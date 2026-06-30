import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { query, pageNumber = 1, pageSize = 20 } = await req.json();

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ results: [], totalRecords: 0 }, { status: 200 });
  }

  const session = await getSession();
  const customerId = session?.role === "Customer Admin" ? session.customerId : null;

  try {
    const data = await azurePost(apimUrl("/SearchPoles"), { query: query.trim(), customerId, pageNumber, pageSize }, { cache: "no-store" });
    return NextResponse.json(data);
  } catch (e) {
    console.error("poles-search error:", e);
    return NextResponse.json({ results: [], totalRecords: 0 }, { status: 500 });
  }
}