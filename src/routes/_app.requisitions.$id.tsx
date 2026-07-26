import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/detail-page";

export const Route = createFileRoute("/_app/requisitions/$id")({
  component: RequisitionDetail,
});

function RequisitionDetail() {
  const { id } = Route.useParams();
  return <DetailPage section="requisitions" id={id} />;
}
