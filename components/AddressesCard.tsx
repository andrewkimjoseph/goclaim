import { CopyAddress } from "@/components/CopyAddress";
import { copy } from "@/lib/copy";

type AddressesCardProps = {
  rootAddress?: string;
  smartAccountAddress?: string;
};

export function AddressesCard({
  rootAddress,
  smartAccountAddress,
}: AddressesCardProps) {
  if (!rootAddress && !smartAccountAddress) return null;

  return (
    <details className="card group [&::-webkit-details-marker]:hidden">
      <summary className="text-xs font-display font-semibold text-shell cursor-pointer list-none flex items-center justify-between gap-3">
        <span className="min-w-0">{copy.dashboard.addressesLabel}</span>
        <span
          aria-hidden
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black rounded-brutal bg-white font-display font-bold text-lg leading-none text-foreground shadow-[2px_2px_0_0_#000000] group-open:bg-primary group-open:text-white transition-colors"
        >
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:block -mt-0.5">−</span>
        </span>
      </summary>

      <div className="mt-3 pt-3 border-t-2 border-black space-y-4">
        {rootAddress && (
          <div>
            <p className="text-xs font-display font-semibold text-shell mb-3">
              {copy.dashboard.walletLabel}
            </p>
            <CopyAddress address={rootAddress} nested />
          </div>
        )}

        {rootAddress && smartAccountAddress && (
          <div className="border-t-2 border-black" />
        )}

        {smartAccountAddress && (
          <div>
            <p className="text-xs font-display font-semibold text-shell mb-3">
              {copy.dashboard.smartAccountLabel}
            </p>
            <CopyAddress address={smartAccountAddress} nested />
          </div>
        )}
      </div>
    </details>
  );
}
