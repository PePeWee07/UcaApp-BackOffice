import { UserService } from '../../core/services/user/user.service';
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
    private userService: UserService
    ) {}

  ngOnInit(): void {
    this.test();
  }

  varTest: Object = "...";
    test(){
      this.userService.getMethodtest().subscribe( (res) => {
        console.log("SUCCESS: ", res);
        this.varTest = res;
      }, (err) => {
        console.log("ERROR: ", err);
        this.varTest = err;
      });
    }

  logout(){
    this.authService.logout()
    this._route.navigateByUrl("/login")
  }
}
