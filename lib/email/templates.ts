import type { Reservation, RestaurantConfig } from "@/types/reservation";
import type { LargeGroupInput } from "@/lib/reservations/validation";

// Email-safe HTML (inline styles, table-free simple layout) in a warm palette
// that echoes the restaurant theme. Each builder returns subject + html + text.

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const COLORS = {
  bg: "#0c0a08",
  card: "#16130f",
  text: "#f4f4f4",
  muted: "#cac2af",
  border: "#8d724c",
  accent: "#e0b478",
  confirm: "#2f7d4f",
  reject: "#9c3b34",
};

function prettyDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function shell(title: string, restaurantName: string, inner: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${COLORS.bg};font-family:Helvetica,Arial,sans-serif;color:${COLORS.text};">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.muted};margin-bottom:24px;">
        ${escapeHtml(restaurantName)}
      </div>
      <div style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:18px;padding:28px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:500;color:${COLORS.text};">${escapeHtml(title)}</h1>
        ${inner}
      </div>
      <div style="text-align:center;font-size:11px;color:${COLORS.muted};margin-top:24px;">
        ${escapeHtml(restaurantName)} · Digital reservations
      </div>
    </div>
  </body>
</html>`;
}

function detailRows(reservation: Reservation): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:${COLORS.muted};font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;text-align:right;color:${COLORS.text};font-size:15px;font-weight:500;">${escapeHtml(value)}</td>
    </tr>`;
  return `
    <table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">
      ${row("Date", prettyDate(reservation.date))}
      ${row("Time", reservation.time)}
      ${row("Guests", String(reservation.people))}
    </table>`;
}

function button(href: string, label: string, color: string): string {
  return `<a href="${escapeAttr(href)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:${color};color:#fff;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(label)}</a>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}

// --- New request → restaurant ---------------------------------------------

export function newRequestTemplate(
  reservation: Reservation,
  config: RestaurantConfig,
  confirmUrl: string,
  rejectUrl: string,
): EmailTemplate {
  const inner = `
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      A new reservation request is awaiting your approval.
    </p>
    ${detailRows(reservation)}
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">Name</td>
        <td style="padding:6px 0;text-align:right;color:${COLORS.text};font-size:14px;">${escapeHtml(reservation.name)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">Phone</td>
        <td style="padding:6px 0;text-align:right;color:${COLORS.text};font-size:14px;">${escapeHtml(reservation.phone)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">Email</td>
        <td style="padding:6px 0;text-align:right;color:${COLORS.text};font-size:14px;">${escapeHtml(reservation.email)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">Suggested table</td>
        <td style="padding:6px 0;text-align:right;color:${COLORS.accent};font-size:14px;font-weight:600;">${escapeHtml(reservation.assigned_table)}</td>
      </tr>
    </table>
    <div style="text-align:center;margin-top:24px;">
      ${button(confirmUrl, "Confirm reservation", COLORS.confirm)}
      <span style="display:inline-block;width:10px;"></span>
      ${button(rejectUrl, "Reject reservation", COLORS.reject)}
    </div>`;

  return {
    subject: `New reservation · ${reservation.name} · ${prettyDate(reservation.date)} ${reservation.time}`,
    html: shell("New reservation request", config.restaurant_name, inner),
    text: [
      `New reservation request awaiting approval.`,
      ``,
      `Name: ${reservation.name}`,
      `Phone: ${reservation.phone}`,
      `Email: ${reservation.email}`,
      `Guests: ${reservation.people}`,
      `Date: ${prettyDate(reservation.date)}`,
      `Time: ${reservation.time}`,
      `Suggested table: ${reservation.assigned_table}`,
      ``,
      `Confirm: ${confirmUrl}`,
      `Reject: ${rejectUrl}`,
    ].join("\n"),
  };
}

// --- Large-group enquiry → restaurant --------------------------------------

export function largeGroupRequestTemplate(
  details: LargeGroupInput,
  config: RestaurantConfig,
): EmailTemplate {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;color:${COLORS.text};font-size:14px;">${escapeHtml(value)}</td>
    </tr>`;
  const inner = `
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      A large-group enquiry came in through the website. This party is larger than
      any single table, so it wasn't booked automatically — please contact the
      guest directly to arrange their visit.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">
      ${row("Name", details.name)}
      ${row("Phone", details.phone)}
      ${row("Email", details.email)}
      ${row("Guests", String(details.people))}
      ${row("Desired date", prettyDate(details.date))}
    </table>`;

  return {
    subject: `Large group enquiry · ${details.name} · ${details.people} guests`,
    html: shell("Large group enquiry", config.restaurant_name, inner),
    text: [
      `Large group enquiry from the website (not auto-booked).`,
      ``,
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Email: ${details.email}`,
      `Guests: ${details.people}`,
      `Desired date: ${prettyDate(details.date)}`,
      ``,
      `Please contact the guest directly to arrange their visit.`,
    ].join("\n"),
  };
}

// --- Confirmed → customer --------------------------------------------------

export function confirmedTemplate(
  reservation: Reservation,
  config: RestaurantConfig,
): EmailTemplate {
  const contact = config.phone
    ? `<p style="margin:16px 0 0;color:${COLORS.muted};font-size:13px;">Need to change something? Call us at ${escapeHtml(config.phone)}.</p>`
    : "";
  const inner = `
    <p style="margin:0 0 8px;color:${COLORS.text};font-size:15px;line-height:1.6;">
      Dear ${escapeHtml(reservation.name)}, we are delighted to confirm your table at
      <strong>${escapeHtml(config.restaurant_name)}</strong>.
    </p>
    ${detailRows(reservation)}
    <p style="margin:16px 0 0;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      We look forward to welcoming you. See you soon!
    </p>
    ${contact}`;

  return {
    subject: `Reservation confirmed · ${config.restaurant_name}`,
    html: shell("Your reservation is confirmed", config.restaurant_name, inner),
    text: [
      `Dear ${reservation.name},`,
      ``,
      `Your table at ${config.restaurant_name} is confirmed.`,
      ``,
      `Date: ${prettyDate(reservation.date)}`,
      `Time: ${reservation.time}`,
      `Guests: ${reservation.people}`,
      ``,
      `We look forward to welcoming you.`,
    ].join("\n"),
  };
}

// --- Rejected → customer ---------------------------------------------------

export function rejectedTemplate(
  reservation: Reservation,
  config: RestaurantConfig,
): EmailTemplate {
  const contact = config.phone
    ? `<p style="margin:16px 0 0;color:${COLORS.muted};font-size:13px;">We'd love to find another time — call us at ${escapeHtml(config.phone)}.</p>`
    : "";
  const inner = `
    <p style="margin:0 0 8px;color:${COLORS.text};font-size:15px;line-height:1.6;">
      Dear ${escapeHtml(reservation.name)}, thank you for your interest in dining with us.
    </p>
    <p style="margin:0 0 8px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      Unfortunately we are unable to accommodate your request for
      <strong style="color:${COLORS.text};">${prettyDate(reservation.date)}</strong> at
      <strong style="color:${COLORS.text};">${escapeHtml(reservation.time)}</strong> for
      ${reservation.people} ${reservation.people === 1 ? "guest" : "guests"}.
    </p>
    <p style="margin:0;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      We would be glad to welcome you on another date and sincerely hope to see you soon.
    </p>
    ${contact}`;

  return {
    subject: `Reservation request update · ${config.restaurant_name}`,
    html: shell("About your reservation request", config.restaurant_name, inner),
    text: [
      `Dear ${reservation.name},`,
      ``,
      `Thank you for your interest in ${config.restaurant_name}.`,
      `Unfortunately we cannot accommodate your request for ${prettyDate(reservation.date)} at ${reservation.time} for ${reservation.people} guests.`,
      ``,
      `We would be glad to welcome you another time.`,
    ].join("\n"),
  };
}
