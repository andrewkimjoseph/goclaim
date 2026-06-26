-- CreateTable
CREATE TABLE "TransferLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "claimLogId" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "amountWei" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "userOpHash" TEXT NOT NULL,
    "transferredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransferLog_claimLogId_key" ON "TransferLog"("claimLogId");

-- AddForeignKey
ALTER TABLE "TransferLog" ADD CONSTRAINT "TransferLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLog" ADD CONSTRAINT "TransferLog_claimLogId_fkey" FOREIGN KEY ("claimLogId") REFERENCES "ClaimLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
