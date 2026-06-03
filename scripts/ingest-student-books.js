/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full);
    if (entry.isFile() && entry.name.endsWith(".json")) return [full];

    return [];
  });
}

function defaultTrack(grade) {
  return Number(grade) >= 10 ? "math" : "general";
}

function chunkText(text, max = 1400) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();

  if (!cleaned) return [];

  const chunks = [];

  for (let i = 0; i < cleaned.length; i += max) {
    chunks.push(cleaned.slice(i, i + max));
  }

  return chunks;
}

async function main() {
  const root = path.join(process.cwd(), "data", "student-books");
  const files = walk(root);

  console.log(`Found ${files.length} book JSON files.`);

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));

    const grade = Number(raw.grade);
    const track = String(raw.track || defaultTrack(grade)).trim();
    const subject = String(raw.subject || "").trim();
    const title = String(raw.title || "").trim();

    if (!grade || !track || !subject || !title || !Array.isArray(raw.pages)) {
      console.warn(`Skipped invalid file: ${file}`);
      continue;
    }

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
        edition: raw.edition || null,
        sourceUrl: raw.sourceUrl || null,
        fileName: path.relative(root, file),
      },
      update: {
        track,
        edition: raw.edition || null,
        sourceUrl: raw.sourceUrl || null,
        fileName: path.relative(root, file),
        status: "active",
      },
    });

    await prisma.studentBookChunk.deleteMany({
      where: {
        bookId: book.id,
      },
    });

    let created = 0;

    for (const page of raw.pages) {
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

    console.log(`✅ ${title} (${grade}/${track}/${subject}): ${created} chunks`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
