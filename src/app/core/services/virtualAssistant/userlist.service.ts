import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WhatsAppUserList } from '../../../models/models_assistantVirtual/WhatsAppUserList';
import { catchError, Observable, } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WhatsAppUser } from '../../../models/models_assistantVirtual/WhatsAppUser';

@Injectable({
  providedIn: 'root'
})

export class UserListService {

  private Url = environment.apiUrls.whatsapp;
  private apiKey = environment.apiKeys.whatsapp;

  constructor(private http: HttpClient) { }

  // Obtener usuarios por rango de fechas
  getDatedUsers(parameters: string): Observable<WhatsAppUserList>{
     const headers = new HttpHeaders({
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
    });
    return this.http.get<WhatsAppUserList>(`${this.Url}/v1/whatsapp/page/users/${parameters}`, { headers });
  }

  //Obtener los usuarios
  getWhatsAppUsers(parameters: string): Observable<WhatsAppUserList>{
    const headers = new HttpHeaders({
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
    });
    return this.http.get<WhatsAppUserList>(`${this.Url}/v1/whatsapp/page/users/${parameters}`, { headers });
  }

  // Obtener la informacion de un usuario
  getUserInfo(field: string, value: string): Observable<WhatsAppUser| null> {
      const headers = new HttpHeaders({
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    });

    return this.http.get<WhatsAppUser>(`${this.Url}/v1/whatsapp/user/find?${field}=${value}`,{ headers })

  }

  // Cambiar la informacion de un usuario
  changeUserStatus(userId: string, body: any): Observable<WhatsAppUser>{
    const headers = new HttpHeaders({
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    });
    return this.http.patch<WhatsAppUser>(`${this.Url}/v1/whatsapp/update/user/${userId}`, body, { headers })

  }


}
