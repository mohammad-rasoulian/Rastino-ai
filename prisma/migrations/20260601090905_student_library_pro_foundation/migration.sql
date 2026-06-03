-- CreateTable
CREATE TABLE "StudentBookImportJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "filePath" TEXT,
    "manifest" TEXT,
    "error" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "finishedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" INTEGER NOT NULL,
    "track" TEXT NOT NULL DEFAULT 'general',
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "edition" TEXT,
    "sourceUrl" TEXT,
    "fileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" TEXT,
    "storageProvider" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "pageCount" INTEGER,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "ingestionStatus" TEXT NOT NULL DEFAULT 'not_uploaded',
    "ingestionError" TEXT,
    "lastIngestedAt" DATETIME,
    "vectorStatus" TEXT NOT NULL DEFAULT 'pending',
    "ocrStatus" TEXT NOT NULL DEFAULT 'not_required',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StudentBook" ("createdAt", "edition", "fileName", "grade", "id", "metadata", "sourceUrl", "status", "subject", "title", "track", "updatedAt") SELECT "createdAt", "edition", "fileName", "grade", "id", "metadata", "sourceUrl", "status", "subject", "title", "track", "updatedAt" FROM "StudentBook";
DROP TABLE "StudentBook";
ALTER TABLE "new_StudentBook" RENAME TO "StudentBook";
CREATE INDEX "StudentBook_grade_idx" ON "StudentBook"("grade");
CREATE INDEX "StudentBook_track_idx" ON "StudentBook"("track");
CREATE INDEX "StudentBook_subject_idx" ON "StudentBook"("subject");
CREATE INDEX "StudentBook_status_idx" ON "StudentBook"("status");
CREATE INDEX "StudentBook_ingestionStatus_idx" ON "StudentBook"("ingestionStatus");
CREATE UNIQUE INDEX "StudentBook_grade_track_subject_title_key" ON "StudentBook"("grade", "track", "subject", "title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StudentBookImportJob_status_idx" ON "StudentBookImportJob"("status");

-- CreateIndex
CREATE INDEX "StudentBookImportJob_source_idx" ON "StudentBookImportJob"("source");

-- CreateIndex
CREATE INDEX "StudentBookImportJob_createdAt_idx" ON "StudentBookImportJob"("createdAt");
