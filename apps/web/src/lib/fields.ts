export type FieldKey = "priority" | "members" | "dueDate" | "labels" | "status" | "reporter";
export type FieldsState = Record<FieldKey, boolean>;

export const DEFAULT_FIELDS: FieldsState = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  status: false,
  reporter: false,
};

export function withDefaults(fields: Partial<FieldsState> | null | undefined): FieldsState {
  return { ...DEFAULT_FIELDS, ...fields };
}

// The refs genuinely list "Members" twice in the Fields menu (plan §8) — both rows toggle the
// same underlying key, since there's only one real "members" column to show or hide.
export const FIELDS_MENU_ROWS: { label: string; key: FieldKey }[] = [
  { label: "Priority", key: "priority" },
  { label: "Members", key: "members" },
  { label: "Due Date", key: "dueDate" },
  { label: "Members", key: "members" },
  { label: "Labels", key: "labels" },
  { label: "Status", key: "status" },
  { label: "Reporter", key: "reporter" },
];
