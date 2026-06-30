import { NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import { getSession } from "@/lib/auth";
import { UserRole } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    let data;
    if (session?.role === UserRole.CustomerAdmin && session?.customerId) {
      data = await azurePost(apimUrl("/GetUsersByCustomer"), { customerId: session.customerId }, { cache: "no-store" });
    } else {
      console.log("fetching all users, role:", session?.role);
      data = await azurePost(apimUrl("/GetUsers"), {}, { cache: "no-store" });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("users route error:", e);
    return NextResponse.json([], { status: 500 });
  }
}