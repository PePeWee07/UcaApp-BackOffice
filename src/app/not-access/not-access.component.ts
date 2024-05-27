import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { UserService } from '../services/user/user.service';

@Component({
  selector: 'app-not-access',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './not-access.component.html',
  styleUrl: './not-access.component.scss'
})
export class NotAccessComponent {

  constructor(
    private _route: Router,
    private authService: AuthService
    ) {}

  logout(){
    this.authService.logout()
    this._route.navigateByUrl("/login")
  }

}
