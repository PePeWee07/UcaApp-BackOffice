import { ApiWhatsAppService } from './../../core/services/catia/apiWhatsApp.service';
import {
  WhatsAppUserList,
  Content,
  RolesUsuario,
} from '../../models/catia/WhatsAppUserList';
import { MessageBody } from './../../models/catia/whatsapp/MessageBody';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { MDModalModule } from '../../component/modals';
import { DrawerModule } from '../../component/drawer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { Component, ViewChild, Inject, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NavModule } from '../../component/tab/tab.module';
import {
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  icons,
} from 'lucide-angular';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { fromEvent, Observable, Subject } from 'rxjs';
import { auditTime, debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { FlatpickrModule } from '../../component/flatpickr/flatpickr.module';;
import { UserListService } from '../../core/services/catia/userlist.service';
import { TemplatesWhatsAppService } from '../../core/services/catia/templatesWhatsApp.service';
// import { MnDropdownComponent } from '../../component/dropdown/dropdown.component';

import { contact } from '../../data/chat'; //! Data of expample
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    SimplebarAngularModule,
    NavModule,
    LucideAngularModule,
    DrawerModule,
    MDModalModule,
    // MnDropdownComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlatpickrModule,
    TranslateModule
  ],
  templateUrl: './chat-history.component.html',
  styleUrl: './chat-history.component.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider(icons),
    },
    LanguageService,
  ],
})
export class ChatHistoryComponent {

  constructor(
    private userListService: UserListService,
    private templatesWhatsAppService: TemplatesWhatsAppService,
    private apiWhatsAppService: ApiWhatsAppService,
    public translate: TranslateService,
    public formBuilder: UntypedFormBuilder,
    @Inject(AlertToastService) private alertToast: AlertToastService
  ) {
    translate.setDefaultLang('en');
  }

  contacts: any; //! Variable por eliminar

  ngOnInit(): void {
    // Dejar de escribir 2s, dispara executeSearch()
    this.searchText$
    .pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.executeSearch());
    this.contacts = contact;

    this.loadtemplates();
  }

  // Var Paginacion de Usuarios recientes
  users: Content[] = [];
  private userPage = 0;
  private userTotalPages = 1;
  isLoadingUsers = false;
  @ViewChild('scrollRef', { static: false, read: ElementRef })
  scrollRef!: ElementRef<HTMLElement>;

  // Var Historial
  private destroy$ = new Subject<void>();
  chatuser: any;
  isLoadingHistory = false;
  private historyPage = 0;
  private historyTotalPages = 1;
  @ViewChild('messageScrollRef', { static: false }) messageScrollRef!: any;

  // Var de un usario
  user: Content = {};
  role: string = '';
  profile: string = './assets/images/users/user-dummy-img.jpg';


  // Var buscar usaurio
  searchField : 'identificacion' | 'whatsappPhone' = 'identificacion';
  searching: boolean = false;
  searchText: string = "";
  private searchText$ = new Subject<string>();
  noUsersFound = false;

  // Var Ocultables
  showTab: boolean = true;
  showSearchChat: boolean = false;

  // Scroll al final del historial
  private scrollToBottom() {
    const scrollEl = this.messageScrollRef.SimpleBar.getScrollElement();
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  // CAragr Historial
  private loadHistory() {
    if (this.isLoadingHistory || this.historyPage >= this.historyTotalPages)
      return;
    this.isLoadingHistory = true;

    const scrollEl = this.messageScrollRef.SimpleBar.getScrollElement();
    const prevScrollHeight = scrollEl.scrollHeight;

    this.userListService
      .getHistoryUser(this.user.whatsappPhone!, this.historyPage, 50)
      .subscribe({
        next: (res) => {
          this.historyTotalPages = res.page.totalPages;

          const pageContents = [...res.content].reverse();
          const aiAvatar = '../../../assets/images/users/catia.jpeg';
          const msgs = pageContents.flatMap(c => [
            {
              chatMsg:     c.userMessage,
              isSender:    true,
              avatar:      this.profile,
              attachments: []
            },
            {
              inputTokens:        c.inputTokens,
              outputTokens:       c.outputTokens,
              totalTokens:        c.totalTokens,
              metadata:           c.metadata,
              model:              c.model,
              promptId:           c.promptId,
              promptVariables:    c.promptVariables,
              promptVersion:      c.promptVersion,
              responseId:         c.responseId,
              previousResponseId: c.previousResponseId,
              createdAt:          c.createdAt,
              reasoning:          c.reasoning,
              toolCalls:          c.toolCalls,
              chatMsg:            c.assistantMessage,
              isSender:           false,
              avatar:             aiAvatar,
              attachments:        [],
              showTools:          false
            }
          ]);


          if (this.historyPage === 0) {
            this.chatuser = [...msgs];
            setTimeout(() => this.scrollToBottom(), 0);
          } else {
            this.chatuser = [...msgs, ...this.chatuser];
            setTimeout(() => {
              const newScrollHeight = scrollEl.scrollHeight;
              scrollEl.scrollTop = newScrollHeight - prevScrollHeight;
            }, 0);
          }

          this.isLoadingHistory = false;
        },
        error: () => {
          this.isLoadingHistory = false;
          this.alertToast.showToast(
            'error',
            'Failed to load user history',
            3000
          );
        },
      });
  }

  // Scroll infinito del historial
  private attachHistoryScroll() {
    const scrollEl = this.messageScrollRef.SimpleBar.getScrollElement();

    fromEvent(scrollEl, 'scroll')
      .pipe(
        auditTime(200), // throttle a 200 ms
        filter(
          () =>
            scrollEl.scrollTop === 0 &&
            this.historyPage < this.historyTotalPages - 1 &&
            !this.isLoadingHistory
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.historyPage++;
        this.loadHistory();
      });
  }

  // OnClick User Chat show
  chatUsername(user: Content, role:any) {
    this.user = user;
    this.role = role;
    // Resetear historial
    this.chatuser = [];
    this.historyPage = 0;
    this.historyTotalPages = 1;

    // Cargar la primera página
    this.loadHistory();

    // Una vez renderizado, enganchar el scroll
    setTimeout(() => this.attachHistoryScroll(), 0);
  }

  // Carga de usuarios paginada
  private loadUsers() {
    if (this.isLoadingUsers || this.userPage >= this.userTotalPages) return;
    this.isLoadingUsers = true;

    const host: HTMLElement = this.scrollRef.nativeElement;
    const scrollEl = host.querySelector('.simplebar-content-wrapper')!;
    const prevScrollHeight = scrollEl.scrollHeight;
    if (!scrollEl) {
      console.error('Not Found .simplebar-content-wrapper');
      return;
    }

    const path = `${this.userPage}/byChatSessionStart`;
    const params = [
      `startDate=${this.getTodayDate(true)}`,
      `endDate=${this.getTodayDate(false)}`,
      `pageSize=100`
    ].join('&');

    this.userListService.getWhatsAppUsers(`${path}?${params}`)
      .subscribe({
        next: resp => {
          this.userTotalPages = resp.page!.totalPages!;
          this.users = [...this.users, ...(resp.content || [])];
          this.isLoadingUsers = false;

          // corregir scroll: nueva altura menos la antigua
          setTimeout(() => {
            const newScrollHeight = scrollEl.scrollHeight;
            scrollEl.scrollTop = newScrollHeight - prevScrollHeight;
          }, 0);
        },
        error: err => {
          this.alertToast.showToast('error', 'Failed to load users', 3000);
          console.error('Error loading users:', err);
          this.isLoadingUsers = false;
        }
      });
  }

  // Attach infinite scroll para usuarios
  ngAfterViewInit() {
    setTimeout(() => {
      this.loadUsers();
      this.attachUsersScroll();
    }, 0);
  }

  // Scroll infinito de usuarios
  private attachUsersScroll() {
    const host: HTMLElement = this.scrollRef.nativeElement;
    const scrollEl = host.querySelector('.simplebar-content-wrapper') as HTMLElement;
    if (!scrollEl) {
      console.error('No found .simplebar-content-wrapper');
      return;
    }

    scrollEl.scrollTop = 0;

    fromEvent(scrollEl, 'scroll')
      .pipe(
        auditTime(200),
        filter(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollEl;
          const distanciaAlFondo = scrollHeight - (scrollTop + clientHeight);
          const overflow = scrollHeight > clientHeight;
          const nearBottom = distanciaAlFondo <= 100;
          const hasMore = this.userPage < this.userTotalPages - 1;
          const notLoading = !this.isLoadingUsers;
          return overflow && nearBottom && hasMore && notLoading;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.userPage++;
        this.loadUsers();
      });
  }

  // Buscador de usuario
  onSearchChange(text: string) {
    this.searchText = text;
    this.searchText$.next(text);
  }

  // Cambiar campo de búsqueda
  onFieldChange(field: 'identificacion' | 'whatsappPhone') {
    this.searchField = field;
    if (this.searchText.trim()) {
      this.executeSearch();
    }
  }

  // Metodo para ejecutar la búsqueda
  private executeSearch() {
    const value = this.searchText.trim();
    if (!value) {
      this.users = [];
      this.userPage = 0;
      this.userTotalPages = 1;
      setTimeout(() => this.loadUsers(), 0);
      this.noUsersFound = false;
      return;
    }

    this.searching = true;
    this.noUsersFound = false;

    this.userListService
      .getUserInfo(this.searchField, value)
      .subscribe({
        next: (user) => {
          this.users = [user];
          this.searching = false;
          this.noUsersFound = false;
        },
        error: (err) => {
          if (err.status === 404) {
            this.users = [];
            this.noUsersFound = true;
          }
          this.searching = false;
        }
      });
  }

  // Obtener la fecha de hoy en formato ISO 8601 con hora de inicio o fin del día
  getTodayDate(init: boolean): String {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    if (init) {
      const formattedDate = `${year}-${month}-${day}T00:00:00`;
      return formattedDate;
    } else {
      const formattedDate = `${year}-${month}-${day}T23:59:59`;
      return formattedDate;
    }
  }

  // Obtener Hace cuanto tiempo escrito un mensaje
  getTimeAgo(value?: string | Date | null): string {
    if (!value) {
      return 'N/A';
    }
    const date = value instanceof Date ? value : new Date(value);

    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 1000 / 60);
    if (mins < 60) {
      return `${mins} min atrás`;
    }

    const hrs = Math.floor(mins / 60);
    return `${hrs} hora${hrs > 1 ? 's' : ''} atrás`;
  }

  // Devuelve un string con los tipos de rol o 'None'
  getRolesString(roles?: RolesUsuario[]): string {
    if (!roles?.length) {
      return 'None';
    }
    return roles
      .map((r) => r.tipoRol ?? '')
      .filter((t) => !!t)
      .join(', ');
  }

  // Toggle Tab Sidebar
  toggleTab(show: boolean) {
    this.showTab = show;
  }

  // Togle Tab Search Chat
  toggleSearchChat(): void {
    this.showSearchChat = !this.showSearchChat;
  }

  // Templates
  feedbackList: any[] = [];
  loadtemplates() {
    this.templatesWhatsAppService.getCalificationTemplates(0).subscribe({
      next: (res) => {
        this.feedbackList = res.content;
      },
      error: (err) => console.error('Error cargando feedback', err),
    });
  }

  // Enviar Mensaje WhatsApp
  msgToUser: string = "";
  sendMessage() {
    this.user.whatsappPhone;
    if (this.msgToUser && this.msgToUser.trim() !== '' && this.user.whatsappPhone) {

      console.log('Mensaje enviado:', this.msgToUser);
      const messageBody: MessageBody = {
        number: this.user.whatsappPhone,
        message: this.msgToUser.trim()
      };

      this.apiWhatsAppService.sendWhatsAppMessage(messageBody).subscribe({
        next: (res) => {
          this.alertToast.showToast('success', 'Mensaje enviado', 1500);
        },
        error: (err) => {
          this.alertToast.showToast('error', 'Failed to send message', 3000);
          console.error('Error al enviar mensaje:', err);
        }
      });

      this.msgToUser = "";
    } else {
      this.alertToast.showToast('warning', 'Ingrese un mensaje válido', 2000);
      this.msgToUser = "";
    }
  }

  // Limpiar recursos al destruir el componente
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
