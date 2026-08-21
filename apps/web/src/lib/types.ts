export type Priority = "NO_PRIORITY" | "URGENT" | "HIGH" | "MEDIUM" | "LOW";
export type Status = "TODO" | "DOING" | "COMPLETED" | "ON_HOLD" | "BACKLOG";

export interface MemberSummary {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface TaskListItem {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  assignee: MemberSummary | null;
  tags: string[];
}

export type BoardData = Record<Status, TaskListItem[]>;

export interface ProjectListItem {
  id: string;
  name: string;
  priority: Priority;
  dueDate: string | null;
  lead: MemberSummary | null;
}
