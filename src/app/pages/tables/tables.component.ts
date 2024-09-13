import { Component, Inject } from '@angular/core';
import { UserAdminService } from '../../core/services/user-admin/user-admin.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { data, Company } from '../../models/data';
import { TableModule } from 'ngx-easy-table';
import { Usuario } from '../../models/Usuario';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { UsuarioPageable } from '../../models/UsuarioPageable';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [TableModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent {

  constructor(
    private adminService: UserAdminService,
    @Inject(AlertToastService) private alertToast: AlertToastService
  ) {}

  userList: Usuario[] = [];
  keysUser: string[] = [] || [''];

  //Parametros de paginacion
  page: number = 0;
  pageSize: number = 5;
  sortBy: string = 'id';
  direction: string = 'asc';
  numberOfElements: number = 0;
  pagesArray: number[] = [];
  totalPages: number = 5;

  url:string = `${this.page}?pageSize=${this.pageSize}&sortBy=${this.sortBy}&direction=${this.direction}`;

  getUsers(){
    this.adminService.getUsers(this.url).subscribe(
      {
        next: (res: UsuarioPageable) => {
          //Datos de la tabla
          this.userList = res.content;
          //Datos de paginacion
          this.page = res.pageable.pageNumber;
          this.numberOfElements = res.numberOfElements;
          this.totalPages = res.totalPages;

          //Array de paginas
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i);

          //Obteniendo las keys de los objetos
          if (this.userList.length > 0) {
            const usuarioKeysDynamic = Object.keys(this.userList[0]) as (keyof Usuario)[];
            this.keysUser = usuarioKeysDynamic ? usuarioKeysDynamic : [];
          } else {
            this.keysUser = [''];
          }
        },
        error: (err) => {
          this.alertToast.showToast('error', err.error.message);
        }
      }
    );
  }

  ngOnInit(): void {
    this.getUsers();
  }

  // Métodos para manejar los cambios en las opciones seleccionadas
  onPageSizeChange(value: string) {
    this.pageSize = parseInt(value, 10);
    console.log('Page size changed:', this.pageSize);
    this.getData();
  }

  onSortByChange(value: string) {
    this.sortBy = value;
    console.log('Sort by changed:', this.sortBy);
    this.getData();
  }

  onDirectionChange(value: string) {
    this.direction = value.toLowerCase();
    console.log('Direction changed:', this.direction);
    this.getData();
  }

  // Simula la obtención de datos
  getData() {
    //console.log(`Fetching data with N° Page: ${this.page} ,Page Size: ${this.pageSize}, Sort By: ${this.sortBy}, Direction: ${this.direction}`);
    this.url =`${this.page}?pageSize=${this.pageSize}&sortBy=${this.sortBy}&direction=${this.direction}`
    this.getUsers();
  }

   // Métodos de paginación
   previousPage() {
    if (this.page > 0) {
      this.page--;
      this.getData();
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.getData();
    }
  }

  goToPage(page: number) {
    this.page = page;
    this.getData();
  }

}
