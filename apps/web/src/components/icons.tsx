import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Circle,
  Command,
  Eye,
  Flag,
  FolderKanban,
  GripVertical,
  LayoutGrid,
  List,
  ListFilter,
  Lock,
  Moon,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  SignalHigh,
  Sun,
  Tag,
  Triangle,
  User,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * The reference artboard (Pyramid Task App.dc.html) draws icons as text glyphs — it's a
 * static mock, not a real font. This maps each one to its lucide equivalent so real screens
 * never render a glyph directly. See IMPLEMENTATION_PLAN.md §11 risks.
 */
export const GLYPH_ICONS = {
  "▦": LayoutGrid, // Tasks nav / Fields button
  "▣": FolderKanban, // Projects nav
  "▲": Triangle, // Pyramid logo mark
  "↗": Share2, // task detail rail action
  "⌕": Search,
  "⌘": Command,
  "⌃⌄": ChevronsUpDown, // workspace switcher
  "▟": SignalHigh, // priority bar-chart glyph
  "▤": Calendar, // due date / date picker
  "▸": ChevronRight, // collapsed submenu row
  "▾": ChevronDown, // expanded group / dropdown
  "◇": Tag, // label
  "◉": Eye, // viewer count
  "○": Circle, // status dot, unfilled
  "●": Circle, // status dot, filled (pass className="fill-current")
  "☰": List, // List view toggle
  "☺": User, // member avatar fallback
  "☻": UserCircle, // reporter
  "☾": Moon, // dark theme option
  "✳": Sun, // light theme option
  "⚑": Flag, // team
  "⚙": Settings,
  "⚯": Paperclip, // attach document / link
  "⚿": Lock,
  "✓": Check,
  "✎": Pencil,
  "➤": Send,
  "⠿": GripVertical, // drag handle
  "＋": Plus,
  "⛛": ListFilter, // toolbar filter button
} as const satisfies Record<string, LucideIcon>;

export type Glyph = keyof typeof GLYPH_ICONS;

export function glyphIcon(glyph: Glyph): LucideIcon {
  return GLYPH_ICONS[glyph];
}
