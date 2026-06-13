import type { RestaurantConfig } from "@/types/reservation";
import type { ManualReviewInput } from "@/lib/reservations/validation";
import { sendEmail, type SendResult } from "./resend";
import { manualReviewTemplate } from "./templates";

/**
 * Notifies the restaurant of a party that couldn't be auto-assigned a table but
 * fits within total capacity — the owner decides whether tables can be combined.
 * Sent in the restaurant's configured language; Reply-To is the guest.
 */
export async function sendManualReviewRequest(
  details: ManualReviewInput,
  config: RestaurantConfig,
): Promise<SendResult> {
  const template = manualReviewTemplate(details, config, config.restaurant_language);
  return sendEmail({
    to: config.notification_email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: details.email,
  });
}
