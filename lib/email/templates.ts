import type { Reservation, RestaurantConfig } from "@/types/reservation";
import type { Locale } from "@/lib/types";
import type { ManualReviewInput, CallbackInput } from "@/lib/reservations/validation";

// Email-safe HTML (inline styles, simple layout) in a warm palette that echoes
// the restaurant theme. Each builder returns subject + html + text and is
// localized: customer-facing emails use the customer's language, restaurant-
// facing emails use the restaurant's configured language.

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

// --- Localized strings ------------------------------------------------------

interface Strings {
  footer: string;
  labels: {
    date: string;
    time: string;
    guests: string;
    name: string;
    phone: string;
    email: string;
    table: string;
    desiredDate: string;
  };
  guestWord: (n: number) => string;
  newRequest: {
    heading: string;
    intro: string;
    confirm: string;
    reject: string;
    subject: (name: string, when: string) => string;
  };
  manualReview: {
    heading: string;
    intro: string;
    subject: (name: string, people: number) => string;
  };
  callback: {
    heading: string;
    intro: string;
    subject: string;
  };
  confirmed: {
    heading: string;
    greeting: (name: string, restaurant: string) => string;
    outro: string;
    contact: (phone: string) => string;
    subject: (restaurant: string) => string;
  };
  rejected: {
    heading: string;
    greeting: (name: string) => string;
    body: (when: string, time: string, people: number) => string;
    outro: string;
    contact: (phone: string) => string;
    subject: (restaurant: string) => string;
  };
  sla: {
    heading: string;
    greeting: (name: string) => string;
    body: (restaurant: string) => string;
    subject: (restaurant: string) => string;
  };
}

const EN: Strings = {
  footer: "Digital reservations",
  labels: {
    date: "Date",
    time: "Time",
    guests: "Guests",
    name: "Name",
    phone: "Phone",
    email: "Email",
    table: "Suggested table",
    desiredDate: "Desired date",
  },
  guestWord: (n) => (n === 1 ? "guest" : "guests"),
  newRequest: {
    heading: "New reservation request",
    intro: "A new reservation request is awaiting your approval.",
    confirm: "Confirm reservation",
    reject: "Reject reservation",
    subject: (name, when) => `New reservation · ${name} · ${when}`,
  },
  manualReview: {
    heading: "Manual review required",
    intro:
      "No suitable table configuration exists for this party, but overall capacity is available. Manual review required — please check whether tables can be combined and contact the guest directly.",
    subject: (name, people) => `Manual review · ${name} · ${people} guests`,
  },
  callback: {
    heading: "Customer callback request",
    intro:
      "The online reservation system was unavailable, so a guest left their details for a callback. Please contact them to arrange their visit.",
    subject: "Reservation System Unavailable - Customer Callback Request",
  },
  confirmed: {
    heading: "Your reservation is confirmed",
    greeting: (name, restaurant) =>
      `Dear ${name}, we are delighted to confirm your table at ${restaurant}.`,
    outro: "We look forward to welcoming you. See you soon!",
    contact: (phone) => `Need to change something? Call us at ${phone}.`,
    subject: (restaurant) => `Reservation confirmed · ${restaurant}`,
  },
  rejected: {
    heading: "About your reservation request",
    greeting: (name) => `Dear ${name}, thank you for your interest in dining with us.`,
    body: (when, time, people) =>
      `Unfortunately we are unable to accommodate your request for ${when} at ${time} for ${people} ${people === 1 ? "guest" : "guests"}.`,
    outro:
      "We would be glad to welcome you on another date and sincerely hope to see you soon.",
    contact: (phone) => `We'd love to find another time — call us at ${phone}.`,
    subject: (restaurant) => `Reservation request update · ${restaurant}`,
  },
  sla: {
    heading: "Awaiting restaurant response",
    greeting: (name) => `Dear ${name},`,
    body: (restaurant) =>
      `The restaurant has not yet responded to your reservation request at ${restaurant}. If your booking is urgent, please contact them directly using the details below.`,
    subject: (restaurant) => `Your reservation request · ${restaurant}`,
  },
};

const PT: Strings = {
  footer: "Reservas digitais",
  labels: {
    date: "Data",
    time: "Hora",
    guests: "Pessoas",
    name: "Nome",
    phone: "Telefone",
    email: "Email",
    table: "Mesa sugerida",
    desiredDate: "Data pretendida",
  },
  guestWord: (n) => (n === 1 ? "pessoa" : "pessoas"),
  newRequest: {
    heading: "Novo pedido de reserva",
    intro: "Um novo pedido de reserva aguarda a sua aprovação.",
    confirm: "Confirmar reserva",
    reject: "Recusar reserva",
    subject: (name, when) => `Nova reserva · ${name} · ${when}`,
  },
  manualReview: {
    heading: "Revisão manual necessária",
    intro:
      "Não existe uma configuração de mesa adequada para este grupo, mas há capacidade total disponível. É necessária revisão manual — verifique se é possível juntar mesas e contacte o cliente diretamente.",
    subject: (name, people) => `Revisão manual · ${name} · ${people} pessoas`,
  },
  callback: {
    heading: "Pedido de contacto do cliente",
    intro:
      "O sistema de reservas online estava indisponível, por isso um cliente deixou os seus dados para ser contactado. Contacte-o para combinar a visita.",
    subject: "Sistema de Reservas Indisponível - Pedido de Contacto do Cliente",
  },
  confirmed: {
    heading: "A sua reserva está confirmada",
    greeting: (name, restaurant) =>
      `Caro(a) ${name}, é com grande prazer que confirmamos a sua mesa no ${restaurant}.`,
    outro: "Aguardamos a sua visita. Até breve!",
    contact: (phone) => `Precisa de alterar algo? Ligue-nos para ${phone}.`,
    subject: (restaurant) => `Reserva confirmada · ${restaurant}`,
  },
  rejected: {
    heading: "Sobre o seu pedido de reserva",
    greeting: (name) =>
      `Caro(a) ${name}, obrigado pelo seu interesse em jantar connosco.`,
    body: (when, time, people) =>
      `Infelizmente não conseguimos acomodar o seu pedido para ${when} às ${time} para ${people} ${people === 1 ? "pessoa" : "pessoas"}.`,
    outro:
      "Teríamos todo o gosto em recebê-lo noutra data e esperamos sinceramente vê-lo em breve.",
    contact: (phone) => `Gostaríamos de encontrar outro horário — ligue-nos para ${phone}.`,
    subject: (restaurant) => `Atualização do pedido de reserva · ${restaurant}`,
  },
  sla: {
    heading: "A aguardar resposta do restaurante",
    greeting: (name) => `Caro(a) ${name},`,
    body: (restaurant) =>
      `O restaurante ainda não respondeu ao seu pedido de reserva no ${restaurant}. Se a sua reserva for urgente, contacte-o diretamente através dos dados abaixo.`,
    subject: (restaurant) => `O seu pedido de reserva · ${restaurant}`,
  },
};

function strings(locale: Locale): Strings {
  return locale === "pt" ? PT : EN;
}

// --- Shared building blocks -------------------------------------------------

function prettyDate(date: string, locale: Locale): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function shell(title: string, restaurantName: string, inner: string, footer: string): string {
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
        ${escapeHtml(restaurantName)} · ${escapeHtml(footer)}
      </div>
    </div>
  </body>
</html>`;
}

function infoRow(label: string, value: string, accent = false): string {
  const color = accent ? COLORS.accent : COLORS.text;
  const weight = accent ? "600" : "400";
  return `
    <tr>
      <td style="padding:6px 0;color:${COLORS.muted};font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;color:${color};font-size:14px;font-weight:${weight};">${escapeHtml(value)}</td>
    </tr>`;
}

function detailRows(reservation: Reservation, s: Strings, locale: Locale): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">
      ${infoRow(s.labels.date, prettyDate(reservation.date, locale))}
      ${infoRow(s.labels.time, reservation.time)}
      ${infoRow(s.labels.guests, String(reservation.people))}
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
  locale: Locale,
): EmailTemplate {
  const s = strings(locale);
  const inner = `
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      ${escapeHtml(s.newRequest.intro)}
    </p>
    ${detailRows(reservation, s, locale)}
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      ${infoRow(s.labels.name, reservation.name)}
      ${infoRow(s.labels.phone, reservation.phone)}
      ${infoRow(s.labels.email, reservation.email)}
      ${infoRow(s.labels.table, reservation.assigned_table, true)}
    </table>
    <div style="text-align:center;margin-top:24px;">
      ${button(confirmUrl, s.newRequest.confirm, COLORS.confirm)}
      <span style="display:inline-block;width:10px;"></span>
      ${button(rejectUrl, s.newRequest.reject, COLORS.reject)}
    </div>`;

  return {
    subject: s.newRequest.subject(
      reservation.name,
      `${prettyDate(reservation.date, locale)} ${reservation.time}`,
    ),
    html: shell(s.newRequest.heading, config.restaurant_name, inner, s.footer),
    text: [
      s.newRequest.intro,
      ``,
      `${s.labels.name}: ${reservation.name}`,
      `${s.labels.phone}: ${reservation.phone}`,
      `${s.labels.email}: ${reservation.email}`,
      `${s.labels.guests}: ${reservation.people}`,
      `${s.labels.date}: ${prettyDate(reservation.date, locale)}`,
      `${s.labels.time}: ${reservation.time}`,
      `${s.labels.table}: ${reservation.assigned_table}`,
      ``,
      `${s.newRequest.confirm}: ${confirmUrl}`,
      `${s.newRequest.reject}: ${rejectUrl}`,
    ].join("\n"),
  };
}

// --- Manual review → restaurant --------------------------------------------

export function manualReviewTemplate(
  details: ManualReviewInput,
  config: RestaurantConfig,
  locale: Locale,
): EmailTemplate {
  const s = strings(locale);
  const inner = `
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      ${escapeHtml(s.manualReview.intro)}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">
      ${infoRow(s.labels.name, details.name)}
      ${infoRow(s.labels.phone, details.phone)}
      ${infoRow(s.labels.email, details.email)}
      ${infoRow(s.labels.guests, String(details.people))}
      ${infoRow(s.labels.desiredDate, prettyDate(details.date, locale))}
    </table>`;

  return {
    subject: s.manualReview.subject(details.name, details.people),
    html: shell(s.manualReview.heading, config.restaurant_name, inner, s.footer),
    text: [
      s.manualReview.intro,
      ``,
      `${s.labels.name}: ${details.name}`,
      `${s.labels.phone}: ${details.phone}`,
      `${s.labels.email}: ${details.email}`,
      `${s.labels.guests}: ${details.people}`,
      `${s.labels.desiredDate}: ${prettyDate(details.date, locale)}`,
    ].join("\n"),
  };
}

// --- Fail-safe callback request → restaurant -------------------------------

export function callbackTemplate(
  details: CallbackInput,
  config: RestaurantConfig,
  locale: Locale,
): EmailTemplate {
  const s = strings(locale);
  const timeRow = details.time ? infoRow(s.labels.time, details.time) : "";
  const inner = `
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      ${escapeHtml(s.callback.intro)}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 4px;">
      ${infoRow(s.labels.name, details.name)}
      ${infoRow(s.labels.phone, details.phone)}
      ${infoRow(s.labels.email, details.email)}
      ${infoRow(s.labels.guests, String(details.people))}
      ${infoRow(s.labels.desiredDate, prettyDate(details.date, locale))}
      ${timeRow}
    </table>`;

  return {
    subject: s.callback.subject,
    html: shell(s.callback.heading, config.restaurant_name, inner, s.footer),
    text: [
      s.callback.intro,
      ``,
      `${s.labels.name}: ${details.name}`,
      `${s.labels.phone}: ${details.phone}`,
      `${s.labels.email}: ${details.email}`,
      `${s.labels.guests}: ${details.people}`,
      `${s.labels.desiredDate}: ${prettyDate(details.date, locale)}`,
      ...(details.time ? [`${s.labels.time}: ${details.time}`] : []),
    ].join("\n"),
  };
}

// --- Confirmed → customer --------------------------------------------------

export function confirmedTemplate(
  reservation: Reservation,
  config: RestaurantConfig,
  locale: Locale,
): EmailTemplate {
  const s = strings(locale);
  const contact = config.phone
    ? `<p style="margin:16px 0 0;color:${COLORS.muted};font-size:13px;">${escapeHtml(s.confirmed.contact(config.phone))}</p>`
    : "";
  const inner = `
    <p style="margin:0 0 8px;color:${COLORS.text};font-size:15px;line-height:1.6;">
      ${escapeHtml(s.confirmed.greeting(reservation.name, config.restaurant_name))}
    </p>
    ${detailRows(reservation, s, locale)}
    <p style="margin:16px 0 0;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      ${escapeHtml(s.confirmed.outro)}
    </p>
    ${contact}`;

  return {
    subject: s.confirmed.subject(config.restaurant_name),
    html: shell(s.confirmed.heading, config.restaurant_name, inner, s.footer),
    text: [
      s.confirmed.greeting(reservation.name, config.restaurant_name),
      ``,
      `${s.labels.date}: ${prettyDate(reservation.date, locale)}`,
      `${s.labels.time}: ${reservation.time}`,
      `${s.labels.guests}: ${reservation.people}`,
      ``,
      s.confirmed.outro,
    ].join("\n"),
  };
}

// --- Rejected → customer ---------------------------------------------------

export function rejectedTemplate(
  reservation: Reservation,
  config: RestaurantConfig,
  locale: Locale,
): EmailTemplate {
  const s = strings(locale);
  const contact = config.phone
    ? `<p style="margin:16px 0 0;color:${COLORS.muted};font-size:13px;">${escapeHtml(s.rejected.contact(config.phone))}</p>`
    : "";
  const inner = `
    <p style="margin:0 0 8px;color:${COLORS.text};font-size:15px;line-height:1.6;">
      ${escapeHtml(s.rejected.greeting(reservation.name))}
    </p>
    <p style="margin:0 0 8px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      ${escapeHtml(s.rejected.body(prettyDate(reservation.date, locale), reservation.time, reservation.people))}
    </p>
    <p style="margin:0;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      ${escapeHtml(s.rejected.outro)}
    </p>
    ${contact}`;

  return {
    subject: s.rejected.subject(config.restaurant_name),
    html: shell(s.rejected.heading, config.restaurant_name, inner, s.footer),
    text: [
      s.rejected.greeting(reservation.name),
      ``,
      s.rejected.body(prettyDate(reservation.date, locale), reservation.time, reservation.people),
      ``,
      s.rejected.outro,
    ].join("\n"),
  };
}

// --- SLA timeout → customer ------------------------------------------------

export function slaTimeoutTemplate(
  reservation: Reservation,
  config: RestaurantConfig,
  locale: Locale,
): EmailTemplate {
  const s = strings(locale);
  const contactRows = [
    config.phone ? infoRow(s.labels.phone, config.phone) : "",
    config.notification_email ? infoRow(s.labels.email, config.notification_email) : "",
  ].join("");
  const inner = `
    <p style="margin:0 0 8px;color:${COLORS.text};font-size:15px;line-height:1.6;">
      ${escapeHtml(s.sla.greeting(reservation.name))}
    </p>
    <p style="margin:0 0 12px;color:${COLORS.muted};font-size:14px;line-height:1.6;">
      ${escapeHtml(s.sla.body(config.restaurant_name))}
    </p>
    ${detailRows(reservation, s, locale)}
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      ${contactRows}
    </table>`;

  return {
    subject: s.sla.subject(config.restaurant_name),
    html: shell(s.sla.heading, config.restaurant_name, inner, s.footer),
    text: [
      s.sla.greeting(reservation.name),
      ``,
      s.sla.body(config.restaurant_name),
      ``,
      `${s.labels.date}: ${prettyDate(reservation.date, locale)}`,
      `${s.labels.time}: ${reservation.time}`,
      `${s.labels.guests}: ${reservation.people}`,
      ``,
      config.phone ? `${s.labels.phone}: ${config.phone}` : "",
      config.notification_email ? `${s.labels.email}: ${config.notification_email}` : "",
    ].filter(Boolean).join("\n"),
  };
}
