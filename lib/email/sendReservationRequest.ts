import type { Reservation, RestaurantConfig } from "@/types/reservation";
import { createActionToken } from "@/lib/reservations/token";
import { sendEmail, type SendResult } from "./resend";
import { newRequestTemplate } from "./templates";

/**
 * Notifies the restaurant of a new pending reservation, embedding signed
 * Confirm / Reject action links rooted at `baseUrl` (the deployment origin).
 */
export async function sendReservationRequest(
  reservation: Reservation,
  config: RestaurantConfig,
  baseUrl: string,
): Promise<SendResult> {
  const actionUrl = (action: "confirmed" | "rejected") => {
    const token = createActionToken(reservation.reservation_id, action);
    const params = new URLSearchParams({
      id: reservation.reservation_id,
      action,
      token,
    });
    return `${baseUrl}/api/reservations/action?${params.toString()}`;
  };

  const template = newRequestTemplate(
    reservation,
    config,
    actionUrl("confirmed"),
    actionUrl("rejected"),
  );

  return sendEmail({
    to: config.notification_email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: reservation.email,
  });
}
