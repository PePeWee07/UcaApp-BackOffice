import { Component, Inject } from '@angular/core';
import { UserAdminService } from '../../core/services/user-admin/user-admin.service';
import { Usuario } from '../../models/Usuario';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { UsuarioPageable } from '../../models/UsuarioPageable';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';


@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [ FormsModule ],
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
  totalElements: number = 0;
  pagesArray: number[] = [];
  totalPages: number = 5;
  searchText: string = '';
  numberOfElements: number = 0; //? No se usa Actualmente numero de elementos por pagina
  searchSubject: Subject<string> = new Subject<string>();
  selectedField: string = 'email';

  onSearch(event: KeyboardEvent) {
    this.searchSubject.next((event.target as HTMLInputElement).value); // Emitir el valor de búsqueda
  }

  // Obtener el filtro de búsqueda
  get searchFilter(): string {
    if (this.searchText) {
      return `&${this.selectedField}=${this.searchText}`;
    }
    return '';
  }

  get url(): string {
    return `${this.page}?pageSize=${this.pageSize}&sortBy=${this.sortBy}&direction=${this.direction}${this.searchFilter}`;
  }

  getUsers(){
    console.log("URL: ",this.url);
    this.adminService.getUsers(this.url).subscribe(
      {
        next: (res: UsuarioPageable) => {
          //Datos de la tabla
          this.userList = res.content;
          //Datos de paginacion
          this.page = res.pageable.pageNumber;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.numberOfElements = res.numberOfElements;

          //Array de paginas
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i);

          //Obteniendo las keys de los objetos
          if (this.userList.length > 0) {
            const usuarioKeysDynamic = Object.keys(this.userList[0]) as (keyof Usuario)[];
            this.keysUser = usuarioKeysDynamic ? usuarioKeysDynamic : [];
          } else {
            this.keysUser = ['None'];
          }
        },
        error: (err: any) => {
          this.alertToast.showToast('error', err.error.errors[0].error);
        }
      }
    );
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getUsers(); // Llama al método de búsqueda cuando el usuario deja de escribir
    });

    this.getUsers();
  }

  // Métodos para manejar los cambios en las opciones seleccionadas
  onPageSizeChange(value: string) {
    this.pageSize = parseInt(value, 10);
    this.getUsers();
  }

  onSortByChange(value: string) {
    this.sortBy = value;
    this.getUsers();
  }

  onDirectionChange(value: string) {
    this.direction = value.toLowerCase();
    this.getUsers();
  }

   // Métodos de paginación
  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.getUsers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.getUsers();
    }
  }

  goToPage(page: number) {
    this.page = page;
    this.getUsers();
  }
}
