import { createFileRoute } from "@tanstack/react-router";
import { SectionListPage } from "@/components/section-list-page";

export const Route = createFileRoute("/_app/requisitions/")({
  head: () => ({ meta: [{ title: "Job Requisitions — Talento" }] }),
  component: () => <SectionListPage section="requisitions" />,
});
