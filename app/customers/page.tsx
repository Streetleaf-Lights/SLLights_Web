/**
 * app/customers/page.tsx
 * Customer list — server component.
 */

import { getCustomers } from "@/lib/customers";
import CustomerListClient from "@/components/CustomerListClient";

export default async function CustomersPage() {
  const customers = await getCustomers();
  return <CustomerListClient customers={customers} />;
}
