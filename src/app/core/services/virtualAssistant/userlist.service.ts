import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class UserListService {

  // https://ia-sp-backoffice.ucatolica.cue.ec/api/v1/whatsapp/user/find?cedula=0704713619
  Url: String = '';

  constructor(private http: HttpClient) { }

  //* Paginacion de Usuarios
  getUsers(parameters: string){
    return null;
  }
}
