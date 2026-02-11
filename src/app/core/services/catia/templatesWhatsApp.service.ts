import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TemplatesWhatsAppService {
  private Url = environment.apiUrls.whatsapp + "/v1";
  private apiKey = environment.apiKeys.whatsapp;
  private header = environment.apiKeys.header;

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    [this.header]: this.apiKey,
    'Content-Type': 'application/json'
  });

  // Obtiene las plantillas con calificaciones
  getCalificationTemplates(
    pageNumber: number,
    pageSize: number = 1000,
    sort: string = 'sentAt',
    dir: string = 'desc'
  ): Observable<any> {
    const url = `${this.Url}/whatsapp/template/all?page=${pageNumber}&pageSize=${pageSize}&sort=${sort}&dir=${dir}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      map((response) => {
        // Procesamos cada item del content
        response.content = response.content.map((item: any) => {
          const parsedAnswer = this.parseAnswer(item.answer);
          const { rating, label } = this.extractRating(parsedAnswer);
          return { ...item, parsedAnswer, rating, label };
        });
        return response;
      })
    );
  }

  // Limpia y parsea el campo answer
  private parseAnswer(answer: string | null) {
    if (!answer) return null;
    try {
      const cleaned = answer.replace(/\\(?!["\\/bfnrtu])/g, '');
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }

  // Extrae número de estrellas y texto
  private extractRating(answerObj: any) {
    if (!answerObj) return { rating: null, label: null };

    const key = Object.keys(answerObj).find((k) =>
      k.toLowerCase().includes('calific')
    );
    if (!key) return { rating: null, label: null };

    const text = answerObj[key] as string;

    const rating = Array.from(text).filter((c) => c === '⭐').length;

    let label = '';
    if (text.includes('_•_')) {
      label = text.split('_•_')[1] ?? '';
      label = label.replace(/_\(.+?\)/, '').replace(/_/g, ' ').trim();
    }

    return { rating, label };
  }
}
