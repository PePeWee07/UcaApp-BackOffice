import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private sidebarVisible = new BehaviorSubject<boolean>(false);  // Controla la visibilidad del sidebar
  public sidebarVisible$ = this.sidebarVisible.asObservable();   // Observa los cambios en la visibilidad

  toggleSidebar(): void {
    this.sidebarVisible.next(!this.sidebarVisible.value);  // Cambia el estado del sidebar
  }
}
