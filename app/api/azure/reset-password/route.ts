import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  const { email, token, password } = await req.json();

  if (!email || !token || !password) {
    return NextResponse.json({ error: "Email, token and password are required." }, { status: 400 });
  }

  let passwordHash: string;
  try {
    passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  } catch (e) {
    console.error("bcrypt error:", e);
    return NextResponse.json({ error: "Failed to process password." }, { status: 500 });
  }

  try {
    await azurePost(apimUrl("/ResetPassword"), { email, token, passwordHash });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    const message = e?.message ?? "";
    if (message.includes("User not found.")) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (message.includes("Invalid or expired reset link.")) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 410 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}