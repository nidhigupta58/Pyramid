"use client";

import { ErrorState } from "@/components/error-state";

export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load this workspace"
      description="Something went wrong fetching this page. Try again."
      onRetry={reset}
    />
  );
}
