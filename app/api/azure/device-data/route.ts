import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";

export async function POST(req: NextRequest) {
  const { deviceId } = await req.json();
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }
  const data = await azurePost(apimUrl("/GetDeviceData"), { deviceId });
  return NextResponse.json(data);
}
