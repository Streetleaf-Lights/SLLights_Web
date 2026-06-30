import { NextResponse } from "next/server";
import { getDevices, getDevicesByCustomer } from "@/lib/customers";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  const devices =
    session?.role === "Customer Admin" && session?.customerId
      ? await getDevicesByCustomer(session.customerId)
      : await getDevices();
  return NextResponse.json(devices);
}
