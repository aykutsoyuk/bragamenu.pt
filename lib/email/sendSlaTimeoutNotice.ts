import type { Reservation, RestaurantConfig } from "@/types/reservation";
import { sendEmail, type SendResult } from "./resend";
import { slaTimeoutTemplate } from "./templates";

/**
 * Tells the customer the restaurant hasn't yet responded to their pending
 * request, with the restaurant's contact details so they can follow up directly.
 * Sent in the language the customer used when booking.
 */
export async function sendSlaTimeoutNotice(
  reservation: Reservation,
  config: RestaurantConfig,
): Promise<SendResult> {
  const template = slaTimeoutTemplate(reservation, config, reservation.customer_language);
  return sendEmail({
    to: reservation.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
