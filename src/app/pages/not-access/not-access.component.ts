import { Component, Inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { AlertToastService } from '../../core/services/component/alert-toast.service';

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
    @Inject(AlertToastService) private alertService: AlertToastService
    ) {}


}
