-- CreateTable
CREATE TABLE "StudentBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "edition" TEXT,
    "sourceUrl" TEXT,
    "fileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentBookChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "page" INTEGER,
    "chapter" TEXT,
    "section" TEXT,
    "content" TEXT NOT NULL,
    "keywords" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentBookChunk_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "StudentBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentStudyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "weekEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "StudentStudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentStudyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayIndex" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "bookTitle" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "minutes" INTEGER NOT NULL DEFAULT 45,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    CONSTRAINT "StudentStudyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentStudyTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudentStudyPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentStudyStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "bookTitle" TEXT,
    "studiedMinutes" INTEGER NOT NULL DEFAULT 0,
    "readiness" INTEGER NOT NULL DEFAULT 0,
    "solvedQuestions" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "StudentStudyStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentCoachMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "StudentCoachMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StudentBook_grade_idx" ON "StudentBook"("grade");

-- CreateIndex
CREATE INDEX "StudentBook_subject_idx" ON "StudentBook"("subject");

-- CreateIndex
CREATE INDEX "StudentBook_status_idx" ON "StudentBook"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentBook_grade_subject_title_key" ON "StudentBook"("grade", "subject", "title");

-- CreateIndex
CREATE INDEX "StudentBookChunk_bookId_idx" ON "StudentBookChunk"("bookId");

-- CreateIndex
CREATE INDEX "StudentBookChunk_grade_idx" ON "StudentBookChunk"("grade");

-- CreateIndex
CREATE INDEX "StudentBookChunk_subject_idx" ON "StudentBookChunk"("subject");

-- CreateIndex
CREATE INDEX "StudentBookChunk_page_idx" ON "StudentBookChunk"("page");

-- CreateIndex
CREATE INDEX "StudentStudyPlan_userId_idx" ON "StudentStudyPlan"("userId");

-- CreateIndex
CREATE INDEX "StudentStudyPlan_weekStart_idx" ON "StudentStudyPlan"("weekStart");

-- CreateIndex
CREATE INDEX "StudentStudyPlan_status_idx" ON "StudentStudyPlan"("status");

-- CreateIndex
CREATE INDEX "StudentStudyTask_userId_idx" ON "StudentStudyTask"("userId");

-- CreateIndex
CREATE INDEX "StudentStudyTask_planId_idx" ON "StudentStudyTask"("planId");

-- CreateIndex
CREATE INDEX "StudentStudyTask_dayIndex_idx" ON "StudentStudyTask"("dayIndex");

-- CreateIndex
CREATE INDEX "StudentStudyTask_status_idx" ON "StudentStudyTask"("status");

-- CreateIndex
CREATE INDEX "StudentStudyStat_userId_idx" ON "StudentStudyStat"("userId");

-- CreateIndex
CREATE INDEX "StudentStudyStat_subject_idx" ON "StudentStudyStat"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "StudentStudyStat_userId_subject_bookTitle_key" ON "StudentStudyStat"("userId", "subject", "bookTitle");

-- CreateIndex
CREATE INDEX "StudentCoachMessage_userId_idx" ON "StudentCoachMessage"("userId");

-- CreateIndex
CREATE INDEX "StudentCoachMessage_role_idx" ON "StudentCoachMessage"("role");

-- CreateIndex
CREATE INDEX "StudentCoachMessage_createdAt_idx" ON "StudentCoachMessage"("createdAt");
