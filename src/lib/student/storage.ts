import path from "node:path";

export function getStudentBookStorageDir() {
  return (
    process.env.STUDENT_BOOK_STORAGE_DIR ||
    path.join(process.cwd(), "data", "student-books", "storage")
  );
}

export function buildStudentBookStorageKey({
  grade,
  track,
  subject,
  title,
  fileName,
}: {
  grade: number;
  track: string;
  subject: string;
  title: string;
  fileName: string;
}) {
  const safe = (value: string) =>
    String(value || "")
      .trim()
      .replace(/[^\p{L}\p{N}\-_\.]+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90);

  return path.join(
    `grade-${grade}`,
    safe(track),
    safe(subject),
    `${safe(title)}-${Date.now()}-${safe(fileName)}`
  );
}
