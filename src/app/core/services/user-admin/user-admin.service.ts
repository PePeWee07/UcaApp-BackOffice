import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UsuarioPageable } from '../../../models/UsuarioPageable';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {

  private Url: String = environment.apiUrls.ucacue;

  constructor(private http: HttpClient) { }

  //* Paginacion de Usuarios
  getUsers(parameters: string): Observable <UsuarioPageable>{
    return this.http.get<UsuarioPageable>(`${this.Url}/v2/manager/users/page/${parameters}`);
  }
}
