// Public surface of the email module.
export { isEmailConfigured, type SendResult } from "./resend";
export { sendReservationRequest } from "./sendReservationRequest";
export { sendConfirmationEmail } from "./sendConfirmationEmail";
export { sendRejectionEmail } from "./sendRejectionEmail";
export { sendLargeGroupRequest } from "./sendLargeGroupRequest";
