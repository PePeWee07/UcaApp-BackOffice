import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from '../../models/Usuario';
import { MnDropdownComponent } from '../../component/dropdown';
import { Roles } from '../../models/roles_permissions/Roles';
import { Permissions } from '../../models/roles_permissions/Permissions';
import { RolesPermissionsService } from '../../core/services/rolesPermissions/role-permissions.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, icons } from 'lucide-angular';
import { NavModule } from '../../component/tab/tab.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionList } from '../../models/UserProfile';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { DashboardService } from '../../core/services/component/dashboard.service';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';


@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [LucideAngularModule, NavModule, CommonModule, ReactiveFormsModule, FormsModule, MnDropdownComponent, TranslateModule],
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}, LanguageService]
})
export class RolesPermissionsComponent {
  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService,
    private rolesPrermissionsService: RolesPermissionsService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    @Inject(AlertToastService) private alertToastService: AlertToastService,
    public translate: TranslateService
  ){ translate.setDefaultLang('en'); }

  // parametros para la informacion del usuario
  id: number | undefined = undefined;
  user: Usuario | null = null;
  User: { key: string; value: any; }[] = [];
  userPermissions: PermissionList[] | null | undefined = [];

  // parametros para la lista de roles
  roles: Roles | any = [];
  selectedRole: { id: number; name: string; permissionList: any}| null = null;

  // parametros para cambiar o crear un rol o permiso
  newRole: string = '';
  newPermissions: string[] = [];
  permissionInput: string = '';
  permissionList: string[] = [];
  selectedRoles: number[] = [];
  selectedPermissions: number[] = [];

  // parametros para la lista de permisos
  permissions: Permissions | any = [];
  permissionsLen: number | null = null;

  menuItems: { path: string; label: string; roles?: string[] }[] = [];

  showUpdateRoleTab: boolean = false;

  // parametros para actualizar la informacion del usuario
  roleForm = this.formBuilder.group({
    rolesId: [[]] 
    }
  );

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // Obtener los parametros de la ruta
      this.id = params['id'];   
      if(this.id != undefined){
        this.getUser(this.id)
      }
        this.getRoles()
        this.getPermissions()
        this.getMenus()

    });
  }
  // Verificar si el usuario tiene los permisos necessarios
  withPermissions(permissions: string[]): boolean{
    return this.authService.includesPermission(permissions);
  }
  // Obtener los menus 
  getMenus(){
    this.menuItems = this.dashboardService.getDashboardMenu()
  }
  // Obtener informacion del usuario
  getUser(id: number){
    this.rolesPrermissionsService.getUser(id).subscribe({
      next: (user) => {
        this.user = user!
        console.log(this.user)
        // Obtener la informacion en keys values
        this.User = Object.entries(this.user ?? {}).filter(([key,_]) => 
          key !== 'name' &&
          key !== 'lastName' &&
          key !== 'enabled' &&
          key != 'accountNonExpired' &&
          key != 'accountNonLocked' &&
          key != 'accountExpiryDate' &&
          key != 'credentialsNonExpired' &&
          key != 'roles' &&
          key != 'authorities' 
        ).map(([key, value]) => ({
          key: key === 'phoneNumber' ? 'phone number' : key,
          value: value
        }))

      },error: (err) => {
        console.log('Error al obtener informacion del usuario: ', err);
      },
    })
  }
  // Obtener lista de roles
  getRoles(){
    this.rolesPrermissionsService.getRoles().subscribe({
      next: (roles: Roles) => {
        this.roles = roles;
        console.log(this.roles)
      },error: (err) => {
        console.log('Error al obtener la lista de roles: ', err);
      },
    })
  }
  // Obtener lista de permisos
  getPermissions(){
    this.rolesPrermissionsService.getPermissions().subscribe({
      next: (permissions: PermissionList) => {
        this.permissions = permissions
        this.permissionsLen = this.permissions.at(-1).id
        console.log(this.permissions)
      },error: (err) => {
        console.log('Error al obtener la lista de permisos: ', err);
      },
    })
  }
  
  // HTML dynamico para cambiar el color en base al permiso
  getPermissionBadge(permission: string): SafeHtml{
      let badge = ``;
      switch(permission){
        case 'DELETE':
          badge = `<p class=" text-sm dark:text-zink-200 border border-red-200 bg-red-100 text-red-500 dark:bg-red-500/20 w-fit text-center px-3 my-1 rounded-full"> ${permission} </p>`
          break;
        case 'UPDATE': 
          badge =`<p class=" text-sm dark:text-zink-200 border border-yellow-200 bg-yellow-100 text-yellow-500 dark:bg-yellow-500/20 w-fit text-center px-3 my-1 rounded-full"> ${permission}</p>`
        break;
        case 'READ': 
          badge = `<p class="text-sm dark:text-zink-200 border border-sky-200 bg-sky-100 text-sky-500 dark:bg-sky-500/20 w-fit text-center px-3 my-1 rounded-full">${permission}</p>`
        break;
        case 'WRITE': 
          badge = `<p class="text-sm dark:text-zink-200 border border-green-200 bg-green-100 text-green-500 dark:bg-green-500/20 w-fit text-center px-3 my-1 rounded-full">${permission}</p>`
        break;
        case 'CREATE': 
          badge = `<p class="text-sm dark:text-zink-200 border border-purple-200 bg-purple-100 text-purple-500 dark:bg-purple-500/20 w-fit text-center px-3 my-1 rounded-full">${permission} </p>`
        break;
        default:
          badge = `<p class="text-sm dark:text-zink-200 border border-slate-200 bg-slate-100 text-slate-500 dark:bg-purple-500/20 w-fit text-center px-3 my-1 rounded-full">${permission} </p>`
          break;
      }
      return this.sanitizer.bypassSecurityTrustHtml(badge);
  }

  // Metodo para detectar cuando se selecciona un permiso
  onPermissionCheckboxChange(event: Event, name: string, id: number, selectedList: number[]) {
    let checked = (event.target as HTMLInputElement).checked;
    console.log((event.target as HTMLInputElement).checked)

    if (checked) {
      if (!selectedList.includes(id)) {
        selectedList.push(id);
        this.newPermissions.push(name)
      }
    } else {
      const idIndex = selectedList.indexOf(id);
      const nameIndex = this.newPermissions.indexOf(name);
        if (idIndex > -1 && nameIndex > -1) {
          selectedList.splice(idIndex, 1); // Remove the unchecked item
          this.newPermissions.splice(nameIndex, 1)
        }
    }
  }
  // Metodo para detectar cuando se selecciona un rol
  onRoleCheckboxChange(event: Event, name: string, id: number, selectedList: number[]) {
      console.log('change fired')
      let checked = (event.target as HTMLInputElement).checked;
      console.log((event.target as HTMLInputElement).checked)

      if (checked) {
        if (!selectedList.includes(id)) {
          selectedList.push(id);
        }
      } else {
        const idIndex = selectedList.indexOf(id);
          if (idIndex > -1) {
            selectedList.splice(idIndex, 1); // Remove the unchecked item
          }
      }
  }


  // Metodo para actulizar los roles del usuario
  updateUserRole(userId: number) {
    console.log('change fired')
    console.log('Selected Role IDs:', this.selectedRoles);
    const body = {
      "enabled": true,
      "accountNonExpired": true,
      "accountNonLocked": true,
      "credentialsNonExpired": true,
      "rolesIds": this.selectedRoles
    }
    console.log(body)
    console.log(this.newPermissions)
    this.rolesPrermissionsService.editUser(userId, body).subscribe({
        next: (data) => {
          console.log('Actualizacion Exitosa: ', body, data)
          this.getUser(userId);
        },
          error: (err) => {
          console.error('Error al cambiar el estado del usuario:', err);
        }
      })
  }

  // Metodo para añadir un nuevo rol
  addRole(name: any): any {
    const trimmed = name.trim().toUpperCase();
    let body: any;
    if (trimmed && !this.roles.includes(trimmed)) {
      body = {
        "id": this.roles.at(-1).id!+1,
        "name": trimmed,
        "permissionsIds": this.selectedPermissions
      }     
    }
    console.log(body)
    this.rolesPrermissionsService.createRole(body).subscribe({
        next: (data) => {
          console.log('Actualizacion Exitosa: ', body, data)
          this.alertToastService.showToast('success', 'New Role Added', 1500);
          this.getRoles();
        },
          error: (err) => {
          console.error('Error al crear nuevo rol:', err);
        }
      })
    this.newRole = '';
    return body;
  }

  // Metodo para elimianr un rol
  deleteRol(id: number){
    this.rolesPrermissionsService.deleteRole(id).subscribe({
      next: (data) => {
        console.log('Rol Eliminado: ', data)
        this.alertToastService.showToast('success', 'Role Deleted', 1500);
        this.getRoles();
      },
        error: (err) => {
        console.error('Error al elimiar rol:', err);
      }
    })
  }

  // Metodo para actualizr los permissos de un rol
  updateRole(roleId: number){
    console.log(this.selectedRole)
    let body = {
        "permissionsIds": this.selectedPermissions
    }  
    
    this.rolesPrermissionsService.updateRole(roleId, body).subscribe({
      next: (data) => {
        console.log('Rol Actualizado: ', data)
        this.alertToastService.showToast('success', 'Role Updated', 1500);
        this.getRoles();
      },
        error: (err) => {
        console.error('Error al actulizar el rol:', err);
      }
    })
    this.showUpdateRoleTab = false;
    this.selectedRole = null

  }

  // Metodo para crear un nuevo permiso
  addPermission(name: any): void {
    const trimmed = name.trim().toUpperCase();
    let body: any;
    if (trimmed && !this.permissionList.includes(trimmed)) {
      body = {
        "id": this.permissionsLen!+1,
        "name": trimmed
      }     
    }
      console.log(body)
      this.rolesPrermissionsService.createPermission(body).subscribe({
        next: (data) => {
          console.log('Actualizacion Exitosa: ', body, data)
          this.alertToastService.showToast('success', 'Role Created', 1500);
          this.getPermissions();
        },
          error: (err) => {
          console.error('Error al crear nuevo permiso:', err);
        }
      })
    this.permissionInput = '';
  }

  onEnterPress(event: any) {
    event.preventDefault(); // stop it from submitting the main form
    this.addPermission(this.permissionInput);
  }


  // Detalles de las funciones que tiene cada pagina y los permisos necessarioss
  pages = [
  {
    menu: 'Profile',
    functions: [
      { name: 'Update names', permissions: ['READ']  },
      { name: 'Update address', permissions: ['READ']  },
      { name: 'Update email', permissions: ['READ']  },
      { name: 'Update password', permissions: ['READ']  },
      { name: 'Update identificacion', permissions: ['UPDATE', 'READ'] },
    ]
  },
  {
    menu: 'User List',
    functions: [
      { name: 'View list', permissions: ['READ'] },
      { name: 'Filter list', permissions: ['READ'] },
      { name: 'Search User', permissions: ['READ'] },
      { name: 'Edit user roles/permissions', permissions: ['UPDATE', 'READ'] }
    ]
  },
  {
    menu: 'Audit Logs',
    functions: [
      { name: 'View logs', permissions: ['READ'] },
      { name: 'Search on list', permissions: ['READ'] },
      { name: 'View log details', permissions: ['READ'] }
    ]
  },
  {
    menu: 'Roles & Permissions',
    functions: [
      { name: 'View Menus with Roles', permissions: ['READ'] },
      { name: 'Change User Information', permissions: ['READ'] },
      { name: 'Update a Role', permissions: ['UPDATE'] },
      { name: 'Update User Role', permissions: ['UPDATE'] },
      { name: 'Create new roles', permissions: ['CREATE'] },
      { name: 'Create new permissions', permissions: ['CREATE'] },
      { name: 'Delete a role', permissions: ['DELETE'] }
    ]
  },
  {
    menu: 'Chat History',
    functions: [
      { name: 'View recent users', permissions: ['READ'] },
      { name: 'Filter chat messages', permissions: ['READ'] }
    ]
  },
  {
    menu: 'Chat User List',
    functions: [
      { name: 'View list', permissions: ['READ'] },
      { name: 'Filter list', permissions: ['READ'] },
      { name: 'Block/Unblock user', permissions: ['UPDATE', 'DELETE'] },
      { name: 'Open Chat sessions', permissions: ['READ'] }
    ]
  }
  ];  

  selected(selected: string){
    let count = -1;
    this.pages.forEach((page) =>
      { count = count+1;
        if (selected == page.menu){
          this.selectedPage = this.pages[count]
        }
      }
    )

  }
  selectedPage = this.pages[0]; // default to first page


}
