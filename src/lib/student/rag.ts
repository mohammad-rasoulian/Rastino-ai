import { prisma } from "@/lib/prisma";

export type StudentRagSource = {
  bookTitle: string;
  subject: string;
  grade: number;
  track: string;
  page: number | null;
  chapter: string | null;
  section: string | null;
  content: string;
  score: number;
};

function normalizeFa(value: string) {
  return value
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[أإآ]/g, "ا")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  const stopWords = new Set([
    "از",
    "به",
    "با",
    "در",
    "را",
    "که",
    "این",
    "آن",
    "برای",
    "یک",
    "و",
    "یا",
    "است",
    "هست",
    "می",
    "شود",
    "شد",
    "کن",
    "چرا",
    "چگونه",
    "سوال",
    "تمرین",
  ]);

  return normalizeFa(value)
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && !stopWords.has(item));
}

function scoreChunk(content: string, queryTokens: string[]) {
  const normalized = normalizeFa(content);
  let score = 0;

  for (const token of queryTokens) {
    if (normalized.includes(token)) {
      score += token.length >= 5 ? 4 : 2;
    }
  }

  for (let i = 0; i < queryTokens.length - 1; i += 1) {
    const pair = `${queryTokens[i]} ${queryTokens[i + 1]}`;
    if (normalized.includes(pair)) score += 4;
  }

  return score;
}

export async function searchStudentBookChunks({
  grade,
  track,
  subject,
  bookId,
  question,
  limit = 8,
}: {
  grade?: number | null;
  track?: string | null;
  subject?: string | null;
  bookId?: string | null;
  question: string;
  limit?: number;
}) {
  const queryTokens = tokenize(question).slice(0, 22);

  if (queryTokens.length === 0) {
    return [];
  }

  const candidates = await prisma.studentBookChunk.findMany({
    where: {
      ...(bookId ? { bookId } : {}),
      ...(grade ? { grade } : {}),
      ...(track ? { track } : {}),
      ...(subject ? { subject: { contains: subject } } : {}),
      OR: queryTokens.slice(0, 10).map((token) => ({
        content: {
          contains: token,
        },
      })),
    },
    take: 120,
    include: {
      book: true,
    },
  });

  return candidates
    .map((chunk) => ({
      bookTitle: chunk.book.title,
      subject: chunk.subject,
      grade: chunk.grade,
      track: chunk.track,
      page: chunk.page,
      chapter: chunk.chapter,
      section: chunk.section,
      content: chunk.content,
      score: scoreChunk(chunk.content, queryTokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildStudentRagPrompt({
  question,
  grade,
  trackLabel,
  subject,
  bookTitle,
  sources,
}: {
  question: string;
  grade?: number | null;
  trackLabel?: string | null;
  subject?: string | null;
  bookTitle?: string | null;
  sources: StudentRagSource[];
}) {
  const sourceText = sources
    .map((source, index) => {
      const citation = [
        `منبع ${index + 1}`,
        `کتاب: ${source.bookTitle}`,
        `پایه: ${source.grade}`,
        `رشته/مسیر: ${source.track}`,
        `درس: ${source.subject}`,
        source.page ? `صفحه: ${source.page}` : "",
        source.chapter ? `فصل: ${source.chapter}` : "",
        source.section ? `بخش: ${source.section}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      return `### ${citation}\n${source.content}`;
    })
    .join("\n\n");

  return `تو دستیار دانش‌آموزی راستینو هستی. پاسخ باید فقط بر اساس منابع کتاب درسی بازیابی‌شده ساخته شود.

مشخصات دانش‌آموز:
${grade ? `پایه: ${grade}` : "پایه: مشخص نشده"}
${trackLabel ? `رشته/مسیر: ${trackLabel}` : "رشته/مسیر: مشخص نشده"}
${subject ? `درس: ${subject}` : "درس: مشخص نشده"}
${bookTitle ? `کتاب انتخاب‌شده: ${bookTitle}` : "کتاب انتخاب‌شده: مشخص نشده"}

سوال دانش‌آموز:
${question}

منابع کتاب درسی:
${sourceText}

قواعد پاسخ:
- پاسخ فارسی، دقیق، مرحله‌به‌مرحله و مناسب دانش‌آموز باشد.
- برای هر بخش مهم، منبع را داخل متن ذکر کن؛ مثل: «طبق کتاب، صفحه ۲۳».
- اگر از یک منبع استفاده کردی، شماره صفحه یا فصل را ذکر کن.
- اگر منابع کافی نیستند، شفاف بگو که در کتاب‌های بارگذاری‌شده منبع کافی پیدا نشد.
- جواب نهایی را بده، اما مسیر حل و یادگیری را هم توضیح بده.
- در انتها یک بخش «منابع استفاده‌شده» با نام کتاب، صفحه و فصل بنویس.`;
}
