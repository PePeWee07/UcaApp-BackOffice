import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  public getUsers(){
    return this.http.get('');
  }

  public getPokemon(numberId: number){
    // return this.http.get('https://pokeapi.co/api/v2/pokemon');
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${numberId}`);
  }
}
