/**
 * app/customers/page.tsx
 * Customer list — server component.
 */

import { Suspense } from "react";
import { getCustomers } from "@/lib/customers";
import CustomerSearch from "@/components/CustomerSearch";

export default async function CustomersPage() {
  const customers = await getCustomers();
  return (
    <Suspense fallback="Loading...">
      <CustomerSearch customers={customers} />
    </Suspense>
  );
}
