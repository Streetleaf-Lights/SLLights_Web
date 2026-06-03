/**
 * lib/customers.ts
 * Server-side data fetching for customers via Azure APIM.
 *
 * Expected APIM endpoints:
 *   POST /customers         body: { name: string } → { value: Customer[] } | Customer[]
 *   GET  /customers/{id}    → Customer
 */

import { azureFetch, azurePost } from "./azure-auth";
import type { Customer } from "./types";

const BASE = process.env.AZURE_APIM_BASE_URL ?? "";

function apimUrl(path: string) {
  return `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const data = await azurePost(apimUrl("/GetCustomers2"), { name: "Blynk" }) as { value?: Customer[] } | Customer[];
    // Handle both { value: [] } envelope and bare array responses
    if (Array.isArray(data)) return data;
    return (data as { value?: Customer[] }).value ?? [];
  } catch (e) {
    console.error("getCustomers error:", e);
    return [];
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    return await azureFetch(apimUrl(`/customers/${id}`)) as Customer;
  } catch (e) {
    console.error(`getCustomer(${id}) error:`, e);
    return null;
  }
}
