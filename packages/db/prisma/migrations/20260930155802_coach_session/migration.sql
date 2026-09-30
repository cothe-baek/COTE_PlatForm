-- CreateTable
CREATE TABLE "CoachSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachSession_userId_problemId_key" ON "CoachSession"("userId", "problemId");

-- AddForeignKey
ALTER TABLE "CoachSession" ADD CONSTRAINT "CoachSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSession" ADD CONSTRAINT "CoachSession_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
