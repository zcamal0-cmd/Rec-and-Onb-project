import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/detail-page";

export const Route = createFileRoute("/_app/candidates/$id")({
  component: CandidateDetail,
});

function CandidateDetail() {
  const { id } = Route.useParams();
  return <DetailPage section="candidates" id={id} />;
}
