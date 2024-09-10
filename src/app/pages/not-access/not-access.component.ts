import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AlertService } from '../../core/services/component/alert.service';

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
    private authService: AuthService,
    private alertService: AlertService
    ) {}

    logout() {
      this.authService.logout().subscribe(
        {
          next: (res) => {
            this.alertService.showToast('success', res.message);
            this._route.navigateByUrl("/login")
          },
          error: (err) => {
            console.log(err)
            this.alertService.showToast('error', err.error.message);
            this._route.navigateByUrl("/login")
          }
        }
      );
    }

}
