"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared shell for every route-segment error.tsx — keeps the fallback UI consistent app-wide. */
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </main>
  );
}
