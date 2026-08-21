"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder login screen — pixel-matched to ref 01 in P6. For now, just enough to get an
// authenticated session so the shell (P5) and later phases can be exercised end to end.
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 bg-background p-6 text-foreground">
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Triangle className="size-3.5" fill="currentColor" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Pyramid</span>
      </div>
      <div className="flex w-full max-w-[330px] flex-col gap-4 rounded-xl border border-border p-6">
        <h1 className="text-center text-sm font-medium text-muted-foreground">Let&apos;s get back on track</h1>
        <Button className="w-full" disabled={loading} onClick={continueAsGuest}>
          Continue as Guest
        </Button>
        <Button variant="outline" className="w-full" disabled>
          Login with Google
        </Button>
      </div>
    </main>
  );
}
