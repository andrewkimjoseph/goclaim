import type { Address } from "viem";
import { celina } from "@/lib/celina";
import { formatGdAmountWhole } from "./claimUbi";

export async function getRootGdBalance(rootAddress: Address): Promise<string> {
  const balance = await celina.token.getTokenBalance("GoodDollar", rootAddress);
  return formatGdAmountWhole(balance.raw);
}
