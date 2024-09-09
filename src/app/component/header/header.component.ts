import { Component } from '@angular/core';
import { SidebarService } from '../../core/services/component/sidebar-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  sidebarVisible: boolean = true;
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
