import { createFileRoute } from "@tanstack/react-router";
import { SectionListPage } from "@/components/section-list-page";

export const Route = createFileRoute("/_app/offers/")({
  head: () => ({ meta: [{ title: "Job Offers — Talento" }] }),
  component: () => <SectionListPage section="offers" />,
});
