import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

export type MessageUpdateEvent = {
  type: string;
  phone: string;
  messageId: number | null;
  wamid: string;
  ts: number;
};

@Injectable({ providedIn: 'root' })
export class MessageStreamService {
  private baseUrl = environment.apiUrls.whatsapp + '/v1';
  private apiKey = environment.apiKeys.whatsapp;
  private headerName = environment.apiKeys.header;

  private abortController?: AbortController;

  connect(
    phone: string,
    onEvent: (ev: MessageUpdateEvent) => void,
    onError?: (err: any) => void,
  ) {
    this.abortController = new AbortController();

    const url = `http://localhost:8082/api/messages/stream?phone=${encodeURIComponent(phone)}`;

    fetch(url, {
      method: 'GET',
      headers: {
        [this.headerName]: this.apiKey,
        Accept: 'text/event-stream',
      },
      signal: this.abortController.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          throw new Error(`SSE stream failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE separa eventos por línea en blanco \n\n
          let idx;
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const rawEvent = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);

            // buscamos la línea "data: ..."
            const dataLine = rawEvent
              .split('\n')
              .find((line) => line.startsWith('data:'));

            if (!dataLine) continue;

            const json = dataLine.replace(/^data:\s*/, '').trim();
            try {
              const parsed = JSON.parse(json);
              onEvent(parsed);
            } catch (e) {
              // si no es JSON, igual lo puedes loggear
              console.warn('SSE data not JSON:', json);
            }
          }
        }
      })
      .catch((err) => {
        if (onError) onError(err);
        else console.error('Stream error', err);
      });
  }

  disconnect() {
    this.abortController?.abort();
  }
}
