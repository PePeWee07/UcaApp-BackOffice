import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

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
      this.authService.logout().subscribe( (res) => {
        console.log(res)
        this._route.navigateByUrl("/login")
      }, (err) => {
        console.log(err)
        this._route.navigateByUrl("/login")
      })
    }

}
