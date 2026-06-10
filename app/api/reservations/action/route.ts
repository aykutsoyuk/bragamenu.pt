import { type NextRequest } from "next/server";
import { fetchRestaurantConfig, updateReservationStatus } from "@/lib/googleSheets";
import { sendConfirmationEmail, sendRejectionEmail } from "@/lib/email";
import { verifyActionToken, type ReservationAction } from "@/lib/reservations";

// GET /api/reservations/action?id=...&action=confirmed|rejected&token=...
// Invoked by the restaurant from the notification email. Verifies the signed
// token, flips the reservation status, and emails the customer. Renders a small
// HTML page so the restaurateur gets visible feedback in their browser.

function isAction(value: string): value is ReservationAction {
  return value === "confirmed" || value === "rejected";
}

function page(title: string, message: string, tone: "ok" | "warn" | "error"): Response {
  const accent =
    tone === "ok" ? "#2f7d4f" : tone === "warn" ? "#b8862f" : "#9c3b34";
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c0a08;font-family:Helvetica,Arial,sans-serif;color:#f4f4f4;">
    <div style="max-width:420px;margin:24px;padding:36px 28px;background:#16130f;border:1px solid #8d724c;border-radius:20px;text-align:center;">
      <div style="width:56px;height:56px;margin:0 auto 18px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;font-size:28px;">●</div>
      <h1 style="margin:0 0 10px;font-size:21px;font-weight:500;">${title}</h1>
      <p style="margin:0;color:#cac2af;font-size:15px;line-height:1.6;">${message}</p>
    </div>
  </body>
</html>`;
  const status = tone === "error" ? 400 : 200;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = params.get("id") ?? "";
  const action = params.get("action") ?? "";
  const token = params.get("token") ?? "";

  if (!id || !isAction(action) || !token) {
    return page("Invalid link", "This action link is malformed or incomplete.", "error");
  }

  if (!verifyActionToken(id, action, token)) {
    return page(
      "Link not valid",
      "This link could not be verified. Please use the buttons from the original email.",
      "error",
    );
  }

  let result;
  try {
    result = await updateReservationStatus(id, action);
  } catch (err) {
    console.error("[action] update failed:", err);
    return page(
      "Something went wrong",
      "We couldn't update this reservation. Please try again shortly.",
      "error",
    );
  }

  if (!result) {
    return page("Reservation not found", "This reservation no longer exists.", "error");
  }

  const { reservation, changed } = result;
  const confirmed = action === "confirmed";

  if (!changed) {
    return page(
      confirmed ? "Already confirmed" : "Already rejected",
      `This reservation for ${reservation.name} was already ${action}. No further action is needed.`,
      "warn",
    );
  }

  // Status changed → notify the customer (best-effort).
  try {
    const config = await fetchRestaurantConfig();
    if (confirmed) {
      await sendConfirmationEmail(reservation, config);
    } else {
      await sendRejectionEmail(reservation, config);
    }
  } catch (err) {
    console.error("[action] customer email failed:", err);
  }

  return page(
    confirmed ? "Reservation confirmed" : "Reservation rejected",
    confirmed
      ? `${reservation.name}'s table is confirmed for ${reservation.date} at ${reservation.time}. A confirmation email has been sent.`
      : `${reservation.name}'s request has been declined. A courteous note has been sent to the guest.`,
    confirmed ? "ok" : "warn",
  );
}
