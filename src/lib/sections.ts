import type { SectionKey, FieldDef, StandardStatus, OnboardingTask } from "./types";

export const USERS = [
  "Alex Morgan",
  "Priya Shah",
  "Marcus Chen",
  "Sofia Rossi",
  "Jamal Reed",
  "Elena Volkov",
  "David Park",
  "Aisha Khan",
];

export const CURRENT_USER = USERS[0];

export const STANDARD_STATUSES: StandardStatus[] = ["New", "In Progress", "Done", "Removed"];

export function approvalRollup(approvals: { status: string }[]): "Approved" | "Pending" | "Rejected" | "—" {
  if (!approvals || approvals.length === 0) return "—";
  if (approvals.some((a) => a.status === "Rejected")) return "Rejected";
  if (approvals.every((a) => a.status === "Approved")) return "Approved";
  return "Pending";
}

export const POSITIONS = [
  "Senior Software Engineer",
  "Product Designer",
  "Data Scientist",
  "Engineering Manager",
  "DevOps Engineer",
  "Marketing Lead",
  "Sales Executive",
  "Business Analyst",
  "System Administrator",
  "Sales Manager",
];

export const DEPARTMENTS = ["Engineering", "Design", "Data", "Marketing", "Sales", "People", "Finance"];
export const TEAMS = ["Platform", "Growth", "Core", "Research", "Enterprise"];
export const EMPLOYMENT_TYPES = ["Hybrid", "In office", "Remote"];
export const PRIORITIES = ["Low", "Medium", "High"];
export const REASONS = ["Backfill", "New headcount", "Expansion", "Reorganization", "Attrition"];
export const MEETING_TYPES = ["online", "offline"];
export const TASK_OWNERS = ["IT", "Health and Safety", "HR", "Finance"] as const;

export const ONBOARDING_TEMPLATES = ["Business Analyst", "System Administrator", "Sales Manager"] as const;
export type OnboardingTemplate = (typeof ONBOARDING_TEMPLATES)[number];

export const ONBOARDING_TEMPLATE_TASKS: Record<OnboardingTemplate, OnboardingTask[]> = {
  "Business Analyst": [
    { id: "t-ba-1", title: "Sign employment contract", assigned: USERS[0], group: "HR", description: "Review and sign the digital employment contract.", priority: "High", dueDate: "" },
    { id: "t-ba-2", title: "IT equipment provisioning", assigned: USERS[6], group: "IT", description: "Laptop, monitor and access badge issued.", priority: "High", dueDate: "" },
    { id: "t-ba-3", title: "Access to JIRA & Confluence", assigned: USERS[6], group: "IT", description: "Provision workspace and project access.", priority: "Medium", dueDate: "" },
    { id: "t-ba-4", title: "Workplace safety induction", assigned: USERS[3], group: "Health and Safety", description: "Complete on-site safety walkthrough and e-learning.", priority: "Medium", dueDate: "" },
    { id: "t-ba-5", title: "Payroll & benefits enrolment", assigned: USERS[4], group: "Finance", description: "Submit banking details and select benefits package.", priority: "Low", dueDate: "" },
  ],
  "System Administrator": [
    { id: "t-sa-1", title: "Sign employment contract", assigned: USERS[0], group: "HR", description: "Review and sign the digital employment contract.", priority: "High", dueDate: "" },
    { id: "t-sa-2", title: "Datacenter access badge", assigned: USERS[6], group: "IT", description: "Approve physical DC access.", priority: "High", dueDate: "" },
    { id: "t-sa-3", title: "Admin credentials & VPN", assigned: USERS[6], group: "IT", description: "Root/sudo, VPN, monitoring stack access.", priority: "High", dueDate: "" },
    { id: "t-sa-4", title: "DC safety & fire training", assigned: USERS[2], group: "Health and Safety", description: "Datacenter safety, evacuation, ESD training.", priority: "Medium", dueDate: "" },
    { id: "t-sa-5", title: "Corporate card issuance", assigned: USERS[0], group: "Finance", description: "Issue corporate card and expense policy briefing.", priority: "Medium", dueDate: "" },
  ],
  "Sales Manager": [
    { id: "t-sm-1", title: "Sign employment contract", assigned: USERS[0], group: "HR", description: "Review and sign the digital employment contract.", priority: "High", dueDate: "" },
    { id: "t-sm-2", title: "CRM access (Salesforce)", assigned: USERS[6], group: "IT", description: "Provision CRM seat and dashboards.", priority: "High", dueDate: "" },
    { id: "t-sm-3", title: "Commission plan sign-off", assigned: USERS[5], group: "Finance", description: "Review and acknowledge Q3 commission plan.", priority: "High", dueDate: "" },
    { id: "t-sm-4", title: "Office safety orientation", assigned: USERS[4], group: "Health and Safety", description: "Emergency exits, first-aid contacts.", priority: "Medium", dueDate: "" },
    { id: "t-sm-5", title: "Employee handbook review", assigned: USERS[1], group: "HR", description: "Read and acknowledge the employee handbook.", priority: "Low", dueDate: "" },
  ],
};

export interface SectionConfig {
  key: SectionKey;
  label: string;
  singular: string;
  route: string;
  statuses: string[]; // = "steps"
  defaultStatus: string;
  fields: FieldDef[];
  hideCreate?: boolean;
}

export const SECTIONS: Record<SectionKey, SectionConfig> = {
  requisitions: {
    key: "requisitions",
    label: "Job Requisitions",
    singular: "Job Requisition",
    route: "/requisitions",
    statuses: ["Draft", "Pending", "Approved", "Rejected", "Completed", "Cancelled"],
    defaultStatus: "Draft",
    fields: [
      { name: "requester", label: "Requester", type: "user" },
      { name: "assigned", label: "Assigned", type: "user" },
      { name: "title", label: "Job Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "position", label: "Position", type: "select", options: POSITIONS },
      { name: "count", label: "Count", type: "number" },
      { name: "department", label: "Department", type: "select", options: DEPARTMENTS },
      { name: "employmentType", label: "Employment Type", type: "select", options: EMPLOYMENT_TYPES },
      { name: "reason", label: "Reason of Hiring", type: "select", options: REASONS },
      { name: "priority", label: "Priority", type: "select", options: PRIORITIES },
      { name: "urgent", label: "Urgent", type: "checkbox" },
      { name: "owner", label: "Owner", type: "user" },
      { name: "salaryRange", label: "Salary Range", type: "text" },
    ],
  },
  vacancies: {
    key: "vacancies",
    label: "Vacancies",
    singular: "Vacancy",
    route: "/vacancies",
    statuses: ["Opened", "Cancelled", "Completed"],
    defaultStatus: "Opened",
    fields: [
      { name: "count", label: "Count", type: "number" },
      { name: "title", label: "Vacancy Title", type: "text", required: true },
      { name: "position", label: "Position", type: "select", options: POSITIONS },
      { name: "department", label: "Department", type: "select", options: DEPARTMENTS },
      { name: "team", label: "Team", type: "select", options: TEAMS },
      { name: "hiringManager", label: "Hiring Manager", type: "user" },
      { name: "assigned", label: "Assigned", type: "user" },
      { name: "employmentType", label: "Employment Type", type: "select", options: EMPLOYMENT_TYPES },
      { name: "urgent", label: "Urgent", type: "checkbox" },
      { name: "workLocation", label: "Work Location", type: "text" },
      { name: "salaryRange", label: "Salary Range", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  candidates: {
    key: "candidates",
    label: "Candidates",
    singular: "Candidate",
    route: "/candidates",
    statuses: [
      "Applied",
      "Resume Review",
      "Technical Interview",
      "HR Interview",
      "Interviewed",
      "Hired",
      "Rejected",
      "Withdrawn",
    ],
    defaultStatus: "Applied",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "surname", label: "Surname", type: "text" },
      { name: "mobile", label: "Mobile phone", type: "text" },
      { name: "linkedin", label: "LinkedIn URL", type: "text" },
      { name: "desiredPay", label: "Desired pay", type: "text" },
      { name: "image", label: "Image", type: "image" },
      { name: "mail", label: "Email", type: "text" },
      { name: "cv", label: "CV", type: "file" },
      { name: "otherAttachments", label: "Other attachments", type: "file" },
      { name: "rating", label: "Rating", type: "text" },
    ],
  },
  interviews: {
    key: "interviews",
    label: "Interviews",
    singular: "Interview",
    route: "/interviews",
    statuses: ["Scheduled", "Completed", "Cancelled"],
    defaultStatus: "Scheduled",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "vacancy", label: "Vacancy", type: "select", options: [] },
      { name: "candidate", label: "Candidate", type: "select", options: [] },
      { name: "description", label: "Description", type: "textarea" },
      { name: "datetime", label: "Date & time", type: "date" },
      { name: "invitees", label: "Invitees", type: "user" },
      { name: "assigned", label: "Assigned", type: "user" },
      { name: "meetingType", label: "Meeting type", type: "select", options: MEETING_TYPES },
      { name: "roomName", label: "Room name", type: "text" },
    ],
  },
  offers: {
    key: "offers",
    label: "Job Offers",
    singular: "Job Offer",
    route: "/offers",
    statuses: ["New", "Sent", "Rejected", "Cancelled", "Accepted"],
    defaultStatus: "New",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "sentDate", label: "Sent date", type: "date" },
      { name: "position", label: "Position", type: "select", options: POSITIONS },
      { name: "candidate", label: "Candidate", type: "select", options: [] },
    ],
  },
  onboarding: {
    key: "onboarding",
    label: "Onboarding",
    singular: "Onboarding Process",
    route: "/onboarding",
    statuses: ["Not started", "In Process", "Done"],
    defaultStatus: "Not started",
    hideCreate: true,
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "surname", label: "Surname", type: "text" },
      { name: "department", label: "Department", type: "select", options: DEPARTMENTS },
      { name: "position", label: "Position", type: "select", options: POSITIONS },
      { name: "hireDate", label: "Hire date", type: "date" },
      { name: "recruiter", label: "Recruiter", type: "user" },
      { name: "template", label: "Onboarding template", type: "select", options: [...ONBOARDING_TEMPLATES] },
    ],
  },
};

export const SECTION_ORDER: SectionKey[] = [
  "requisitions",
  "vacancies",
  "candidates",
  "interviews",
  "offers",
  "onboarding",
];

export function statusTone(status: string): string {
  const s = status.toLowerCase();
  if (["approved", "hired", "accepted", "completed", "opened", "done"].includes(s)) return "success";
  if (["rejected", "cancelled", "withdrawn", "removed"].includes(s)) return "danger";
  if (["pending", "waiting", "scheduled", "sent", "applied", "new"].includes(s)) return "info";
  if (["in progress", "in process"].includes(s)) return "warning";
  if (["draft", "not started"].includes(s)) return "muted";
  return "default";
}
