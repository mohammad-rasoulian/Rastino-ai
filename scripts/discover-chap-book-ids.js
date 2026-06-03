/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const CACHE_ROOT = path.join(ROOT, "data/student-books/book-page-cache");
const INBOX_ROOT = path.join(ROOT, "data/student-books/inbox");
const MANIFEST_ROOT = path.join(ROOT, "data/student-books/manifests");

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sha1(value) {
  return crypto.createHash("sha1").update(String(value)).digest("hex");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<[^>]+>/g, " "));
}

function normalizeUrl(url, base = "https://www.chap.sch.ir") {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${base}${url}`;
  return new URL(url, base).toString();
}

function safeName(value) {
  return String(value || "")
    .trim()
    .replace(/[^\p{L}\p{N}\-_\.]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 110) || "book";
}

function runCurl(args, { encoding = "utf8" } = {}) {
  const result = spawnSync("curl", args, {
    encoding,
    maxBuffer: 1024 * 1024 * 250,
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? String(result.stderr).trim() : "";
    throw new Error(`curl failed ${result.status}: ${stderr}`);
  }

  return result.stdout;
}

async function fetchBookPage(id, delayMs) {
  ensureDir(CACHE_ROOT);
  const url = `https://www.chap.sch.ir/books/${id}`;
  const cachePath = path.join(CACHE_ROOT, `${id}.html`);

  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf8");
  }

  await sleep(delayMs);

  const html = runCurl([
    "-k",
    "-L",
    "--compressed",
    "--retry",
    "2",
    "--retry-delay",
    "1",
    "--connect-timeout",
    "20",
    "--max-time",
    "80",
    "-A",
    "Mozilla/5.0 RastinoEducationalBookCrawler/1.0",
    url,
  ]);

  fs.writeFileSync(cachePath, html);
  return html;
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripTags(title[1]).replace(/\|.*$/, "").trim();

  return "";
}

function extractBookCode(html) {
  const text = stripTags(html);
  const match =
    text.match(/کد\s*کتاب\s*[:：]?\s*([0-9۰-۹]+)/) ||
    text.match(/کد\s*[:：]?\s*([0-9۰-۹]{2,8})/);

  return match ? match[1] : "";
}

function extractYear(html) {
  const text = stripTags(html);
  const match = text.match(/سال\s*تحصیلی\s*[:：]?\s*([0-9۰-۹]{4}\s*[-–]\s*[0-9۰-۹]{4})/);
  return match ? match[1].replace(/\s+/g, "") : "";
}

function extractPdfLinks(html) {
  const links = new Set();

  for (const match of html.matchAll(/href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi)) {
    links.add(normalizeUrl(decodeHtml(match[1])));
  }

  for (const match of html.matchAll(/https?:\/\/[^"'\s<>]+\.pdf(?:\?[^"'\s<>]*)?/gi)) {
    links.add(decodeHtml(match[0]));
  }

  return [...links];
}

function detectGrade(html) {
  const text = stripTags(html);

  const grades = [
    ["دوازدهم", 12],
    ["یازدهم", 11],
    ["دهم", 10],
    ["نهم", 9],
    ["هشتم", 8],
    ["هفتم", 7],
    ["ششم", 6],
    ["پنجم", 5],
    ["چهارم", 4],
    ["سوم", 3],
    ["دوم", 2],
    ["اول", 1],
    ["اوّل", 1],
  ];

  for (const [word, grade] of grades) {
    if (text.includes(`پایه ${word}`) || text.includes(`پایۀ ${word}`) || text.includes(`${word} دبستان`)) {
      return grade;
    }
  }

  return null;
}

function detectTrack(html, grade) {
  const text = stripTags(html);

  if (grade && grade <= 9) return "general";

  if (text.includes("ریاضی فیزیک") || text.includes("ریاضی‌فیزیک")) return "math";
  if (text.includes("علوم تجربی")) return "experimental";
  if (text.includes("علوم انسانی") || text.includes("ادبیات و علوم انسانی")) return "humanities";
  if (text.includes("معارف اسلامی")) return "islamic";
  if (text.includes("فنی حرفه") || text.includes("فنی‌حرفه")) return "technical";
  if (text.includes("کاردانش")) return "vocational";

  return grade && grade >= 10 ? "general" : "general";
}

function guessSubjectFromTitle(title) {
  const clean = String(title || "").trim();

  const known = [
    "ریاضی",
    "علوم تجربی",
    "فارسی",
    "نگارش",
    "قرآن",
    "هدیه‌های آسمان",
    "پیام‌های آسمان",
    "مطالعات اجتماعی",
    "عربی",
    "زبان انگلیسی",
    "تفکر و سبک زندگی",
    "فرهنگ و هنر",
    "کار و فناوری",
    "فیزیک",
    "شیمی",
    "زیست شناسی",
    "زیست‌شناسی",
    "حسابان",
    "هندسه",
    "آمار و احتمال",
    "گسسته",
    "دین و زندگی",
    "تاریخ",
    "جغرافیا",
    "جامعه شناسی",
    "جامعه‌شناسی",
    "فلسفه",
    "منطق",
    "روان شناسی",
    "روان‌شناسی",
    "اقتصاد",
    "سلامت و بهداشت",
  ];

  for (const item of known) {
    if (clean.includes(item)) return item;
  }

  return clean
    .replace(/\([^)]+\)/g, "")
    .replace(/[۰-۹0-9]/g, "")
    .trim()
    .slice(0, 40) || "عمومی";
}

async function downloadPdf(url, outputPath, delayMs) {
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    return { skipped: true, bytes: fs.statSync(outputPath).size };
  }

  ensureDir(path.dirname(outputPath));
  await sleep(delayMs);

  runCurl([
    "-k",
    "-L",
    "--fail",
    "--retry",
    "2",
    "--retry-delay",
    "1",
    "--connect-timeout",
    "25",
    "--max-time",
    "240",
    "-A",
    "Mozilla/5.0 RastinoEducationalBookCrawler/1.0",
    "-o",
    outputPath,
    url,
  ]);

  return { skipped: false, bytes: fs.statSync(outputPath).size };
}

async function main() {
  const args = parseArgs(process.argv);

  const from = Number(args.from || 13100);
  const to = Number(args.to || 13200);
  const delayMs = Number(args.delayMs || 450);
  const wantedYear = String(args.year || "").trim();

  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
    throw new Error("Invalid --from / --to range.");
  }

  ensureDir(INBOX_ROOT);
  ensureDir(MANIFEST_ROOT);

  const manifestBooks = [];
  let foundPages = 0;

  for (let id = from; id <= to; id += 1) {
    const sourcePage = `https://www.chap.sch.ir/books/${id}`;

    let html = "";
    try {
      html = await fetchBookPage(id, delayMs);
    } catch (error) {
      console.log(`⚠️ ${id}: ${error.message}`);
      continue;
    }

    if (!html.includes("کد کتاب") && !html.includes("فایل کامل کتاب") && !html.includes(".pdf")) {
      continue;
    }

    const title = extractTitle(html);
    const pdfLinks = extractPdfLinks(html);
    const year = extractYear(html);
    const code = extractBookCode(html);
    const grade = detectGrade(html);
    const track = detectTrack(html, grade);
    const subject = guessSubjectFromTitle(title);

    if (!title || pdfLinks.length === 0 || !grade) {
      continue;
    }

    if (wantedYear && year && year !== wantedYear) {
      continue;
    }

    foundPages += 1;
    console.log(`\n✅ Book page ${id}: ${title}`);
    console.log(`   code=${code || "-"} grade=${grade} track=${track} year=${year || "-"}`);
    console.log(`   PDFs=${pdfLinks.length}`);

    for (let index = 0; index < pdfLinks.length; index += 1) {
      const pdfUrl = pdfLinks[index];
      const fileName = `${safeName(subject)}-${safeName(title)}-${id}-${index + 1}-${sha1(pdfUrl).slice(0, 8)}.pdf`;
      const outputPath = path.join(INBOX_ROOT, `grade-${grade}`, track, fileName);

      try {
        const result = await downloadPdf(pdfUrl, outputPath, delayMs);
        console.log(`   ${result.skipped ? "↪️ cached" : "⬇️ downloaded"} ${Math.round(result.bytes / 1024)} KB`);

        manifestBooks.push({
          file: path.relative(ROOT, outputPath),
          grade,
          track,
          subject,
          title: pdfLinks.length > 1 ? `${title} - فایل ${index + 1}` : title,
          edition: year || wantedYear || "",
          sourceUrl: pdfUrl,
          sourcePage,
          bookCode: code,
          chapBookId: id,
        });
      } catch (error) {
        console.log(`   ❌ PDF failed: ${error.message}`);
      }
    }
  }

  const manifest = {
    source: "chap.sch.ir/book-id-scan",
    createdAt: new Date().toISOString(),
    range: { from, to },
    year: wantedYear || null,
    foundPages,
    books: manifestBooks,
  };

  const manifestPath = path.join(
    MANIFEST_ROOT,
    `chap-idscan-${from}-${to}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log("\n==== DONE ====");
  console.log(`Found book pages: ${foundPages}`);
  console.log(`Downloaded PDFs: ${manifestBooks.length}`);
  console.log(`Manifest: ${path.relative(ROOT, manifestPath)}`);
  console.log("\nNext:");
  console.log(`node scripts/import-student-books-batch.js --manifest ${path.relative(ROOT, manifestPath)}`);
}

main().catch((error) => {
  console.error("❌ ID scanner failed:");
  console.error(error.message || error);
  process.exit(1);
});
