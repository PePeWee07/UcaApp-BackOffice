import { Component, Inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserAdminService } from '../../core/services/user-admin/user-admin.service';
import { Role, Usuario } from '../../models/Usuario';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { UsuarioPageable } from '../../models/UsuarioPageable';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { TooltipModule, TooltipOptions } from 'ng2-tooltip-directive';
import { CommonModule } from '@angular/common';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, icons } from 'lucide-angular';
// import { MnDropdownComponent } from '../../component/dropdown';

@Component({
  selector: 'app-user-tables',
  standalone: true,
  imports: [ FormsModule, TooltipModule, CommonModule, LucideAngularModule ],
  templateUrl: './user-tables.component.html',
  styleUrl: './user-tables.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}]
})
export class UserTablesComponent {

  constructor(
    private adminService: UserAdminService,
    private sanitizer: DomSanitizer, // dar permiso HTML ( this.sanitizer.bypassSecurityTrustHtml)
    @Inject(AlertToastService) private alertToast: AlertToastService
  ) {}

  userList: Usuario[] = [];
  keysUser: string[] = [];

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

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getUsers(); // Llama al método de búsqueda cuando el usuario deja de escribir
    });

    this.getUsers();
  }

  // Obtener el filtro de búsqueda
  get searchFilter(): string {
    if (this.searchText) {
      return `&${this.selectedField}=${this.searchText}`;
    }
    return '';
  }

  // Función para buscar en la tabla
  onSearch(event: KeyboardEvent) {
    this.searchSubject.next((event.target as HTMLInputElement).value); // Emitir el valor de búsqueda
  }

  // Obtener la URL de la petición
  get url(): string {
    return `${this.page}?pageSize=${this.pageSize}&sortBy=${this.sortBy}&direction=${this.direction}${this.searchFilter}`;
  }

  // Obtener los usuarios
  getUsers(){
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
            const usuarioKeysDynamic = Object.keys(this.userList[0])
              .filter((key: string) =>
                key !== 'authorities' &&
                key !== 'accountNonExpired' &&
                key !== 'accountNonLocked' &&
                key !== 'credentialsNonExpired' &&
                key !== 'username'
              )
              .map((key: string) =>
                key === 'enabled' ? 'Account Status' : key &&
                key === 'accountExpiryDate' ? 'Account Expiry Date' : key &&
                key === 'phoneNumber' ? 'Phone Number' : key &&
                key === 'lastName' ? 'Last Name' : key
              ) as (keyof Usuario)[];
            this.keysUser = usuarioKeysDynamic ? usuarioKeysDynamic : ['None'];
          } else {
            this.keysUser = ['None'];
          }
        },
        error: (err: any) => {
          this.alertToast.showToast('error', err.error.errors[0].error, 3000);
        }
      }
    );
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

  //ToolOption Account Status
  toolOptionAccountStatus: TooltipOptions = {
    hideDelayTouchscreen: 2000,  // Retraso para esconder en móviles
    display: true,               // Retraso para escritorio
    placement: 'left',           // Posición del tooltip
    showDelay: 300,              // Retraso para mostrar el tooltip
    theme: "light",              // Tema del tooltip
    hideDelay: 500,              // Retraso para esconder el tooltip
  }

  // HTML dinámico para mostrar los estados de la cuenta en el tooltip
  getDynamicTooltipAccount(enabled: boolean, accountNonExpired: boolean, accountNonLocked: boolean, credentialsNonExpired: boolean): any {
    var html =`
      <div>
        <h6 class="text-center"> Account Status </h6>
        <div class="grid grid-cols-1 gap-2 place-content-center">
          <span class="px-2.5 py-0.5 inline-block text-xs font-medium rounded border border-transparent ${this.getColorClassAccountStatus(enabled)} dark:border-transparent">
            <div class="flex">
              <div class="flex-none w-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#050505" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div class="flex-1">
                ${this.getAccountStatusEnabled(enabled)}
              </div>
            </div>
          </span>
          <span class="px-2.5 py-0.5 inline-block text-xs font-medium rounded border border-transparent ${this.getColorClassAccountStatus(accountNonExpired)} dark:border-transparent">
            <div class="flex">
              <div class="flex-none w-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#050505" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              </div>
              <div class="flex-1">
                ${this.getAccountStatusExpired(accountNonExpired)}
              </div>
            </div>
          </span>
          <span class="px-2.5 py-0.5 inline-block text-xs font-medium rounded border border-transparent ${this.getColorClassAccountStatus(accountNonLocked)} dark:border-transparent">
            <div class="flex">
              <div class="flex-none w-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#050505" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-ban"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m4.243 5.21 14.39 12.472"/></svg>
              </div>
              <div class="flex-1">
                ${this.getAccountStatusLocked(accountNonLocked)}
              </div>
            </div>
          </span>
          <span class="px-2.5 py-0.5 inline-block text-xs font-medium rounded border border-transparent ${this.getColorClassAccountStatus(credentialsNonExpired)} dark:border-transparent">
            <div class="flex">
              <div class="flex-none w-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#050505" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-x"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m14.5 9.5-5 5"/><path d="m9.5 9.5 5 5"/></svg>
              </div>
              <div class="flex-1">
                ${this.getCredentialStatusExpired(credentialsNonExpired)}
              </div>
            </div>
          </span>
        </div>
      </div>
    `;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getColorClassAccountStatus(accountStatus: boolean): string {
    return accountStatus ? 'bg-green-100 text-green-500 dark:bg-green-500/20' : 'bg-red-100 text-red-500 dark:bg-red-500/20';
  }

  getColorAccountStatusBadges(accountStatus: boolean): string {
    return accountStatus ? 'text-green-500 bg-green-100 border border-transparent rounded-full dark:bg-green-500/20 dark:border-transparent' : 'text-red-500 bg-red-500 border-transparent rounded-full dark:bg-red-500/20 dark:border-transparent';
  }

  getAccountStatus(enabled: boolean): string {
    if (!enabled) {
      return 'Disabled';
    }
    return 'Enabled';
  }

  getAccountStatusEnabled(enabled: boolean): string {
    return enabled ? 'Account Enabled' : 'Account Disabled';
  }

  getAccountStatusExpired(accountStatus: boolean): string {
    return accountStatus ? 'Account Non Expired' : 'Account Expired';
  }

  getAccountStatusLocked(accountStatus: boolean): string {
    return accountStatus ? 'Account Non Locked' : 'Account Locked';
  }

  getCredentialStatusExpired(accountStatus: boolean): string {
    return accountStatus ? 'Credentials Non Expired' : 'Credentials Expired';
  }

  //ToolOption Role
  toolOptionRole: TooltipOptions = {
    hideDelayTouchscreen: 2000,  // Retraso para esconder en móviles
    display: true,               // Retraso para escritorio
    placement: 'right',          // Posición del tooltip
    showDelay: 300,              // Retraso para mostrar el tooltip
    theme: "light",              // Tema del tooltip
    hideDelay: 500,              // Retraso para esconder el tooltip
  };

  // HTML dinámico para mostrar los roles en el tooltip
  getDynamicTooltipRole(roleName: Role[]): string {
    let roleList = '';
    roleName.forEach(roles => {
      const permissionsFormatted = roles.permissionList.map(permission => {
        const colorClass = this.getColorClassPermission(permission.name);
        return `<span class="px-2.5 py-0.5 inline-block text-xs font-medium rounded border border-transparent ${colorClass} dark:border-transparent"> ${permission.name} </span>`;
      }).join(' ');

      roleList += `
        <div>
          <h6 class="text-center"> Permission list of <strong>${roles.name}:</strong> </h6>
          <div class="grid grid-cols-1 gap-2 place-content-center">
            ${permissionsFormatted}
          </div>
        </div>
      `;
    });
    return roleList;
  }

  // Función para obtener las clases de color basadas en el permiso
  getColorClassPermission(permission: string): string {
    const colors: { [key: string]: string } = {
      DELETE: 'bg-red-100 text-red-500 dark:bg-red-500/20',
      UPDATE: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-500/20',
      READ: 'bg-sky-100 text-sky-500 dark:bg-sky-500/20',
      WRITE: 'bg-green-100 text-green-500 dark:bg-green-500/20',
      CREATE: 'bg-purple-100 text-purple-500 dark:bg-purple-500/20',
    };
    return colors[permission.toUpperCase()] || 'bg-slate-100 text-slate-500 dark:bg-slate-500/20';
  }

  // Método para mapear los nombres de roles a clases CSS
  getRoleClass(roleName: string): string {
    switch (roleName) {
      case 'ADMIN':
        return 'border-red-400 text-red-500 dark:border-red-700';
      case 'USER':
        return 'border-blue-400 text-blue-500 dark:border-blue-700';
      case 'Manager':
        return 'border-orange-400 text-orange-500 dark:border-orange-700';
      case 'Support':
        return 'border-green-400 text-green-500 dark:border-green-700';
      case 'Custom':
        return 'border-purple-400 text-purple-500 dark:border-purple-700';
      default:
        return 'border-gray-400 text-gray-500 dark:border-gray-700'; // Clases por defecto
    }
  }
}
