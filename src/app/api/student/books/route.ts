import { getRequestUser } from "@/lib/auth/request-user";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  await getRequestUser();

  const url = new URL(req.url);
  const gradeNumber = Number(url.searchParams.get("grade"));
  const grade = Number.isFinite(gradeNumber) ? gradeNumber : null;
  const track = url.searchParams.get("track") || null;

  const books = await prisma.studentBook.findMany({
    where: {
      status: "active",
      ...(grade ? { grade } : {}),
      ...(track ? { track } : {}),
    },
    orderBy: [{ grade: "asc" }, { track: "asc" }, { subject: "asc" }, { title: "asc" }],
    select: {
      id: true,
      grade: true,
      track: true,
      subject: true,
      title: true,
      edition: true,
      sourceUrl: true,
      storageProvider: true,
      storageKey: true,
      mimeType: true,
      fileSizeBytes: true,
      pageCount: true,
      chunkCount: true,
      ingestionStatus: true,
      ingestionError: true,
      lastIngestedAt: true,
      vectorStatus: true,
      ocrStatus: true,
      _count: {
        select: {
          chunks: true,
        },
      },
    },
  });

  const summary = await prisma.studentBook.groupBy({
    by: ["grade", "track", "ingestionStatus"],
    where: {
      status: "active",
    },
    _count: {
      id: true,
    },
  });

  return Response.json({ books, summary });
}
