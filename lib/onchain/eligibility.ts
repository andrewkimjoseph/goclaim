import { type Hex, zeroAddress } from "viem";
import { identityAbi } from "./abis/identity";
import { ubiSchemeAbi } from "./abis/ubiScheme";
import { IDENTITY_PROXY_ADDRESS, UBI_SCHEME_PROXY_ADDRESS } from "./constants";
import { publicClient } from "./config";
import { createSmartAccount } from "./createSmartAccount";

type EligibilityBase = {
  eoaAddress: Hex;
  smartAccountAddress: Hex;
  whitelistedRoot: Hex;
};

export type UbiClaimEligibility =
  | (EligibilityBase & { status: "already_claimed"; entitlement: "0" })
  | (EligibilityBase & { status: "eligible"; entitlement: bigint })
  | (EligibilityBase & { status: "not_whitelisted"; entitlement: "0" })
  | (EligibilityBase & { status: "no_entitlement"; entitlement: "0" });

export async function checkUbiClaimEligibility(
  privateKeyHex: Hex
): Promise<UbiClaimEligibility> {
  const { eoaAddress, smartAccountAddress } =
    await createSmartAccount(privateKeyHex);

  const whitelistedRoot = await publicClient.readContract({
    address: IDENTITY_PROXY_ADDRESS,
    abi: identityAbi,
    functionName: "getWhitelistedRoot",
    args: [smartAccountAddress],
  });

  const base: EligibilityBase = {
    eoaAddress,
    smartAccountAddress,
    whitelistedRoot,
  };

  if (whitelistedRoot === zeroAddress) {
    return { ...base, status: "not_whitelisted", entitlement: "0" };
  }

  const [hasClaimedResult, entitlementResult] = await publicClient.multicall({
    contracts: [
      {
        address: UBI_SCHEME_PROXY_ADDRESS,
        abi: ubiSchemeAbi,
        functionName: "hasClaimed",
        args: [whitelistedRoot],
      },
      {
        address: UBI_SCHEME_PROXY_ADDRESS,
        abi: ubiSchemeAbi,
        functionName: "checkEntitlement",
        args: [whitelistedRoot],
      },
    ],
  });

  if (hasClaimedResult.status !== "success") {
    throw new Error("Failed to read hasClaimed from UBI scheme");
  }

  if (hasClaimedResult.result) {
    return { ...base, status: "already_claimed", entitlement: "0" };
  }

  if (entitlementResult.status !== "success") {
    throw new Error("Failed to read checkEntitlement from UBI scheme");
  }

  const entitlement = entitlementResult.result;

  if (entitlement === BigInt(0)) {
    return { ...base, status: "no_entitlement", entitlement: "0" };
  }

  return { ...base, status: "eligible", entitlement };
}

export async function getLinkStatus(
  smartAccountAddress: Hex,
  rootAddress: Hex
): Promise<{
  isWhitelisted: boolean;
  linkComplete: boolean;
  whitelistedRoot: Hex;
}> {
  const whitelistedRoot = await publicClient.readContract({
    address: IDENTITY_PROXY_ADDRESS,
    abi: identityAbi,
    functionName: "getWhitelistedRoot",
    args: [smartAccountAddress],
  });

  const isWhitelisted = whitelistedRoot !== zeroAddress;
  const linkComplete =
    isWhitelisted &&
    whitelistedRoot.toLowerCase() === rootAddress.toLowerCase();

  return { isWhitelisted, linkComplete, whitelistedRoot };
}
