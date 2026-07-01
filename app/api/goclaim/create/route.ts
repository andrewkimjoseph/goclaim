import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAgentWallet } from "@/lib/onchain/createAgent";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agent = await createAgentWallet(session.userId);
    return NextResponse.json(agent);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create agent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
