import { NextRequest, NextResponse } from "next/server";
import { azurePost } from "@/lib/azure-auth";
import { apimUrl } from "@/lib/customers";
import { randomUUID } from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@yourdomain.com";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://yourdomain.com";

export async function POST(req: NextRequest) {
  const { name, email, role, customerId, customerName } = await req.json();
  const newId = randomUUID();

  if (!name || !email || !role) {
    return NextResponse.json({ error: "Name, Email, and Role are required." }, { status: 400 });
  }

  try {
    await azurePost(apimUrl("/PostUser"), {
      id: newId,
      Name: name,
      Email: email,
      Role: role,
      CustomerId: customerId ?? null,
      CustomerName: customerName ?? null,
    });
  } catch (e: any) {
    const message = e?.message ?? "";
    if (message.includes("A user with this email already exists.")) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }

  // User created — send registration email (non-blocking)
  const registrationLink = `${BASE_URL}/register?token=${newId}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You've been invited to Streetleaf Lights",
      html: buildInviteEmail(name, registrationLink),
    });
  } catch (e) {
    // Log but don't fail the request — user is already created
    console.error("Failed to send invitation email:", e);
  }

  return NextResponse.json({ id: newId }, { status: 201 });
}

function buildInviteEmail(name: string, link: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Roboto Slab',Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:#00b1ae;padding:32px 40px;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                      Streetleaf Lights
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 16px;font-size:16px;color:#333333;">
                      Hi ${name},
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
                      You've been invited to the Streetleaf Lights customer portal.
                      Click the button below to complete your registration and set up your account.
                    </p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                      <tr>
                        <td style="background:#00b1ae;border-radius:6px;">
                          <a href="${link}"
                            style="display:inline-block;padding:14px 32px;font-size:15px;
                                   font-weight:600;color:#ffffff;text-decoration:none;
                                   letter-spacing:0.3px;">
                            Complete Registration
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;font-size:13px;color:#888888;">
                      Or copy this link into your browser:
                    </p>
                    <p style="margin:0;font-size:12px;color:#aaaaaa;word-break:break-all;">
                      ${link}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #eeeeee;">
                    <p style="margin:0;font-size:12px;color:#aaaaaa;">
                      If you weren't expecting this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}