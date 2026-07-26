import { create } from "zustand";
import type { Item, SectionKey, Comment, Approval } from "./types";
import { SEED_ITEMS } from "./sample-data";
import { SECTIONS, USERS } from "./sections";

interface State {
  items: Item[];
  bySection: (s: SectionKey) => Item[];
  byId: (id: string) => Item | undefined;
  create: (section: SectionKey, data: Record<string, any>, parentId?: string) => Item;
  update: (id: string, patch: Partial<Item>) => void;
  updateData: (id: string, patch: Record<string, any>) => void;
  setStatus: (id: string, status: string) => void;
  setStandardStatus: (id: string, standardStatus: import("./types").StandardStatus) => void;
  addComment: (id: string, text: string) => void;
  addApproval: (id: string, approval: Omit<Approval, "id" | "status" | "sentBy">) => void;
  respondApproval: (id: string, approvalId: string, decision: "Approved" | "Rejected", note: string) => void;
  relatedChildren: (id: string) => Item[];
  relatedParent: (id: string) => Item | undefined;
}

let counter = 9000;
const nextId = (section: SectionKey) => {
  counter += 1;
  const prefix =
    section === "requisitions" ? "REQ"
    : section === "vacancies" ? "VAC"
    : section === "candidates" ? "CAN"
    : section === "interviews" ? "INT"
    : section === "onboarding" ? "ONB"
    : "OFF";
  return `${prefix}-${counter}`;
};

export const useStore = create<State>((set, get) => ({
  items: SEED_ITEMS,
  bySection: (s) => get().items.filter((i) => i.section === s),
  byId: (id) => get().items.find((i) => i.id === id),
  create: (section, data, parentId) => {
    const cfg = SECTIONS[section];
    const title =
      data.title || [data.name, data.surname].filter(Boolean).join(" ") || `Untitled ${cfg.singular}`;
    const item: Item = {
      id: nextId(section),
      section,
      title,
      status: data.status || cfg.defaultStatus,
      standardStatus: (data.standardStatus as any) || "New",
      createdBy: USERS[0],
      createdAt: new Date().toISOString(),
      assigned: data.assigned || USERS[1],
      parentId,
      data,
      comments: [],
      approvals: [],
      activity: [{ id: `a-${Date.now()}`, at: new Date().toISOString(), actor: USERS[0], message: "Created item" }],
      attachments: [],
      mails: section === "candidates" ? [] : undefined,
    };
    set({ items: [item, ...get().items] });
    return item;
  },
  update: (id, patch) =>
    set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
  updateData: (id, patch) =>
    set({
      items: get().items.map((i) => {
        if (i.id !== id) return i;
        const data = { ...i.data, ...patch };
        const title =
          patch.title || data.title ||
          [data.name, data.surname].filter(Boolean).join(" ") || i.title;
        return { ...i, data, title };
      }),
    }),
  setStatus: (id, status) =>
    set({
      items: get().items.map((i) => {
        if (i.id !== id) return i;
        const activity = [
          { id: `a-${Date.now()}`, at: new Date().toISOString(), actor: USERS[0], message: `Step → ${status}` },
          ...i.activity,
        ];
        return { ...i, status, activity };
      }),
    }),
  setStandardStatus: (id, standardStatus) =>
    set({
      items: get().items.map((i) => {
        if (i.id !== id) return i;
        const activity = [
          { id: `a-${Date.now()}`, at: new Date().toISOString(), actor: USERS[0], message: `Status → ${standardStatus}` },
          ...i.activity,
        ];
        return { ...i, standardStatus, activity };
      }),
    }),
  addComment: (id, text) =>
    set({
      items: get().items.map((i) => {
        if (i.id !== id) return i;
        const c: Comment = { id: `c-${Date.now()}`, author: USERS[0], text, at: new Date().toISOString() };
        return { ...i, comments: [...i.comments, c] };
      }),
    }),
  addApproval: (id, a) =>
    set({
      items: get().items.map((i) => {
        if (i.id !== id) return i;
        const approval: Approval = {
          id: `ap-${Date.now()}`,
          status: "Pending",
          sentBy: USERS[0],
          ...a,
        };
        return { ...i, approvals: [...i.approvals, approval] };
      }),
    }),
  respondApproval: (id, approvalId, decision, note) =>
    set({
      items: get().items.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          approvals: i.approvals.map((a) =>
            a.id === approvalId
              ? { ...a, status: decision, approvedBy: USERS[0], approvedDate: new Date().toISOString(), responseNote: note }
              : a,
          ),
        };
      }),
    }),
  relatedChildren: (id) => get().items.filter((i) => i.parentId === id),
  relatedParent: (id) => {
    const item = get().byId(id);
    if (!item?.parentId) return undefined;
    return get().byId(item.parentId);
  },
}));
