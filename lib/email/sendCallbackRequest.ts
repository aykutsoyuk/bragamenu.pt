import type { RestaurantConfig } from "@/types/reservation";
import type { CallbackInput } from "@/lib/reservations/validation";
import { sendEmail, type SendResult } from "./resend";
import { callbackTemplate } from "./templates";

/**
 * Fail-safe path: when the reservation system can't reach Sheets, the customer
 * leaves their details and we email the restaurant directly. Email is the record
 * of the request (the sheet is unreachable). Sent in the restaurant's language.
 */
export async function sendCallbackRequest(
  details: CallbackInput,
  config: RestaurantConfig,
): Promise<SendResult> {
  const template = callbackTemplate(details, config, config.restaurant_language);
  return sendEmail({
    to: config.notification_email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: details.email,
  });
}
