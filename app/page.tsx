"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectSignIn } from "@/components/ConnectSignIn";
import { useSession } from "@/lib/hooks/useSession";
import { copy } from "@/lib/copy";

export default function LandingPage() {
  const router = useRouter();
  const { authenticated, checked } = useSession();

  useEffect(() => {
    if (checked && authenticated) {
      router.replace("/dashboard");
    }
  }, [checked, authenticated, router]);

  if (checked && authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/70 font-display">{copy.auth.openingDashboard}</p>
      </div>
    );
  }

  async function handleSuccess() {
    const createRes = await fetch("/api/agent/create", {
      method: "POST",
      credentials: "include",
    });
    if (createRes.ok) {
      router.push("/dashboard?onboarding=1");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="font-display font-extrabold text-2xl text-foreground tracking-tight">
          GoClaim
        </span>
        <span className="section-label hidden sm:inline">GoodDollar UBI</span>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        <section className="py-16 md:py-24 text-center">
          <p className="section-label inline-block mb-6">{copy.landing.tagline}</p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-foreground tracking-tight leading-tight">
            {copy.landing.headline}
          </h1>
          <p className="mt-6 text-foreground/70 text-lg max-w-xl mx-auto">
            {copy.landing.subhead}
          </p>
          <div className="mt-10">
            <ConnectSignIn onSuccess={handleSuccess} />
          </div>
        </section>

        <section className="py-16 border-t border-foreground/20">
          <h2 className="font-display font-bold text-2xl text-center text-foreground mb-10">
            {copy.landing.howItWorks}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {copy.landing.steps.map((step, i) => (
              <div key={step.title} className="card text-left">
                <span className="font-display font-extrabold text-primary text-3xl">
                  {i + 1}
                </span>
                <h3 className="font-display font-bold text-lg mt-2">
                  {step.title}
                </h3>
                <p className="text-sm text-foreground/70 mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/20 py-8 text-center text-foreground/60 text-sm">
        {copy.landing.footer}
      </footer>
    </div>
  );
}
