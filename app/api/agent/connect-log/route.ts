import { NextRequest, NextResponse } from "next/server";
import { type Address, type Hash, isHash } from "viem";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveAgentAddresses } from "@/lib/onchain/resolveAgentAddresses";
import { verifyConnectAccountTx } from "@/lib/onchain/verifyConnectAccountTx";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { txHash?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const txHash = body.txHash;
  if (!txHash || !isHash(txHash)) {
    return NextResponse.json({ error: "Valid txHash required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { agentWallet: true, connectAccountLog: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.agentWallet) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (user.connectAccountLog) {
    return NextResponse.json({
      id: user.connectAccountLog.id,
      txHash: user.connectAccountLog.txHash,
      connectedAt: user.connectAccountLog.connectedAt.toISOString(),
    });
  }

  const resolved = await resolveAgentAddresses(session.userId);
  if (!resolved) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  try {
    await verifyConnectAccountTx({
      txHash: txHash as Hash,
      rootAddress: user.rootAddress as Address,
      smartAccountAddress: resolved.smartAccountAddress,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid connectAccount transaction";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const log = await prisma.connectAccountLog.create({
    data: {
      userId: user.id,
      smartAccountAddress: resolved.smartAccountAddress,
      rootAddress: user.rootAddress,
      txHash,
    },
  });

  return NextResponse.json(
    {
      id: log.id,
      txHash: log.txHash,
      connectedAt: log.connectedAt.toISOString(),
    },
    { status: 201 }
  );
}
