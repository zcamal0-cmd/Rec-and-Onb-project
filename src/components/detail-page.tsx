import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SECTIONS, USERS, STANDARD_STATUSES } from "@/lib/sections";
import type { SectionKey, FieldDef } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "./status-badge";
import { UserAvatar, UserChip } from "./user-avatar";
import { FieldInput, FieldRow } from "./field-input";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateDialog } from "./create-dialog";
import { ArrowLeft, Check, X, Plus, Paperclip, FileText, MessageSquare, Send, Smile, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const EMOJIS = ["👍", "🎉", "🚀", "🔥", "👀", "✅", "❤️", "😄", "🙌", "💯"];

export function DetailPage({ section, id }: { section: SectionKey; id: string }) {
  const cfg = SECTIONS[section];
  const items = useStore((s) => s.items);
  const setStatus = useStore((s) => s.setStatus);
  const setStandardStatus = useStore((s) => s.setStandardStatus);
  const navigate = useNavigate();

  const [createChild, setCreateChild] = useState<SectionKey | null>(null);

  const item = useMemo(() => items.find((i) => i.id === id), [items, id]);
  const relatedChildren = useMemo(() => items.filter((i) => i.parentId === id), [items, id]);
  const parent = useMemo(() => {
    if (!item?.parentId) return undefined;
    return items.find((i) => i.id === item.parentId);
  }, [items, item?.parentId]);

  if (!item) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Item not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: cfg.route })}>
          Back
        </Button>
      </div>
    );
  }

  const childSection: SectionKey | null =
    section === "requisitions" ? "vacancies" :
    section === "vacancies" ? "candidates" :
    null;

  // Candidate → interview + offer as children (same parentId)
  const candidateChildren = section === "candidates";
  const interviewChildren = candidateChildren ? relatedChildren.filter((r) => r.section === "interviews") : [];
  const offerChildren = candidateChildren ? relatedChildren.filter((r) => r.section === "offers") : [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate({ to: cfg.route })} className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> {cfg.label}
          </button>
          <span>/</span>
          <span className="font-mono text-xs">{item.id}</span>
        </div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Select value={item.standardStatus ?? "New"} onValueChange={(v) => setStandardStatus(item.id, v as any)}>
                <SelectTrigger className="h-8 w-auto min-w-[140px] gap-2 border-0 bg-transparent p-0 shadow-none focus:ring-0">
                  <StatusBadge status={item.standardStatus ?? "New"} />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Step</span>
              <Select value={item.status} onValueChange={(v) => setStatus(item.id, v)}>
                <SelectTrigger className="h-8 w-auto min-w-[160px] gap-2 border-0 bg-transparent p-0 shadow-none focus:ring-0">
                  <StatusBadge status={item.status} />
                </SelectTrigger>
                <SelectContent>
                  {cfg.statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                Created {format(new Date(item.createdAt), "MMM d, yyyy")} by {item.createdBy}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {section === "requisitions" && (
              <Button onClick={() => setCreateChild("vacancies")}>
                <Plus className="h-4 w-4" /> Create Vacancy
              </Button>
            )}
            {section === "vacancies" && (
              <Button onClick={() => setCreateChild("candidates")}>
                <Plus className="h-4 w-4" /> Add Candidate
              </Button>
            )}
            {section === "candidates" && (
              <>
                {item.status === "Hired" && (
                  <Button
                    variant="default"
                    onClick={() =>
                      navigate({
                        to: "/employees/new",
                        search: {
                          ad: item.data?.name ?? "",
                          soyad: item.data?.surname ?? "",
                          ataAdi: item.data?.fatherName ?? item.data?.patronymic ?? "",
                          struktur: parent?.data?.department ?? "",
                          vezife: parent?.data?.position ?? item.data?.position ?? "",
                        },
                      })
                    }
                  >
                    <Plus className="h-4 w-4" /> Create Employee
                  </Button>
                )}

                <Button variant="outline" onClick={() => setCreateChild("interviews")}>
                  <Plus className="h-4 w-4" /> Create Interview
                </Button>
                <Button onClick={() => setCreateChild("offers")}>
                  <Plus className="h-4 w-4" /> Create Job Offer
                </Button>
              </>
            )}

          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b bg-background px-6">
          <TabsList className="h-auto bg-transparent p-0">
            <DetailTab value="overview">Overview</DetailTab>
            {section === "candidates" && <DetailTab value="similar">Similar applications</DetailTab>}
            <DetailTab value="related">Related with</DetailTab>
            <DetailTab value="approvals">Approvals</DetailTab>
            <DetailTab value="activity">Activity</DetailTab>
            <DetailTab value="attachments">Attachments</DetailTab>
            {section === "candidates" && <DetailTab value="mails">Mails</DetailTab>}
          </TabsList>
        </div>

        <TabsContent value="overview" className="m-0 flex-1 overflow-auto">
          <OverviewTab section={section} id={id} />
        </TabsContent>
        {section === "candidates" && (
          <TabsContent value="similar" className="m-0 flex-1 overflow-auto p-6">
            <SimilarApplicationsTab id={id} />
          </TabsContent>
        )}
        <TabsContent value="related" className="m-0 flex-1 overflow-auto p-6">
          <RelatedTab
            parent={parent}
            childSection={childSection}
            children={childSection ? relatedChildren.filter((r) => r.section === childSection) : []}
            interviews={interviewChildren}
            offers={offerChildren}
            section={section}
            onboardingTasks={section === "onboarding" && Array.isArray(item.data?.tasks) ? item.data.tasks : []}
          />
        </TabsContent>
        <TabsContent value="approvals" className="m-0 flex-1 overflow-auto p-6">
          <ApprovalsTab id={id} />
        </TabsContent>
        <TabsContent value="activity" className="m-0 flex-1 overflow-auto p-6">
          <ActivityTab id={id} />
        </TabsContent>
        <TabsContent value="attachments" className="m-0 flex-1 overflow-auto p-6">
          <AttachmentsTab id={id} />
        </TabsContent>
        {section === "candidates" && (
          <TabsContent value="mails" className="m-0 flex-1 overflow-auto p-6">
            <MailsTab id={id} />
          </TabsContent>
        )}
      </Tabs>

      {createChild && (
        <CreateDialog
          section={createChild}
          open={!!createChild}
          onOpenChange={(v) => !v && setCreateChild(null)}
          parentId={id}
        />
      )}
    </div>
  );
}

function DetailTab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="relative h-11 rounded-none border-b-2 border-transparent bg-transparent px-3 text-sm text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
    >
      {children}
    </TabsTrigger>
  );
}

function OverviewTab({ section, id }: { section: SectionKey; id: string }) {
  const cfg = SECTIONS[section];
  const item = useStore((s) => s.byId(id))!;
  const updateData = useStore((s) => s.updateData);
  const addComment = useStore((s) => s.addComment);
  const items = useStore((s) => s.items);

  const [commentText, setCommentText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMention, setShowMention] = useState(false);

  const cvValue = item.data.cv;

  return (
    <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {cfg.fields.map((f) => {
              let optionsOverride;
              if (section === "interviews" && f.name === "vacancy")
                optionsOverride = items.filter((i) => i.section === "vacancies").map((i) => ({ value: i.id, label: i.title }));
              if ((section === "interviews" || section === "offers") && f.name === "candidate")
                optionsOverride = items.filter((i) => i.section === "candidates").map((i) => ({ value: i.id, label: i.title }));
              const wide = f.type === "textarea" || f.type === "file" || f.type === "image";
              return (
                <div key={f.name} className={wide ? "md:col-span-2" : ""}>
                  <FieldRow field={f}>
                    <FieldInput
                      field={f}
                      value={item.data[f.name]}
                      onChange={(v) => updateData(id, { [f.name]: v })}
                      optionsOverride={optionsOverride}
                    />
                  </FieldRow>
                </div>
              );
            })}
          </div>
        </div>

        {section === "candidates" && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" /> CV Preview
            </h2>
            <CVPreview cv={cvValue} candidate={item.title} />
          </div>
        )}

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4" /> Comments & chat
          </h2>
          <div className="space-y-4">
            {item.comments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet — start the conversation.</p>
            )}
            {item.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <UserAvatar name={c.author} size={32} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">{c.author}</span>
                    <span className="text-muted-foreground">{format(new Date(c.at), "MMM d, h:mma")}</span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{renderMentions(c.text)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment… Use @ to mention someone"
              className="min-h-[80px] resize-none border-0 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between border-t p-2">
              <div className="flex gap-1">
                <div className="relative">
                  <Button variant="ghost" size="sm" onClick={() => setShowMention((v) => !v)}>
                    @ Mention
                  </Button>
                  {showMention && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border bg-popover p-1 shadow-md">
                      {USERS.map((u) => (
                        <button
                          key={u}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => {
                            setCommentText((t) => `${t}@${u} `);
                            setShowMention(false);
                          }}
                        >
                          <UserAvatar name={u} size={20} /> {u}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Button variant="ghost" size="sm" onClick={() => setShowEmoji((v) => !v)}>
                    <Smile className="h-4 w-4" />
                  </Button>
                  {showEmoji && (
                    <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-md border bg-popover p-2 shadow-md">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          className="rounded p-1 text-lg hover:bg-accent"
                          onClick={() => {
                            setCommentText((t) => t + e);
                            setShowEmoji(false);
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                disabled={!commentText.trim()}
                onClick={() => {
                  addComment(id, commentText.trim());
                  setCommentText("");
                }}
              >
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SidePanel item={item} />
      </div>
    </div>
  );
}

function renderMentions(text: string) {
  const parts = text.split(/(@[\w ]+?)(?=\s|$)/g);
  return parts.map((p, i) =>
    p.startsWith("@") && USERS.some((u) => p.slice(1).startsWith(u.split(" ")[0])) ? (
      <span key={i} className="rounded bg-info/15 px-1 font-medium text-info-foreground">
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function CVPreview({ cv, candidate }: { cv: any; candidate: string }) {
  return (
    <div className="rounded-md border bg-surface p-6">
      <div className="mx-auto max-w-lg space-y-4 rounded bg-card p-6 text-sm shadow-sm">
        <div className="border-b pb-3">
          <h3 className="text-lg font-semibold">{candidate}</h3>
          <p className="text-xs text-muted-foreground">
            {cv?.name || "Riya_Patel_CV.pdf"} · Senior Software Engineer
          </p>
        </div>
        <section>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Experience</h4>
          <div className="space-y-2">
            <div>
              <p className="font-medium">Senior Engineer · Stripe · 2022–Present</p>
              <p className="text-xs text-muted-foreground">Led payments reliability squad, cut incidents 40%.</p>
            </div>
            <div>
              <p className="font-medium">Engineer · Shopify · 2019–2022</p>
              <p className="text-xs text-muted-foreground">Built merchant analytics pipelines.</p>
            </div>
          </div>
        </section>
        <section>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Education</h4>
          <p>B.Sc. Computer Science · University of Waterloo</p>
        </section>
        <section>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</h4>
          <p className="text-xs">TypeScript · Go · Kubernetes · System Design · PostgreSQL</p>
        </section>
      </div>
    </div>
  );
}

function SidePanel({ item }: { item: any }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Properties</h3>
      <div className="space-y-3 text-sm">
        <PropRow label="ID"><span className="font-mono text-xs">{item.id}</span></PropRow>
        <PropRow label="Status"><StatusBadge status={item.standardStatus ?? "New"} /></PropRow>
        <PropRow label="Step"><StatusBadge status={item.status} /></PropRow>
        <PropRow label="Assigned"><UserChip name={item.assigned} /></PropRow>
        <PropRow label="Created by"><UserChip name={item.createdBy} /></PropRow>
        <PropRow label="Created"><span className="text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</span></PropRow>
        {item.section === "candidates" && (
          <PropRow label="Applied date"><span className="text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</span></PropRow>
        )}
      </div>
    </div>
  );
}

function SimilarApplicationsTab({ id }: { id: string }) {
  const items = useStore((s) => s.items);
  const current = items.find((i) => i.id === id);
  const similar = useMemo(() => {
    if (!current) return [] as any[];
    const curName = (current.data?.name ?? "").toString().toLowerCase();
    const curSurname = (current.data?.surname ?? "").toString().toLowerCase();
    const matches = items.filter((i) => {
      if (i.section !== "candidates" || i.id === current.id) return false;
      const n = (i.data?.name ?? "").toString().toLowerCase();
      const s = (i.data?.surname ?? "").toString().toLowerCase();
      if (!curName && !curSurname) return false;
      return (
        (curName && (n === curName || n.startsWith(curName.slice(0, 3)))) ||
        (curSurname && (s === curSurname || s.startsWith(curSurname.slice(0, 3))))
      );
    });
    // Always show at least a few sample rows for demo
    const demo = [
      { id: "SAMPLE-1", data: { name: current.data?.name || "Riya", surname: "Sharma", image: { dataUrl: "https://i.pravatar.cc/96?img=26" } }, status: "Rejected", createdAt: new Date(Date.now() - 90 * 86400000).toISOString(), positionApplied: "Product Designer" },
      { id: "SAMPLE-2", data: { name: current.data?.name || "Riya", surname: "Kapoor", image: { dataUrl: "https://i.pravatar.cc/96?img=44" } }, status: "Withdrawn", createdAt: new Date(Date.now() - 180 * 86400000).toISOString(), positionApplied: "Data Scientist" },
      { id: "SAMPLE-3", data: { name: current.data?.surname || "Patel", surname: "Mehta", image: { dataUrl: "https://i.pravatar.cc/96?img=52" } }, status: "Hired", createdAt: new Date(Date.now() - 240 * 86400000).toISOString(), positionApplied: "Senior Software Engineer" },
    ];
    return [
      ...matches.map((m) => {
        const parentV = items.find((x) => x.id === m.parentId);
        return {
          id: m.id,
          data: m.data,
          status: m.status,
          createdAt: m.createdAt,
          positionApplied: parentV?.data?.position || parentV?.title || "—",
        };
      }),
      ...demo,
    ];
  }, [items, current]);

  if (!current) return null;
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Similar applications</h3>
        <span className="text-xs text-muted-foreground">Candidates with similar name or surname to {current.title}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((s: any) => {
          const url = s.data?.image?.dataUrl as string | undefined;
          const name = [s.data?.name, s.data?.surname].filter(Boolean).join(" ");
          return (
            <div key={s.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                {url ? (
                  <img src={url} alt={name} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <UserAvatar name={name} size={44} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.positionApplied}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Applied {format(new Date(s.createdAt), "MMM d, yyyy")}</span>
                <span className="font-mono">{s.id}</span>
              </div>
            </div>
          );
        })}
        {similar.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No similar applications found.</p>
        )}
      </div>
    </div>
  );
}
function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function RelatedTab({
  parent,
  childSection,
  children,
  interviews,
  offers,
  section,
  onboardingTasks = [],
}: {
  parent: { section: SectionKey; [k: string]: any } | undefined;
  childSection: SectionKey | null;
  children: any[];
  interviews: any[];
  offers: any[];
  section: SectionKey;
  onboardingTasks?: any[];
}) {
  return (
    <div className="space-y-6">
      {parent && (
        <RelatedGroup label={`Parent ${SECTIONS[parent.section].singular}`} items={[parent]} sectionRoute={SECTIONS[parent.section].route} />
      )}
      {childSection && (
        <RelatedGroup label={SECTIONS[childSection].label} items={children} sectionRoute={SECTIONS[childSection].route} />
      )}
      {section === "candidates" && (
        <>
          <RelatedGroup label="Interviews" items={interviews} sectionRoute="/interviews" />
          <RelatedGroup label="Job Offers" items={offers} sectionRoute="/offers" />
        </>
      )}
      {section === "onboarding" && <OnboardingTasksGroup tasks={onboardingTasks} />}
      {!parent && !childSection && section !== "candidates" && section !== "onboarding" && (
        <p className="text-sm text-muted-foreground">No related items.</p>
      )}
    </div>
  );
}

function OnboardingTasksGroup({ tasks }: { tasks: any[] }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Tasks <span className="ml-1 text-muted-foreground">({tasks.length})</span></h3>
      </div>
      {tasks.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No tasks linked.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Task</th>
                <th className="px-4 py-2 text-left font-medium">Owner</th>
                <th className="px-4 py-2 text-left font-medium">Assigned</th>
                <th className="px-4 py-2 text-left font-medium">Priority</th>
                <th className="px-4 py-2 text-left font-medium">Due date</th>
                <th className="px-4 py-2 text-left font-medium">Description</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 font-medium">{t.title}</td>
                  <td className="px-4 py-2">{t.group || "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{t.assigned || "—"}</td>
                  <td className="px-4 py-2">{t.priority || "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{t.dueDate || "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{t.description || "—"}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={t.done ? "Done" : "In Progress"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RelatedGroup({ label, items, sectionRoute }: { label: string; items: any[]; sectionRoute: string }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{label} <span className="ml-1 text-muted-foreground">({items.length})</span></h3>
      </div>
      {items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No {label.toLowerCase()} linked.</p>
      ) : (
        <ul className="divide-y">
          {items.map((i) => (
            <li key={i.id}>
              <Link to={`${sectionRoute}/$id`} params={{ id: i.id }} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                  <span className="text-sm font-medium">{i.title}</span>
                </div>
                <StatusBadge status={i.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type DraftApproval = {
  key: string;
  approver: string;
  order: number;
  note: string;
  required: "required" | "optional";
};

function newDraft(order: number): DraftApproval {
  return { key: `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, approver: "", order, note: "", required: "required" };
}

function ApprovalsTab({ id }: { id: string }) {
  const item = useStore((s) => s.byId(id))!;
  const addApproval = useStore((s) => s.addApproval);
  const respond = useStore((s) => s.respondApproval);

  const [drafts, setDrafts] = useState<DraftApproval[]>(() => [newDraft(item.approvals.length + 1)]);
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});

  const updateDraft = (key: string, patch: Partial<DraftApproval>) =>
    setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const removeDraft = (key: string) =>
    setDrafts((ds) => (ds.length === 1 ? [newDraft(item.approvals.length + 1)] : ds.filter((d) => d.key !== key)));
  const addDraft = () =>
    setDrafts((ds) => [...ds, newDraft(item.approvals.length + ds.length + 1)]);

  const sendAll = () => {
    const valid = drafts.filter((d) => d.approver);
    if (valid.length === 0) {
      toast.error("Add at least one approver");
      return;
    }
    for (const d of valid) {
      addApproval(id, {
        approver: d.approver,
        order: d.order,
        note: d.note,
        required: d.required === "required",
      });
    }
    toast.success(`${valid.length} approval${valid.length === 1 ? "" : "s"} requested`);
    setDrafts([newDraft(item.approvals.length + valid.length + 1)]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">
            Approval Chain <span className="ml-1 text-muted-foreground">({item.approvals.length})</span>
          </h3>
        </div>
        {item.approvals.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No approvals requested yet.</p>
        ) : (
          <ul className="divide-y">
            {item.approvals
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((a) => (
                <li key={a.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {a.order}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <UserChip name={a.approver} />
                          <span className="text-xs text-muted-foreground">
                            {a.required ? "Required" : "Optional"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sent by {a.sentBy}
                          {a.approvedDate && ` · Responded ${format(new Date(a.approvedDate), "MMM d, h:mma")}`}
                        </p>
                        {a.note && <p className="mt-1 text-sm">{a.note}</p>}
                        {a.responseNote && (
                          <p className="mt-1 rounded bg-muted p-2 text-xs">
                            <span className="font-medium">{a.approvedBy}:</span> {a.responseNote}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.status === "Pending" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 pl-11">
                      <Input
                        placeholder="Response note (optional)"
                        value={responseNotes[a.id] ?? ""}
                        onChange={(e) => setResponseNotes({ ...responseNotes, [a.id]: e.target.value })}
                        className="h-8 max-w-md"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-success/40 text-success hover:bg-success/10"
                        onClick={() => {
                          respond(id, a.id, "Approved", responseNotes[a.id] ?? "");
                          toast.success("Approved");
                        }}
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          respond(id, a.id, "Rejected", responseNotes[a.id] ?? "");
                          toast.error("Rejected");
                        }}
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Request new approvals</h3>
          <span className="text-xs text-muted-foreground">
            {drafts.length} approver{drafts.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-4">
          {drafts.map((d, idx) => (
            <div key={d.key} className="rounded-md border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Approver #{idx + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDraft(d.key)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Approver</Label>
                  <Select value={d.approver} onValueChange={(v) => updateDraft(d.key, { approver: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {USERS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={d.order}
                    onChange={(e) => updateDraft(d.key, { order: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-1.5 md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Note</Label>
                  <Textarea
                    value={d.note}
                    onChange={(e) => updateDraft(d.key, { note: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">Requirement</Label>
                  <RadioGroup
                    value={d.required}
                    onValueChange={(v) => updateDraft(d.key, { required: v as "required" | "optional" })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id={`req-${d.key}`} value="required" />
                      <Label htmlFor={`req-${d.key}`}>Required</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id={`opt-${d.key}`} value="optional" />
                      <Label htmlFor={`opt-${d.key}`}>Optional</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={addDraft}>
            <Plus className="h-3.5 w-3.5" /> Add approver
          </Button>
          <Button onClick={sendAll}>
            <Send className="h-3.5 w-3.5" /> Send{drafts.length > 1 ? " all" : ""} request
            {drafts.length > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ id }: { id: string }) {
  const item = useStore((s) => s.byId(id))!;
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Activity timeline</h3>
      </div>
      <ol className="relative divide-y">
        {item.activity.map((a) => (
          <li key={a.id} className="flex gap-3 p-4">
            <UserAvatar name={a.actor} size={28} />
            <div className="flex-1">
              <p className="text-sm"><span className="font-medium">{a.actor}</span> {a.message}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(a.at), "MMM d, yyyy · h:mma")}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AttachmentsTab({ id }: { id: string }) {
  const item = useStore((s) => s.byId(id))!;
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Attachments <span className="ml-1 text-muted-foreground">({item.attachments.length})</span></h3>
        <Button variant="outline" size="sm"><Paperclip className="h-3.5 w-3.5" /> Upload</Button>
      </div>
      {item.attachments.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No attachments yet.</p>
      ) : (
        <ul className="divide-y">
          {item.attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-muted"><FileText className="h-4 w-4" /></div>
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.kind.toUpperCase()} · {a.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Download</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MailsTab({ id }: { id: string }) {
  const item = useStore((s) => s.byId(id))!;
  const mails = item.mails ?? [];
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4" /> Mails <span className="text-muted-foreground">({mails.length})</span></h3>
        <Button variant="outline" size="sm">Compose</Button>
      </div>
      {mails.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No mails yet.</p>
      ) : (
        <ul className="divide-y">
          {mails.map((m) => (
            <li key={m.id} className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span><span className="font-medium text-foreground">{m.from}</span> → {m.to}</span>
                <span>{format(new Date(m.at), "MMM d, h:mma")}</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{m.subject}</p>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
