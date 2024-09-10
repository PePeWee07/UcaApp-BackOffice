import { Component } from '@angular/core';
import { SidebarService } from '../../core/services/component/sidebar-service.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/component/alert.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  sidebarVisible: boolean = true;

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private _route: Router,
    private alertService: AlertService
  ) {}

  isDropdownOpen = false;  // estado del dropdown

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();  // Llama al servicio para alternar el sidebar
  }

  ngOnInit() {
    this.sidebarService.sidebarVisible$.subscribe((isVisible) => {
      this.sidebarVisible = isVisible;
    });
  }

  SingOut(){
    this.authService.logout().subscribe( (res) => {
      this.alertService.showToast('success', res.message);
      this._route.navigateByUrl("/login")
    }, (err) => {
      console.log(err)
      this.alertService.showToast('error', err.error.message);
      this._route.navigateByUrl("/login")
    })
  }


}
