import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/detail-page";

export const Route = createFileRoute("/_app/interviews/$id")({
  component: InterviewDetail,
});

function InterviewDetail() {
  const { id } = Route.useParams();
  return <DetailPage section="interviews" id={id} />;
}
