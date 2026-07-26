import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldInput, FieldRow, useFormState } from "./field-input";
import { SelectWithAdd } from "./select-with-add";
import { SECTIONS, POSITIONS } from "@/lib/sections";
import { useStore } from "@/lib/store";
import type { SectionKey } from "@/lib/types";
import { toast } from "sonner";
import { CreateVacancyDialog } from "./create-vacancy-dialog";
import { CreateOfferDialog } from "./create-offer-dialog";

export function CreateDialog({
  section,
  open,
  onOpenChange,
  parentId,
  onCreated,
}: {
  section: SectionKey;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  parentId?: string;
  onCreated?: (id: string) => void;
}) {
  if (section === "vacancies") {
    return (
      <CreateVacancyDialog
        open={open}
        onOpenChange={onOpenChange}
        parentId={parentId}
        onCreated={onCreated}
      />
    );
  }
  if (section === "offers") {
    return (
      <CreateOfferDialog
        open={open}
        onOpenChange={onOpenChange}
        parentId={parentId}
        onCreated={onCreated}
      />
    );
  }
  return (
    <GenericCreateDialog
      section={section}
      open={open}
      onOpenChange={onOpenChange}
      parentId={parentId}
      onCreated={onCreated}
    />
  );
}

function GenericCreateDialog({
  section,
  open,
  onOpenChange,
  parentId,
  onCreated,
}: {
  section: SectionKey;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  parentId?: string;
  onCreated?: (id: string) => void;
}) {
  const cfg = SECTIONS[section];
  const create = useStore((s) => s.create);
  const items = useStore((s) => s.items);
  const { values, set, setAll } = useFormState({});

  const submit = () => {
    const created = create(section, values, parentId);
    toast.success(`${cfg.singular} created`);
    onOpenChange(false);
    setAll({});
    onCreated?.(created.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create {cfg.singular}</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new {cfg.singular.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          {cfg.fields.map((f) => {
            let optionsOverride;
            if (section === "interviews" && f.name === "vacancy") {
              optionsOverride = items
                .filter((i) => i.section === "vacancies")
                .map((i) => ({ value: i.id, label: i.title }));
            }
            if (section === "interviews" && f.name === "candidate") {
              optionsOverride = items
                .filter((i) => i.section === "candidates")
                .map((i) => ({ value: i.id, label: i.title }));
            }
            const wide = f.type === "textarea" || f.type === "file" || f.type === "image";
            return (
              <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
                <FieldRow field={f}>
                  {f.name === "position" && f.type === "select" ? (
                    <SelectWithAdd
                      id={`f-${f.name}`}
                      value={values[f.name] ?? ""}
                      onChange={(v) => set(f.name, v)}
                      options={POSITIONS}
                      placeholder="Select position…"
                    />
                  ) : (
                    <FieldInput
                      field={f}
                      value={values[f.name]}
                      onChange={(v) => set(f.name, v)}
                      optionsOverride={optionsOverride}
                    />
                  )}
                </FieldRow>
              </div>
            );
          })}
          <div>
            <FieldRow field={{ name: "status", label: "Status", type: "select", options: cfg.statuses }}>
              <FieldInput
                field={{ name: "status", label: "Status", type: "select", options: cfg.statuses }}
                value={values.status ?? cfg.defaultStatus}
                onChange={(v) => set("status", v)}
              />
            </FieldRow>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
