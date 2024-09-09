import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../core/services/component/sidebar-service.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sidebarVisible: boolean = false;

  constructor(private sidebarService: SidebarService) {}

  toggleSidebar() {
    this.sidebarService.toggleSidebar();  // Llama al servicio para alternar el sidebar
  }

  ngOnInit() {
    this.sidebarService.sidebarVisible$.subscribe((isVisible) => {
      this.sidebarVisible = isVisible;
    });
  }

}
