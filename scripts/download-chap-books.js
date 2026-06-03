/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, "data/student-books/sources/chap-categories.json");
const INBOX_ROOT = path.join(ROOT, "data/student-books/inbox");
const MANIFEST_ROOT = path.join(ROOT, "data/student-books/manifests");
const CACHE_ROOT = path.join(ROOT, "data/student-books/catalog-cache");



function runCurl(args, { encoding = "utf8" } = {}) {
  const result = spawnSync("curl", args, {
    encoding,
    maxBuffer: 1024 * 1024 * 200,
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? String(result.stderr).trim() : "";
    throw new Error(`curl failed (${result.status}): ${stderr}`);
  }

  return result.stdout;
}

async function fetchTextWithFallback(url, { delayMs }) {
  await sleep(delayMs);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 RastinoEducationalBookCrawler/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      throw new Error(`fetch HTTP ${res.status}`);
    }

    return await res.text();
  } catch (error) {
    const reason = error?.cause?.message || error?.message || String(error);
    console.log(`↪️ node fetch failed, trying curl: ${reason}`);

    return runCurl([
      "-L",
      "-k",
      "--compressed",
      "--retry",
      "3",
      "--retry-delay",
      "2",
      "--connect-timeout",
      "25",
      "--max-time",
      "90",
      "-A",
      "Mozilla/5.0 RastinoEducationalBookCrawler/1.0",
      url,
    ]);
  }
}

async function downloadFileWithFallback(url, outputPath, delayMs) {
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    return { skipped: true, bytes: fs.statSync(outputPath).size };
  }

  await sleep(delayMs);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 RastinoEducationalBookCrawler/1.0",
        "Accept": "application/pdf,*/*",
      },
    });

    if (!res.ok) {
      throw new Error(`fetch HTTP ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, buffer);

    return { skipped: false, bytes: buffer.length };
  } catch (error) {
    const reason = error?.cause?.message || error?.message || String(error);
    console.log(`↪️ node download failed, trying curl: ${reason}`);

    ensureDir(path.dirname(outputPath));

    runCurl(
      [
        "-L",
        "-k",
        "--fail",
        "--retry",
        "3",
        "--retry-delay",
        "2",
        "--connect-timeout",
        "25",
        "--max-time",
        "240",
        "-A",
        "Mozilla/5.0 RastinoEducationalBookCrawler/1.0",
        "-o",
        outputPath,
        url,
      ],
      { encoding: "utf8" }
    );

    return { skipped: false, bytes: fs.statSync(outputPath).size };
  }
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

function normalizeUrl(url, base = "https://www.chap.sch.ir") {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${base}${url}`;
  return new URL(url, base).toString();
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

function safeName(value) {
  return String(value || "")
    .trim()
    .replace(/[^\p{L}\p{N}\-_\.]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 110) || "book";
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
    "فلسفه",
    "منطق",
    "روان شناسی",
    "اقتصاد",
    "سلامت و بهداشت"
  ];

  for (const item of known) {
    if (clean.includes(item)) return item;
  }

  return clean.replace(/\(\d+\)/g, "").replace(/[۰-۹0-9]/g, "").trim().slice(0, 40) || "عمومی";
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    return stripTags(title[1]).replace(/\|.*$/, "").trim();
  }

  return "";
}

function extractBookLinks(html) {
  const links = new Set();

  for (const match of html.matchAll(/href=["']([^"']*\/books\/\d+[^"']*)["']/gi)) {
    links.add(normalizeUrl(decodeHtml(match[1])));
  }

  return [...links];
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

async function fetchText(url, { cacheKey, delayMs }) {
  ensureDir(CACHE_ROOT);
  const cachePath = path.join(CACHE_ROOT, `${cacheKey || sha1(url)}.html`);

  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf8");
  }

  const html = await fetchTextWithFallback(url, { delayMs });
  fs.writeFileSync(cachePath, html);
  return html;
}

async function downloadFile(url, outputPath, delayMs) {
  return downloadFileWithFallback(url, outputPath, delayMs);
}

function categoryPageUrl(baseUrl, page) {
  const url = new URL(baseUrl);
  if (page > 0) {
    url.searchParams.set("page", String(page));
  }
  return url.toString();
}

async function crawlCategory(category, config) {
  const delayMs = Number(config.delayMs || 1200);
  const maxPages = Number(config.maxPagesPerCategory || 20);

  console.log(`\n==== ${category.label} | grade=${category.grade} track=${category.track} ====`);

  const bookPageLinks = new Set();
  const directPdfLinks = new Set();

  for (let page = 0; page < maxPages; page += 1) {
    const url = categoryPageUrl(category.url, page);

    console.log(`Category page ${page + 1}: ${url}`);

    let html = "";
    try {
      html = await fetchText(url, {
        cacheKey: `category-${sha1(url)}`,
        delayMs,
      });
    } catch (error) {
      console.log(`⚠️ ${error.message}`);
      break;
    }

    const pageBookLinks = extractBookLinks(html);
    const pagePdfLinks = extractPdfLinks(html);

    pageBookLinks.forEach((item) => bookPageLinks.add(item));
    pagePdfLinks.forEach((item) => directPdfLinks.add(item));

    console.log(`Found book pages: ${pageBookLinks.length}, direct PDFs: ${directPdfLinks.size}`);

    if (page > 0 && pageBookLinks.length === 0 && pagePdfLinks.length === 0) {
      break;
    }

    if (pageBookLinks.length === 0 && pagePdfLinks.length === 0 && page >= 2) {
      break;
    }
  }

  const books = [];

  for (const bookUrl of bookPageLinks) {
    console.log(`Book page: ${bookUrl}`);

    let html = "";
    try {
      html = await fetchText(bookUrl, {
        cacheKey: `book-${sha1(bookUrl)}`,
        delayMs,
      });
    } catch (error) {
      console.log(`⚠️ ${error.message}`);
      continue;
    }

    const title = extractTitle(html) || `book-${sha1(bookUrl).slice(0, 8)}`;
    const pdfLinks = extractPdfLinks(html);

    if (pdfLinks.length === 0) {
      console.log(`⚠️ No PDF found for: ${title}`);
      continue;
    }

    for (let index = 0; index < pdfLinks.length; index += 1) {
      books.push({
        title: pdfLinks.length > 1 ? `${title} - فایل ${index + 1}` : title,
        subject: guessSubjectFromTitle(title),
        sourcePage: bookUrl,
        pdfUrl: pdfLinks[index],
      });
    }
  }

  for (const pdfUrl of directPdfLinks) {
    if (books.some((book) => book.pdfUrl === pdfUrl)) continue;

    const fileBase = decodeURIComponent(path.basename(new URL(pdfUrl).pathname)).replace(/\.pdf$/i, "");
    books.push({
      title: fileBase || `book-${sha1(pdfUrl).slice(0, 8)}`,
      subject: guessSubjectFromTitle(fileBase),
      sourcePage: category.url,
      pdfUrl,
    });
  }

  const unique = [];
  const seen = new Set();

  for (const book of books) {
    if (seen.has(book.pdfUrl)) continue;
    seen.add(book.pdfUrl);
    unique.push(book);
  }

  console.log(`Unique PDF books: ${unique.length}`);

  const manifestBooks = [];

  for (const book of unique) {
    const ext = ".pdf";
    const fileName = `${safeName(book.subject)}-${safeName(book.title)}-${sha1(book.pdfUrl).slice(0, 8)}${ext}`;
    const outputPath = path.join(
      INBOX_ROOT,
      `grade-${category.grade}`,
      category.track,
      fileName
    );

    console.log(`Downloading: ${book.title}`);

    try {
      const result = await downloadFile(book.pdfUrl, outputPath, delayMs);

      console.log(`${result.skipped ? "↪️ cached" : "✅ downloaded"} ${Math.round(result.bytes / 1024)} KB`);

      manifestBooks.push({
        file: path.relative(ROOT, outputPath),
        grade: category.grade,
        track: category.track,
        subject: book.subject,
        title: book.title,
        edition: category.edition || "",
        sourceUrl: book.pdfUrl,
        sourcePage: book.sourcePage,
      });
    } catch (error) {
      console.log(`❌ Download failed: ${error.message}`);
    }
  }

  return manifestBooks;
}

async function main() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Source config not found: ${SOURCE_FILE}`);
  }

  const config = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf8"));
  const categories = (config.categories || []).filter((item) => item.enabled !== false);

  if (categories.length === 0) {
    throw new Error("No enabled categories in chap-categories.json");
  }

  const allManifestBooks = [];

  for (const category of categories) {
    const books = await crawlCategory(category, config);
    allManifestBooks.push(...books);
  }

  ensureDir(MANIFEST_ROOT);

  const manifest = {
    source: "chap.sch.ir",
    createdAt: new Date().toISOString(),
    books: allManifestBooks,
  };

  const manifestPath = path.join(
    MANIFEST_ROOT,
    `chap-downloaded-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log("\n==== DONE ====");
  console.log(`Books downloaded: ${allManifestBooks.length}`);
  console.log(`Manifest: ${path.relative(ROOT, manifestPath)}`);
  console.log("\nNext:");
  console.log(`node scripts/import-student-books-batch.js --manifest ${path.relative(ROOT, manifestPath)}`);
}

main().catch((error) => {
  console.error("❌ chap crawler failed:");
  console.error(error);
  process.exit(1);
});
