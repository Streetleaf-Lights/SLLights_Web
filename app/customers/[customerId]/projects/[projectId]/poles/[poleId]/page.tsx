import { getCustomers } from "@/lib/customers";
import PoleDetailClient from "@/components/PoleDetailClient";
import { notFound } from "next/navigation";

export default async function PolePage({
  params,
}: {
  params: { customerId: string; projectId: string; poleId: string };
}) {
  const customers = await getCustomers();
  const customer = customers.find((c) => c.id === params.customerId);
  if (!customer) notFound();

  const project = customer.projects.find((p) => p.id === params.projectId);
  if (!project) notFound();

  if (!["pole-1", "pole-2"].includes(params.poleId)) notFound();

  const poleNumber = params.poleId === "pole-1" ? 1 : 2;

  return (
    <PoleDetailClient
      customer={customer}
      project={project}
      poleId={params.poleId}
      poleName={`Pole ${poleNumber}`}
    />
  );
}
