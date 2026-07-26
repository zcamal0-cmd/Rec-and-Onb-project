import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function hue(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export function UserAvatar({ name, size = 24 }: { name?: string; size?: number }) {
  if (!name) return null;
  const h = hue(name);
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full font-medium text-white")}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `oklch(0.55 0.13 ${h})`,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export function UserChip({ name }: { name?: string }) {
  if (!name) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <UserAvatar name={name} size={20} />
      <span className="text-sm">{name}</span>
    </span>
  );
}
