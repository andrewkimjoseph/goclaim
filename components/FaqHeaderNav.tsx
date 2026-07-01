"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useSession } from "@/lib/hooks/useSession";
import { copy } from "@/lib/copy";

export function FaqHeaderNav() {
  const { authenticated, checked } = useSession();
  const showDashboard = checked && authenticated;
  const targetHref = showDashboard ? "/dashboard" : "/";
  const targetLabel = showDashboard
    ? copy.faqs.backToDashboard
    : copy.dashboard.backToHome;

  return (
    <header className="header-bar" style={{ viewTransitionName: "site-header" }}>
      <Link href={targetHref}>
        <BrandLogo size="nav" />
      </Link>
      <Link
        href={targetHref}
        transitionTypes={["nav-back"]}
        className="section-label-inverse hover:bg-white/10 transition-colors shrink-0"
      >
        {targetLabel}
      </Link>
    </header>
  );
}
