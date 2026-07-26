import { createFileRoute } from "@tanstack/react-router";
import { SectionListPage } from "@/components/section-list-page";

export const Route = createFileRoute("/_app/candidates/")({
  head: () => ({ meta: [{ title: "Candidates — Talento" }] }),
  component: () => <SectionListPage section="candidates" />,
});
