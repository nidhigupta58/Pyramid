import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceNotFound() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold text-foreground">Workspace not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This workspace doesn&apos;t exist, or you&apos;re not a member of it.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/">Back to app</Link>
      </Button>
    </main>
  );
}
