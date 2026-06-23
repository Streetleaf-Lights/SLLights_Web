import { getCustomers } from "@/lib/customers";
import PoleDetail from "@/components/PoleDetail";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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

    return (
        <Suspense fallback="Loading...">
          <PoleDetail
            customer={customer}
            project={project}
            poleId={params.poleId}
          />
        </Suspense>
      );
}
