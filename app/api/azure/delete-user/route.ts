import { NextRequest, NextResponse } from "next/server";
import { azureDelete } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    const data = await azureDelete(apimUrl("/DeleteUser"), { id });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    const message = e?.message ?? "";
    if (message.includes("User not found.")) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}