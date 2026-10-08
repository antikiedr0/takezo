import type { ChatMessage } from '../generated/prisma/client.js'

// SZEW DLA AGENTA (docelowo w Pythonie).
//
// Dzis: odpowiedz zastepcza - wiadomosci uzytkownika zapisuja sie normalnie,
// wiec caly czat da sie dokonczyc i przetestowac bez modelu.
// Pozniej: to wywolanie pojdzie do serwisu agenta razem z historia i kontekstem
// tematu. Kontrakt POST /api/topics/:id/messages zostaje bez zmian.
export type RespondInput = {
  topicName: string
  projectName: string
  topicStatus: string
  history: ChatMessage[]
  userMessage: string
}

// Odpowiedz zastepcza jest w Markdownie, bo tak samo bedzie odpowiadal agent -
// frontend renderuje to jako artykul, wiec format widac od pierwszego dnia.
export async function respond(input: RespondInput): Promise<string> {
  return `## ${input.topicName}

Agent nie jest jeszcze podłączony, więc to jest **odpowiedź zastępcza**. Twoja wiadomość
zapisała się normalnie i zostanie w historii tematu.

### Co już działa

1. Rozmowa zapisuje się w bazie, osobno dla każdego tematu.
2. Formatowanie odpowiedzi — nagłówki, listy, pogrubienia i kod w zdaniu, jak \`useEffect\`.
3. Powrót do tematu po tygodniu pokazuje rozmowę w tym samym miejscu.

### Czego brakuje

Prawdziwych odpowiedzi. Wejdą, gdy podłączymy agenta w Pythonie pod
\`POST /api/topics/:id/messages\` — kontrakt już się nie zmieni.

> Kontekst, który agent dostanie: projekt **${input.projectName}**, status tematu
> *${input.topicStatus}*, oraz ostatnie wiadomości z tej rozmowy.`
}
