export interface MessageBody {
  number: string;
  message: string;
}

export interface MessageResponse {
  messaging_product: string;
  contacts: Contact[];
  messages: Message[];
}

export interface Contact {
  input: string;
  wa_id: string;
}

export interface Message {
  id: string;
  status?: string;
}
