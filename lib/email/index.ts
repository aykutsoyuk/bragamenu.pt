// Public surface of the email module.
export { isEmailConfigured, type SendResult } from "./resend";
export { sendReservationRequest } from "./sendReservationRequest";
export { sendConfirmationEmail } from "./sendConfirmationEmail";
export { sendRejectionEmail } from "./sendRejectionEmail";
export { sendManualReviewRequest } from "./sendManualReviewRequest";
export { sendCallbackRequest } from "./sendCallbackRequest";
export { sendSlaTimeoutNotice } from "./sendSlaTimeoutNotice";
