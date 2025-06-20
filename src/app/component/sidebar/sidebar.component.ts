import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, icons } from 'lucide-angular';
import { SidebarService } from '../../core/services/component/sidebar.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { authRoleGuard } from '../../core/guards/auth-role.guard';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}]
})
export class SidebarComponent {
  sidebarVisible: boolean = false;

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  toggleSidebar() {
    this.sidebarService.toggleSidebar();  // Llama al servicio para alternar el sidebar
  }
  // verificar si el usuario tiene el rol especificado
  withRoles(roles: string[]): boolean{
    return this.authService.includesRole(roles);
  }

  ngOnInit() {
    this.sidebarService.sidebarVisible$.subscribe((isVisible) => {
      this.sidebarVisible = isVisible;
    });
  }

}
