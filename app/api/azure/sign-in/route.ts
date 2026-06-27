import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import { createSession } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  let user: any;
  try {
    user = await azurePost(apimUrl("/SignInUser"), { email });
    // console.log("SignInUser response:", user);
  } catch (e: any) {
    const message = e?.message ?? "";
    if (message.includes("User not found.")) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Account registration is not complete." }, { status: 403 });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession({
    id:    user.id,
    name:  user.name,
    email: user.email,
    role:  user.role,
  });

  return NextResponse.json({ success: true }, { status: 200 });
}