import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
  }

  let passwordHash: string;
  try {
    passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  } catch (e) {
    console.error("bcrypt error:", e);
    return NextResponse.json({ error: "Failed to process password." }, { status: 500 });
  }

  try {
    await azurePost(apimUrl("/RegisterUser"), { id: token, passwordHash });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("register-user raw error:", e);
    const message = e?.message ?? "";
    if (message.includes("User not found.")) {
      return NextResponse.json({ error: "Invalid registration link." }, { status: 404 });
    }
    if (message.includes("User is already registered.")) {
      return NextResponse.json({ error: "This account has already been registered." }, { status: 409 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}