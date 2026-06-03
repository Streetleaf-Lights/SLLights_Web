/**
 * app/customers/[customerId]/page.tsx
 * Individual customer detail page — server component.
 */

import { getCustomers } from "@/lib/customers";
import CustomerDetailClient from "@/components/CustomerDetailClient";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const customers = await getCustomers();
  return customers.map((c) => ({ customerId: c.id }));
}

export default async function CustomerPage({ params }: { params: { customerId: string } }) {
  const customers = await getCustomers();
  const customer = customers.find((c) => c.id === params.customerId) ?? null;
  if (!customer) notFound();
  return <CustomerDetailClient customer={customer} />;
}
