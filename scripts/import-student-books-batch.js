/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = {};

  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;

    const key = item.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i += 1;
    }
  }

  return args;
}

function required(args, key) {
  const value = String(args[key] || "").trim();
  if (!value) throw new Error(`Missing required argument: --${key}`);
  return value;
}

async function main() {
  const args = parseArgs(process.argv);
  const manifestPath = path.resolve(required(args, "manifest"));

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const books = Array.isArray(manifest.books) ? manifest.books : [];

  if (books.length === 0) throw new Error("Manifest has no books.");

  const job = await prisma.studentBookImportJob.create({
    data: {
      status: "running",
      source: String(manifest.source || "manifest"),
      filePath: manifestPath,
      manifest: JSON.stringify(manifest),
      startedAt: new Date(),
    },
  });

  let success = 0;
  let failed = 0;
  const failures = [];

  for (const book of books) {
    const command = [
      "scripts/import-student-book.js",
      "--file",
      book.file,
      "--grade",
      String(book.grade),
      "--track",
      String(book.track),
      "--subject",
      String(book.subject),
      "--title",
      String(book.title),
    ];

    if (book.edition) command.push("--edition", String(book.edition));
    if (book.sourceUrl) command.push("--sourceUrl", String(book.sourceUrl));

    console.log(`\n---- Importing: ${book.title} ----`);

    const result = spawnSync("node", command, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    });

    if (result.status === 0) {
      success += 1;
    } else {
      failed += 1;
      failures.push({
        title: book.title,
        file: book.file,
        status: result.status,
      });
    }
  }

  await prisma.studentBookImportJob.update({
    where: { id: job.id },
    data: {
      status: failed > 0 ? "completed_with_errors" : "completed",
      finishedAt: new Date(),
      metadata: JSON.stringify({ success, failed, failures }),
      error: failed > 0 ? JSON.stringify(failures) : null,
    },
  });

  console.log("\n---- Batch import finished ----");
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("❌ Batch import failed:");
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
