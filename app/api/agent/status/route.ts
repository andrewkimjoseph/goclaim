import { NextResponse } from "next/server";
import { type Address } from "viem";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLinkStatus } from "@/lib/onchain/eligibility";
import { resolveAgentAddresses } from "@/lib/onchain/resolveAgentAddresses";
import { publicClient } from "@/lib/onchain/config";

type ClaimLogRow = {
  id: string;
  status: string;
  txHash: string | null;
  errorMsg: string | null;
  claimedAt: Date;
  waveIndex: number | null;
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      agentWallet: true,
      claimLogs: {
        orderBy: { claimedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.agentWallet) {
    return NextResponse.json({
      hasAgent: false,
      rootAddress: user.rootAddress,
    });
  }

  const resolved = await resolveAgentAddresses(session.userId);
  if (!resolved) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const simpleSmartAccountAddress = resolved.smartAccountAddress;

  const link = await getLinkStatus(
    simpleSmartAccountAddress,
    user.rootAddress as Address
  );

  const saBytecode = await publicClient.getBytecode({
    address: simpleSmartAccountAddress,
  });
  const isDeployed = Boolean(saBytecode && saBytecode !== "0x");

  const successfulClaims = await prisma.claimLog.findMany({
    where: { userId: user.id, status: "success" },
    select: { id: true },
  });

  return NextResponse.json({
    hasAgent: true,
    rootAddress: user.rootAddress,
    /** ERC-4337 simple smart account — the connectAccount target and claim sender */
    simpleSmartAccountAddress,
    /** @deprecated use simpleSmartAccountAddress */
    smartAccountAddress: simpleSmartAccountAddress,
    isCounterfactual: !isDeployed,
    isActive: user.agentWallet.isActive,
    lastClaimedAt: user.agentWallet.lastClaimedAt,
    linkStatus: link.linkComplete
      ? "active"
      : link.isWhitelisted
        ? "linked_other"
        : "pending",
    linkComplete: link.linkComplete,
    whitelistedRoot: link.whitelistedRoot,
    lifetimeClaims: successfulClaims.length,
    claimLogs: (user.claimLogs as ClaimLogRow[]).map((log) => ({
      id: log.id,
      status: log.status,
      txHash: log.txHash,
      errorMsg: log.errorMsg,
      claimedAt: log.claimedAt.toISOString(),
      waveIndex: log.waveIndex,
    })),
  });
}
