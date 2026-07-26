import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SECTIONS, approvalRollup } from "@/lib/sections";
import type { SectionKey, Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { UserChip, UserAvatar } from "./user-avatar";
import { CreateDialog } from "./create-dialog";
import { format } from "date-fns";

type Column = {
  header: string;
  width?: string;
  cell: (i: Item, ctx: { candidatesByVacancy: Map<string, number>; items: Item[] }) => React.ReactNode;
};

const fmtDate = (v: any) => (v ? format(new Date(v), "MMM d, yyyy") : "—");

function ApprovalBadge({ status }: { status: string }) {
  const tone =
    status === "Approved" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : status === "Rejected" ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
      : status === "Pending" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
      : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>;
}

function EmployeeCell({ item }: { item: Item }) {
  const url = item.data?.image?.dataUrl as string | undefined;
  const name = [item.data?.name, item.data?.surname].filter(Boolean).join(" ") || item.title;
  return (
    <div className="flex items-center gap-3">
      {url ? (
        <img src={url} alt={name} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <UserAvatar name={name} size={36} />
      )}
      <span className="font-medium">{name}</span>
    </div>
  );
}

function CandidateAvatar({ item }: { item: Item }) {
  const url = item.data?.image?.dataUrl as string | undefined;
  const name = [item.data?.name, item.data?.surname].filter(Boolean).join(" ") || item.title;
  if (url) {
    return <img src={url} alt={name} className="h-9 w-9 rounded-full object-cover" />;
  }
  return <UserAvatar name={name} size={36} />;
}

const STATUS_COL: Column = {
  header: "Status",
  width: "w-[130px]",
  cell: (i) => <StatusBadge status={i.standardStatus ?? "New"} />,
};

const COLUMNS: Record<SectionKey, Column[]> = {
  requisitions: [
    { header: "Request No.", width: "w-[120px]", cell: (i) => <span className="font-mono text-xs text-muted-foreground">{i.id}</span> },
    { header: "Position", cell: (i) => (
        <Link to="/requisitions/$id" params={{ id: i.id }} className="font-medium hover:underline">
          {i.data?.position || i.title}
        </Link>
      ) },
    { header: "Department", width: "w-[140px]", cell: (i) => <span className="text-sm">{i.data?.department || "—"}</span> },
    { header: "Requested By", width: "w-[180px]", cell: (i) => <UserChip name={i.data?.requester || i.createdBy} /> },
    { header: "Step", width: "w-[140px]", cell: (i) => <StatusBadge status={i.status} /> },
    STATUS_COL,
    { header: "Approval", width: "w-[120px]", cell: (i) => <ApprovalBadge status={approvalRollup(i.approvals)} /> },
    { header: "Requested Date", width: "w-[140px]", cell: (i) => <span className="text-sm text-muted-foreground">{fmtDate(i.createdAt)}</span> },
  ],
  vacancies: [
    { header: "Vacancy", cell: (i) => (
        <Link to="/vacancies/$id" params={{ id: i.id }} className="font-medium hover:underline">{i.title}</Link>
      ) },
    { header: "Department", width: "w-[140px]", cell: (i) => <span className="text-sm">{i.data?.department || "—"}</span> },
    { header: "Recruiter", width: "w-[180px]", cell: (i) => <UserChip name={i.data?.assigned || i.assigned} /> },
    { header: "Candidates", width: "w-[110px]", cell: (i, ctx) => (
        <span className="inline-flex min-w-[28px] justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
          {ctx.candidatesByVacancy.get(i.id) ?? 0}
        </span>
      ) },
    { header: "Step", width: "w-[140px]", cell: (i) => <StatusBadge status={i.status} /> },
    STATUS_COL,
    { header: "Closing Date", width: "w-[140px]", cell: (i) => <span className="text-sm text-muted-foreground">{fmtDate(i.data?.closingDate)}</span> },
  ],
  candidates: [
    { header: "", width: "w-[60px]", cell: (i) => <CandidateAvatar item={i} /> },
    { header: "Name", cell: (i) => (
        <Link to="/candidates/$id" params={{ id: i.id }} className="font-medium hover:underline">{i.title}</Link>
      ) },
    { header: "Step", width: "w-[160px]", cell: (i) => <StatusBadge status={i.status} /> },
    STATUS_COL,
    { header: "Recruiter", width: "w-[180px]", cell: (i) => <UserChip name={i.assigned} /> },
    { header: "Applied Date", width: "w-[140px]", cell: (i) => <span className="text-sm text-muted-foreground">{fmtDate(i.createdAt)}</span> },
    { header: "Approval", width: "w-[120px]", cell: (i) => <ApprovalBadge status={approvalRollup(i.approvals)} /> },
  ],
  interviews: [
    { header: "Vacancy", cell: (i, ctx) => {
        const v = ctx.items.find((x) => x.id === i.data?.vacancy);
        return <span className="text-sm">{v?.title || "—"}</span>;
      } },
    { header: "Candidate", width: "w-[200px]", cell: (i, ctx) => {
        const c = ctx.items.find((x) => x.id === i.data?.candidate);
        return c ? (
          <Link to="/candidates/$id" params={{ id: c.id }} className="font-medium hover:underline">{c.title}</Link>
        ) : "—";
      } },
    { header: "Type", width: "w-[120px]", cell: (i) => <span className="text-sm">{i.data?.interviewType || "—"}</span> },
    { header: "Interviewers", width: "w-[220px]", cell: (i) => {
        const list: string[] = Array.isArray(i.data?.interviewers) ? i.data.interviewers : i.data?.invitees ? [i.data.invitees] : [];
        if (list.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex -space-x-1.5">
            {list.slice(0, 4).map((n) => <UserAvatar key={n} name={n} size={22} />)}
            {list.length > 4 && <span className="ml-2 text-xs text-muted-foreground">+{list.length - 4}</span>}
          </div>
        );
      } },
    { header: "Date & Time", width: "w-[170px]", cell: (i) => (
        <span className="text-sm text-muted-foreground">
          {i.data?.datetime ? format(new Date(i.data.datetime), "MMM d, yyyy · HH:mm") : "—"}
        </span>
      ) },
    { header: "Step", width: "w-[130px]", cell: (i) => <StatusBadge status={i.status} /> },
    STATUS_COL,
    { header: "Recommendation", width: "w-[150px]", cell: (i) => <span className="text-sm">{i.data?.recommendation || "—"}</span> },
  ],
  offers: [
    { header: "Candidate", cell: (i, ctx) => {
        const c = ctx.items.find((x) => x.id === i.data?.candidate);
        return c ? (
          <Link to="/candidates/$id" params={{ id: c.id }} className="font-medium hover:underline">{c.title}</Link>
        ) : <span className="font-medium">{i.title}</span>;
      } },
    { header: "Position", width: "w-[220px]", cell: (i) => <span className="text-sm">{i.data?.position || "—"}</span> },
    { header: "Salary", width: "w-[140px]", cell: (i) => <span className="text-sm">{i.data?.salary || "—"}</span> },
    { header: "Approval", width: "w-[120px]", cell: (i) => <ApprovalBadge status={approvalRollup(i.approvals)} /> },
    { header: "Offer Step", width: "w-[140px]", cell: (i) => <StatusBadge status={i.status} /> },
    STATUS_COL,
    { header: "Start Date", width: "w-[140px]", cell: (i) => <span className="text-sm text-muted-foreground">{fmtDate(i.data?.startDate)}</span> },
  ],
  onboarding: [
    { header: "Employee", cell: (i) => (
        <Link to="/onboarding/$id" params={{ id: i.id }} className="hover:underline">
          <EmployeeCell item={i} />
        </Link>
      ) },
    { header: "Department", width: "w-[140px]", cell: (i) => <span className="text-sm">{i.data?.department || "—"}</span> },
    { header: "Position", width: "w-[180px]", cell: (i) => <span className="text-sm">{i.data?.position || "—"}</span> },
    { header: "Hire date", width: "w-[140px]", cell: (i) => <span className="text-sm text-muted-foreground">{fmtDate(i.data?.hireDate)}</span> },
    STATUS_COL,
    { header: "Recruiter", width: "w-[180px]", cell: (i) => <UserChip name={i.data?.recruiter || i.assigned} /> },
    { header: "Done tasks", width: "w-[120px]", cell: (i) => {
        const tasks: any[] = Array.isArray(i.data?.tasks) ? i.data.tasks : [];
        const done = tasks.filter((t) => t.done).length;
        return (
          <span className="inline-flex min-w-[48px] justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
            {done} / {tasks.length}
          </span>
        );
      } },
  ],
};

export function SectionListPage({ section }: { section: SectionKey }) {
  const cfg = SECTIONS[section];
  const allItems = useStore((s) => s.items);
  const setStatus = useStore((s) => s.setStatus);
  const navigate = useNavigate();

  const items = useMemo(() => allItems.filter((i) => i.section === section), [allItems, section]);
  const allVacancies = useMemo(() => allItems.filter((i) => i.section === "vacancies"), [allItems]);
  const candidatesByVacancy = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of allItems) if (c.section === "candidates" && c.parentId) m.set(c.parentId, (m.get(c.parentId) ?? 0) + 1);
    return m;
  }, [allItems]);

  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "board">("list");
  const [createOpen, setCreateOpen] = useState(false);
  const [vacancyFilter, setVacancyFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let out = items;
    if (section === "candidates" && vacancyFilter !== "all") {
      out = out.filter((i) => i.parentId === vacancyFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q),
      );
    }
    return out;
  }, [items, query, vacancyFilter, section]);

  const columns = COLUMNS[section];
  const ctx = { candidatesByVacancy, items: allItems };
  const openDetail = (id: string) => navigate({ to: `${cfg.route}/$id`, params: { id } } as any);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{cfg.label}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} total · {items.filter((i) => !["Cancelled", "Rejected", "Completed"].includes(i.status)).length} active
            </p>
          </div>
          {!cfg.hideCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New {cfg.singular}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b bg-background px-6 py-3">
          <TabsList>
            <TabsTrigger value="list">
              <List className="h-3.5 w-3.5" /> List
            </TabsTrigger>
            <TabsTrigger value="board">
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </TabsTrigger>
          </TabsList>

          <div className="relative ml-auto w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${cfg.label.toLowerCase()}…`}
              className="h-9 pl-8"
            />
          </div>

          {section === "candidates" && (
            <Select value={vacancyFilter} onValueChange={setVacancyFilter}>
              <SelectTrigger className="h-9 w-56">
                <SelectValue placeholder="All vacancies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All vacancies</SelectItem>
                {allVacancies.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="list" className="m-0 flex-1 overflow-auto">
          <div className="p-6">
            <div className="overflow-hidden rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    {columns.map((c, idx) => (
                      <TableHead key={idx} className={c.width}>{c.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                        No {cfg.label.toLowerCase()} found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((i) => (
                    <TableRow
                      key={i.id}
                      onDoubleClick={() => openDetail(i.id)}
                      className="cursor-pointer"
                    >
                      {columns.map((c, idx) => (
                        <TableCell key={idx}>{c.cell(i, ctx)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Tip: double-click a row to open its detail page.</p>
          </div>
        </TabsContent>

        <TabsContent value="board" className="m-0 flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {cfg.statuses.map((status) => {
                const cards = filtered.filter((i) => i.status === status);
                return (
                  <div
                    key={status}
                    className="flex w-72 shrink-0 flex-col rounded-lg border bg-surface"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) setStatus(id, status);
                    }}
                  >
                    <div className="flex items-center justify-between border-b px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        <span className="text-xs text-muted-foreground">{cards.length}</span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-2">
                      {cards.map((c) => (
                        <div
                          key={c.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                          onDoubleClick={() => openDetail(c.id)}
                          onClick={() => openDetail(c.id)}
                          className="cursor-pointer rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                          </div>
                          <div className="mb-2 text-sm font-medium leading-snug">{c.title}</div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{format(new Date(c.createdAt), "MMM d")}</span>
                            <UserChip name={c.assigned} />
                          </div>
                        </div>
                      ))}
                      {cards.length === 0 && (
                        <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                          Empty
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreateDialog section={section} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
