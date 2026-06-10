// Minimal Resend client over the REST API — no SDK dependency. Sending is a
// no-op (logged) when RESEND_API_KEY is unset so local development never fails
// on missing email credentials.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  /** Optional plain-text fallback. */
  text?: string;
  /** Optional Reply-To, e.g. the customer's address on the restaurant notification. */
  replyTo?: string;
}

export interface SendResult {
  sent: boolean;
  id?: string;
  error?: string;
}

function fromAddress(): string {
  return (
    process.env.RESERVATION_FROM_EMAIL ||
    "Reservations <onboarding@resend.dev>"
  );
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    // Surface intent in dev without failing the request.
    console.warn(`[email] RESEND_API_KEY unset — skipped "${message.subject}" to ${message.to}`);
    return { sent: false, error: "not_configured" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [message.to],
        subject: message.subject,
        html: message.html,
        ...(message.text ? { text: message.text } : {}),
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Resend failed (${res.status}): ${detail}`);
      return { sent: false, error: `resend_${res.status}` };
    }

    const json = (await res.json()) as { id?: string };
    return { sent: true, id: json.id };
  } catch (err) {
    console.error("[email] Resend request threw:", err);
    return { sent: false, error: "network" };
  }
}
