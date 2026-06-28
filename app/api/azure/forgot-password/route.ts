import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import { Resend } from "resend";
import { randomUUID } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourdomain.com";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

  // Save token — silent fail if email doesn't exist (SP handles it silently)
  try {
    await azurePost(apimUrl("/ForgotPassword"), { email, token, expiresAt });
  } catch (e) {
    console.error("ForgotPassword APIM error:", e);
    // Still return success to avoid revealing if email exists
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const resetLink = `${BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Reset your Streetleaf Lights password",
      html: buildResetEmail(resetLink),
    });
  } catch (e) {
    console.error("Failed to send reset email:", e);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

function buildResetEmail(link: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Roboto Slab',Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:#00b1ae;padding:32px 40px;">
                  <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Streetleaf Lights</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 16px;font-size:16px;color:#333333;">Password Reset Request</p>
                  <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
                    Click the button below to reset your password. This link expires in 1 hour.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                    <tr>
                      <td style="background:#00b1ae;border-radius:6px;">
                        <a href="${link}"
                          style="display:inline-block;padding:14px 32px;font-size:15px;
                                 font-weight:600;color:#ffffff;text-decoration:none;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 8px;font-size:13px;color:#888888;">Or copy this link:</p>
                  <p style="margin:0;font-size:12px;color:#aaaaaa;word-break:break-all;">${link}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #eeeeee;">
                  <p style="margin:0;font-size:12px;color:#aaaaaa;">
                    If you didn't request a password reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `;
}