/**
 * app/customers/[customerId]/projects/[projectId]/page.tsx
 * Project detail page — shows customer name, project name, and fixed light stats.
 */

import { getCustomers } from "@/lib/customers";
import ProjectDetail from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ProjectPage({
  params,
}: {
  params: { customerId: string; projectId: string };
}) {
  const customers = await getCustomers();
  const customer = customers.find((c) => c.id === params.customerId);
  if (!customer) notFound();

  const project = customer.projects.find((p) => p.id === params.projectId);
  if (!project) notFound();

  return (
      <Suspense fallback="Loading...">
        <ProjectDetail customer={customer} project={project} />
      </Suspense>
    );
}
