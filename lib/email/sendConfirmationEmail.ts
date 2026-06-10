import type { Reservation, RestaurantConfig } from "@/types/reservation";
import { sendEmail, type SendResult } from "./resend";
import { confirmedTemplate } from "./templates";

/** Tells the customer their reservation has been confirmed by the restaurant. */
export async function sendConfirmationEmail(
  reservation: Reservation,
  config: RestaurantConfig,
): Promise<SendResult> {
  const template = confirmedTemplate(reservation, config);
  return sendEmail({
    to: reservation.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
