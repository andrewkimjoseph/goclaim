import { type Hex } from "viem";
import { decryptPrivateKey } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { createSmartAccount } from "./createSmartAccount";

export type ResolvedAgentAddresses = {
  smartAccountAddress: Hex;
  eoaAddress: Hex;
  dbCorrected: boolean;
};

/**
 * Derive the ERC-4337 simple smart account from the stored agent key.
 * This is the only address that must be passed to Identity.connectAccount.
 */
export async function resolveAgentAddresses(
  userId: string
): Promise<ResolvedAgentAddresses | null> {
  const agent = await prisma.agentWallet.findUnique({ where: { userId } });
  if (!agent) return null;

  const privateKey = decryptPrivateKey(
    agent.encryptedPrivateKey,
    agent.iv
  ) as Hex;
  const privateKeyHex = (
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  ) as Hex;

  const derived = await createSmartAccount(privateKeyHex);

  const dbSa = agent.smartAccountAddress.toLowerCase();
  const derivedSa = derived.smartAccountAddress.toLowerCase();
  let dbCorrected = false;

  if (dbSa !== derivedSa || agent.eoaAddress.toLowerCase() !== derived.eoaAddress.toLowerCase()) {
    await prisma.agentWallet.update({
      where: { userId },
      data: {
        smartAccountAddress: derived.smartAccountAddress,
        eoaAddress: derived.eoaAddress,
      },
    });
    dbCorrected = true;
  }

  return {
    smartAccountAddress: derived.smartAccountAddress,
    eoaAddress: derived.eoaAddress,
    dbCorrected,
  };
}
