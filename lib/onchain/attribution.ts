import { concat, stringToHex, type Hex } from "viem";

/** Calldata suffix appended to prepared transactions for on-chain attribution. */
export const GOCLAIM_DATA_SUFFIX = stringToHex("GOCLAIM");

export function appendDataSuffix(
  data: Hex,
  suffix: Hex = GOCLAIM_DATA_SUFFIX
): Hex {
  return concat([data, suffix]);
}

/** Alias matching Celina repos: `concat([data, GOCLAIM_DATA_SUFFIX])`. */
export function taggedCalldata(
  data: Hex,
  suffix: Hex = GOCLAIM_DATA_SUFFIX
): Hex {
  return appendDataSuffix(data, suffix);
}

export function hasDataSuffix(
  data: Hex,
  suffix: Hex = GOCLAIM_DATA_SUFFIX
): boolean {
  const suffixBody = suffix.slice(2).toLowerCase();
  return data.slice(2).toLowerCase().endsWith(suffixBody);
}

export function stripDataSuffix(
  data: Hex,
  suffix: Hex = GOCLAIM_DATA_SUFFIX
): Hex {
  if (!hasDataSuffix(data, suffix)) {
    return data;
  }
  const suffixBody = suffix.slice(2);
  return `0x${data.slice(2, data.length - suffixBody.length)}` as Hex;
}
