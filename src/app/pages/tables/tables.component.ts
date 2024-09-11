import { Component } from '@angular/core';
import { UserAdminService } from '../../core/services/user-admin/user-admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent {

  constructor(
    private adminService: UserAdminService
  ) {}

  user: any = [];
  page: number = 0;

  getUsers(){
    this.adminService.getUsers(this.page).subscribe(
      {
        next: (res) => {
          this.user = res;
        },
        error: (err) => {
          console.log(err)
        }
      }
    );
  }

  ngOnInit(): void {
    this.getUsers();
  }

}
