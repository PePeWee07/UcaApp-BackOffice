import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SimplebarAngularModule } from 'simplebar-angular';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { CommonModule } from '@angular/common';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, Trash, icons } from 'lucide-angular';
import { ChatHistoryService } from '../../core/services/virtualAssistant/chatHistory.service';
import { ChatAssistenteVirtual, History } from '../../models/chatAssistenteVirtual';
import { WhatsAppUser,ERPUser, RolesUsuario } from '../../models/models_assistantVirtual/WhatsAppUser';
import { UserListService } from '../../core/services/virtualAssistant/userlist.service';
import { WhatsAppUserList, Content } from '../../models/models_assistantVirtual/WhatsAppUserList';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, SimplebarAngularModule, LucideAngularModule, FormsModule, TranslateModule],
  templateUrl: './chat-history.component.html',
  styleUrl: './chat-history.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}, LanguageService]
})
export class ChatHistoryComponent{
  constructor(
    private chatHistoryService: ChatHistoryService,
    private userListService: UserListService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sanitizer: DomSanitizer, 
    @Inject(AlertToastService) private alertToast: AlertToastService,
    public translate: TranslateService
    ) { translate.setDefaultLang('en'); }

    // parametros para obtener la lista de usuarios
    filteredUsers: Content[] = [];
    isSelected: string = '';
    page: number = 0;
    pageSize: number = 5;
    totalPages: number = 1;
    totalElements: number = 0;
    pagesArray: number[] = [];
    searchText: string = '';
    searchFilter: string = 'whatsappPhone'

    // parametros para obtener la informacion del usuario
    userInfo: WhatsAppUser | null = null;
    userKeys: string[] = [];
    identificacion:  string = '';
    threadId: string = '';
    erpUserInfo: any | null = null;
    erpUsers: any[] = [];
    erpUserKeys: string[] = [];

    // parametros para filtrar los usuarios
    today: any = new Date();
    startDate: string = '';
    endDate: string = '';
    listStartDate?: string = '';
    listEndDate?:string = '';
    listFilter: boolean = false;
    listFilterLabel: string = 'Filter';
    listSearchFilter: string = 'LastInteraction'

    // parametros para obtener la informacion del chat
    chatHistory: History [] = [];
    keysChat: string[] = [];
    chatLabel: string = 'All Chat Messages';
    chatType: number = 2; // 0 = Today, 1 = Session, 2 = Filtered, default/3 = All
    hasHistory: boolean = true;

    // parametros para filtrar el chat
    chatFilterLabel: string = 'Filter Messages';
    chatStartDate?: string = '';
    chatEndDate?: string = '';
    chatFilter: boolean = false;

    ngOnInit(): void {
    this.route.params.subscribe(params => {
      // Obtener los parametros de la ruta
      this.identificacion = params['identificacion'];  
      let phone = params['phoneNumber']; 
      this.startDate = params['startDate'];
      this.endDate = params['endDate'];

      if(this.identificacion == 'Anonymus' || this.identificacion == 'null'){
        this.hasHistory = false;
        this.getUserInfo('whatsappPhone', phone)
      }else if(this.identificacion != undefined){
        this.searchText = this.identificacion;
        this.searchFilter = 'identificacion'
        this.searchUser('identificacion')

        if(this.startDate && this.endDate){
          this.chatType = 1;
          this.getUserInfo('identificacion', this.identificacion, this.startDate, this.endDate);
        }else{
          this.getUserInfo('identificacion', this.identificacion)
        }
      }else{
        this.getTodaysUsers();
      }

    });
    }

    // verificar si el usuario tiene el rol especificado
    withPermissions(permissions: string[]): boolean{
      return this.authService.includesPermission(permissions);
    }

    // Metodo para obtener la fecha de hoy
    getToday(): string {
      return this.today.toISOString().split('T')[0]
    }
  
    // Obtener la URL de la petición
    get url(): string {
      return `${this.page}/by${this.listSearchFilter}?startDate=${this.startDate}&endDate=${this.endDate}&pageSize=${this.pageSize}`;
    }

    // Metodo para buscar en la lista 
    onSearch(event: KeyboardEvent) {
      this.searchText = (event.target as HTMLInputElement).value.trim();
      
      if (this.searchText) {
        this.chatHistoryService.getUserInfo(this.searchFilter, this.searchText);
      } else {
        this.getTodaysUsers();
      }
    }

    // Metodo para encontrar la informacion de un usuario
    searchUser(field: string): void {
    this.chatHistoryService.getUserInfo(field, this.searchText).subscribe({
      next: (res) => {
        if (!res) {
          this.filteredUsers = [];
          this.userKeys = ['None'];
          return;
        }

        this.filteredUsers = [res];
        this.page;
        this.totalPages = 1;
        this.pagesArray = [0];
        this.totalElements = this.filteredUsers.length;
        this.filteredUsers.forEach(user =>
          this.erpUsers?.push(user.erpUser)
        )

        // Obtener los keys del usuario
        const allowedKeys = ['whatsappPhone', 'identificacion', 'threadId'];
        this.userKeys = Object.keys(this.filteredUsers[0])
        .filter((key: string) =>
          allowedKeys.includes(key)
        ).map((key: string) => 
          key === 'whatsappPhone' ? 'Phone Number' : key && key === 'identificacion' ? 'Identification' : key
        )
        
        this.erpUserKeys = Object.keys(this.erpUsers[0])
        .filter((key: string) =>
          allowedKeys.includes(key)
        )
      },
      error: (err) => {
        console.error('Error al buscar el usuario:', err);
        this.alertToast.showToast('error', err.error.errors[0].error, 3000);
        this.filteredUsers = [];
        this.userKeys = ['None'];
      }
    });
    }

    // Metodo para obtener a los usuarios dentro de un rango de fechas
    getDatedUsers(startDate: Date, endDate: Date){
    this.startDate = startDate.toISOString()
    this.endDate = endDate.toISOString()
    this.chatFilterLabel = 'Filter Messages';

    this.userListService.getDatedUsers(this.url).subscribe({
      next: (users: WhatsAppUserList) => {
        if(!users || users.content?.length == 0){
          this.filteredUsers = [];
          return; 
        }
        this.filteredUsers = users.content ?? [];
        this.page = users.page?.number ?? 0;
        this.pageSize = users.page?.size  ?? 5;
        this.totalPages = users.page?.totalPages ?? 0;
        this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i);
        console.log('Filtered Users: ', this.filteredUsers)

        // Obtener la informacion dentro del objeto erpUser
        this.filteredUsers.forEach(user =>
          this.erpUsers.push(user.erpUser)
        )
        // Obtener los keys que se veran en lista de usuarios
        const allowedKeys = ['whatsappPhone', 'identificacion', 'threadId']
        this.userKeys = Object.keys(this.filteredUsers[0]).filter((key: string) =>
          allowedKeys.includes(key))
          .map((key: string) => 
            key === 'whatsappPhone' ? 'Phone Number' : key && key === 'identificacion' ? 'Identification' : key
        )

        if (this.chatType != 1) {
          this.chatType = 3;
        }
      },
      error: (err) => {
        console.log('Error al obtener la lista de usuarios: ', err)
      }
    })
    }

    // Metodo para obtener los usuarios que tuvieron una conversacion hoy
    getTodaysUsers() {
      // obtener la fecha de hoy
      this.startDate = this.today.toISOString().split('T')[0] + 'T00:00:00';
      this.endDate = this.today.toISOString().split('T')[0] + 'T23:59:59';
      this.listStartDate = '';
      this.listEndDate = '';
      this.listFilterLabel = 'Filter';
      this.chatType = 0;
      this.searchText = '';

      this.userListService.getWhatsAppUsers(this.url).subscribe({
        next: (users: WhatsAppUserList) => {
          if (!users || users.content?.length == 0) {
            this.filteredUsers = [];
            this.page = 0;
            this.pagesArray = [0] ;
            return;
          }

          this.filteredUsers = users.content ?? [];
          this.page = users.page?.number ?? 0;
          this.totalPages = users.page?.totalPages ?? 0;
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i);

          // Obtener la informacion del objeto erpUser
          this.filteredUsers.forEach(user =>
            this.erpUsers.push(user.erpUser)
          )

          // Obtener los keys que se veran 
          const allowedKeys = [ 'whatsappPhone', 'identificacion', 'threadId']
          this.userKeys = Object.keys(this.filteredUsers[0]).filter((key) =>
            allowedKeys.includes(key))
            .map((key: string) => 
              key === 'whatsappPhone' ? 'Phone Number' : key && key === 'identificacion' ? 'Identification' : key
          ) as (keyof Content)[];

          this.erpUserKeys = Object.keys(this.erpUsers[0]).filter((key: string)=>
            allowedKeys.includes(key)
          ) as (keyof ERPUser)[];

        },
        error: (err) => {
          console.log('Error al obtener los usuarios de hoy: ', err)
        }
      });
    }

    // Seleccionar a un usuario
    selectUser(identificacion: string, threadId:string, phone: string) {
      this.isSelected = phone;
      if(identificacion == null && threadId == null){
        this.hasHistory = false;
        this.getUserInfo('whatsappPhone', phone)
      }else{
        this.identificacion = identificacion;
        this.threadId = threadId
        switch (this.chatType) {
          case 0:
            this.chatLabel = "Today's Chat Messages"
            this.getUserInfo('identificacion', identificacion, this.startDate, this.endDate);
            break;
          case 1:
            this.chatLabel = "Chat Session Messages"
            this.getUserInfo('identificacion', identificacion, this.chatStartDate, this.chatEndDate)
            break
          case 3:
            this.chatLabel = "All Chat Messages"
            this.getUserInfo('identificacion', identificacion);
            break;
        }
      }
      
    }

    // Obtener los datos de un usuario
    getUserInfo(field: string, value:string, startDate?: string, endDate?: string){
      this.chatHistoryService.getUserInfo(field, value).subscribe({
      next: (res: WhatsAppUser) => {   
        this.userInfo = res     

        // obtener los keys 
        const allowedKeys = ['whatsappPhone', 'threadId', 'identificacion']
        this.userKeys  = Object.keys(this.userInfo)
        .filter((key: string) =>
          allowedKeys.includes(key)
        ).map((key: string) => 
          key === 'whatsappPhone' ? 'Phone Number' : key && key === 'identificacion' ? 'Identification' : key
        ) as (keyof Content) [];

        // Verificar si el usuario tiene hilo y buscar el historial
        if(res.threadId != null){
          this.hasHistory = true
          if(startDate && endDate){
            const start = new Date(startDate);
            const end = new Date(endDate);
            this.getDatedChatHistory(res.threadId, start, end)
          }else{
            this.chatType = 3;
            this.getDatedChatHistory(res.threadId)
          }
        }else{
          this.hasHistory = false;
        }
      },
      error: (err: any) => {
        console.log('Error al obtener la infomacion del usuario: ', err)
      }
    });
    }

    // Metodo para filtrar el historial al cambiar de fecha
    onChatDateChange() {  
      if(this.chatStartDate  && this.chatEndDate ){
        this.chatLabel = 'Filtered Chat Messages';
        this.chatType = 2;
        const startDateTime = new Date(`${this.chatStartDate}T00:00:00`);
        const endDateTime = new Date(`${this.chatEndDate}T23:59:59`);
        this.getDatedChatHistory(this.threadId, startDateTime, endDateTime);

        this.chatFilter = !this.chatFilter;

        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        this.chatFilterLabel = `${startDateTime.toLocaleDateString(undefined, options)} - ${endDateTime.toLocaleDateString(undefined, options)}`;

      } else {
        this.getChatHistory(this.threadId);
      }

    }

    // Metodo para filtrar los usuarios por fecha de su ultima interaccion
    onListDateChange() {  
      console.log(this.listSearchFilter)
      if(this.listStartDate  && this.listEndDate ){
        if(this.listSearchFilter == 'ChatSessionStart'){
          this.chatType = 1;
          this.chatStartDate = `${this.listStartDate}T00:00:00`;
          this.chatEndDate = `${this.listEndDate}T23:59:59`;
        }else{
          this.chatType = 3
        }

        const startDateTime = new Date(`${this.listStartDate}T00:00:00`);
        const endDateTime = new Date(`${this.listEndDate}T23:59:59`);

        this.getDatedUsers(startDateTime, endDateTime);
        this.listFilter = !this.listFilter

        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        this.listFilterLabel = `${startDateTime.toLocaleDateString(undefined, options)} - ${endDateTime.toLocaleDateString(undefined, options)}`;
      }else{
        this.listFilterLabel = 'Filter'
      }

    }

    // Obtener historial del chat dentro de un rango de fechas 
    getDatedChatHistory(threadId:string, startDate?:Date, endDate?: Date){
      this.chatHistoryService.getChatHistory(threadId).subscribe({
        next: (chat: ChatAssistenteVirtual) => {

          if(startDate && endDate){ 
            switch (this.chatType) {
              case 0:
                this.chatLabel = "Today's Chat Messages"
                break;
              case 1:
                this.chatLabel = 'Chat Session Messages'
                break;
              case 2:
                this.chatLabel = 'Filtered Chat Messages'
                break;
              default:
                this.chatLabel = 'All Chat Messages'
                break;
            }

            this.hasHistory = true;
            this.chatHistory = chat.history ?? []

            // Filter messages within the date range
            this.chatHistory = this.chatHistory.filter(message => {
              let messageTime = parseCustomTimestamp(message.timestamp!);
              return messageTime <= endDate! && messageTime >= startDate!;
            }).slice().reverse();

            if(this.chatHistory.length == 0){
              this.hasHistory = false;
            }

          }
          else{
            console.log('Getting all history.')
            this.getChatHistory(threadId)
          }

        },
        error: (err)=> {
          console.log('Error al obtener el historial dentro de las fechas:', err)
        }
      })
    }

    // Obtener todo el historial del usuario
    getChatHistory(threadId: string){
      this.chatHistoryService.getChatHistory(threadId).subscribe({
        next: (chat: ChatAssistenteVirtual) => {
          if(!chat || chat.history?.length == 0){
            this.hasHistory = false;
            return;
          }
          this.chatType = 3;
          this.chatLabel = 'All Chat Messages'
          this.chatHistory = (chat.history ?? []).slice().reverse();
        },
        error: (err) => {
          console.log('Error al obtener el historial del chat: ', err)
        }
      })
    }

    //para filtrar los usuarios
    openListFilter(){
      this.listFilter = !this.listFilter
      if(this.listFilter == true){
        this.listSearchFilter =  this.listSearchFilter;
      }
    }
    //para filtrar el chat
    openChatFilter(threadId: string){
      this.threadId = threadId;
      this.chatFilter = !this.chatFilter
    }

    //  Metodo para cambiar el tamaño de la pagina
    onPageSizeChange(value: string) {
      this.pageSize = parseInt(value, 10);
      this.getDatedUsers(new Date(this.startDate!), new Date(this.endDate!));
    }

    //Metodo para ir a la pagina anterior 
    previousPage() {
      if (this.page > 0) {
        this.page--;
        this.getDatedUsers(new Date(this.startDate!), new Date(this.endDate!));
      }
    }

    // Metodo para ir a la siguiente pagina
    nextPage() {
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.getDatedUsers(new Date(this.startDate!), new Date(this.endDate!))
      }
    }

    // Metodo para ir a una pagina especifca
    goToPage(page: number) {
      this.page = page;
      this.getDatedUsers(new Date(this.startDate!), new Date(this.endDate!))
    }

}

// Metodo para convertir el timestamp a fecha valida
function parseCustomTimestamp(ts: string): Date {
  const [datePart, timePart] = ts.split(" ");
  const [day, month, year] = datePart.split("-");
  return new Date(`${year}-${month}-${day}T${timePart}`);
}