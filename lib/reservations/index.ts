// Public surface of the deterministic reservation engine.
export { assignTable } from "./assignTable";
export {
  loadAvailabilityContext,
  maxTableCapacity,
  occupiedTableIdsAt,
  type AvailabilityContext,
} from "./getAvailableTables";
export {
  validateReservationInput,
  validateLargeGroupInput,
  type LargeGroupInput,
  type ValidationResult,
} from "./validation";
export {
  getAvailableSlots,
  computeSlots,
  type SlotsResult,
} from "./getAvailableSlots";
export {
  createReservation,
  type CreateReservationResult,
} from "./createReservation";
export {
  createActionToken,
  verifyActionToken,
  type ReservationAction,
} from "./token";
export {
  BOOKING_WINDOW_DAYS,
  MAX_PARTY_SIZE,
  RESTAURANT_TIMEZONE,
} from "./constants";
export { addDays, isValidDate, nowInRestaurant } from "./time";
