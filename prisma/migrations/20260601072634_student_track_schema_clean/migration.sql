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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StudentBook" ("createdAt", "edition", "fileName", "grade", "id", "metadata", "sourceUrl", "status", "subject", "title", "updatedAt") SELECT "createdAt", "edition", "fileName", "grade", "id", "metadata", "sourceUrl", "status", "subject", "title", "updatedAt" FROM "StudentBook";
DROP TABLE "StudentBook";
ALTER TABLE "new_StudentBook" RENAME TO "StudentBook";
CREATE INDEX "StudentBook_grade_idx" ON "StudentBook"("grade");
CREATE INDEX "StudentBook_track_idx" ON "StudentBook"("track");
CREATE INDEX "StudentBook_subject_idx" ON "StudentBook"("subject");
CREATE INDEX "StudentBook_status_idx" ON "StudentBook"("status");
CREATE UNIQUE INDEX "StudentBook_grade_track_subject_title_key" ON "StudentBook"("grade", "track", "subject", "title");
CREATE TABLE "new_StudentBookChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "track" TEXT NOT NULL DEFAULT 'general',
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
INSERT INTO "new_StudentBookChunk" ("bookId", "chapter", "content", "createdAt", "grade", "id", "keywords", "metadata", "page", "section", "subject") SELECT "bookId", "chapter", "content", "createdAt", "grade", "id", "keywords", "metadata", "page", "section", "subject" FROM "StudentBookChunk";
DROP TABLE "StudentBookChunk";
ALTER TABLE "new_StudentBookChunk" RENAME TO "StudentBookChunk";
CREATE INDEX "StudentBookChunk_bookId_idx" ON "StudentBookChunk"("bookId");
CREATE INDEX "StudentBookChunk_grade_idx" ON "StudentBookChunk"("grade");
CREATE INDEX "StudentBookChunk_track_idx" ON "StudentBookChunk"("track");
CREATE INDEX "StudentBookChunk_subject_idx" ON "StudentBookChunk"("subject");
CREATE INDEX "StudentBookChunk_page_idx" ON "StudentBookChunk"("page");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
