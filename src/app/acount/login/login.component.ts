import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;  // FormGroup para manejar el formulario reactivo

  constructor(
    @Inject(Router) private router: Router,
    private authService: AuthService,
    private fb: FormBuilder   // FormBuilder para crear el formulario
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/welcom');
    }
    this.initForm();  // Inicializamos el formulario
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      const loginDto = this.loginForm.value;
      this.authService.login(loginDto).subscribe(
        (res) => {
          loginDto.password = btoa(loginDto.password);
          this.authService.guardarToken(res.jwt);
          this.router.navigateByUrl('/dashboard');
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
}
