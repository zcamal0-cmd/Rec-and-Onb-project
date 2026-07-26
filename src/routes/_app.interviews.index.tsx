import { createFileRoute } from "@tanstack/react-router";
import { SectionListPage } from "@/components/section-list-page";

export const Route = createFileRoute("/_app/interviews/")({
  head: () => ({ meta: [{ title: "Interviews — Talento" }] }),
  component: () => <SectionListPage section="interviews" />,
});
