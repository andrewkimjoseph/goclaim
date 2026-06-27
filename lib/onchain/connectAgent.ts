import { encodeFunctionData, type Address, type Hex } from "viem";
import { taggedCalldata } from "./attribution";
import { identityAbi } from "./abis/identity";
import { IDENTITY_PROXY_ADDRESS } from "./constants";
import { publicClient } from "./config";

export const IDENTITY_CONNECT_TARGET = IDENTITY_PROXY_ADDRESS;

export function encodeConnectAccount(smartAccountAddress: Address): Hex {
  // IdentityV4.connectAccount(account): account must be the ERC-4337 simple smart account.
  return encodeFunctionData({
    abi: identityAbi,
    functionName: "connectAccount",
    args: [smartAccountAddress],
  });
}

export function encodeTaggedConnectAccount(smartAccountAddress: Address): Hex {
  return taggedCalldata(encodeConnectAccount(smartAccountAddress));
}

export async function readConnectedRoot(
  smartAccountAddress: Address
): Promise<Address> {
  return publicClient.readContract({
    address: IDENTITY_PROXY_ADDRESS,
    abi: identityAbi,
    functionName: "getWhitelistedRoot",
    args: [smartAccountAddress],
  });
}

export async function readConnectedAccountsMapping(
  smartAccountAddress: Address
): Promise<Address> {
  return publicClient.readContract({
    address: IDENTITY_PROXY_ADDRESS,
    abi: identityAbi,
    functionName: "connectedAccounts",
    args: [smartAccountAddress],
  });
}
