import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectList from "@/components/ProjectList";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (session.role !== "Customer Admin") redirect("/customers");
  return (
    <Suspense>
      <ProjectList customerId={session.customerId} />
    </Suspense>
  );
}