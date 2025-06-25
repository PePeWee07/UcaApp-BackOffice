import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, icons } from 'lucide-angular';
import { SidebarService } from '../../core/services/component/sidebar.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons) }, LanguageService]
})
export class SidebarComponent {
  sidebarVisible: boolean = false;

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    public translate: TranslateService
  ) { translate.setDefaultLang('en'); }

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
