import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/sections";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserChip } from "@/components/user-avatar";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/my-approvals")({
  head: () => ({ meta: [{ title: "My Approvals — Talento" }] }),
  component: MyApprovalsPage,
});

const TYPE_LABEL: Record<string, { label: string; route: string }> = {
  requisitions: { label: "Job requisition", route: "/requisitions" },
  vacancies: { label: "Vacancy", route: "/vacancies" },
  candidates: { label: "Candidate", route: "/candidates" },
  interviews: { label: "Interview", route: "/interviews" },
  offers: { label: "Job offer", route: "/offers" },
};

const FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;
type Filter = (typeof FILTERS)[number];

function ApprovalBadge({ status }: { status: string }) {
  const tone =
    status === "Approved"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : status === "Rejected"
      ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
      : "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}

function MyApprovalsPage() {
  const items = useStore((s) => s.items);
  const [filter, setFilter] = useState<Filter>("All");

  const allRows = useMemo(() => {
    const out: Array<{
      key: string;
      item: (typeof items)[number];
      approval: (typeof items)[number]["approvals"][number];
    }> = [];
    for (const item of items) {
      for (const a of item.approvals) {
        if (a.approver === CURRENT_USER) {
          out.push({ key: `${item.id}:${a.id}`, item, approval: a });
        }
      }
    }
    return out;
  }, [items]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { All: allRows.length, Pending: 0, Approved: 0, Rejected: 0 };
    for (const r of allRows) {
      if (r.approval.status === "Pending" || r.approval.status === "Waiting") c.Pending++;
      else if (r.approval.status === "Approved") c.Approved++;
      else if (r.approval.status === "Rejected") c.Rejected++;
    }
    return c;
  }, [allRows]);

  const rows = useMemo(() => {
    if (filter === "All") return allRows;
    if (filter === "Pending")
      return allRows.filter((r) => r.approval.status === "Pending" || r.approval.status === "Waiting");
    return allRows.filter((r) => r.approval.status === filter);
  }, [allRows, filter]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight">My Approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allRows.length} approval{allRows.length === 1 ? "" : "s"} sent to you
        </p>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mt-4">
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f} className="gap-2">
                {f}
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {counts[f]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[130px]">ID</TableHead>
                <TableHead className="w-[160px]">Type</TableHead>
                <TableHead className="w-[200px]">Sent by</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[160px]">Due date</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No {filter === "All" ? "" : filter.toLowerCase() + " "}approvals.
                  </TableCell>
                </TableRow>
              )}
              {rows.map(({ key, item, approval }) => {
                const meta = TYPE_LABEL[item.section] ?? { label: item.section, route: `/${item.section}` };
                return (
                  <TableRow key={key}>
                    <TableCell>
                      <Link
                        to={`${meta.route}/$id`}
                        params={{ id: item.id }}
                        className="font-mono text-xs text-foreground hover:underline"
                      >
                        {item.id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{meta.label}</TableCell>
                    <TableCell>
                      <UserChip name={approval.sentBy} />
                    </TableCell>
                    <TableCell>
                      <ApprovalBadge status={approval.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {approval.dueDate ? format(new Date(approval.dueDate), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{approval.note || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
