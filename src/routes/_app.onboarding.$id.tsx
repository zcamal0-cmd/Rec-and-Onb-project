import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/detail-page";

export const Route = createFileRoute("/_app/onboarding/$id")({
  component: OnboardingDetail,
});

function OnboardingDetail() {
  const { id } = Route.useParams();
  return <DetailPage section="onboarding" id={id} />;
}
