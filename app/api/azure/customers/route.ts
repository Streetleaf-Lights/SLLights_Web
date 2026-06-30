import { NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";

export async function GET() {
  try {
    const data = await azurePost(apimUrl("/GetCustomers2"), {}) as { value?: any[] } | any[];
    const customers = Array.isArray(data) ? data : (data as { value?: any[] }).value ?? [];
    return NextResponse.json(customers, { status: 200 });
  } catch (e) {
    console.error("GET /api/azure/customers error:", e);
    return NextResponse.json([], { status: 500 });
  }
}