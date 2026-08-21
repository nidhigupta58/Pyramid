"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Triangle } from "lucide-react";

// Pixel-matched to ref 01. Card width, logo mark, and legal-text width are literal artboard
// values per the plan (§9 P6) — everything else (font sizes, colours, radii) goes through the
// §3 scale mapping / design tokens rather than the artboard's raw px.
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function continueAsGuest() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/guest", { method: "POST" });
      if (!res.ok) throw new Error("Guest login failed");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Couldn't start a guest session. Try again.");
      setLoading(false);
    }
  }

  return (
    // Accent is a per-user preference — force neutral here so a stale cookie (or a different
    // user on a shared browser) never colours the pre-auth screen. Refs always show it black.
    <main
      data-accent="black"
      className="flex min-h-full flex-col items-center justify-center gap-[22px] bg-background p-6"
    >
      <div className="flex items-center gap-2">
        <div className="flex size-[26px] items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Triangle className="size-3" fill="currentColor" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">Pyramid</span>
      </div>

      <div className="flex w-[330px] flex-col gap-4 rounded-xl border border-border bg-card px-[22px] py-[26px] shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[17px] font-semibold tracking-tight text-foreground">Let&apos;s get back on track</h1>
          <p className="text-sm text-muted-foreground-faint">Enter your email below to login to your account.</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={continueAsGuest}
            className="h-9 rounded-full bg-primary text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue as Guest"}
          </button>
          <button
            type="button"
            onClick={() => toast("Google sign-in is coming soon.")}
            className="flex h-9 items-center justify-center gap-2 rounded-full border border-border-control bg-card text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span className="font-mono font-medium text-[#4285f4]">G</span>
            Login with Google
          </button>
        </div>
      </div>

      <p className="w-[250px] text-center text-xs leading-relaxed text-muted-foreground-faint">
        By clicking continue, you agree to our{" "}
        <span className="cursor-pointer underline">Terms of Service</span> and{" "}
        <span className="cursor-pointer underline">Privacy Policy</span>
      </p>
    </main>
  );
}
