import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

type GettingStartedHeroProps = {
  headline: string;
  subhead: string;
  children?: ReactNode;
  priority?: boolean;
};

export function GettingStartedHero({
  headline,
  subhead,
  children,
  priority,
}: GettingStartedHeroProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 w-full">
      <BrandLogo size="hero" alt="" priority={priority} />
      <h1 className="font-display font-extrabold text-4xl tracking-tight leading-tight text-white">
        {headline}
      </h1>
      <p className="text-white/85 text-base leading-relaxed px-2">{subhead}</p>
      {children ? <div className="w-full mt-6">{children}</div> : null}
    </div>
  );
}
