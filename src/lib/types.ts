export type SectionKey =
  | "requisitions"
  | "vacancies"
  | "candidates"
  | "interviews"
  | "offers"
  | "onboarding";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "user"
  | "checkbox"
  | "date"
  | "file"
  | "image";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select
  required?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  at: string;
}

export interface Approval {
  id: string;
  approver: string;
  order: number;
  note: string;
  required: boolean;
  status: "Pending" | "Waiting" | "Approved" | "Rejected";
  sentBy: string;
  approvedBy?: string;
  approvedDate?: string;
  responseNote?: string;
  dueDate?: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  actor: string;
  message: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  kind: string;
}

export interface Mail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  at: string;
}

export type StandardStatus = "New" | "In Progress" | "Done" | "Removed";

export interface OnboardingTask {
  id: string;
  title: string;
  assigned: string;
  group: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  done?: boolean;
}

export interface Item {
  id: string;
  section: SectionKey;
  title: string;
  status: string;
  standardStatus?: StandardStatus;
  createdBy: string;
  createdAt: string;
  assigned: string;
  parentId?: string;
  data: Record<string, any>;
  comments: Comment[];
  approvals: Approval[];
  activity: ActivityEntry[];
  attachments: Attachment[];
  mails?: Mail[];
}
