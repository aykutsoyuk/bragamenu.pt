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
  largeGroupIntro: string;
  largeGroupSummaryIntro: string;
  largeGroupConfirm: string;
  largeGroupSuccessTitle: string;
  largeGroupSuccessBody: string;
  rateLimited: string;
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
  largeGroupIntro:
    "For large group reservations, please leave your contact details. The restaurant will contact you directly to arrange everything.",
  largeGroupSummaryIntro:
    "Here are your details. Shall I send them to the restaurant?",
  largeGroupConfirm: "Send to the restaurant",
  largeGroupSuccessTitle: "Details sent",
  largeGroupSuccessBody:
    "Thank you! The restaurant has your details and will be in touch shortly to arrange your visit.",
  rateLimited:
    "You've made several requests recently. Please wait a little while and try again.",
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
  largeGroupIntro:
    "Para reservas de grupos grandes, deixe os seus contactos, por favor. O restaurante entrará em contacto consigo diretamente para tratar de tudo.",
  largeGroupSummaryIntro:
    "Aqui estão os seus dados. Envio-os ao restaurante?",
  largeGroupConfirm: "Enviar ao restaurante",
  largeGroupSuccessTitle: "Dados enviados",
  largeGroupSuccessBody:
    "Obrigado! O restaurante tem os seus contactos e entrará em contacto em breve para tratar da sua visita.",
  rateLimited:
    "Fez vários pedidos recentemente. Aguarde um momento e tente novamente, por favor.",
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
