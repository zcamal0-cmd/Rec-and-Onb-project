import { createFileRoute } from "@tanstack/react-router";
import { SectionListPage } from "@/components/section-list-page";

export const Route = createFileRoute("/_app/vacancies/")({
  head: () => ({ meta: [{ title: "Vacancies — Talento" }] }),
  component: () => <SectionListPage section="vacancies" />,
});
