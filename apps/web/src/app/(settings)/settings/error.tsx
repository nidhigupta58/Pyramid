"use client";

import { ErrorState } from "@/components/error-state";

export default function SettingsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load settings"
      description="Something went wrong fetching this page. Try again."
      onRetry={reset}
    />
  );
}
