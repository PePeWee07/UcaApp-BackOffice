import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user/user.service';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  myTitleInApp = 'UcaApp';
  title = 'UcaApp';

  constructor(private userService: UserService){}

  // public users!: Observable<any>;
  users: Array<any> = [];
  getUsers(){
    this.userService.getUsers().subscribe((data: any) => {
      this.users = data;
    });
  }

  pokeRegister: Array<any> = [];
  getPokemon(){
    for(let i = 1; i <= 10; i++){
      this.userService.getPokemon(i).subscribe((data: any) => {
        var {name, sprites} = data;
        this.pokeRegister.push({name, sprites});
      },(err) => {
        console.log(err);
      });
    }
  }

  ngOnInit(): void {
    this.getUsers();
    this.getPokemon();
  }
}
