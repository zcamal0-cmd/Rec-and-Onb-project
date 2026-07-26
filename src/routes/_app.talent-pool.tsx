import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_app/talent-pool")({
  head: () => ({ meta: [{ title: "Talent Pool — Talento" }] }),
  component: TalentPool,
});

function TalentPool() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Talent Pool</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Coming soon — a curated pool of past applicants and sourced candidates you can re-engage
          for new roles.
        </p>
      </div>
    </div>
  );
}
