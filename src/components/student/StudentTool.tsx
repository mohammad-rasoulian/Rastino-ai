"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type StudentTrack = {
  id: string;
  label: string;
};

type StudentBook = {
  id: string;
  grade: number;
  track: string;
  subject: string;
  title: string;
  edition?: string | null;
  sourceUrl?: string | null;
  _count?: {
    chunks: number;
  };
};

type RagSource = {
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

type StudyTask = {
  id: string;
  dayIndex: number;
  subject: string;
  bookTitle?: string | null;
  title: string;
  minutes: number;
  status: string;
  progress: number;
};

type StudyStat = {
  id: string;
  subject: string;
  bookTitle?: string | null;
  studiedMinutes: number;
  readiness: number;
  solvedQuestions: number;
};

type CoachMessage = {
  id: string;
  role: string;
  content: string;
};

const weekdays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const tracks: StudentTrack[] = [
  { id: "general", label: "عمومی" },
  { id: "math", label: "ریاضی فیزیک" },
  { id: "experimental", label: "علوم تجربی" },
  { id: "humanities", label: "ادبیات و علوم انسانی" },
  { id: "islamic", label: "علوم و معارف اسلامی" },
  { id: "technical", label: "فنی‌وحرفه‌ای" },
  { id: "vocational", label: "کاردانش" },
];

function tracksForGrade(grade: string) {
  const numberGrade = Number(grade);

  if (numberGrade >= 10) {
    return tracks;
  }

  return [tracks[0]];
}

function trackLabel(trackId: string) {
  return tracks.find((item) => item.id === trackId)?.label || "عمومی";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود."));
    reader.readAsDataURL(file);
  });
}

function PanelCard({
  children,
  className = "",
  dir,
}: {
  children: React.ReactNode;
  className?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div
      dir={dir}
      className={`rounded-[2rem] border border-white/10 bg-[#0d0d0f]/85 shadow-2xl shadow-black/25 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}



function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-black text-zinc-500">
      {children}
    </label>
  );
}

export function StudentTool({
  onChatCreated,
}: {
  onChatCreated?: (chatId: string) => void;
} = {}) {
  void onChatCreated;

  const [tab, setTab] = useState<"rag" | "coach">("rag");

  const [books, setBooks] = useState<StudentBook[]>([]);
  const [booksStatus, setBooksStatus] = useState("در حال دریافت کتاب‌ها...");

  const [grade, setGrade] = useState("12");
  const [track, setTrack] = useState("math");
  const [subject, setSubject] = useState("");
  const [bookId, setBookId] = useState("");
  const [question, setQuestion] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [extractedQuestion, setExtractedQuestion] = useState("");
  const [ragSources, setRagSources] = useState<RagSource[]>([]);
  const [ragStatus, setRagStatus] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [stats, setStats] = useState<StudyStat[]>([]);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [coachText, setCoachText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDay, setTaskDay] = useState("0");
  const [taskMinutes, setTaskMinutes] = useState("45");
  const [studyStatus, setStudyStatus] = useState("");
  const [isCoachSending, setIsCoachSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const availableTracks = useMemo(() => tracksForGrade(grade), [grade]);

  const filteredBooks = useMemo(() => {
    return books.filter(
      (book) => String(book.grade) === String(grade) && book.track === track
    );
  }, [books, grade, track]);

  const subjectsForSelection = useMemo(() => {
    return Array.from(new Set(filteredBooks.map((book) => book.subject)));
  }, [filteredBooks]);

  const booksForSubject = useMemo(() => {
    if (!subject) return filteredBooks;
    return filteredBooks.filter((book) => book.subject === subject);
  }, [filteredBooks, subject]);

  const selectedBook = useMemo(() => {
    return books.find((book) => book.id === bookId) || null;
  }, [books, bookId]);

  const doneTaskCount = tasks.filter((task) => task.status === "done").length;
  const totalStudyMinutes = stats.reduce(
    (sum, stat) => sum + stat.studiedMinutes,
    0
  );
  const averageReadiness =
    stats.length > 0
      ? Math.round(
          stats.reduce((sum, stat) => sum + Math.min(100, stat.readiness), 0) /
            stats.length
        )
      : 0;

  useEffect(() => {
    loadBooks();
    loadStudyDashboard();
  }, []);

  useEffect(() => {
    const nextTracks = tracksForGrade(grade);

    if (!nextTracks.some((item) => item.id === track)) {
      setTrack(nextTracks[0]?.id || "general");
    }

    setSubject("");
    setBookId("");
  }, [grade, track]);

  async function loadBooks() {
    try {
      const response = await fetch("/api/student/books", {
        credentials: "include",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "دریافت کتاب‌ها ناموفق بود.");
      }

      setBooks(data?.books || []);
      setBooksStatus(
        data?.books?.length
          ? `${data.books.length} کتاب در کتابخانه راستینو ثبت شده است.`
          : "ساختار کتابخانه آماده است؛ هنوز کتابی برای RAG وارد نشده."
      );
    } catch (error) {
      setBooksStatus(
        error instanceof Error ? error.message : "دریافت کتاب‌ها ناموفق بود."
      );
    }
  }

  async function loadStudyDashboard() {
    try {
      const response = await fetch("/api/student/study", {
        credentials: "include",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "دریافت برنامه ناموفق بود.");
      }

      setTasks(data?.tasks || []);
      setStats(data?.stats || []);
      setMessages(data?.messages || []);
    } catch (error) {
      setStudyStatus(
        error instanceof Error ? error.message : "دریافت برنامه ناموفق بود."
      );
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setRagStatus("فرمت تصویر باید PNG، JPG یا WebP باشد.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setRagStatus("حجم تصویر نباید بیشتر از ۶ مگابایت باشد.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setImageDataUrl(dataUrl);
    setImageName(file.name);
    setRagStatus("عکس سوال اضافه شد.");
  }

  async function askFromBooks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim() && !imageDataUrl) {
      setRagStatus("سوالت را بنویس یا عکس سوال را اضافه کن.");
      return;
    }

    setIsAsking(true);
    setRagStatus("در حال خواندن سوال و جستجو در کتاب‌های درسی...");
    setRagAnswer("");
    setExtractedQuestion("");
    setRagSources([]);

    try {
      const response = await fetch("/api/student/rag/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          grade: Number(grade),
          track,
          trackLabel: trackLabel(track),
          subject,
          bookId,
          question,
          imageDataUrl,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "پاسخ منبع‌دار ساخته نشد.");
      }

      setRagAnswer(data.answer || "");
      setExtractedQuestion(data.extractedQuestion || "");
      setRagSources(data.sources || []);
      setRagStatus("پاسخ منبع‌دار آماده شد.");
    } catch (error) {
      setRagStatus(
        error instanceof Error ? error.message : "پاسخ منبع‌دار ساخته نشد."
      );
    } finally {
      setIsAsking(false);
    }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taskTitle.trim()) {
      setStudyStatus("عنوان برنامه را وارد کن.");
      return;
    }

    const response = await fetch("/api/student/study", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        action: "create-task",
        title: taskTitle,
        subject: taskSubject || "عمومی",
        dayIndex: Number(taskDay),
        minutes: Number(taskMinutes),
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setStudyStatus(data?.error || "ثبت برنامه ناموفق بود.");
      return;
    }

    setTaskTitle("");
    setTaskSubject("");
    setTaskMinutes("45");
    setStudyStatus("برنامه ثبت شد.");
    await loadStudyDashboard();
  }

  async function toggleTask(taskId: string) {
    await fetch("/api/student/study", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        action: "toggle-task",
        taskId,
      }),
    });

    await loadStudyDashboard();
  }

  async function sendCoachMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!coachText.trim()) return;

    setIsCoachSending(true);
    const message = coachText;
    setCoachText("");
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        role: "user",
        content: message,
      },
    ]);

    try {
      const response = await fetch("/api/student/study", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "coach-message",
          message,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "مشاور پاسخ نداد.");
      }

      await loadStudyDashboard();
    } catch (error) {
      setStudyStatus(
        error instanceof Error ? error.message : "مشاور پاسخ نداد."
      );
    } finally {
      setIsCoachSending(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="relative isolate min-h-screen overflow-hidden overflow-y-auto bg-[#050505] px-4 py-4 text-white md:px-6"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute right-[-12rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-white/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-14rem] left-[-14rem] h-[32rem] w-[32rem] rounded-full bg-white/5 blur-[160px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-5">
        <PanelCard className="p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-white" />
                Student Intelligence
              </div>

              <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
                پنل دانش‌آموزی راستینو
              </h1>

              <p className="mt-3 text-sm leading-8 text-zinc-400">
                سوالت را از کتاب‌های درسی بپرس، عکس سوال را بفرست، برنامه
                هفتگی بچین و با مشاور مطالعه جلو برو؛ همه در یک محیط منظم و
                منبع‌محور.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:w-[420px]">
              <button
                type="button"
                onClick={() => setTab("rag")}
                className="rounded-2xl border border-white px-5 py-4 text-sm font-black text-black transition hover:bg-zinc-100"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  opacity: tab === "rag" ? 1 : 0.78,
                  boxShadow: tab === "rag" ? "0 18px 45px rgba(255,255,255,0.14)" : "none",
                }}
              >
                پرسش از کتاب
              </button>

              <button
                type="button"
                onClick={() => setTab("coach")}
                className="rounded-2xl border border-white px-5 py-4 text-sm font-black text-black transition hover:bg-zinc-100"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  opacity: tab === "coach" ? 1 : 0.78,
                  boxShadow: tab === "coach" ? "0 18px 45px rgba(255,255,255,0.14)" : "none",
                }}
              >
                مشاور و برنامه
              </button>
            </div>
          </div>
        </PanelCard>

        {tab === "rag" ? (
          <section
            dir="ltr"
            className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
          >
            <PanelCard dir="rtl" className="min-h-[620px] p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    سوال از کتاب با ذکر منبع
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                    سوال متنی یا عکس سوال را بفرست. راستینو اول متن سوال را
                    می‌خواند، بعد در کتاب‌های همان پایه و رشته جستجو می‌کند.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs leading-6 text-zinc-400">
                  <span className="font-black text-zinc-200">
                    {selectedBook ? selectedBook.title : "همه کتاب‌های مرتبط"}
                  </span>
                  <br />
                  پایه {grade} • {trackLabel(track)}
                </div>
              </div>

              <form onSubmit={askFromBooks} className="mt-5">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={8}
                  placeholder="سوالت را بنویس. اگر عکس سوال را می‌فرستی، اینجا می‌توانی توضیح کوتاه هم اضافه کنی..."
                  className="w-full resize-none rounded-[1.7rem] border border-white/10 bg-black/35 px-5 py-5 text-sm leading-8 text-white outline-none placeholder:text-zinc-600 focus:border-white/25"
                />

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm font-bold text-zinc-300 transition hover:bg-white/[0.05]"
                  >
                    {imageName ? `عکس انتخاب شد: ${imageName}` : "افزودن عکس سوال"}
                  </button>

                  {imageDataUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setImageDataUrl("");
                        setImageName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="rounded-2xl border border-red-400/20 px-5 py-4 text-sm font-bold text-red-200 transition hover:bg-red-400/10"
                    >
                      حذف عکس
                    </button>
                  ) : null}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {imageDataUrl ? (
                  <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-3">
                    <img
                      src={imageDataUrl}
                      alt="عکس سوال"
                      className="max-h-64 w-full rounded-2xl object-contain"
                    />
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    type="submit"
                    disabled={isAsking}
                    className="rounded-2xl border border-white px-7 py-4 text-sm font-black transition disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      opacity: isAsking ? 0.72 : 1,
                      boxShadow: "0 18px 45px rgba(255,255,255,0.13)",
                    }}
                  >
                    {isAsking ? "در حال جستجو و پاسخ..." : "پاسخ منبع‌دار بساز"}
                  </button>

                  <p className="text-xs leading-6 text-zinc-500">
                    پاسخ‌ها فقط وقتی واقعاً منبع‌دار می‌شوند که کتاب‌ها ingest
                    شده باشند.
                  </p>
                </div>
              </form>

              {ragStatus ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-zinc-300">
                  {ragStatus}
                </div>
              ) : null}

              {extractedQuestion ? (
                <article className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
                  <h3 className="mb-3 text-lg font-black">
                    متن استخراج‌شده از تصویر
                  </h3>
                  <div className="whitespace-pre-wrap text-sm leading-8 text-zinc-300">
                    {extractedQuestion}
                  </div>
                </article>
              ) : null}

              {ragAnswer ? (
                <article className="mt-5 rounded-3xl border border-white/10 bg-black/35 p-5">
                  <h3 className="mb-3 text-lg font-black">پاسخ راستینو</h3>
                  <div className="whitespace-pre-wrap text-sm leading-8 text-zinc-200">
                    {ragAnswer}
                  </div>
                </article>
              ) : null}

              {ragSources.length > 0 ? (
                <div className="mt-5">
                  <h3 className="mb-3 text-lg font-black">
                    منابع پیدا شده از کتاب
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {ragSources.map((source, index) => (
                      <div
                        key={`${source.bookTitle}-${source.page}-${index}`}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <p className="text-sm font-black">
                          منبع {index + 1}: {source.bookTitle}
                        </p>
                        <p className="mt-1 text-xs leading-6 text-zinc-500">
                          پایه {source.grade} • {trackLabel(source.track)} •{" "}
                          {source.subject}
                          {source.page ? ` • صفحه ${source.page}` : ""}
                        </p>
                        <p className="mt-3 line-clamp-4 text-xs leading-6 text-zinc-400">
                          {source.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </PanelCard>

            <PanelCard dir="rtl" className="p-5 md:p-6">
              <h2 className="text-xl font-black">انتخاب مسیر آموزشی</h2>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                پایه، رشته و کتاب را مشخص کن تا جستجو دقیق‌تر انجام شود.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel>پایه</FieldLabel>
                  <select
                    value={grade}
                    onChange={(event) => setGrade(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none"
                  >
                    {Array.from({ length: 12 }).map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                        پایه {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>رشته / مسیر آموزشی</FieldLabel>
                  <select
                    value={track}
                    onChange={(event) => setTrack(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none"
                  >
                    {availableTracks.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>درس</FieldLabel>
                  <select
                    value={subject}
                    onChange={(event) => {
                      setSubject(event.target.value);
                      setBookId("");
                    }}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none"
                  >
                    <option value="">همه درس‌ها</option>
                    {subjectsForSelection.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>کتاب</FieldLabel>
                  <select
                    value={bookId}
                    onChange={(event) => setBookId(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none"
                  >
                    <option value="">همه کتاب‌های مرتبط</option>
                    {booksForSubject.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-black">وضعیت کتابخانه</p>
                <p className="mt-2 text-xs leading-6 text-zinc-500">
                  {booksStatus}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white/[0.04] p-3 text-center">
                    <p className="text-lg font-black">{grade}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">پایه</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-3 text-center">
                    <p className="text-lg font-black">{filteredBooks.length}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">کتاب</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-3 text-center">
                    <p className="text-lg font-black">
                      {filteredBooks.reduce(
                        (sum, book) => sum + (book._count?.chunks || 0),
                        0
                      )}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">بخش</p>
                  </div>
                </div>

                <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1">
                  {filteredBooks.length === 0 ? (
                    <p className="text-xs leading-6 text-zinc-600">
                      هنوز کتابی برای این پایه/رشته وارد نشده.
                    </p>
                  ) : (
                    filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <p className="text-xs font-black">{book.title}</p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                          {book.subject} • {book._count?.chunks || 0} بخش
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </PanelCard>
          </section>
        ) : (
          <section
            dir="ltr"
            className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_320px_minmax(360px,0.9fr)]"
          >
            <PanelCard dir="rtl" className="p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">جدول هفتگی</h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-500">
                    برنامه این هفته را بساز؛ هر کاری را انجام دادی تیک بزن تا
                    آمار آمادگی به‌روزرسانی شود.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-400">
                  {doneTaskCount} از {tasks.length} کار انجام شده
                </div>
              </div>

              <form onSubmit={createTask} className="mt-5 grid gap-3 md:grid-cols-4">
                <input
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="مثلاً مرور فصل ۲"
                  className="h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-zinc-600 md:col-span-2"
                />

                <input
                  value={taskSubject}
                  onChange={(event) => setTaskSubject(event.target.value)}
                  placeholder="درس"
                  className="h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-zinc-600"
                />

                <input
                  value={taskMinutes}
                  onChange={(event) => setTaskMinutes(event.target.value)}
                  placeholder="دقیقه"
                  inputMode="numeric"
                  className="h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-zinc-600"
                />

                <select
                  value={taskDay}
                  onChange={(event) => setTaskDay(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none md:col-span-2"
                >
                  {weekdays.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>

                <button
                  className="h-12 rounded-2xl border border-white px-5 text-sm font-black transition"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    boxShadow: "0 18px 45px rgba(255,255,255,0.12)",
                  }}
                >
                  افزودن به برنامه
                </button>
              </form>

              {studyStatus ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                  {studyStatus}
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {weekdays.map((day, index) => {
                  const dayTasks = tasks.filter((task) => task.dayIndex === index);

                  return (
                    <div
                      key={day}
                      className="min-h-[150px] rounded-3xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black">{day}</p>
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] text-zinc-500">
                          {dayTasks.length} کار
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {dayTasks.length === 0 ? (
                          <p className="text-xs leading-6 text-zinc-600">
                            برنامه‌ای ثبت نشده.
                          </p>
                        ) : (
                          dayTasks.map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => toggleTask(task.id)}
                              className={`block w-full rounded-2xl border px-3 py-3 text-right text-xs leading-6 transition ${
                                task.status === "done"
                                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                                  : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                              }`}
                            >
                              <span className="font-black">{task.subject}</span>{" "}
                              — {task.title}
                              <span className="mt-1 block text-zinc-500">
                                {task.minutes} دقیقه
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PanelCard>

            <PanelCard dir="rtl" className="p-5 md:p-6">
              <h2 className="text-xl font-black">آمار آمادگی</h2>
              <p className="mt-2 text-sm leading-7 text-zinc-500">
                وضعیت مطالعه و آمادگی هر درس اینجا دیده می‌شود.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs text-zinc-500">مطالعه ثبت‌شده</p>
                  <p className="mt-2 text-2xl font-black">
                    {totalStudyMinutes}
                    <span className="mr-1 text-xs text-zinc-500">دقیقه</span>
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs text-zinc-500">میانگین آمادگی</p>
                  <p className="mt-2 text-2xl font-black">{averageReadiness}٪</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${averageReadiness}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs text-zinc-500">کارهای انجام‌شده</p>
                  <p className="mt-2 text-2xl font-black">
                    {doneTaskCount}
                    <span className="mr-1 text-xs text-zinc-500">
                      از {tasks.length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {stats.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-zinc-500">
                    هنوز آماری ثبت نشده. بعد از تکمیل برنامه‌ها، این بخش پر
                    می‌شود.
                  </p>
                ) : (
                  stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black">{stat.subject}</p>
                        <p className="text-xs text-zinc-500">
                          {stat.studiedMinutes} دقیقه
                        </p>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${Math.min(100, stat.readiness)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        آمادگی: {Math.min(100, stat.readiness)}٪
                      </p>
                    </div>
                  ))
                )}
              </div>
            </PanelCard>

            <PanelCard
              dir="rtl"
              className="flex min-h-[720px] flex-col overflow-hidden"
            >
              <div className="border-b border-white/10 p-5 md:p-6">
                <h2 className="text-2xl font-black">مشاور مطالعه</h2>
                <p className="mt-2 text-sm leading-7 text-zinc-500">
                  به مشاور بگو این هفته چه چیزهایی را می‌خواهی جمع کنی، کجا
                  عقب افتادی یا چه چیزی اذیتت می‌کند.
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {messages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/25 p-5 text-sm leading-8 text-zinc-500">
                    برای شروع بنویس:
                    <br />
                    «این هفته می‌خوام زیست و ریاضی رو جمع کنم، از کجا شروع
                    کنم؟»
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                          message.role === "user"
                            ? "mr-auto bg-white text-black"
                            : "ml-auto border border-white/10 bg-white/[0.05] text-zinc-200"
                        }`}
                      >
                        {message.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={sendCoachMessage}
                className="border-t border-white/10 bg-black/20 p-4"
              >
                <div className="flex gap-2">
                  <input
                    value={coachText}
                    onChange={(event) => setCoachText(event.target.value)}
                    placeholder="پیام به مشاور..."
                    className="h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                  <button
                    disabled={isCoachSending}
                    className="rounded-2xl border border-white px-5 text-sm font-black transition disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      opacity: isCoachSending ? 0.72 : 1,
                      boxShadow: "0 18px 45px rgba(255,255,255,0.12)",
                    }}
                  >
                    ارسال
                  </button>
                </div>
              </form>
            </PanelCard>
          </section>
        )}
      </div>
    </main>
  );
}
