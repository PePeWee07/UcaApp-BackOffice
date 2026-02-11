import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MessageBody, MessageResponse } from '../../../models/catia/whatsapp/MessageBody';

@Injectable({
  providedIn: 'root'
})

export class ApiWhatsAppService {
  private Url = environment.apiUrls.whatsapp + "/v1";
  private apiKey = environment.apiKeys.whatsapp;
  private header = environment.apiKeys.header;

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    [this.header]: this.apiKey,
    'Content-Type': 'application/json'
  });

  // Enviar mensaje WhatsApp
  sendWhatsAppMessage(body: MessageBody): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.Url}/whatsapp/send`, body, { headers: this.headers });
  }

  
}
