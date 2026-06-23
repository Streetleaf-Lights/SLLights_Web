import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers"; // or wherever apimUrl lives

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }
  const data = await azurePost(apimUrl("/GetProjectData"), { projectId });
  return NextResponse.json(data);
}
