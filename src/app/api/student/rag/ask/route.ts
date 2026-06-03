import { getRequestUser } from "@/lib/auth/request-user";
import { buildStudentRagPrompt, searchStudentBookChunks } from "@/lib/student/rag";
import { extractQuestionFromStudentImage, generateStudentAnswer } from "@/lib/student/avalai";
import { prisma } from "@/lib/prisma";

function isSafeImageDataUrl(value: string) {
  return /^data:image\/(png|jpe?g|webp);base64,/i.test(value) && value.length < 6_000_000;
}

export async function POST(req: Request) {
  await getRequestUser();

  const body = await req.json().catch(() => ({}));

  const rawQuestion = String(body.question || "").trim();
  const imageDataUrl = String(body.imageDataUrl || "").trim();
  const subject = String(body.subject || "").trim();
  const track = String(body.track || "general").trim();
  const trackLabel = String(body.trackLabel || track).trim();
  const bookId = String(body.bookId || "").trim();
  const gradeNumber = Number(body.grade);
  const grade = Number.isFinite(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 12 ? gradeNumber : null;

  let question = rawQuestion;

  if (imageDataUrl) {
    if (!isSafeImageDataUrl(imageDataUrl)) {
      return Response.json(
        { error: "فرمت یا حجم تصویر مناسب نیست. PNG/JPG/WebP تا حدود ۶ مگابایت مجاز است." },
        { status: 400 }
      );
    }

    const extracted = await extractQuestionFromStudentImage({
      imageDataUrl,
      helperText: rawQuestion,
    });

    question = rawQuestion
      ? `${rawQuestion}\n\nمتن استخراج‌شده از تصویر:\n${extracted}`
      : extracted;
  }

  if (question.length < 3) {
    return Response.json(
      { error: "سوال را کامل‌تر وارد کن یا عکس واضح‌تری بفرست." },
      { status: 400 }
    );
  }

  const selectedBook = bookId
    ? await prisma.studentBook.findFirst({
        where: {
          id: bookId,
          status: "active",
        },
      })
    : null;

  const sources = await searchStudentBookChunks({
    grade,
    track,
    subject: subject || selectedBook?.subject || null,
    bookId: selectedBook?.id || null,
    question,
    limit: 8,
  });

  if (sources.length === 0) {
    return Response.json(
      {
        error:
          "هنوز منبع مرتبطی در کتاب‌های بارگذاری‌شده این پایه/رشته پیدا نشد. باید کتاب‌های همین پایه و رشته ingest شوند.",
        extractedQuestion: imageDataUrl ? question : undefined,
        sources: [],
      },
      { status: 404 }
    );
  }

  const prompt = buildStudentRagPrompt({
    question,
    grade,
    trackLabel,
    subject: subject || selectedBook?.subject || null,
    bookTitle: selectedBook?.title || null,
    sources,
  });

  const answer = await generateStudentAnswer(prompt);

  return Response.json({
    answer: answer.content,
    model: answer.model,
    usage: answer.usage,
    requestId: answer.requestId,
    extractedQuestion: imageDataUrl ? question : undefined,
    sources,
  });
}
