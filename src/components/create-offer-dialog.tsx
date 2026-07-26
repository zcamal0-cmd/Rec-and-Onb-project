import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldRow } from "./field-input";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { FileText, Send } from "lucide-react";

const TEMPLATES = [
  { id: "standard", name: "Standard Offer", description: "Standard full-time employment offer" },
  { id: "technical", name: "Technical Role Offer", description: "Includes stack, on-call & equity terms" },
  { id: "executive", name: "Executive Offer", description: "Leadership offer with sign-on bonus" },
];

export function CreateOfferDialog({
  open,
  onOpenChange,
  parentId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  parentId?: string;
  onCreated?: (id: string) => void;
}) {
  const items = useStore((s) => s.items);
  const create = useStore((s) => s.create);

  const [template, setTemplate] = useState<string>("");
  const [values, setValues] = useState({
    vacancy: "",
    candidate: parentId ?? "",
    offerType: "Standart",
    showSalary: true,
    salary: "",
    startDate: "",
  });
  const set = <K extends keyof typeof values>(k: K, v: (typeof values)[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const vacancies = items.filter((i) => i.section === "vacancies");
  const candidates = items.filter((i) => i.section === "candidates");
  const vac = vacancies.find((v) => v.id === values.vacancy);
  const cand = candidates.find((c) => c.id === values.candidate);

  const reset = () => {
    setTemplate("");
    setValues({
      vacancy: "",
      candidate: parentId ?? "",
      offerType: "Standart",
      showSalary: true,
      salary: "",
      startDate: "",
    });
  };

  const submit = (sendMail: boolean) => {
    const title = cand ? `Offer — ${cand.title}` : "New Job Offer";
    const created = create(
      "offers",
      {
        title,
        template,
        offerType: values.offerType,
        showSalary: values.showSalary,
        salary: values.showSalary ? values.salary : "",
        startDate: values.startDate,
        vacancy: values.vacancy,
        candidate: values.candidate,
        sentDate: sendMail ? new Date().toISOString() : "",
        status: sendMail ? "Sent" : "New",
      },
      parentId ?? values.candidate,
    );
    toast.success(sendMail ? "Offer created and mail sent" : "Offer saved");
    onOpenChange(false);
    reset();
    onCreated?.(created.id);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job Offer</DialogTitle>
          <DialogDescription>
            {template ? "Fill in the fields to populate the offer template." : "Select a template document to begin."}
          </DialogDescription>
        </DialogHeader>

        {!template ? (
          <div className="grid gap-3 py-2 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className="rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent/40"
              >
                <FileText className="h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 py-2 lg:grid-cols-2">
            <div className="space-y-3">
              <FieldRow field={{ name: "vacancy", label: "Vacancy", type: "select" }}>
                <Select value={values.vacancy} onValueChange={(v) => set("vacancy", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vacancy…" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacancies.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow field={{ name: "candidate", label: "Candidate", type: "select" }}>
                <Select value={values.candidate} onValueChange={(v) => set("candidate", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate…" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow field={{ name: "offerType", label: "Job offer type", type: "select" }}>
                <Select value={values.offerType} onValueChange={(v) => set("offerType", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standart">Standart</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="offer-showsal"
                  checked={values.showSalary}
                  onCheckedChange={(v) => set("showSalary", !!v)}
                />
                <Label htmlFor="offer-showsal" className="text-sm">
                  Show salary
                </Label>
              </div>

              {values.showSalary && (
                <FieldRow field={{ name: "salary", label: "Salary", type: "text" }}>
                  <Input
                    value={values.salary}
                    onChange={(e) => set("salary", e.target.value)}
                    placeholder="$120,000"
                  />
                </FieldRow>
              )}

              <FieldRow field={{ name: "startDate", label: "Job start date", type: "date" }}>
                <Input
                  type="date"
                  value={values.startDate ? values.startDate.slice(0, 10) : ""}
                  onChange={(e) =>
                    set("startDate", e.target.value ? new Date(e.target.value).toISOString() : "")
                  }
                />
              </FieldRow>

              <Button variant="ghost" size="sm" onClick={() => setTemplate("")}>
                ← Change template
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <TemplatePreview template={template} vacancy={vac} candidate={cand} values={values} />
            </div>
          </div>
        )}

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {template && (
            <>
              <Button variant="outline" onClick={() => submit(false)}>
                Save
              </Button>
              <Button onClick={() => submit(true)}>
                <Send className="h-3.5 w-3.5" /> Save and send mail
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplatePreview({
  template,
  vacancy,
  candidate,
  values,
}: {
  template: string;
  vacancy?: { title: string };
  candidate?: { title: string };
  values: {
    offerType: string;
    showSalary: boolean;
    salary: string;
    startDate: string;
  };
}) {
  const tpl = TEMPLATES.find((t) => t.id === template);
  const name = candidate?.title ?? "[Candidate name]";
  const role = vacancy?.title ?? "[Vacancy]";
  const salary = values.showSalary ? values.salary || "[Salary]" : null;
  const start = values.startDate ? new Date(values.startDate).toLocaleDateString() : "[Start date]";

  return (
    <div className="mx-auto max-w-md space-y-3 rounded bg-card p-6 text-sm shadow-sm">
      <div className="border-b pb-2">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{tpl?.name}</p>
        <h3 className="text-lg font-semibold">Offer of Employment</h3>
      </div>
      <p>
        Dear <strong>{name}</strong>,
      </p>
      <p>
        We are delighted to offer you the position of <strong>{role}</strong>{" "}
        <span className="text-muted-foreground">({values.offerType})</span> at Acme Inc.
      </p>
      <p>
        Your proposed start date is <strong>{start}</strong>.
      </p>
      {salary !== null && (
        <p>
          Your annualized compensation will be <strong>{salary}</strong>.
        </p>
      )}
      <p>Please indicate your acceptance by signing and returning this letter.</p>
      <p className="pt-4 text-xs text-muted-foreground">— The Acme People Team</p>
    </div>
  );
}
