/**
 * app/customers/[customerId]/page.tsx
 * Individual customer detail page — server component.
 */

import { getCustomers } from "@/lib/customers";
import { notFound } from "next/navigation";
import CustomerDetail from "@/components/CustomerDetail";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";

export async function generateStaticParams() {
  const customers = await getCustomers();
  return customers.map((c) => ({ customerId: c.id }));
}

export default async function CustomerPage({ params }: { params: { customerId: string } }) {
  const session = await getSession();
  const customers = await getCustomers();
  const customer = customers.find((c) => c.id === params.customerId) ?? null;
  if (!customer) notFound();
  return (
    <Suspense fallback="Loading...">
      <CustomerDetail customer={customer} sessionRole={session?.role ?? ""} />
    </Suspense>
  );
}
