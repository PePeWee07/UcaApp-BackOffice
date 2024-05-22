import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  url: String =  "http://localhost:8080/api"

  public getUsers(){
    return this.http.get(`${this.url}/v1/users`);
  }

  public getPokemon(numberId: number){
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${numberId}`);
  }
}
