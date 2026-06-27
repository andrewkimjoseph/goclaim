-- CreateTable
CREATE TABLE "ConnectAccountLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "smartAccountAddress" TEXT NOT NULL,
    "rootAddress" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectAccountLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectAccountLog_userId_key" ON "ConnectAccountLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectAccountLog_txHash_key" ON "ConnectAccountLog"("txHash");

-- AddForeignKey
ALTER TABLE "ConnectAccountLog" ADD CONSTRAINT "ConnectAccountLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
