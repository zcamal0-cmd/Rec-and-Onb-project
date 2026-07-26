import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/detail-page";

export const Route = createFileRoute("/_app/vacancies/$id")({
  component: VacancyDetail,
});

function VacancyDetail() {
  const { id } = Route.useParams();
  return <DetailPage section="vacancies" id={id} />;
}
