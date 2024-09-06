import { Component, Inject, OnInit } from '@angular/core';
import { LoginDto, Usuario } from '../../models/User';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  constructor(
    @Inject(Router) private route: Router,
    private authService: AuthService
    ) {}

  loginDto: LoginDto = new LoginDto();
  login(){
    this.authService.login(this.loginDto).subscribe( (res) => {
      this.loginDto.password=btoa(this.loginDto.password!);
      this.authService.guardarToken(res.jwt);
      this.route.navigateByUrl('/welcom');
      console.log(res);
    }, (err) => {
      console.log(err);
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.route.navigateByUrl('/welcom');
    }
  }
}
