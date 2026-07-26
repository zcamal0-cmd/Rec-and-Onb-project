import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Check } from "lucide-react";

const ADD_NEW = "__add_new__";

export function SelectWithAdd({
  value,
  onChange,
  options,
  placeholder = "Select…",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const isCustom = !!value && !options.includes(value);

  if (adding) {
    return (
      <div className="flex gap-2">
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Enter new value"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) onChange(draft.trim());
              setAdding(false);
              setDraft("");
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (draft.trim()) onChange(draft.trim());
            setAdding(false);
            setDraft("");
          }}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setAdding(false);
            setDraft("");
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => {
        if (v === ADD_NEW) {
          setAdding(true);
          setDraft("");
          return;
        }
        onChange(v);
      }}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isCustom && <SelectItem value={value}>{value}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
        <SelectItem value={ADD_NEW}>
          <span className="flex items-center gap-1 text-primary">
            <Plus className="h-3.5 w-3.5" /> Add new…
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
