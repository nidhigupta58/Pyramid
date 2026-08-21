export type Priority = "NO_PRIORITY" | "URGENT" | "HIGH" | "MEDIUM" | "LOW";
export type Status = "TODO" | "DOING" | "COMPLETED" | "ON_HOLD" | "BACKLOG";
export type Role = "OWNER" | "ADMIN" | "MEMBER";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  title: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: Role;
  joinedAt: string;
  user: CurrentUser;
}

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

export interface LabelSummary {
  labelId: string;
  label: { id: string; name: string; color: string | null };
}

export interface CommentItem {
  id: string;
  body: string;
  createdAt: string;
  author: MemberSummary;
}

export interface ActivityItem {
  id: string;
  verb: string;
  meta: Record<string, string>;
  createdAt: string;
  actor: MemberSummary;
}

export interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  team: string | null;
  assignee: MemberSummary | null;
  reporter: MemberSummary | null;
  subtasks: TaskListItem[];
  labels: LabelSummary[];
  comments: CommentItem[];
  activity: ActivityItem[];
}
