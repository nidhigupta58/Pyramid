import { Eye, Lock, MoreHorizontal, PanelRight, Share2 } from "lucide-react";

// Decorative — refs' lock/share/panel icons don't have a backing feature yet.
export function RailActions({ viewerCount = 1 }: { viewerCount?: number }) {
  const items = [
    { icon: Lock, label: "Lock" },
    { icon: Eye, label: `${viewerCount} viewer${viewerCount === 1 ? "" : "s"}`, showCount: true },
    { icon: Share2, label: "Share" },
    { icon: MoreHorizontal, label: "More" },
    { icon: PanelRight, label: "Toggle panel" },
  ];

  return (
    <div className="flex items-center justify-end gap-1.5">
      {items.map(({ icon: Icon, label, showCount }, i) => (
        <button
          key={i}
          type="button"
          aria-label={label}
          className="flex h-[26px] min-w-[26px] items-center justify-center gap-1 rounded-md border border-border-control px-1.5 text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Icon className="size-3.5" />
          {showCount && <span className="text-xs">{viewerCount}</span>}
        </button>
      ))}
    </div>
  );
}
