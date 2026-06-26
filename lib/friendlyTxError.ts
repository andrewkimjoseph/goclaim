export function friendlyConnectError(err?: { message?: string } | null): string {
  if (!err) return "Transaction failed";
  const m = (err.message ?? "").toString();
  if (/already connected/i.test(m)) {
    return "This agent is already linked to an identity.";
  }
  if (/invalid account/i.test(m)) {
    return "This smart account cannot be linked (already whitelisted or blacklisted).";
  }
  if (/not whitelisted/i.test(m)) {
    return "Your root wallet is not verified. Re-verify in GoodDollar and try again.";
  }
  if (/User rejected|denied|rejected the request/i.test(m)) {
    return "You cancelled the transaction.";
  }
  if (/insufficient funds|gas required/i.test(m)) {
    return "Not enough CELO for gas. Add funds to your root wallet and try again.";
  }
  return m.slice(0, 160);
}
