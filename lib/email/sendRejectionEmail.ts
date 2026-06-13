import type { Reservation, RestaurantConfig } from "@/types/reservation";
import { sendEmail, type SendResult } from "./resend";
import { rejectedTemplate } from "./templates";

/** Sends the customer a friendly note that their request could not be accommodated. */
export async function sendRejectionEmail(
  reservation: Reservation,
  config: RestaurantConfig,
): Promise<SendResult> {
  const template = rejectedTemplate(reservation, config, reservation.customer_language);
  return sendEmail({
    to: reservation.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
