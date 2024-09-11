import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {

  Url: String = 'http://localhost:8080/ucacue/api';

  constructor(private http: HttpClient) { }

  //* Paginacion de Usuarios
  getUsers(page: number){
    return this.http.get<any>(`${this.Url}/v2/manager/users/page/${page}`);
  }
}
