/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync, spawnSync } = require("child_process");
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

function commandExists(command) {
  const result = spawnSync("bash", ["-lc", `command -v ${command}`], {
    encoding: "utf8",
  });

  return result.status === 0;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function splitPdfTextIntoPages(text) {
  const pages = String(text || "")
    .split("\f")
    .map((content, index) => ({
      page: index + 1,
      content: normalizeText(content),
    }))
    .filter((page) => page.content.length > 20);

  if (pages.length > 0) return pages;

  const fallback = normalizeText(text);
  return fallback ? [{ page: 1, content: fallback }] : [];
}

function readPdf(filePath) {
  if (!commandExists("pdftotext")) {
    throw new Error(
      "pdftotext نصب نیست. برای PDF بزن: sudo apt-get update && sudo apt-get install -y poppler-utils"
    );
  }

  const output = execFileSync(
    "pdftotext",
    ["-layout", "-enc", "UTF-8", filePath, "-"],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 120,
    }
  );

  return splitPdfTextIntoPages(output);
}

function readTxt(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  if (content.includes("\f")) return splitPdfTextIntoPages(content);

  const pageMatches = [
    ...content.matchAll(
      /(?:^|\n)---\s*page\s*(\d+)\s*---\n([\s\S]*?)(?=\n---\s*page\s*\d+\s*---\n|$)/gi
    ),
  ];

  if (pageMatches.length > 0) {
    return pageMatches
      .map((match) => ({
        page: Number(match[1]),
        content: normalizeText(match[2]),
      }))
      .filter((page) => page.content.length > 20);
  }

  const text = normalizeText(content);
  return text ? [{ page: 1, content: text }] : [];
}

function readJson(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!Array.isArray(raw.pages)) {
    throw new Error("JSON file must include pages array.");
  }

  return raw.pages
    .map((page, index) => ({
      page: page.page ? Number(page.page) : index + 1,
      chapter: page.chapter || null,
      section: page.section || null,
      content: normalizeText(page.content),
    }))
    .filter((page) => page.content.length > 20);
}

function readBookPages(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") return readPdf(filePath);
  if (ext === ".txt" || ext === ".md") return readTxt(filePath);
  if (ext === ".json") return readJson(filePath);

  throw new Error("Unsupported file type. Use PDF, TXT, MD or JSON.");
}

function chunkText(text, max = 1400, overlap = 180) {
  const cleaned = normalizeText(text).replace(/\s+/g, " ");
  if (!cleaned) return [];

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + max, cleaned.length);
    const chunk = cleaned.slice(start, end).trim();

    if (chunk.length > 80) chunks.push(chunk);
    if (end >= cleaned.length) break;

    start = Math.max(0, end - overlap);
  }

  return chunks;
}

function safeName(value) {
  return String(value || "")
    .trim()
    .replace(/[^\p{L}\p{N}\-_\.]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function getStorageDir() {
  return (
    process.env.STUDENT_BOOK_STORAGE_DIR ||
    path.join(process.cwd(), "data", "student-books", "storage")
  );
}

function buildStorageKey({ grade, track, subject, title, fileName }) {
  return path.join(
    `grade-${grade}`,
    safeName(track),
    safeName(subject),
    `${safeName(title)}-${Date.now()}-${safeName(fileName)}`
  );
}

function guessMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".txt") return "text/plain";
  if (ext === ".md") return "text/markdown";
  if (ext === ".json") return "application/json";
  return "application/octet-stream";
}

async function main() {
  const args = parseArgs(process.argv);

  const file = required(args, "file");
  const grade = Number(required(args, "grade"));
  const track = required(args, "track");
  const subject = required(args, "subject");
  const title = required(args, "title");
  const edition = String(args.edition || "").trim() || null;
  const sourceUrl = String(args.sourceUrl || "").trim() || null;

  if (!Number.isFinite(grade) || grade < 1 || grade > 12) {
    throw new Error("--grade must be a number between 1 and 12.");
  }

  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const stat = fs.statSync(filePath);
  const storageKey = buildStorageKey({
    grade,
    track,
    subject,
    title,
    fileName: path.basename(filePath),
  });

  const storagePath = path.join(getStorageDir(), storageKey);
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  fs.copyFileSync(filePath, storagePath);

  const baseMetadata = {
    importedAt: new Date().toISOString(),
    originalFile: filePath,
    storageKey,
    importer: "scripts/import-student-book.js",
    host: os.hostname(),
  };

  const book = await prisma.studentBook.upsert({
    where: {
      grade_track_subject_title: {
        grade,
        track,
        subject,
        title,
      },
    },
    create: {
      grade,
      track,
      subject,
      title,
      edition,
      sourceUrl,
      fileName: path.basename(filePath),
      storageProvider: "local",
      storageKey,
      mimeType: guessMime(filePath),
      fileSizeBytes: stat.size,
      ingestionStatus: "uploaded",
      vectorStatus: "pending",
      ocrStatus: "not_required",
      metadata: JSON.stringify(baseMetadata),
    },
    update: {
      edition,
      sourceUrl,
      fileName: path.basename(filePath),
      storageProvider: "local",
      storageKey,
      mimeType: guessMime(filePath),
      fileSizeBytes: stat.size,
      status: "active",
      ingestionStatus: "uploaded",
      vectorStatus: "pending",
      ingestionError: null,
      metadata: JSON.stringify(baseMetadata),
    },
  });

  console.log("---- Extracting text ----");

  let pages = [];

  try {
    pages = readBookPages(storagePath);
  } catch (error) {
    await prisma.studentBook.update({
      where: { id: book.id },
      data: {
        ingestionStatus: "failed",
        ingestionError: error.message || String(error),
        ocrStatus: "unknown",
      },
    });

    throw error;
  }

  if (pages.length === 0) {
    await prisma.studentBook.update({
      where: { id: book.id },
      data: {
        ingestionStatus: "needs_ocr",
        ocrStatus: "required",
        pageCount: 0,
        chunkCount: 0,
        ingestionError: "No readable text found. OCR required.",
      },
    });

    throw new Error("No readable text found. OCR required.");
  }

  await prisma.studentBookChunk.deleteMany({
    where: { bookId: book.id },
  });

  let created = 0;

  for (const page of pages) {
    const chunks = chunkText(page.content);

    for (const content of chunks) {
      await prisma.studentBookChunk.create({
        data: {
          bookId: book.id,
          grade,
          track,
          subject,
          page: page.page ? Number(page.page) : null,
          chapter: page.chapter || null,
          section: page.section || null,
          content,
        },
      });

      created += 1;
    }
  }

  await prisma.studentBook.update({
    where: { id: book.id },
    data: {
      ingestionStatus: "ready",
      ingestionError: null,
      pageCount: pages.length,
      chunkCount: created,
      lastIngestedAt: new Date(),
      ocrStatus: "not_required",
      vectorStatus: "pending",
    },
  });

  console.log("---- Done ----");
  console.log(`Book: ${title}`);
  console.log(`Grade: ${grade}`);
  console.log(`Track: ${track}`);
  console.log(`Subject: ${subject}`);
  console.log(`Pages/sections: ${pages.length}`);
  console.log(`Chunks: ${created}`);
  console.log(`Storage: ${storageKey}`);
}

main()
  .catch((error) => {
    console.error("❌ Import failed:");
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
