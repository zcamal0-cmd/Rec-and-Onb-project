import type { Item } from "./types";
import { USERS } from "./sections";

const now = new Date("2026-07-10").getTime();
const d = (days: number) => new Date(now - days * 86400000).toISOString();

let idCounter = 1000;
const genId = (prefix: string) => `${prefix}-${++idCounter}`;

function base(id: string, over: Partial<Item>): Item {
  return {
    id,
    section: "requisitions",
    title: "",
    status: "Draft",
    standardStatus: "In Progress",
    createdBy: USERS[0],
    createdAt: d(10),
    assigned: USERS[1],
    data: {},
    comments: [],
    approvals: [],
    activity: [
      { id: genId("a"), at: d(9), actor: USERS[0], message: "Created item" },
      { id: genId("a"), at: d(5), actor: USERS[1], message: "Updated status" },
    ],
    attachments: [],
    ...over,
  };
}

// Requisitions
const req1 = base("REQ-1001", {
  section: "requisitions",
  title: "Senior Software Engineer — Platform",
  status: "Approved",
  createdBy: USERS[0],
  assigned: USERS[2],
  data: {
    requester: USERS[0],
    assigned: USERS[2],
    title: "Senior Software Engineer — Platform",
    description: "Own the checkout platform services end-to-end.",
    position: "Senior Software Engineer",
    count: 2,
    department: "Engineering",
    employmentType: "Hybrid",
    reason: "New headcount",
    priority: "High",
    urgent: true,
    owner: USERS[3],
    salaryRange: "$140K – $180K",
  },
});
const req2 = base("REQ-1002", {
  section: "requisitions",
  title: "Product Designer",
  status: "Pending",
  createdBy: USERS[3],
  assigned: USERS[1],
  data: {
    requester: USERS[3],
    assigned: USERS[1],
    title: "Product Designer",
    description: "Design systems and end-to-end product flows.",
    position: "Product Designer",
    count: 1,
    department: "Design",
    employmentType: "Remote",
    reason: "Backfill",
    priority: "Medium",
    urgent: false,
    owner: USERS[4],
    salaryRange: "$110K – $140K",
  },
  approvals: [
    {
      id: "ap-r2",
      approver: USERS[0],
      order: 1,
      required: true,
      note: "Approve new Product Designer requisition",
      status: "Pending",
      sentBy: USERS[3],
      dueDate: d(-2),
    } as any,
  ],
});
const req3 = base("REQ-1003", {
  section: "requisitions",
  title: "Data Scientist — Growth",
  status: "Draft",
  data: {
    title: "Data Scientist — Growth",
    position: "Data Scientist",
    count: 1,
    department: "Data",
    employmentType: "Hybrid",
    priority: "Low",
  },
});
const req4 = base("REQ-1004", {
  section: "requisitions",
  title: "Engineering Manager",
  status: "Completed",
  data: {
    title: "Engineering Manager",
    position: "Engineering Manager",
    count: 1,
    department: "Engineering",
    employmentType: "In office",
    priority: "High",
  },
  approvals: [
    {
      id: "ap-r4",
      approver: USERS[0],
      order: 1,
      required: true,
      note: "Approve Engineering Manager backfill",
      status: "Approved",
      sentBy: USERS[4],
      approvedBy: USERS[0],
      approvedDate: d(6),
      responseNote: "Approved — strong business case.",
    },
  ],
});
const req5 = base("REQ-1005", {
  section: "requisitions",
  title: "DevOps Engineer",
  status: "Rejected",
  data: { title: "DevOps Engineer", position: "DevOps Engineer", count: 1, department: "Engineering" },
  approvals: [
    {
      id: "ap-r5",
      approver: USERS[0],
      order: 1,
      required: true,
      note: "Please approve DevOps hire",
      status: "Rejected",
      sentBy: USERS[2],
      approvedBy: USERS[0],
      approvedDate: d(8),
      responseNote: "Rejected — budget not available this quarter.",
    },
  ],
});

// Vacancies
const vac1 = base("VAC-2001", {
  section: "vacancies",
  title: "Senior Software Engineer — Platform",
  status: "Opened",
  parentId: "REQ-1001",
  data: {
    count: 2,
    title: "Senior Software Engineer — Platform",
    position: "Senior Software Engineer",
    department: "Engineering",
    team: "Platform",
    hiringManager: USERS[3],
    assigned: USERS[2],
    employmentType: "Hybrid",
    urgent: true,
    workLocation: "New York",
    salaryRange: "$140K – $180K",
    description: "Own the checkout platform services end-to-end.",
  },
});
const vac2 = base("VAC-2002", {
  section: "vacancies",
  title: "Product Designer",
  status: "Opened",
  parentId: "REQ-1002",
  data: {
    count: 1,
    title: "Product Designer",
    position: "Product Designer",
    department: "Design",
    team: "Core",
    hiringManager: USERS[4],
    assigned: USERS[1],
    employmentType: "Remote",
    workLocation: "Remote (EU)",
    salaryRange: "$110K – $140K",
    description: "Design systems and end-to-end product flows.",
  },
});
const vac3 = base("VAC-2003", {
  section: "vacancies",
  title: "Marketing Lead",
  status: "Completed",
  data: {
    count: 1,
    title: "Marketing Lead",
    position: "Marketing Lead",
    department: "Marketing",
    team: "Growth",
    hiringManager: USERS[5],
    employmentType: "Hybrid",
    workLocation: "London",
    salaryRange: "£95K – £120K",
  },
});

// Candidates
const cand1 = base("CAN-3001", {
  section: "candidates",
  title: "Riya Patel",
  status: "Technical Interview",
  parentId: "VAC-2001",
  data: {
    name: "Riya",
    surname: "Patel",
    mobile: "+1 415 555 0113",
    linkedin: "https://linkedin.com/in/riyapatel",
    desiredPay: "$165K",
    mail: "riya.patel@example.com",
    rating: "4.5 / 5",
    image: { name: "riya.jpg", dataUrl: "https://i.pravatar.cc/96?img=47" },
  },
  attachments: [
    { id: "att-1", name: "Riya_Patel_CV.pdf", size: "182 KB", kind: "pdf" },
    { id: "att-2", name: "Portfolio.pdf", size: "3.4 MB", kind: "pdf" },
  ],
  mails: [
    {
      id: "m1",
      from: "recruiter@acme.co",
      to: "riya.patel@example.com",
      subject: "Next steps — Senior Software Engineer",
      body: "Hi Riya, thanks for your time! We'd love to schedule a technical interview next week.",
      at: d(4),
    },
    {
      id: "m2",
      from: "riya.patel@example.com",
      to: "recruiter@acme.co",
      subject: "Re: Next steps — Senior Software Engineer",
      body: "Sounds great — Tuesday afternoon works.",
      at: d(3),
    },
  ],
  approvals: [
    {
      id: "ap-1",
      approver: USERS[3],
      order: 1,
      required: true,
      note: "Please review technical assessment",
      status: "Approved",
      sentBy: USERS[2],
      approvedBy: USERS[3],
      approvedDate: d(2),
      responseNote: "Strong signal on system design.",
    },
    {
      id: "ap-2",
      approver: USERS[0],
      order: 2,
      required: true,
      note: "Final HR review — please sign off on candidate",
      status: "Pending",
      sentBy: USERS[2],
      dueDate: d(-3),
    } as any,
  ],
  comments: [
    { id: "c1", author: USERS[2], text: "Great candidate! @Marcus Chen can you review?", at: d(3) },
    { id: "c2", author: USERS[3], text: "On it 👍", at: d(2) },
  ],
});
const cand2 = base("CAN-3002", {
  section: "candidates",
  title: "Tomás Álvarez",
  status: "HR Interview",
  parentId: "VAC-2001",
  data: {
    name: "Tomás",
    surname: "Álvarez",
    mobile: "+34 600 555 021",
    mail: "tomas.alv@example.com",
    linkedin: "https://linkedin.com/in/tomasalv",
    desiredPay: "$150K",
    rating: "4 / 5",
    image: { name: "tomas.jpg", dataUrl: "https://i.pravatar.cc/96?img=12" },
  },
  approvals: [
    {
      id: "ap-3",
      approver: USERS[0],
      order: 1,
      required: true,
      note: "Approve moving Tomás to offer stage",
      status: "Pending",
      sentBy: USERS[1],
      dueDate: d(-5),
    } as any,
  ],
});
const cand3 = base("CAN-3003", {
  section: "candidates",
  title: "Nina Okafor",
  status: "Applied",
  parentId: "VAC-2002",
  data: {
    name: "Nina",
    surname: "Okafor",
    mail: "nina.okafor@example.com",
    linkedin: "https://linkedin.com/in/ninaokafor",
    desiredPay: "$125K",
    image: { name: "nina.jpg", dataUrl: "https://i.pravatar.cc/96?img=45" },
  },
});
const cand4 = base("CAN-3004", {
  section: "candidates",
  title: "Kenji Watanabe",
  status: "Hired",
  parentId: "VAC-2002",
  data: {
    name: "Kenji",
    surname: "Watanabe",
    mail: "kenji@example.com",
    desiredPay: "$130K",
    rating: "5 / 5",
    image: { name: "kenji.jpg", dataUrl: "https://i.pravatar.cc/96?img=33" },
  },
});
const cand5 = base("CAN-3005", {
  section: "candidates",
  title: "Chloe Bernard",
  status: "Rejected",
  parentId: "VAC-2001",
  data: {
    name: "Chloe",
    surname: "Bernard",
    mail: "chloe@example.com",
    image: { name: "chloe.jpg", dataUrl: "https://i.pravatar.cc/96?img=48" },
  },
});

// Interviews
const int1 = base("INT-4001", {
  section: "interviews",
  title: "Technical Interview — Riya Patel",
  status: "Scheduled",
  parentId: "CAN-3001",
  data: {
    title: "Technical Interview — Riya Patel",
    vacancy: "VAC-2001",
    candidate: "CAN-3001",
    description: "System design + coding round",
    datetime: d(-3),
    invitees: USERS[3],
    interviewers: [USERS[3], USERS[2]],
    interviewType: "Technical",
    recommendation: "Pending",
    assigned: USERS[2],
    meetingType: "online",
    roomName: "Zoom — Platform Room",
  },
});
const int2 = base("INT-4002", {
  section: "interviews",
  title: "HR Interview — Tomás Álvarez",
  status: "Completed",
  parentId: "CAN-3002",
  data: {
    title: "HR Interview — Tomás Álvarez",
    candidate: "CAN-3002",
    vacancy: "VAC-2001",
    datetime: d(2),
    meetingType: "offline",
    interviewType: "HR",
    interviewers: [USERS[4]],
    recommendation: "Hire",
    roomName: "HQ — Room 4B",
  },
});

// Offers
const off1 = base("OFF-5001", {
  section: "offers",
  title: "Offer — Kenji Watanabe",
  status: "Accepted",
  parentId: "CAN-3004",
  data: {
    title: "Offer — Kenji Watanabe",
    description: "Product Designer offer, remote EU",
    sentDate: d(6),
    startDate: d(-14),
    salary: "$130,000",
    position: "Product Designer",
    candidate: "CAN-3004",
  },
  approvals: [
    {
      id: "ap-o1",
      approver: USERS[3],
      order: 1,
      required: true,
      note: "Offer approval",
      status: "Approved",
      sentBy: USERS[2],
      approvedBy: USERS[3],
      approvedDate: d(7),
    },
  ],
});
const off2 = base("OFF-5002", {
  section: "offers",
  title: "Offer — Riya Patel",
  status: "Sent",
  parentId: "CAN-3001",
  data: {
    title: "Offer — Riya Patel",
    description: "Senior Software Engineer offer",
    sentDate: d(1),
    startDate: d(-21),
    salary: "$170,000",
    position: "Senior Software Engineer",
    candidate: "CAN-3001",
  },
  approvals: [
    {
      id: "ap-o2",
      approver: USERS[0],
      order: 1,
      required: true,
      note: "Please review and approve offer package",
      status: "Pending",
      sentBy: USERS[2],
      dueDate: d(-1),
    } as any,
  ],
});

// Onboarding processes (for hired candidates)
const onb1 = base("ONB-6001", {
  section: "onboarding",
  title: "Kenji Watanabe",
  status: "In Process",
  standardStatus: "In Progress",
  createdAt: d(12),
  assigned: USERS[1],
  data: {
    name: "Kenji",
    surname: "Watanabe",
    image: { name: "kenji.jpg", dataUrl: "https://i.pravatar.cc/96?img=33" },
    department: "Design",
    position: "Product Designer",
    hireDate: d(-14),
    recruiter: USERS[1],
    template: "Business Analyst",
    tasks: [
      { id: "t1", title: "Sign employment contract", assigned: USERS[0], group: "HR", description: "Digital contract signed.", priority: "High", dueDate: d(-10), done: true },
      { id: "t2", title: "IT equipment provisioning", assigned: USERS[6], group: "IT", description: "Laptop + badge.", priority: "High", dueDate: d(-8), done: true },
      { id: "t3", title: "Meet product & data team", assigned: USERS[3], group: "Team", description: "Intro meetings.", priority: "Medium", dueDate: d(-4), done: false },
      { id: "t4", title: "Requirements engineering training", assigned: USERS[4], group: "Training", description: "BA methodology course.", priority: "Low", dueDate: d(-1), done: false },
    ],
  },
});

const onb2 = base("ONB-6002", {
  section: "onboarding",
  title: "Amelia Cortés",
  status: "Not started",
  standardStatus: "New",
  createdAt: d(2),
  assigned: USERS[2],
  data: {
    name: "Amelia",
    surname: "Cortés",
    image: { name: "amelia.jpg", dataUrl: "https://i.pravatar.cc/96?img=32" },
    department: "Sales",
    position: "Sales Manager",
    hireDate: d(-2),
    recruiter: USERS[2],
    template: "Sales Manager",
    tasks: [
      { id: "t1", title: "Sign employment contract", assigned: USERS[0], group: "HR", description: "Pending signature.", priority: "High", dueDate: d(-5), done: false },
      { id: "t2", title: "CRM access (Salesforce)", assigned: USERS[6], group: "IT", description: "Provision seat.", priority: "High", dueDate: d(-4), done: false },
      { id: "t3", title: "Territory & quota assignment", assigned: USERS[5], group: "Sales Ops", description: "Assign Q3 quota.", priority: "High", dueDate: d(-3), done: false },
    ],
  },
});

const onb3 = base("ONB-6003", {
  section: "onboarding",
  title: "Ravi Menon",
  status: "Done",
  standardStatus: "Done",
  createdAt: d(40),
  assigned: USERS[6],
  data: {
    name: "Ravi",
    surname: "Menon",
    image: { name: "ravi.jpg", dataUrl: "https://i.pravatar.cc/96?img=15" },
    department: "Engineering",
    position: "System Administrator",
    hireDate: d(30),
    recruiter: USERS[6],
    template: "System Administrator",
    tasks: [
      { id: "t1", title: "Sign employment contract", assigned: USERS[0], group: "HR", description: "Signed.", priority: "High", dueDate: d(28), done: true },
      { id: "t2", title: "Datacenter access badge", assigned: USERS[6], group: "IT", description: "Issued.", priority: "High", dueDate: d(26), done: true },
      { id: "t3", title: "Admin credentials & VPN", assigned: USERS[6], group: "IT", description: "Configured.", priority: "High", dueDate: d(24), done: true },
      { id: "t4", title: "On-call rotation onboarding", assigned: USERS[2], group: "Team", description: "Shadowed.", priority: "Medium", dueDate: d(18), done: true },
      { id: "t5", title: "Security awareness training", assigned: USERS[0], group: "Compliance", description: "Completed.", priority: "Medium", dueDate: d(16), done: true },
    ],
  },
});

export const SEED_ITEMS: Item[] = [
  req1, req2, req3, req4, req5,
  vac1, vac2, vac3,
  cand1, cand2, cand3, cand4, cand5,
  int1, int2,
  off1, off2,
  onb1, onb2, onb3,
];
