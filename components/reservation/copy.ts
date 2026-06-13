import type { Locale } from "@/lib/types";

// All reservation-flow copy, in the same two locales as the menu. Interpolated
// strings are functions; everything is plain data so the chat component stays
// presentation-only.

export interface ReservationCopy {
  buttonLabel: string;
  title: string;
  subtitle: string;
  close: string;
  greeting: (restaurant: string) => string;
  askPeople: string;
  guestUnit: (n: number) => string;
  morePeople: string;
  askDate: string;
  checking: string;
  askSlot: (dateLabel: string) => string;
  noSlots: string;
  closedDay: string;
  pickAnotherDate: string;
  manualReviewIntro: string;
  manualReviewSummaryIntro: string;
  manualReviewConfirm: string;
  manualReviewSuccessTitle: string;
  manualReviewSuccessBody: string;
  requestManualReview: string;
  emailWarning: string;
  failsafeIntro: string;
  failsafeCall: string;
  failsafeCallback: string;
  callbackSummaryIntro: string;
  callbackConfirm: string;
  callbackSuccessTitle: string;
  callbackSuccessBody: string;
  askName: string;
  askPhone: string;
  askEmail: string;
  invalidName: string;
  invalidPhone: string;
  invalidEmail: string;
  summaryIntro: string;
  labelName: string;
  labelGuests: string;
  labelDate: string;
  labelTime: string;
  confirmRequest: string;
  editDetails: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  errorTitle: string;
  errorBody: string;
  slotTakenBody: string;
  retry: string;
  startOver: string;
  inputPlaceholderName: string;
  inputPlaceholderPhone: string;
  inputPlaceholderEmail: string;
  send: string;
  typing: string;
}

const EN: ReservationCopy = {
  buttonLabel: "Reservation",
  title: "Reservations",
  subtitle: "Concierge",
  close: "Close",
  greeting: (r) =>
    `Welcome to ${r}. I'd be delighted to arrange your table. How many guests will be joining?`,
  askPeople: "How many guests?",
  guestUnit: (n) => (n === 1 ? "1 guest" : `${n} guests`),
  morePeople: "More",
  askDate: "Lovely. Which day would you like to dine with us?",
  checking: "Checking availability…",
  askSlot: (d) => `Here are the available times for ${d}. Which suits you best?`,
  noSlots:
    "I'm sorry — we're fully booked for that day and party size. Shall we try another date?",
  closedDay: "We're closed on that day. Could I suggest another date?",
  pickAnotherDate: "Choose another date",
  manualReviewIntro:
    "No single table fits a party this size, but we may be able to combine tables. Please leave your details and the restaurant will review your request and contact you directly.",
  manualReviewSummaryIntro:
    "Here are your details. Shall I send them to the restaurant for review?",
  manualReviewConfirm: "Send for manual review",
  manualReviewSuccessTitle: "Request sent for review",
  manualReviewSuccessBody:
    "Thank you! Your request has been sent to the restaurant for manual review. They'll be in touch shortly to arrange your visit.",
  requestManualReview: "Request manual review",
  emailWarning:
    "Please provide a valid email address. Reservation updates and confirmations will be sent here.",
  failsafeIntro:
    "We are currently unable to access the restaurant reservation system. You can call the restaurant directly, or leave your details for a callback.",
  failsafeCall: "Call the restaurant",
  failsafeCallback: "Request a callback",
  callbackSummaryIntro:
    "We'll pass these to the restaurant so they can call you back. Shall I send them?",
  callbackConfirm: "Request callback",
  callbackSuccessTitle: "Callback requested",
  callbackSuccessBody:
    "Thank you! The restaurant has your details and will contact you as soon as possible.",
  askName: "Wonderful. Whose name should the reservation be under?",
  askPhone: "Thank you. And a phone number in case we need to reach you?",
  askEmail: "Perfect. Lastly, an email for your confirmation?",
  invalidName: "Please share a name so we know who to expect.",
  invalidPhone: "That doesn't look like a valid phone number — could you check it?",
  invalidEmail: "Hmm, that email doesn't look quite right. Mind trying again?",
  summaryIntro: "Here's everything I have. Shall I send the request?",
  labelName: "Name",
  labelGuests: "Guests",
  labelDate: "Date",
  labelTime: "Time",
  confirmRequest: "Send reservation request",
  editDetails: "Start over",
  submitting: "Sending your request…",
  successTitle: "Request sent",
  successBody:
    "Thank you! Your request is with the restaurant for approval. You'll receive an email as soon as it's confirmed.",
  errorTitle: "Something went wrong",
  errorBody: "We couldn't send your request just now. Please try again in a moment.",
  slotTakenBody:
    "That time was just taken. Let's pick another — shall we try a different slot?",
  retry: "Try again",
  startOver: "Start a new reservation",
  inputPlaceholderName: "Your name",
  inputPlaceholderPhone: "Phone number",
  inputPlaceholderEmail: "you@example.com",
  send: "Send",
  typing: "typing",
};

const PT: ReservationCopy = {
  buttonLabel: "Reserva",
  title: "Reservas",
  subtitle: "Concierge",
  close: "Fechar",
  greeting: (r) =>
    `Bem-vindo ao ${r}. Será um prazer reservar a sua mesa. Quantas pessoas serão?`,
  askPeople: "Quantas pessoas?",
  guestUnit: (n) => (n === 1 ? "1 pessoa" : `${n} pessoas`),
  morePeople: "Mais",
  askDate: "Ótimo. Em que dia gostaria de nos visitar?",
  checking: "A verificar disponibilidade…",
  askSlot: (d) => `Estes são os horários disponíveis para ${d}. Qual prefere?`,
  noSlots:
    "Lamento — estamos esgotados nesse dia para esse número de pessoas. Tentamos outra data?",
  closedDay: "Estamos encerrados nesse dia. Posso sugerir outra data?",
  pickAnotherDate: "Escolher outra data",
  manualReviewIntro:
    "Não há uma única mesa para um grupo deste tamanho, mas talvez seja possível juntar mesas. Deixe os seus dados e o restaurante irá analisar o seu pedido e contactá-lo diretamente.",
  manualReviewSummaryIntro:
    "Aqui estão os seus dados. Envio-os ao restaurante para análise?",
  manualReviewConfirm: "Enviar para análise",
  manualReviewSuccessTitle: "Pedido enviado para análise",
  manualReviewSuccessBody:
    "Obrigado! O seu pedido foi enviado ao restaurante para análise manual. Entrarão em contacto em breve para tratar da sua visita.",
  requestManualReview: "Pedir análise manual",
  emailWarning:
    "Indique um email válido, por favor. As atualizações e confirmações da reserva serão enviadas para este endereço.",
  failsafeIntro:
    "De momento não conseguimos aceder ao sistema de reservas do restaurante. Pode ligar diretamente ao restaurante ou deixar os seus dados para ser contactado.",
  failsafeCall: "Ligar ao restaurante",
  failsafeCallback: "Pedir contacto",
  callbackSummaryIntro:
    "Vamos entregar estes dados ao restaurante para que o contactem. Envio-os?",
  callbackConfirm: "Pedir contacto",
  callbackSuccessTitle: "Pedido de contacto enviado",
  callbackSuccessBody:
    "Obrigado! O restaurante tem os seus dados e entrará em contacto o mais rapidamente possível.",
  askName: "Maravilha. Em nome de quem fica a reserva?",
  askPhone: "Obrigado. E um número de telefone para o caso de precisarmos de o contactar?",
  askEmail: "Perfeito. Por fim, um email para a sua confirmação?",
  invalidName: "Indique um nome, por favor, para sabermos quem esperar.",
  invalidPhone: "Esse número não parece válido — pode confirmar?",
  invalidEmail: "Esse email não parece correto. Importa-se de tentar novamente?",
  summaryIntro: "Aqui está o resumo. Envio o pedido?",
  labelName: "Nome",
  labelGuests: "Pessoas",
  labelDate: "Data",
  labelTime: "Hora",
  confirmRequest: "Enviar pedido de reserva",
  editDetails: "Recomeçar",
  submitting: "A enviar o seu pedido…",
  successTitle: "Pedido enviado",
  successBody:
    "Obrigado! O seu pedido está com o restaurante para aprovação. Receberá um email assim que for confirmado.",
  errorTitle: "Ocorreu um erro",
  errorBody: "Não conseguimos enviar o seu pedido agora. Tente novamente dentro de momentos.",
  slotTakenBody:
    "Esse horário acabou de ser ocupado. Vamos escolher outro — tentamos um horário diferente?",
  retry: "Tentar novamente",
  startOver: "Iniciar nova reserva",
  inputPlaceholderName: "O seu nome",
  inputPlaceholderPhone: "Número de telefone",
  inputPlaceholderEmail: "voce@exemplo.com",
  send: "Enviar",
  typing: "a escrever",
};

const COPY: Record<Locale, ReservationCopy> = { en: EN, pt: PT };

export function getReservationCopy(locale: Locale): ReservationCopy {
  return COPY[locale] ?? EN;
}
