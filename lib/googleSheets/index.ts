// Public surface of the Google Sheets data layer.
export { isSheetsConfigured, type SheetCtx } from "./auth";
export {
  fetchSheet,
  fetchRestaurantConfig,
  fetchTables,
  fetchOpeningHours,
  fetchReservations,
  fallbackRestaurantConfig,
  fallbackPhone,
  SHEET_TABS,
  columnLetter,
  fetchReservationHeaders,
  type ReservationRow,
} from "./fetchSheet";
export { appendReservation } from "./appendReservation";
export {
  updateReservationStatus,
  type UpdateResult,
} from "./updateReservationStatus";
export {
  updateReservation,
  type ReservationPatch,
  type UpdateReservationResult,
} from "./updateReservation";
