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

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NgxDatatableModule, FormsModule, CountUpModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}]
})
export class AuditLogsComponent {
  constructor(
    private actionLogService: ActionLogService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer, 
        @Inject(AlertToastService) private alertToast: AlertToastService
  ) {}

  audits: Acciones = []
  tableKeys: string[] = [];
  tableCounts: { table: string; count: number; }[] = []
  allAudits: Acciones = [];
  allKeys: string[] = [];

  filteredAudits: Acciones = [];
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

  
  ngOnInit(): void {
    this.searchParam.pipe(debounceTime(300)).subscribe(() => {
      if(this.searchText != ''){
        console.log('seatch text', this.searchText)
        this.globalSearch(this.searchText!);
      }else if(this.searchNum != undefined){
        console.log('seatch num', this.searchNum)
        this.idSearch(this.searchNum!);
      }
    });
    this.getActions();
  }

  // verificar si el usuario tiene el rol especificado
  withRoles(roles: string[]): boolean{
    return this.authService.includesRole(roles);
  }

  onSearch(event: KeyboardEvent){
    this.searchParam.next((event.target as HTMLInputElement).value); // Emitir el valor de búsqueda
  }

  // filtrar los logs por fechas
  findActionsByDate(startDate: Date, endDate: Date) {
    this.actionLogService.getActions().subscribe({
      next: (actions: Acciones) => {

        // Parse and filter actions
        this.filteredAudits = actions.filter((audit) => {
          const timestamp = new Date(audit.action_tstamp_tx);
          return timestamp >= startDate && timestamp <= endDate;
        });
        this.audits = this.filteredAudits.reverse()

        console.log('Filtered audits:', this.filteredAudits);
      },
      error: (err) => {
        console.error('Failed to fetch actions:', err);
      }
    });
  }

  // llamar al metodo cuando el usuario ponga una fecha
  onListDateChange() {  
    if(this.listStartDate!= ''  && this.listEndDate != '' ){

      const startDateTime = new Date(`${this.listStartDate}T00:00:00`);
      const endDateTime = new Date(`${this.listEndDate}T23:59:59`);

      this.findActionsByDate(startDateTime, endDateTime);
    } else{
      this.getActions()
    }

  }

  // Metodo para buscar en toda la tabla
  globalSearch(text: string){
    console.log('gloal search')
     this.actionLogService.searchOnTables(text).subscribe({
      next: (res: Acciones) => {
        if(!res || res.length < 0){
          this.audits = []
          return;
        }
        this.audits = res;
      },error: (err) => {
        console.log('Error al obtener busqueda: ', err);
      },
    })
  }
  // Metodo para buscar auditoria por id
  idSearch(id: number){
    console.log('searching iwth', id)
    this.findAudit(id)
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
  // Obtener todos los logs de auditoria
  getActions(){
    this.listStartDate = undefined;
    this.listEndDate = undefined;
    this.actionLogService.getActions().subscribe({
      next: (res: Acciones) => { 
        this.allAudits = res;
        this.audits = this.allAudits.reverse()
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

        // Contar el numero de logs por tabla
        const counts: { [key: string]: number } = {};
        for (const audit of this.allAudits) {
          const table = audit.table_name;
          counts[table] = (counts[table] || 0) + 1;
        }
        // Contar el numero de logs por tabla
        this.tableCounts = Object.entries(counts).map(([table, count]) => ({
          table,
          count
        }));


      },error: (err) => {
        console.log('Error al obtener la lista de acciones: ', err);
      },
    })
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
        this.audits = [];
        this.audits.push(log)
        this.auditDetails = log;
        console.log('found: ', this.audits)
      },error: (err) => {
        console.log('Error al encontrar la auditoria con: ', id, err);
      },
    })
  }

  // Metodo para obtener los logs por su nimbre de tabla
  getTable(tableName: string){
    this.actionLogService.getTable(tableName).subscribe({
      next: (table: Acciones) => {
        if(!table || table.length < 0){
          this.audits = []
          return;
        }
        this.audits = table
      },error: (err) => {
        console.log('Error al obtener la tabla de auditorias: ', err);
      },
    })
  }

  onDirectionChange(direction: string){
    this.audits = this.audits.reverse()
  }

}

