// Public surface of the Google Sheets data layer.
export { isSheetsConfigured } from "./auth";
export {
  fetchSheet,
  fetchRestaurantConfig,
  fetchTables,
  fetchOpeningHours,
  fetchReservations,
  fallbackRestaurantConfig,
  fallbackPhone,
  type ReservationRow,
} from "./fetchSheet";
export { appendReservation } from "./appendReservation";
export {
  updateReservationStatus,
  type UpdateResult,
} from "./updateReservationStatus";
