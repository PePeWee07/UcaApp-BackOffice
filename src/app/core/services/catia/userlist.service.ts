import { HistoryChat } from '../../../models/catia/HistoryChat';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WhatsAppUserList } from '../../../models/catia/WhatsAppUserList';
import { map, Observable, } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WhatsAppUser } from '../../../models/catia/WhatsAppUser';

@Injectable({
  providedIn: 'root'
})

export class UserListService {

  private Url = environment.apiUrls.whatsapp + "/v1";
  private apiKey = environment.apiKeys.whatsapp;
  private header = environment.apiKeys.header;

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    [this.header]: this.apiKey,
    'Content-Type': 'application/json'
  });

  // Obtener los usuarios
  getWhatsAppUsers(parameters: string): Observable<WhatsAppUserList>{
    return this.http.get<WhatsAppUserList>(`${this.Url}/whatsapp/page/users/${parameters}`, { headers: this.headers });
  }

  // Obtener la informacion de un usuario
  getUserInfo(field: string, value: string): Observable<WhatsAppUser> {
    return this.http.get<WhatsAppUser>(`${this.Url}/whatsapp/user/find?${field}=${value}`,{ headers: this.headers })
  }

  // Cambiar la informacion de un usuario
  changeUserStatus(userId: string, body: any): Observable<WhatsAppUser>{
    return this.http.patch<WhatsAppUser>(`${this.Url}/whatsapp/update/user/${userId}`, body, { headers: this.headers })
  }

  // Hisotrial del mensajes de un usuario
  getHistoryUser(phone: string, pageNumber: number, pageSize: number = 5): Observable<HistoryChat> {
    return this.http.get<HistoryChat>(`${this.Url}/history/${phone}?page=${pageNumber}&size=${pageSize}`, { headers: this.headers });
  }

}
