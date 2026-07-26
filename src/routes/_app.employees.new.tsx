import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Lock, Plus, Pencil, Trash2, Eye, FileText, Upload, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import {
  ONBOARDING_TEMPLATES,
  ONBOARDING_TEMPLATE_TASKS,
  TASK_OWNERS,
  PRIORITIES,
  USERS,
  type OnboardingTemplate,
} from "@/lib/sections";
import type { OnboardingTask } from "@/lib/types";

type EmployeeSearch = {
  ad?: string;
  soyad?: string;
  ataAdi?: string;
  struktur?: string;
  vezife?: string;
};

export const Route = createFileRoute("/_app/employees/new")({
  validateSearch: (search: Record<string, unknown>): EmployeeSearch => ({
    ad: (search.ad as string) ?? "",
    soyad: (search.soyad as string) ?? "",
    ataAdi: (search.ataAdi as string) ?? "",
    struktur: (search.struktur as string) ?? "",
    vezife: (search.vezife as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "HR Kabinet — Yeni Əməkdaş" },
      { name: "description", content: "Namizəddən yeni əməkdaş yaradılması." },
    ],
  }),
  component: HRCabinet,
});

type Field =
  | { key: string; label: string; type: "text" | "textarea" | "date" }
  | { key: string; label: string; type: "select"; options: string[] };

type Row = Record<string, string>;

function ADField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={value} />
    </div>
  );
}


function EditableField({
  label,
  value,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date" | "textarea" | "select";
  options?: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {type === "textarea" ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seçin" />
          </SelectTrigger>
          <SelectContent>
            {options?.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function CrudSection({
  title,
  columns,
  fields,
  initialRows,
  fileColumn,
  hideDetails,
}: {
  title: string;
  columns: { key: string; label: string }[];
  fields: Field[];
  initialRows: Row[];
  fileColumn?: boolean;
  hideDetails?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [viewing, setViewing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>({});

  const openNew = () => {
    setEditing(null);
    setDraft({});
    setOpen(true);
  };
  const openEdit = (row: Row) => {
    setEditing(row);
    setDraft({ ...row });
    setOpen(true);
  };
  const save = () => {
    if (editing) {
      setRows((r) => r.map((x) => (x.__id === editing.__id ? { ...draft, __id: editing.__id } : x)));
      toast.success("Yeniləndi");
    } else {
      setRows((r) => [...r, { ...draft, __id: crypto.randomUUID() }]);
      toast.success("Əlavə edildi");
    }
    setOpen(false);
  };
  const remove = (row: Row) => {
    setRows((r) => r.filter((x) => x.__id !== row.__id));
    toast.success("Silindi");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> Yeni
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                <TableHead className="text-right">Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center text-sm text-muted-foreground">
                    Məlumat yoxdur
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.__id}>
                    {columns.map((c) => (
                      <TableCell key={c.key}>
                        {c.key === "status" && row[c.key] ? (
                          <Badge variant="secondary">{row[c.key]}</Badge>
                        ) : (
                          row[c.key] || "—"
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {fileColumn && (
                          <Button size="icon" variant="ghost" title="View file">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {!hideDetails && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Details"
                            onClick={() => {
                              setViewing(row);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" title="Edit" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Delete" onClick={() => remove(row)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Redaktə et" : "Yeni əlavə et"} — {title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <EditableField
                  label={f.label}
                  value={draft[f.key] || ""}
                  onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                  type={f.type}
                  options={"options" in f ? f.options : undefined}
                />
              </div>
            ))}
            {fileColumn && (
              <div className="md:col-span-2">
                <Label className="text-xs">Sertifikat / Fayl</Label>
                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-dashed p-4">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Fayl yükləmək üçün seçin</span>
                  <Input type="file" className="ml-auto max-w-xs" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={save}>Yadda saxla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Məlumat — {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {viewing &&
              fields.map((f) => (
                <div key={f.key} className="flex justify-between gap-4 border-b py-1.5">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="text-right font-medium">{viewing[f.key] || "—"}</span>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      <Separator />
    </div>
  );
}

function HRCabinet() {
  const search = Route.useSearch();
  const ad = search.ad ?? "";
  const soyad = search.soyad ?? "";
  const ataAdi = search.ataAdi ?? "";
  const struktur = search.struktur ?? "";
  const vezife = search.vezife ?? "";
  const fullName = [ad, soyad].filter(Boolean).join(" ") || "Yeni Əməkdaş";
  const initials =
    (ad?.[0] ?? "") + (soyad?.[0] ?? "") || "—";

  const [step, setStep] = useState<1 | 2>(1);

  const [personal, setPersonal] = useState({
    dob: "",
    gender: "",
    citizenship: "",
    ethnicity: "",
    marital: "",
    city: "",
    birthCountry: "",
    bloodType: "",
    childrenCount: "",
    personalEmail: "",
    mobile: "",
    regAddress: "",
    liveAddress: "",
    contractType: "",
    staff: "",
    workMode: "",
    workHours: "",
    exitDate: "",
    exitReason: "",
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">HR Kabinet</h1>
            <p className="text-xs text-muted-foreground">Əməkdaş master data</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" /> Active Directory sinxronizasiyası aktivdir
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <Stepper step={step} />

        <Card className="mb-6 mt-6">
          <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">{initials.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <p className="text-sm text-muted-foreground">
                {vezife || "—"} · {struktur || "—"}
              </p>
            </div>
            {step === 1 ? (
              <Button onClick={() => { toast.success("Əməkdaş məlumatları saxlanıldı"); setStep(2); }}>
                Yadda saxla
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Geri
              </Button>
            )}
          </CardContent>
        </Card>

        {step === 2 ? (
          <OnboardingStep
            employee={{ ad, soyad, ataAdi, struktur, vezife, fullName }}
          />
        ) : (
        <Tabs defaultValue="main">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="main">Əsas məlumatlar</TabsTrigger>
            <TabsTrigger value="career">Karyera və Təhsil</TabsTrigger>
            <TabsTrigger value="docs">Sənədlər</TabsTrigger>
            <TabsTrigger value="relatives">Qohumluq əlaqələri</TabsTrigger>
            <TabsTrigger value="military">Hərbi xidmət</TabsTrigger>
            <TabsTrigger value="contracts">Müqavilələr</TabsTrigger>
            <TabsTrigger value="leave">Məzuniyyət və Ezamiyyətlər</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="mt-6 space-y-8">
            <Section title="Şəxsi məlumatlar">
              <ADField label="İşçinin İD-si" value="" />
              <ADField label="SSN kodu" value="" />
              <ADField label="Ad" value={ad} />
              <ADField label="Soyad" value={soyad} />
              <ADField label="Ata adı" value={ataAdi} />
              <EditableField label="Doğum tarixi" type="date" value={personal.dob} onChange={(v) => setPersonal((p) => ({ ...p, dob: v }))} />
              <EditableField label="Cins" type="select" options={["Kişi", "Qadın"]} value={personal.gender} onChange={(v) => setPersonal((p) => ({ ...p, gender: v }))} />
              <EditableField label="Vətəndaşlıq" value={personal.citizenship} onChange={(v) => setPersonal((p) => ({ ...p, citizenship: v }))} />
              <EditableField label="Milliyət" value={personal.ethnicity} onChange={(v) => setPersonal((p) => ({ ...p, ethnicity: v }))} />
              <EditableField label="Ailə vəziyyəti" type="select" options={["Subay", "Evli", "Boşanmış", "Dul"]} value={personal.marital} onChange={(v) => setPersonal((p) => ({ ...p, marital: v }))} />
              <div className="space-y-1.5">
                <Label className="text-xs">Foto</Label>
                <div className="flex items-center gap-2 rounded-md border border-dashed p-3">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <Input type="file" accept="image/*" />
                </div>
              </div>
              <EditableField label="Yaşadığı rayon/şəhər" value={personal.city} onChange={(v) => setPersonal((p) => ({ ...p, city: v }))} />
              <EditableField label="Doğulduğu ölkə" type="select" options={["Azərbaycan", "Türkiyə", "Rusiya", "Gürcüstan", "Digər"]} value={personal.birthCountry} onChange={(v) => setPersonal((p) => ({ ...p, birthCountry: v }))} />
              <EditableField label="Qan qrupu" type="select" options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]} value={personal.bloodType} onChange={(v) => setPersonal((p) => ({ ...p, bloodType: v }))} />
              <EditableField label="Övlad sayı" value={personal.childrenCount} onChange={(v) => setPersonal((p) => ({ ...p, childrenCount: v }))} />
            </Section>

            <Section title="Ünvan və əlaqə məlumatları">
              <ADField label="Korporativ e-poçt" value="" />
              <ADField label="İş telefonu" value="" />
              <EditableField label="Şəxsi e-poçt" value={personal.personalEmail} onChange={(v) => setPersonal((p) => ({ ...p, personalEmail: v }))} />
              <EditableField label="Mobil telefon" value={personal.mobile} onChange={(v) => setPersonal((p) => ({ ...p, mobile: v }))} />
              <EditableField label="Qeydiyat ünvanı" value={personal.regAddress} onChange={(v) => setPersonal((p) => ({ ...p, regAddress: v }))} />
              <EditableField label="Yaşayış ünvanı" value={personal.liveAddress} onChange={(v) => setPersonal((p) => ({ ...p, liveAddress: v }))} />
            </Section>

            <Section title="Sonuncu iş yeri məlumatları">
              <ADField label="Cari Vəzifə adı" value={vezife} />
              <ADField label="Cari struktur bölmə" value={struktur} />
              <ADField label="Xətt rəhbəri" value="" />
              <ADField label="İş yerinin ünvanı" value="" />
              <EditableField label="Müqavilə növü" type="select" options={["Müddətsiz", "Müddətli", "Xidmət müqaviləsi"]} value={personal.contractType} onChange={(v) => setPersonal((p) => ({ ...p, contractType: v }))} />
              <EditableField label="Ştat" type="select" options={["Ştat", "Ştatdankənar"]} value={personal.staff} onChange={(v) => setPersonal((p) => ({ ...p, staff: v }))} />
              <EditableField label="İş rejimi" type="select" options={["Ofis", "Uzaqdan", "Hibrid", "Sahə"]} value={personal.workMode} onChange={(v) => setPersonal((p) => ({ ...p, workMode: v }))} />
              <EditableField label="İş saatları" value={personal.workHours} onChange={(v) => setPersonal((p) => ({ ...p, workHours: v }))} />
              <ADField label="İşə qəbul olunma tarixi" value="" />
              <EditableField label="İşdən ayrılma tarixi" type="date" value={personal.exitDate} onChange={(v) => setPersonal((p) => ({ ...p, exitDate: v }))} />
              <EditableField label="İşdən ayrılma səbəbi" value={personal.exitReason} onChange={(v) => setPersonal((p) => ({ ...p, exitReason: v }))} />
            </Section>
          </TabsContent>

          <TabsContent value="career" className="mt-6 space-y-6">
            <CrudSection
              title="İş təcrübəsi"
              columns={[
                { key: "company", label: "Şirkət adı" },
                { key: "dept", label: "Struktur bölmə" },
                { key: "position", label: "Vəzifə adı" },
                { key: "start", label: "İşə qəbul" },
                { key: "end", label: "Ayrılma" },
                { key: "status", label: "Status" },
              ]}
              fields={[
                { key: "company", label: "Şirkət adı", type: "text" },
                { key: "dept", label: "Struktur bölmə", type: "select", options: ["İT Departamenti", "HR Departamenti", "Maliyyə", "Marketinq", "Satış"] },
                { key: "position", label: "Vəzifə adı", type: "text" },
                { key: "start", label: "İşə qəbul olunma tarixi", type: "date" },
                { key: "end", label: "İşdən ayrılma tarixi", type: "date" },
                { key: "reason", label: "İşdən ayrılma səbəbi", type: "text" },
                { key: "manager", label: "Xətt rəhbəri", type: "text" },
                { key: "duties", label: "Vəzifə öhdəlikləri", type: "textarea" },
              ]}
              initialRows={[]}
            />
            <CrudSection
              title="Təhsil məlumatları"
              columns={[
                { key: "country", label: "Ölkə" },
                { key: "institution", label: "Təhsil müəssisəsi" },
                { key: "major", label: "İxtisas" },
                { key: "start", label: "Başlama" },
                { key: "end", label: "Bitirmə" },
              ]}
              fields={[
                { key: "country", label: "Ölkə", type: "select", options: ["Azərbaycan", "Türkiyə", "Rusiya", "Almaniya", "ABŞ"] },
                { key: "level", label: "Təhsil pilləsi", type: "select", options: ["Ali", "Orta", "Orta-ixtisas", "Peşə"] },
                { key: "institution", label: "Təhsil müəssisəsi", type: "select", options: ["BDU", "ADA", "UNEC", "ADNSU", "Qafqaz Universiteti"] },
                { key: "form", label: "Təhsil forması", type: "select", options: ["Əyani", "Qiyabi"] },
                { key: "language", label: "Təhsil dili", type: "select", options: ["Azərbaycan", "İngilis", "Rus", "Türk"] },
                { key: "major", label: "İxtisas", type: "text" },
                { key: "start", label: "Başlama tarixi", type: "date" },
                { key: "end", label: "Bitirmə tarixi", type: "date" },
                { key: "status", label: "Status", type: "select", options: ["Davam edir", "Bitib", "Yarımçıq"] },
                { key: "diplomaDate", label: "Diplom tarixi", type: "date" },
                { key: "diplomaNo", label: "Diplom nömrəsi", type: "text" },
              ]}
              initialRows={[]}
            />
            <CrudSection
              title="İştirak etdiyi təlimlər/kurslar"
              hideDetails
              columns={[
                { key: "name", label: "Təlim adı" },
                { key: "start", label: "Başlama" },
                { key: "end", label: "Bitirmə" },
                { key: "certNo", label: "Sertifikat №" },
                { key: "certDate", label: "Sertifikat tarixi" },
              ]}
              fields={[
                { key: "name", label: "Təlim adı", type: "text" },
                { key: "start", label: "Başlama tarixi", type: "date" },
                { key: "end", label: "Bitirmə tarixi", type: "date" },
                { key: "certNo", label: "Sertifikat nömrəsi", type: "text" },
                { key: "certDate", label: "Sertifikat tarixi", type: "date" },
                { key: "note", label: "Qeyd", type: "textarea" },
              ]}
              initialRows={[]}
            />
            <CrudSection
              title="Sertifikat məlumatları"
              fileColumn
              hideDetails
              columns={[
                { key: "name", label: "Sertifikat adı" },
                { key: "issued", label: "Verilmə tarixi" },
                { key: "valid", label: "Etibarlılıq tarixi" },
                { key: "provider", label: "Təmin edən qurum" },
                { key: "validity", label: "Etibarlılıq növü" },
              ]}
              fields={[
                { key: "name", label: "Sertifikat adı", type: "text" },
                { key: "issued", label: "Verilmə tarixi", type: "date" },
                { key: "provider", label: "Təmin edən qurum", type: "select", options: ["Microsoft", "Cisco", "AWS", "Google", "PMI"] },
                { key: "validity", label: "Etibarlılıq növü", type: "select", options: ["Daimi", "Müvəqqəti"] },
                { key: "valid", label: "Etibarlılıq tarixi", type: "date" },
              ]}
              initialRows={[]}
            />
            <CrudSection
              title="Dil bilikləri"
              hideDetails
              columns={[
                { key: "language", label: "Dil" },
                { key: "level", label: "Səviyyə" },
                { key: "certNo", label: "Sertifikat №" },
                { key: "certDate", label: "Verilmə tarixi" },
              ]}
              fields={[
                { key: "language", label: "Dil", type: "select", options: ["Azərbaycan", "İngilis", "Rus", "Türk", "Alman", "Fransız"] },
                { key: "level", label: "Səviyyə", type: "select", options: ["A1", "A2", "B1", "B2", "C1", "C2"] },
                { key: "certNo", label: "Sertifikat nömrəsi", type: "text" },
                { key: "certDate", label: "Sertifikatın verilmə tarixi", type: "date" },
              ]}
              initialRows={[]}
            />
          </TabsContent>

          <TabsContent value="docs" className="mt-6">
            <CrudSection
              title="Sənədlər"
              fileColumn
              hideDetails
              columns={[
                { key: "type", label: "Sənəd növü" },
                { key: "series", label: "Seriya və nömrəsi" },
                { key: "issuer", label: "Sənədi verən orqan" },
                { key: "issued", label: "Verilmə tarixi" },
                { key: "valid", label: "Etibarlılıq tarixi" },
                { key: "status", label: "Status" },
              ]}
              fields={[
                { key: "type", label: "Sənəd növü", type: "select", options: ["Şəxsiyyət vəsiqəsi", "Xarici passport", "Sürücülük vəsiqəsi", "Doğum haqqında şəhadətnamə", "CV", "Tərcümeyi hal", "Arayış"] },
                { key: "series", label: "Seriya və nömrəsi", type: "text" },
                { key: "issuer", label: "Sənədi verən orqan", type: "select", options: ["ASAN", "DİN", "DMX", "Nazirlik", "Digər"] },
                { key: "issued", label: "Verilmə tarixi", type: "date" },
                { key: "valid", label: "Etibarlılıq tarixi", type: "date" },
                { key: "status", label: "Status", type: "select", options: ["Etibarlı", "Vaxtı bitib", "Yenilənməli"] },
              ]}
              initialRows={[]}
            />
          </TabsContent>

          <TabsContent value="relatives" className="mt-6">
            <CrudSection
              title="Qohumluq əlaqələri"
              hideDetails
              columns={[
                { key: "type", label: "Qohumluq növü" },
                { key: "name", label: "Ad" },
                { key: "surname", label: "Soyad" },
                { key: "father", label: "Ata adı" },
                { key: "dob", label: "Doğum tarixi" },
                { key: "address", label: "Qeydiyyat ünvanı" },
                { key: "work", label: "İş yeri" },
              ]}
              fields={[
                { key: "type", label: "Qohumluq növü", type: "select", options: ["Ata", "Ana", "Bacı", "Qardaş", "Əmioğlu", "Həyat yoldaşı", "Övlad"] },
                { key: "name", label: "Ad", type: "text" },
                { key: "surname", label: "Soyad", type: "text" },
                { key: "father", label: "Ata adı", type: "text" },
                { key: "dob", label: "Doğum tarixi", type: "date" },
                { key: "address", label: "Qeydiyyat ünvanı", type: "text" },
                { key: "work", label: "İş yeri", type: "textarea" },
                { key: "note", label: "Qeyd", type: "textarea" },
              ]}
              initialRows={[]}
            />
          </TabsContent>

          <TabsContent value="military" className="mt-6">
            <MilitarySection />
          </TabsContent>

          <TabsContent value="contracts" className="mt-6 space-y-6">
            <ReadOnlyTable
              title="Müqavilələr"
              columns={[
                { key: "baseDate", label: "Əsas müqavilənin tarixi" },
                { key: "signDate", label: "Bağlanma tarixi" },
                { key: "duration", label: "Müqavilənin müddəti" },
                { key: "endDate", label: "Bitmə tarixi" },
                { key: "status", label: "Status" },
              ]}
              rows={[]}
              actions={["view", "details"]}
            />
            <ReadOnlyTable
              title="Vəzifə dəyişiklikləri"
              columns={[
                { key: "dept", label: "Struktur bölmə" },
                { key: "position", label: "Vəzifə" },
                { key: "startDate", label: "Vəzifəyə başlama tarixi" },
                { key: "status", label: "Status" },
                { key: "endDate", label: "Xitam tarixi" },
              ]}
              rows={[]}
            />
          </TabsContent>

          <TabsContent value="leave" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Məzuniyyət və Ezamiyyətlər</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Bu bölmənin detalları hazırlanır.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  );
}

function ReadOnlyTable({
  title,
  columns,
  rows,
  actions,
}: {
  title: string;
  columns: { key: string; label: string }[];
  rows: Row[];
  actions?: ("view" | "details")[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="text-right">Əməliyyatlar</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions?.length ? 1 : 0)} className="text-center text-sm text-muted-foreground">
                    Məlumat yoxdur
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.__id}>
                    {columns.map((c) => (
                      <TableCell key={c.key}>
                        {c.key === "status" && r[c.key] ? (
                          <Badge variant="secondary">{r[c.key]}</Badge>
                        ) : (
                          r[c.key] || "—"
                        )}
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {actions.includes("view") && (
                            <Button size="sm" variant="outline">
                              <FileText className="mr-1 h-4 w-4" /> View contract
                            </Button>
                          )}
                          {actions.includes("details") && (
                            <Button size="icon" variant="ghost" title="Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function MilitarySection() {
  const [m, setM] = useState({
    obligation: "",
    type: "",
    startDate: "",
    endDate: "",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Hərbi xidmət məlumatları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <EditableField label="Hərbi mükəlləfiyyəti" type="select" options={["Bəli", "Xeyr"]} value={m.obligation} onChange={(v) => setM((s) => ({ ...s, obligation: v }))} />
          <EditableField label="Hərbi tipi" type="select" options={["Çağırışçı", "Hərbi qulluqçu", "Hərbi vəzifəli", "Hərbi vəzifəli olmayan"]} value={m.type} onChange={(v) => setM((s) => ({ ...s, type: v }))} />
          <EditableField label="Hərbi xidmətə başlama tarixi" type="date" value={m.startDate} onChange={(v) => setM((s) => ({ ...s, startDate: v }))} />
          <EditableField label="Hərbi xidməti bitirmə tarixi" type="date" value={m.endDate} onChange={(v) => setM((s) => ({ ...s, endDate: v }))} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Əməkdaş məlumatları" },
    { n: 2, label: "Onboarding şablonu" },
  ];
  return (
    <div className="flex items-center gap-4">
      {steps.map((s, idx) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium ${
                done ? "border-primary bg-primary text-primary-foreground"
                  : active ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : s.n}
            </div>
            <span className={`text-sm ${active || done ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
            {idx < steps.length - 1 && <div className="mx-2 h-px w-8 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function OnboardingStep({
  employee,
}: {
  employee: { ad: string; soyad: string; ataAdi: string; struktur: string; vezife: string; fullName: string };
}) {
  const navigate = useNavigate();
  const create = useStore((s) => s.create);
  const [template, setTemplate] = useState<OnboardingTemplate>(ONBOARDING_TEMPLATES[0]);
  const templateTasks = useMemo(() => ONBOARDING_TEMPLATE_TASKS[template] ?? [], [template]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(templateTasks.map((t) => [t.id, true])),
  );
  const [customTasks, setCustomTasks] = useState<OnboardingTask[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<OnboardingTask>>({ title: "", assigned: USERS[0], priority: "Medium", group: TASK_OWNERS[0], dueDate: "", description: "" });

  // Reset selection when template changes
  const switchTemplate = (t: OnboardingTemplate) => {
    setTemplate(t);
    const tasks = ONBOARDING_TEMPLATE_TASKS[t] ?? [];
    setSelectedIds(Object.fromEntries(tasks.map((task) => [task.id, true])));
    setCustomTasks([]);
  };

  const allTasks = [...templateTasks, ...customTasks];
  const allSelected = allTasks.length > 0 && allTasks.every((t) => selectedIds[t.id]);
  const toggleAll = (v: boolean) =>
    setSelectedIds(Object.fromEntries(allTasks.map((t) => [t.id, v])));

  const addCustom = () => {
    if (!draft.title) return;
    const t: OnboardingTask = {
      id: `TASK-${Date.now()}`,
      title: draft.title!,
      assigned: draft.assigned || USERS[0],
      priority: (draft.priority as any) || "Medium",
      group: draft.group || TASK_OWNERS[0],
      description: draft.description || "",
      dueDate: draft.dueDate || "",
    };
    setCustomTasks((c) => [...c, t]);
    setSelectedIds((s) => ({ ...s, [t.id]: true }));
    setDraft({ title: "", assigned: USERS[0], priority: "Medium", group: TASK_OWNERS[0], dueDate: "", description: "" });
    setAddOpen(false);
  };

  const save = () => {
    const chosen = allTasks.filter((t) => selectedIds[t.id]);
    const item = create("onboarding", {
      title: employee.fullName,
      status: "Not started",
      assigned: USERS[0],
      data: {
        employeeName: employee.fullName,
        firstName: employee.ad,
        lastName: employee.soyad,
        department: employee.struktur,
        position: employee.vezife,
        hireDate: new Date().toISOString(),
        template,
        tasks: chosen,
      },
    } as any);
    toast.success("Onboarding prosesi yaradıldı");
    navigate({ to: "/onboarding/$id", params: { id: item.id } });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onboarding şablonu seçin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {ONBOARDING_TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTemplate(t)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  template === t ? "border-primary bg-primary/5" : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t}</span>
                  {template === t && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(ONBOARDING_TEMPLATE_TASKS[t] ?? []).length} default tapşırıq
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Tapşırıqlar</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Yeni tapşırıq
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(!!v)} />
                </TableHead>
                <TableHead>Tapşırıq</TableHead>
                <TableHead className="w-[160px]">Owner</TableHead>
                <TableHead className="w-[160px]">Məsul şəxs</TableHead>
                <TableHead className="w-[110px]">Prioritet</TableHead>
                <TableHead className="w-[140px]">Due date</TableHead>
                <TableHead className="min-w-[220px]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Bu şablon üçün tapşırıq yoxdur. Yeni əlavə edin.
                  </TableCell>
                </TableRow>
              )}
              {allTasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Checkbox
                      checked={!!selectedIds[t.id]}
                      onCheckedChange={(v) => setSelectedIds((s) => ({ ...s, [t.id]: !!v }))}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-sm">{t.group || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.assigned}</TableCell>
                  <TableCell className="text-sm">{t.priority}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.dueDate || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.description || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate({ to: "/candidates" })}>Ləğv et</Button>
        <Button onClick={save}>Yadda saxla</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni tapşırıq</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tapşırıq adı</Label>
              <Input value={draft.title ?? ""} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Owner</Label>
                <Select value={draft.group} onValueChange={(v) => setDraft((d) => ({ ...d, group: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_OWNERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Məsul şəxs</Label>
                <Select value={draft.assigned} onValueChange={(v) => setDraft((d) => ({ ...d, assigned: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {USERS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioritet</Label>
                <Select value={draft.priority as string} onValueChange={(v) => setDraft((d) => ({ ...d, priority: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due date</Label>
                <Input type="date" value={draft.dueDate ?? ""} onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={draft.description ?? ""} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Ləğv et</Button>
            <Button onClick={addCustom}>Əlavə et</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
