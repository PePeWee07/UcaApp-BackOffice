import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Acciones } from '../../../models/models_acciones/Acciones';
import { Accion } from '../../../models/models_acciones/Accion';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActionLogService {

  private Url: String = environment.apiUrls.ucacue;

  constructor(private http: HttpClient) { }

  //lista de todas las auditorias
  getActions(): Observable <Acciones>{
    return this.http.get<Acciones>(`${this.Url}/v2/audit/actions`);
  }

    // obtener accion por id   
  findAction(id: number): Observable <Accion>{
     return this.http.get<Accion>(`${this.Url}/v2/audit/actions/${id}`);
  }

  getTableNames(): Observable<{ table_name: string }[]>{
    return this.http.get<{ table_name: string }[]>(`${this.Url}/v2/audit/actions/tables`)
  }

  getTable(tableName:string): Observable<Acciones>{
    return this.http.get<Acciones>(`${this.Url}/v2/audit/actions/by-table/${tableName}`);
  }

  searchOnTables(searchParam: string): Observable <Acciones>{
    return this.http.get<Acciones>(`${this.Url}/v2/audit/actions/search?searchParam=${searchParam}`);
  }
}
