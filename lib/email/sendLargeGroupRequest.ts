import type { RestaurantConfig } from "@/types/reservation";
import type { LargeGroupInput } from "@/lib/reservations/validation";
import { sendEmail, type SendResult } from "./resend";
import { largeGroupRequestTemplate } from "./templates";

/**
 * Notifies the restaurant of a large-group enquiry that couldn't be auto-booked.
 * Reply-To is set to the guest so the restaurant can respond directly.
 */
export async function sendLargeGroupRequest(
  details: LargeGroupInput,
  config: RestaurantConfig,
): Promise<SendResult> {
  const template = largeGroupRequestTemplate(details, config);
  return sendEmail({
    to: config.notification_email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo: details.email,
  });
}
