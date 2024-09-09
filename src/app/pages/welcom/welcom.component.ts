import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-welcom',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, CommonModule],
  templateUrl: './welcom.component.html',
  styleUrl: './welcom.component.scss'
})
export class WelcomComponent implements OnInit{

  constructor(
    private _route: Router,
    private authService: AuthService,
    ) {}

  ngOnInit(): void {
  }

  logout(){
    this.authService.logout()
    this._route.navigateByUrl("/login")
  }
}
