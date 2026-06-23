import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import { Customer } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { customerId } = await req.json();
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }
  const data = await azurePost(apimUrl("/GetCustomerData"), { customerId });

    // console.log("getCustomers data:", (data as Customer[])[0]?.projects[0]);
  return NextResponse.json(data);
}
