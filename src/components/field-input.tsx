import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import { USERS } from "@/lib/sections";
import type { FieldDef } from "@/lib/types";

export function FieldInput({
  field,
  value,
  onChange,
  optionsOverride,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
  optionsOverride?: { value: string; label: string }[];
}) {
  const id = `f-${field.name}`;

  switch (field.type) {
    case "text":
      return <Input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <Textarea id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} />;
    case "number":
      return (
        <Input
          id={id}
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        />
      );
    case "date":
      return (
        <Input
          id={id}
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ""}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
        />
      );
    case "checkbox":
      return (
        <div className="flex items-center h-9">
          <Checkbox id={id} checked={!!value} onCheckedChange={(v) => onChange(!!v)} />
        </div>
      );
    case "select": {
      const opts = optionsOverride ?? (field.options || []).map((o) => ({ value: o, label: o }));
      return (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    case "user":
      return (
        <Select value={value ?? ""} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select user…" />
          </SelectTrigger>
          <SelectContent>
            {USERS.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "file":
      return <FileField value={value} onChange={onChange} kind="file" />;
    case "image":
      return <FileField value={value} onChange={onChange} kind="image" />;
    default:
      return null;
  }
}

function FileField({ value, onChange, kind }: { value: any; onChange: (v: any) => void; kind: "file" | "image" }) {
  const [dragging, setDragging] = useState(false);
  const handleFile = (f: File) => {
    if (kind === "image") {
      const reader = new FileReader();
      reader.onload = () => onChange({ name: f.name, size: `${Math.round(f.size / 1024)} KB`, dataUrl: reader.result });
      reader.readAsDataURL(f);
    } else {
      onChange({ name: f.name, size: `${Math.round(f.size / 1024)} KB` });
    }
  };

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-3 text-sm transition-colors ${
        dragging ? "bg-accent" : "hover:bg-accent/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
    >
      {kind === "image" ? <ImageIcon className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
      <div className="flex-1">
        {value?.name ? (
          <span className="text-foreground">{value.name}{value.size ? ` · ${value.size}` : ""}</span>
        ) : (
          <span className="text-muted-foreground">Drop {kind} or click to upload</span>
        )}
      </div>
      <Upload className="h-4 w-4 text-muted-foreground" />
      <input
        type="file"
        accept={kind === "image" ? "image/*" : undefined}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </label>
  );
}

export function FieldRow({ field, children }: { field: FieldDef; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`f-${field.name}`} className="text-xs font-medium text-muted-foreground">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

export function useFormState(initial: Record<string, any> = {}) {
  const [values, setValues] = useState<Record<string, any>>(initial);
  const set = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));
  return { values, set, setAll: setValues };
}

export { Button };
