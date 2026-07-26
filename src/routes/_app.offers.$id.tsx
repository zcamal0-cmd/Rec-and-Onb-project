import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/detail-page";

export const Route = createFileRoute("/_app/offers/$id")({
  component: OfferDetail,
});

function OfferDetail() {
  const { id } = Route.useParams();
  return <DetailPage section="offers" id={id} />;
}
