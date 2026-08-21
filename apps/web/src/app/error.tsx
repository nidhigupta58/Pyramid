"use client";

import { ErrorState } from "@/components/error-state";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="Something went wrong"
      description="An unexpected error occurred. Try again, or head back to the app."
      onRetry={reset}
    />
  );
}
