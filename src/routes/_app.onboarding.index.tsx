import { createFileRoute } from "@tanstack/react-router";
import { SectionListPage } from "@/components/section-list-page";

export const Route = createFileRoute("/_app/onboarding/")({
  head: () => ({
    meta: [
      { title: "Onboarding — Talento" },
      { name: "description", content: "Onboarding processes for hired employees." },
    ],
  }),
  component: () => <SectionListPage section="onboarding" />,
});
