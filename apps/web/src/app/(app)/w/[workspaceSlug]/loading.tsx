import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-72 shrink-0" />
        ))}
      </div>
    </div>
  );
}
