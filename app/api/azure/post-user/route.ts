import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";

export async function POST(req: NextRequest) {
  const { name, email, role, customerId, customerName } = await req.json();

  if (!name || !email || !role) {
    return NextResponse.json({ error: "Name, Email, and Role are required." }, { status: 400 });
  }

  try {
    const data = await azurePost(apimUrl("/PostUser"), { Name: name, Email: email, Role: role, CustomerId: customerId ?? null, CustomerName: customerName ?? null });
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    const message = e?.message ?? "";
    if (message.includes("A user with this email already exists.")) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
