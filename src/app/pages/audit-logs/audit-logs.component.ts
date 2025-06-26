import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, icons } from 'lucide-angular';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { Inject } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { Accion, ClientAddr } from '../../models/models_acciones/Accion';
import { Acciones } from '../../models/models_acciones/Acciones';
import { ActionLogService } from '../../core/services/actionLogs/actionLogs.service';
import { FormsModule } from '@angular/forms';
import { CountUpModule } from 'ngx-countup';
import { AuthService } from '../../core/services/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NgxDatatableModule, FormsModule, CountUpModule, TranslateModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}, TranslateService]
})
export class AuditLogsComponent {
  constructor(
    private actionLogService: ActionLogService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer, 
    @Inject(AlertToastService) private alertToast: AlertToastService,
    public translate: TranslateService
  ) { translate.setDefaultLang('en'); }

  audits: Accion[] = []
  tableKeys: string[] = [];
  tableCounts: { table_name: string; count: number; }[] = []
  allAudits: Accion[] = [];
  allKeys: string[] = [];

  // paramteros para paginacion
  page: number = 0;
  pageSize: number = 30;
  totalElements: number = 0;
  pagesArray: number[] = [];
  totalPages: number = 5;
  numberOfElements: number = 0;

  // Filtros de busqueda
  filteredAudits: Accion[] = [];
  listStartDate?: string = '';
  listEndDate?: string = '';
  listFilterLabel: string = '';
  listFilter: boolean = false;

  auditDetails: Accion | null = null;
  selectAudit: number = -1;
  searchText: string | null = '';
  searchParam: Subject<string> = new Subject<string>();

  tableNames: string[] = [];
  tableName: string = '';
  searchNum: number | null = null;

  rowData: ({ key: string; value: unknown; })[] = [];
  clientAddr: (ClientAddr | null | undefined)[] = [];
  changedFields: ({ key: string; value: unknown; })[] = [];
  totalActions: number = 0;

  
  ngOnInit(): void {
    this.searchParam.pipe(debounceTime(300)).subscribe(() => {
      if(this.searchText != ''){
        this.globalSearch(this.searchText!);
      }else if(this.searchNum != undefined){
        this.idSearch(this.searchNum!);
      }
    });
    this.getActions();
  }

  get url(): string {
    return `page=${this.page}&pageSize=${this.pageSize}`;
  }

  // verificar si el usuario tiene el rol especificado
  withRoles(roles: string[]): boolean{
    return this.authService.includesRole(roles);
  }

  onSearch(event: KeyboardEvent){
    this.searchParam.next((event.target as HTMLInputElement).value); // Emitir el valor de búsqueda
  }
  
  // Obtener todos los logs de auditoria
  getActions(){
    this.listStartDate = undefined;
    this.listEndDate = undefined;
    this.tableName = '';
    this.actionLogService.getActions(this.url).subscribe({
      next: (res: Acciones) => { 
        this.allAudits = res.content;
        this.audits = this.allAudits

        this.page = res.pageable.pageNumber;
        this.totalElements = res.totalElements;
        this.totalActions = this.totalElements
        this.totalPages = res.totalPages;
        this.numberOfElements = res.numberOfElements;
        this.generatePagesArray(this.page, this.totalPages);

        // Filtrar las llaves que se veran en la tabla
        this.tableKeys = Object.keys(this.allAudits[0]).filter((key: string) => 
          key != "action_tstamp_stm" &&
          key != "action_tstamp_clk"  &&
          key != "row_data"  &&
          key != "changed_fields"  &&
          key != "schema_name"  &&
          key != "client_port"  &&
          key != "statement_only"  &&
          key != "session_user_name" 
        ).map((key) =>
          key === 'action_tstamp_tx' ? 'Timestamp' : key
        )
        this.getTableNames();
        this.countActions();

      },error: (err) => {
        console.log('Error al obtener la lista de acciones: ', err);
      },
    })
  }

  countActions(){
    this.actionLogService.countActions().subscribe({
      next: (res) => {
        this.tableCounts = res;
      }
    })
  }

  // filtrar los logs por fechas
  findActionsByDate(startDate: string, endDate: string) {
    const startDateTime = `${this.listStartDate}T00:00:00`;
    const endDateTime = `${this.listEndDate}T23:59:59`;
    this.actionLogService.getActionsByDate(startDateTime, endDateTime, this.url).subscribe({
      next: (actions: Acciones) => {

        this.filteredAudits = actions.content
        this.audits = this.filteredAudits
        this.page = actions.pageable.pageNumber;
        this.totalElements = actions.totalElements;
        this.totalPages = actions.totalPages;
        this.numberOfElements = actions.numberOfElements;
        this.generatePagesArray(this.page, this.totalPages);
        
      },
      error: (err) => {
        console.error('Failed to fetch actions:', err);
      }
    });
  }

  // llamar al metodo cuando el usuario ponga una fecha
  onListDateChange() {  
    if(this.listStartDate  && this.listEndDate ){
      console.log('list start date: ', this.listStartDate, 'list end date: ', this.listEndDate);
      this.findActionsByDate(this.listStartDate, this.listEndDate);
    } else if(this.listStartDate){
      this.listStartDate;
    }else{
      this.getActions()
    }

  }

  // Metodo para buscar en toda la tabla
  globalSearch(text: string){
      this.actionLogService.searchOnTables(text, this.url).subscribe({
        next: (res: Acciones) => {
          if(!res || res.content.length < 0){
            console.log('none found url')
            this.audits = []
            return;
          }
          this.audits = res.content;
          console.log(this.audits)
          this.page = res.pageable.pageNumber;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.numberOfElements = res.numberOfElements;
          this.generatePagesArray(this.page, this.totalPages);
        },error: (err) => {
          console.log('Error al obtener busqueda: ', err);
        },
      })
  
  }
  // Metodo para buscar auditoria por id
  idSearch(id: number){
    if(id == null){
      this.getActions()
    }else{
      this.findAudit(id)
    }
  }

  // Metodoo para obtener los nombres de las tablas
  getTableNames(){
    this.actionLogService.getTableNames().subscribe({
      next: (res: any[]) => {
        this.tableNames = res.map(item => item.table_name).filter((key) =>
          key != 'flyway_schema_history'
        );
      },error: (err) => {
        console.log('Error al obtener las tablas: ', err);
      },
    })
  }

  // Metodo para abrir los detalles de log
  openDetails(id: number){
    this.selectAudit = this.selectAudit === id ? -1 : id;
    this.getAuditDetails(id)
  } 

  // Metodo para obetner los detalles de log
  getAuditDetails(id: number){
    this.actionLogService.findAction(id).subscribe({
      next: (log: Accion) => {
        this.auditDetails = log;
        this.allKeys = Object.keys(log)
        // Obtener los datos dentro del objeto row_Data
        this.rowData = Object.entries(this.auditDetails.row_data ?? {}).map(([key, value]) => ({
          key,
          value
        }));
        // Obetener los datos dentro del objeto changedFields
        this.changedFields = Object.entries(this.auditDetails.changed_fields ?? {}).map(([key, value]) => ({
          key,
          value
        }));
      },error: (err) => {
        console.log('Error al obtener auditoria: ', err);
      },
    })
  }

  // Metodo para obtener un log por id
  findAudit(id: number){
    this.actionLogService.findAction(id).subscribe({
      next: (log: Accion) => {
        if(!log){
          this.audits =[]
          return;
        }
        this.audits = [];
        this.audits.push(log)
        this.auditDetails = log;
        
        this.page = 0;
        this.totalElements = 1;
        this.totalPages = 1;
        this.numberOfElements = 1;
        this.generatePagesArray(this.page, this.totalPages);


      },error: (err) => {
        console.log('Error al encontrar la auditoria con: ', id, err);
      },
    })
  }

  // // Metodo para obtener los logs por su nimbre de tabla
  getTable(tableName: string){
    this.actionLogService.getTable(tableName, this.url).subscribe({
      next: (table: Acciones) => {
        if(!table || table.content.length < 0){
          this.audits = []
          return;
        }
        this.audits = table.content
         this.page = table.pageable.pageNumber;
        this.totalElements = table.totalElements;
        this.totalPages = table.totalPages;
        this.numberOfElements = table.numberOfElements;
        this.generatePagesArray(this.page, this.totalPages);
      },error: (err) => {
        console.log('Error al obtener la tabla de auditorias: ', err);
      },
    })
  }

  // Métodos para manejar los cambios en las opciones seleccionadas
  onPageSizeChange(value: string) {
    this.pageSize = parseInt(value, 10);
    if(this.listStartDate && this.listEndDate){
      this.findActionsByDate(this.listStartDate, this.listEndDate);
    }else if(this.tableName){
      this.getTable(this.tableName)
    }else if(this.searchText){
        this.globalSearch(this.searchText)
    }else{
      this.getActions();
    }
  }


  previousPage() {
    if (this.page > 0) {
      this.page--;
      if(this.listStartDate && this.listEndDate){
        this.findActionsByDate(this.listStartDate, this.listEndDate);
      }else if(this.tableName){
        this.getTable(this.tableName)
      }
      else if(this.searchText){
        this.globalSearch(this.searchText)
      }else{
        this.getActions();
      }
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      if(this.listStartDate && this.listEndDate){
        this.findActionsByDate(this.listStartDate, this.listEndDate);
      }else if(this.tableName){
        this.getTable(this.tableName)
      }else if(this.searchText){
        console.log(this.searchText)
        this.globalSearch(this.searchText)
      }else{
        this.getActions();
      }
    }
  }

  goToPage(page: number) {
    this.page = page;
    if(this.listStartDate && this.listEndDate){
      this.findActionsByDate(this.listStartDate, this.listEndDate);
    }else if(this.tableName){
      this.getTable(this.tableName)
    }else if(this.searchText){
      console.log(this.searchText)
      console.log(this.page)
        this.globalSearch(this.searchText)
    }else{
      this.getActions();
    }
  }

  
  // Método para generar el array de páginas para la paginación
  generatePagesArray(currentPage: number, totalPages: number): void {
    const pages: number [] = [];

    if (totalPages <= 15) {
      // Show all pages
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 5) {
          for (let i = 0; i < 10; i++) pages.push(i);
          pages.push(-1);
          pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 6) {
          pages.push(0);
          pages.push(-1);
          for (let i = totalPages - 7; i < totalPages; i++) pages.push(i);
      } else {
          pages.push(0);
          pages.push(-1);
          for (let i = currentPage - 2; i <= currentPage + 4; i++) pages.push(i);
          pages.push(-1);
          pages.push(totalPages - 1);
      }
    }

    this.pagesArray = pages;
  }

    // HTML dynamico para obtener un icon en base al nombre de tabla
  getTableIcon(tableName: string): SafeHtml{
    let svg = ``
    switch(tableName){
      case 'permissions':
        svg = ` <div class="flex items-center justify-center mx-auto rounded-full size-9 bg-purple-100 text-purple-500 dark:bg-custom-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ungroup-icon lucide-ungroup">
                    <rect width="8" height="6" x="5" y="4" rx="1"/><rect width="8" height="6" x="11" y="14" rx="1"/>
                  </svg>
                </div>`
        break;
      case 'revoked_tokens':
        svg = `<div class="flex items-center justify-center mx-auto rounded-full size-9 bg-red-100 text-red-500 dark:bg-custom-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-x-icon lucide-ticket-x">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9.5 14.5 5-5"/><path d="m9.5 9.5 5 5"/>
                </svg>
              </div>`;
        break;
      case 'roles':
        svg = `<div class="flex items-center justify-center mx-auto rounded-full size-9 bg-pink-100 text-pink-500 dark:bg-custom-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-icon lucide-shield">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                </svg>
              </div>`
        break;
      case 'roles_permissions':
        svg = `<div class="flex items-center justify-center mx-auto rounded-full size-9 bg-green-100 text-green-500 dark:bg-custom-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-group-icon lucide-group">
                  <path d="M3 7V5c0-1.1.9-2 2-2h2"/><path d="M17 3h2c1.1 0 2 .9 2 2v2"/><path d="M21 17v2c0 1.1-.9 2-2 2h-2"/><path d="M7 21H5c-1.1 0-2-.9-2-2v-2"/><rect width="7" height="5" x="7" y="7" rx="1"/><rect width="7" height="5" x="10" y="12" rx="1"/>
                </svg>
              </div>`
        break;
      case 'user_roles':
        svg = `<div class="flex items-center justify-center mx-auto rounded-full size-9 bg-orange-100 text-orange-500 dark:bg-custom-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-user-icon lucide-shield-user">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M6.376 18.91a6 6 0 0 1 11.249.003"/><circle cx="12" cy="11" r="4"/>
                </svg>
              </div>`
        break;
      case 'users':
        svg = `<div class="flex items-center justify-center mx-auto rounded-full size-9 bg-yellow-100 text-yellow-500 dark:bg-custom-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>
                </svg>
              </div>`
        break;
      case 'logged_actions':
        svg = `<div class="flex items-center justify-center mx-auto rounded-full size-9 bg-gray-100 text-gray-500 dark:bg-custom-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity-icon lucide-activity">
                  <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
                </svg>
              </div>`
        break;
      default:
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // Metodo para nombrar la accion
  nameAction(action: string): string{
    switch(action){
      case 'I':
        return 'Insert';
      case 'T':
        return 'Truncate';
      case 'D':
        return 'Delete';
      case 'U':
        return 'Update';
      default:
        return "";
    }
  }
  
  // Metodo para obetener la accion a classes CSS
  getAction(action: string ): string {
    action = this.nameAction(action);
    switch(action){
      case 'Insert':
        return 'border-blue-100 bg-blue-50 text-blue-500 dark:border-blue-700';
      case 'Truncate':
        return 'border-purple-100 bg-purple-50 text-purple-500 dark:border-purple-700';
      case 'Delete':
        return 'border-red-100 bg-red-50 text-red-500 dark:border-red-700';
      case 'Update':
        return 'border-green-100 bg-green-50 text-green-500 dark:border-green-700';
      default:
        return 'border-gray-100 bg-gray-50 text-gray-500 dark:border-gray-700'; // Clases por defecto
    }
  }

  openTable(table: string){
    this.tableName = table
    this.getTable(this.tableName)
  }
}

