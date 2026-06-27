import { NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";

export async function GET() {
  try {
    const data = await azurePost(apimUrl("/GetUsers"), {}, { cache: "no-store" });
    return NextResponse.json(data);
  } catch (e) {
    console.error("users route error:", e);
    return NextResponse.json([], { status: 500 });
  }
}