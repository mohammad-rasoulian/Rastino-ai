/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const MANUAL_ROOT = path.join(ROOT, "data", "student-books", "inbox", "manual");
const MANIFEST_ROOT = path.join(ROOT, "data", "student-books", "manifests");

const VALID_TRACKS = new Set([
  "general",
  "math",
  "experimental",
  "humanities",
  "islamic",
  "technical",
  "vocational",
]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full);

    if (
      entry.isFile() &&
      [".pdf", ".txt", ".md", ".json"].includes(path.extname(entry.name).toLowerCase())
    ) {
      return [full];
    }

    return [];
  });
}

function normalizeTitle(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseGrade(value) {
  const match = String(value || "").match(/grade[-_ ]?(\d{1,2})/i);
  if (!match) return null;

  const grade = Number(match[1]);
  return grade >= 1 && grade <= 12 ? grade : null;
}

function main() {
  fs.mkdirSync(MANUAL_ROOT, { recursive: true });
  fs.mkdirSync(MANIFEST_ROOT, { recursive: true });

  const files = walk(MANUAL_ROOT);
  const books = [];
  const skipped = [];

  for (const file of files) {
    const relative = path.relative(MANUAL_ROOT, file);
    const parts = relative.split(path.sep);

    if (parts.length < 4) {
      skipped.push({
        file: path.relative(ROOT, file),
        reason: "مسیر باید grade/track/subject/book.pdf باشد.",
      });
      continue;
    }

    const grade = parseGrade(parts[0]);
    const track = parts[1];
    const subject = parts[2];
    const title = normalizeTitle(parts[parts.length - 1]);

    if (!grade) {
      skipped.push({ file: path.relative(ROOT, file), reason: "پایه از فولدر grade-N تشخیص داده نشد." });
      continue;
    }

    if (!VALID_TRACKS.has(track)) {
      skipped.push({ file: path.relative(ROOT, file), reason: `رشته نامعتبر است: ${track}` });
      continue;
    }

    if (!subject || !title) {
      skipped.push({ file: path.relative(ROOT, file), reason: "درس یا عنوان کتاب خالی است." });
      continue;
    }

    books.push({
      file: path.relative(ROOT, file),
      grade,
      track,
      subject,
      title,
      edition: process.env.STUDENT_BOOK_EDITION || "۱۴۰۴",
      sourceUrl: "",
    });
  }

  const manifest = {
    source: "manual-folder",
    createdAt: new Date().toISOString(),
    root: path.relative(ROOT, MANUAL_ROOT),
    books,
    skipped,
  };

  const manifestPath = path.join(
    MANIFEST_ROOT,
    `manual-books-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log("---- Manual books manifest created ----");
  console.log(`Books: ${books.length}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Manifest: ${path.relative(ROOT, manifestPath)}`);

  if (skipped.length > 0) {
    console.log("\nSkipped files:");
    console.table(skipped);
  }
}

main();
