import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private router: Router) {}

  getDashboardMenu(): { path: string; label: string; roles: string[]}[] {
    const mainLayout = this.router.config.find(r => r.path === '' && r.children);

    if (!mainLayout || !mainLayout.children){
      return [];
    }else {
      return mainLayout.children.filter(route => route.data && route.data!['label'])
      .map(route => ({
        path: '/' + route.path,
        label: route.data!['label'],
        roles: route.data!['roles']
       }));
    }

  }
}
