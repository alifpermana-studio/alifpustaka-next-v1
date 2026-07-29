-- CreateTable
CREATE TABLE "discussion" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "editedAt" TIMESTAMPTZ(3),
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMPTZ(3),
    "permanentDeleteAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discussion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discussion_userId_idx" ON "discussion"("userId");

-- CreateIndex
CREATE INDEX "discussion_sourceType_sourceId_idx" ON "discussion"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "discussion_status_idx" ON "discussion"("status");

-- CreateIndex
CREATE INDEX "discussion_parentId_idx" ON "discussion"("parentId");

-- CreateIndex
CREATE INDEX "discussion_createdAt_idx" ON "discussion"("createdAt");

-- CreateIndex
CREATE INDEX "discussion_permanentDeleteAt_idx" ON "discussion"("permanentDeleteAt");

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
