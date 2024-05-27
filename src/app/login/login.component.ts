import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { LoginDto, Usuario } from '../models/User';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  constructor(
    private _route: Router,
    private authService: AuthService
    ) {}

  loginDto: LoginDto = new LoginDto();
  login(){
    this.authService.login(this.loginDto).subscribe( (res) => {
      this.loginDto.password=btoa(this.loginDto.password!);
      this.authService.guardarToken(res.jwt);
      this._route.navigateByUrl('/welcom');
      console.log(res);
    }, (err) => {
      console.log(err);
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this._route.navigateByUrl('/welcom');
    }
  }
}
