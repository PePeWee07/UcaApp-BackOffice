import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../../../models/UserProfile';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private Url: String = environment.apiUrls.ucacue;

  constructor(private http: HttpClient) { }

  //Obtener datos del usuario
  getProfile(): Observable<UserProfile>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<UserProfile>(`${this.Url}/v2/user/profile`, { headers });
  }

  editProfile(body: any): Observable<UserProfile>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<UserProfile>(`${this.Url}/v2/user/editProfile`, body, { headers });
  }
}
