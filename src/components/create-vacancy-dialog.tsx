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
import { FieldInput, FieldRow, useFormState } from "./field-input";
import { SelectWithAdd } from "./select-with-add";
import { SECTIONS, POSITIONS } from "@/lib/sections";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Plus, X, Linkedin, Building2, Mail } from "lucide-react";

export function CreateVacancyDialog({
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
  const cfg = SECTIONS.vacancies;
  const create = useStore((s) => s.create);
  const { values, set, setAll } = useFormState({});
  const [step, setStep] = useState(1);
  const [sharing, setSharing] = useState({ linkedin: false, intranet: false, other: false });
  const [emails, setEmails] = useState<string[]>([""]);

  const reset = () => {
    setStep(1);
    setAll({});
    setSharing({ linkedin: false, intranet: false, other: false });
    setEmails([""]);
  };

  const submit = () => {
    const cleanEmails = emails.map((e) => e.trim()).filter(Boolean);
    const created = create(
      "vacancies",
      {
        ...values,
        sharing: {
          linkedin: sharing.linkedin,
          intranet: sharing.intranet,
          other: sharing.other,
          emails: sharing.other ? cleanEmails : [],
        },
      },
      parentId,
    );
    toast.success("Vacancy created");
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
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Vacancy</DialogTitle>
          <DialogDescription>
            Step {step} of 2 — {step === 1 ? "vacancy details" : "share this vacancy"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 pb-2">
          <StepDot n={1} active={step >= 1} label="Details" />
          <div className="h-px flex-1 bg-border" />
          <StepDot n={2} active={step >= 2} label="Share" />
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            {cfg.fields.map((f) => {
              const wide = f.type === "textarea" || f.type === "file" || f.type === "image";
              return (
                <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
                  <FieldRow field={f}>
                    {f.name === "position" ? (
                      <SelectWithAdd
                        id={`f-${f.name}`}
                        value={values[f.name] ?? ""}
                        onChange={(v) => set(f.name, v)}
                        options={POSITIONS}
                        placeholder="Select position…"
                      />
                    ) : (
                      <FieldInput field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
                    )}
                  </FieldRow>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Choose where to publish and share this vacancy.
            </p>
            <ShareRow
              icon={<Linkedin className="h-4 w-4 text-[#0A66C2]" />}
              label="LinkedIn"
              desc="Publish to your company LinkedIn page"
              checked={sharing.linkedin}
              onChange={(v) => setSharing((s) => ({ ...s, linkedin: v }))}
            />
            <ShareRow
              icon={<Building2 className="h-4 w-4" />}
              label="Intranet"
              desc="Post on the internal careers portal"
              checked={sharing.intranet}
              onChange={(v) => setSharing((s) => ({ ...s, intranet: v }))}
            />
            <ShareRow
              icon={<Mail className="h-4 w-4" />}
              label="Other sources"
              desc="Send the vacancy by email to specific recipients"
              checked={sharing.other}
              onChange={(v) => setSharing((s) => ({ ...s, other: v }))}
            />
            {sharing.other && (
              <div className="ml-8 space-y-2 rounded-md border bg-muted/30 p-3">
                <Label className="text-xs text-muted-foreground">Recipient emails</Label>
                {emails.map((e, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      type="email"
                      value={e}
                      onChange={(ev) =>
                        setEmails(emails.map((x, j) => (j === i ? ev.target.value : x)))
                      }
                      placeholder="name@example.com"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEmails(emails.length === 1 ? [""] : emails.filter((_, j) => j !== i))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setEmails([...emails, ""])}>
                  <Plus className="h-3.5 w-3.5" /> Add email
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button onClick={() => setStep(2)}>Next</Button>
            ) : (
              <Button onClick={submit}>Create Vacancy</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepDot({ n, active, label }: { n: number; active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {n}
      </div>
      <span className={`text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function ShareRow({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent/40">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon} {label}
        </div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </label>
  );
}
