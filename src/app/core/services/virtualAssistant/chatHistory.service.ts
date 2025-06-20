import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WhatsAppUser } from '../../../models/models_assistantVirtual/WhatsAppUser';
import { ChatAssistenteVirtual } from '../../../models/chatAssistenteVirtual';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {

  private userUrl = environment.apiUrls.whatsapp;
  private whatsappKey = environment.apiKeys.whatsapp;

  private chatUrl = environment.apiUrls.chat;
  private chatKey = environment.apiKeys.chat;

  constructor(private http: HttpClient) { }

  //Obtener los datos del usuario
  getUserInfo(field: string, value: string): Observable<WhatsAppUser> {
      const headers = new HttpHeaders({
      'X-API-KEY': this.whatsappKey,
      'Content-Type': 'application/json'
    });

    return this.http.get<WhatsAppUser>(`${this.userUrl}/v1/whatsapp/user/find?${field}=${value}`,{ headers });
  }

  //Obtener el historial del chat
  getChatHistory(threadId: string): Observable<ChatAssistenteVirtual>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.chatKey}`,
      'Content-Type': 'application/json'
    }) 
    return this.http.get<ChatAssistenteVirtual>(`${this.chatUrl}/history?thread_id=${threadId}`, { headers });
  }
}