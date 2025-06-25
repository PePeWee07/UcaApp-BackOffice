import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, icons } from 'lucide-angular';
import { UserListService} from '../../core/services/virtualAssistant/userlist.service';
import { Content, WhatsAppUserList } from '../../models/models_assistantVirtual/WhatsAppUserList';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserTicket } from '../../models/models_assistantVirtual/WhatsAppUser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'whatsapp-user-tables',
  standalone: true,
  imports: [ FormsModule, CommonModule, LucideAngularModule, RouterLink, TranslateModule],
  templateUrl: './wa-user-tables.component.html',
  styleUrl: './wa-user-tables.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}, LanguageService]
})
export class WhatsAppUserTablesComponent implements OnInit {
  constructor(
    private WhatsAppUserListService: UserListService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    @Inject(AlertToastService) private alertToast: AlertToastService,
    public translate: TranslateService,
  ) { translate.setDefaultLang('en'); }

  // Parametros para la tabla de usuarios
  userList: Content[] = [];
  userKeys: string[] = [];
  tableKeys: string[] = [];
  chatSessionKeys: string[] = [];

  // userTickets: ({ key: string; value: unknown; })[] = [];
  userTickets: UserTicket[] = [];
  selectedTicket: number | null = null;
  openTickets: number | null = null;

  // Parametros para la informacion de un usuario
  selectedUser: number | null = null;
  userId: number | null = null;
  erpUserKeys: string[] = [];
  erpUserInfo: any[] = [];
  selectedRol: number = -1;
  rolKeys: any[] = [];

  // Parametros para la paginacion
  page: number = 0;
  pageSize: number =  5;
  totalPages: number = 1;
  searchText: string = '';
  direction: string = 'asc'
  sortBy: string = 'id';
  selectedField: string = 'whatsappPhone';
  searchSubject: Subject<string> = new Subject<string>();
  totalElements: number = 0;
  pagesArray: number[] = [];
  userNotFound: boolean = false;

  // Parametros para los chat sessions
  selectedSession: any | null = 'All';
  sessionStart: Date = new Date();
  sessionEnd: Date = new Date();
  openSessions: number | null = null;

  
  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.searchUser(this.selectedField);   
    });

    this.getWhatsAppUsers();
  }

  // verificar si el usuario tiene los permisos necesarios
  withPermissions(permissions: string[]): boolean{
    return this.authService.includesPermission(permissions);
  }
  
  // Obtener la URL de la petición
  get url(): string {
    return `${this.page}?pageSize=${this.pageSize}&sortBy=${this.sortBy}&direction=${this.direction}`;
  }
 
  // Metodo para buscar en la tabla
  onSearch(event: KeyboardEvent) {
    this.searchText = (event.target as HTMLInputElement).value.trim()
    
    if (this.searchText) {
      this.WhatsAppUserListService.getUserInfo(this.selectedField, this.searchText);
    } else {
      this.getWhatsAppUsers();
    }
  }

  // Metodo para buscar a un usuario 
  searchUser(field: string): void {
  this.WhatsAppUserListService.getUserInfo(field, this.searchText).subscribe({
    next: (res) => {
      if (!res) {
        this.userNotFound = true;
        this.userList = [];
        this.userKeys = ['None'];
        return;
      }

      this.userList = [res];
      this.totalPages = 1;
      this.page;
      this.pagesArray = [0];

    },
    error: (err) => {
      console.error('Error al buscar el usuario:', err);
      this.alertToast.showToast('error', err.error.errors[0].error, 3000);
      this.userList = [];
      this.userKeys = ['None'];
    }
    });
  }

  // Obtener los usuarios
  getWhatsAppUsers(){
    this.WhatsAppUserListService.getWhatsAppUsers(this.url).subscribe({
      next: (res: WhatsAppUserList) => {
        this.userList = res.content ?? [];
        this.page = res.page?.number ?? 0;
        this.totalElements = res.page?.totalElements ?? 0;
        this.totalPages = res.page?.totalPages ?? 0;
        this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i); // Array de paginas
        console.log(this.userList)

        const allowedKeys = [ 
          'id', 
          'nombres','apellidos',
          'identificacion',
          'whatsappPhone', 
          'conversationState',
          'block', 
          'blockingReason', 
          'emailInstitucional',
        ];

        const firstValidErpUser = this.userList.find(u => u.erpUser)?.erpUser;
        if (firstValidErpUser) {
          this.erpUserKeys = Object.keys(firstValidErpUser);
        } else {
          this.erpUserKeys = allowedKeys;
        }

        // Obtener los keys para los chat sessions
        const allChatSessionKeys = new Set<string>();
        this.userList.forEach(user => {
          user.chatSessions?.forEach(session => {
            Object.keys(session).map((key:string) =>
              key === 'startTime' ? 'Start Time' : key &&
              key === 'endTime' ? 'End Time' : key
            ).forEach(key => allChatSessionKeys.add(key.toUpperCase()));
          });
        });
        this.chatSessionKeys = Array.from(allChatSessionKeys);

        // Obtener todos los keys
        this.userKeys = Object.keys(this.userList[0])
        .filter((key: string) =>
            key !== 'chatSessions' && key !== 'erpUser'
        ) as (keyof Content)[];
    
        // Obtener los keys que se veran en la tabla  
        this.tableKeys = [...this.userKeys, ...this.erpUserKeys]        
        this.tableKeys = allowedKeys.filter((key) =>
          this.tableKeys.includes(key))
        .map((key: string) =>
            key === 'whatsappPhone' ? 'Phone Number': key &&
            key === 'conversationState' ? 'Conversation State' : key &&
            key === 'blockingReason' ? 'Blocking Reason' : key &&
            key === 'nombres' ? 'Name' : key &&
            key === 'apellidos' ? 'Last Name' : key &&
            key === 'identificacion' ? 'Identification' : key &&
            key === 'emailInstitucional' ? 'Email': key
        )

        // Obtener los keys para los roles
        this.userList[0].erpUser?.rolesUsuario?.forEach( rol =>
          rol.detallesRol?.forEach(detalle =>
            this.rolKeys.push(detalle)
          )
        )
        this.rolKeys = Object.keys(this.rolKeys[0])
        .map((key: string) =>
          key === 'nombreCarrera' ? 'Carrera': key &&
          key === 'unidadAcademica' ? 'Unidad Academica': key &&
          key === 'unidadOrganizativa' ? 'Unidad Organizativa': key &&
          key === 'nombreRol' ? 'Nombre Rol' : key
        )

        },
        error: (err) => {
          console.log('Error al enocntrar la lista de usuarios', err);
        },
    });
  }


  // Metodo para desplegar mas informacion del usuario
  toggleUser(userId: number){
    if(this.withPermissions(['READ'])){
      this.selectedUser = this.selectedUser === userId ? null : userId;
    }
  }

  // Metodo para desplegar los chat sessions
  toggleSessions(userId: number){
    this.openSessions = this.openSessions === userId ? null : userId
  }

  // Metodo para seleccionar un chat session
  getSession(sessionId: number, start: Date, end: Date){
    this.selectedSession = this.selectedSession === sessionId ? 'All' : sessionId
    this.sessionStart = start;
    this.sessionEnd = end;
  }

  // Metodo para ver los detalles de rol
  openRole(index: number){
    this.selectedRol = this.selectedRol === index ? -1 : index;
  }

  toggleTickets(userId: number) {
    this.openTickets = this.openTickets === userId ? null : userId;
  }

  onSortByChange(value: string) {
    this.sortBy = value;
    this.getWhatsAppUsers();
  }

  // Métodos para manejar los cambios en las opciones seleccionadas
  onPageSizeChange(value: string) {
    this.pageSize = parseInt(value, 10);
    this.getWhatsAppUsers();
  }

  // Cambiar la lista de ascendiente o descendiente
  onDirectionChange(value: string) {
    // this.userList.reverse()
      this.direction = value.toLowerCase();
      this.getWhatsAppUsers();
  }

  //Metodo para ir a la pagina anterior 
  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.getWhatsAppUsers();
    }
  }

  // Metodo para ir a la siguiente pagina
  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.getWhatsAppUsers();
    }
  }

  // Metodo para ir a una pagina especifca
  goToPage(page: number) {
    this.page = page;
    this.getWhatsAppUsers();
  }

  // Metodo para bloquear o desbloquear a un usuario
  changeUserStatus(userId: any){
    const isBlocked = !userId.block;
    let limitStrike = userId.limitStrike; 
    let blockingReason = userId.blockingReason;

    if(isBlocked == false){
      limitStrike = 3;
      blockingReason = "";
    }else{
      limitStrike = 0;
      blockingReason = 'Bloqueado por Admin';
    }
    const body = {
      "limitStrike": limitStrike,
      "block": isBlocked,
      "blockingReason": blockingReason,

    };

    this.WhatsAppUserListService.changeUserStatus(userId.id, body).subscribe({
      next: (data) => {
        userId.block = isBlocked;
        userId.blockingReason = body.blockingReason;
        userId.limitStrike = body.limitStrike;
        console.log('Actualizacion Exitosa: ', body)
      },
      error: (err) => {
        console.error('Error al cambiar el estado del usuario:', err);
      }
        });
  }

  getConversationState(state: string): SafeHtml{
    let badge = ``;
    switch(state){
      case 'READY':
        badge= `<div 
                      class="flex items-center px-2.5 py-1 text-xs font-medium rounded-l rounded-r bg-green-100 border-transparent text-green-500 dark:bg-custom-500/20 dark:border-transparent">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check mr-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                      ${ state }
                </div>`
        break;
      case 'ASKED_FOR_CEDULA':
      badge = `<div  
                  class="flex items-center px-2.5 py-1 text-xs font-medium rounded-l rounded-r  bg-orange-100 border-transparent text-orange-500 dark:bg-custom-500/20 dark:border-transparent">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 lucide lucide-loader-icon lucide-loader"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                      ${ state }
                </div>`
        break;
      default:
        badge = `
          <div  class="flex items-center px-2.5 py-1 text-xs font-medium rounded-l rounded-r  bg-slate-100 border-transparent text-gray-500 dark:bg-custom-500/20 dark:border-transparent">
                      ${ state }
                </div>
        `
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(badge);
  }

}