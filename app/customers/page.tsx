/**
 * app/customers/page.tsx
 * Customer list — server component.
 */

import { Suspense } from "react";
import { getCustomers } from "@/lib/customers";
import CustomerSearch from "@/components/CustomerSearch";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
  // const session = await getSession();
  // if (!session) redirect("/signin");
  const customers = await getCustomers();
  return (
    <Suspense fallback="Loading...">
      <CustomerSearch customers={customers} />
    </Suspense>
  );
}
