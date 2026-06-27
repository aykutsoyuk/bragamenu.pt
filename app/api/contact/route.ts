import { NextResponse, type NextRequest } from "next/server";
import { sendEmail } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  let body: { name?: unknown; email?: unknown; restaurant?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const restaurant = typeof body.restaurant === "string" ? body.restaurant.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL ?? "aykutsoyuk@gmail.com";

  const html = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${restaurant ? `<p><strong>Restaurant:</strong> ${restaurant}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${message}</p>
  `;

  await sendEmail({
    to,
    subject: `MenuQR contact: ${name}${restaurant ? ` — ${restaurant}` : ""}`,
    html,
    replyTo: email,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
