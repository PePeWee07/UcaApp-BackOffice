import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Permissions } from '../../../models/roles_permissions/Permissions';
import { Roles } from '../../../models/roles_permissions/Roles';
import { Usuario } from '../../../models/Usuario';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesPermissionsService{

  private Url: String = environment.apiUrls.ucacue;

  constructor(private http: HttpClient) { }

  //Obtener lista de permisos
  getPermissions(): Observable<Permissions>{
    return this.http.get<Permissions>(`${this.Url}/v2/permissions`);
  }

  createPermission(permissionBody: any): Observable <Permissions>{
    return this.http.post<Permissions>(`${this.Url}/v2/permission`, permissionBody);
  }

  deletePermission(id: number): Observable <Permissions>{
    return this.http.delete<Permissions>(`${this.Url}/v2/permission/${id}`);
  }

  //Obtener lista de roles
  getRoles(): Observable<Roles>{
    return this.http.get<Roles>(`${this.Url}/v2/roles`);
  }

  createRole(rolBody: any): Observable <Roles>{
    return this.http.post<Roles>(`${this.Url}/v2/rol`, rolBody);
  }

  updateRole(id: number, body: any): Observable <Roles>{
    return this.http.put<Roles>(`${this.Url}/v2/rol/${id}`, body);
  }

  deleteRole(id: number): Observable <Roles>{
    return this.http.delete<Permissions>(`${this.Url}/v2/role/${id}`);
  }

 // Obtener usuario
  getUser(id: number): Observable<Usuario>{
    return this.http.get<Usuario>(`${this.Url}/v2/manager/user/${id}`);
  }

// actulizar informacion del usuario
  editUser(id: number, body: any): Observable<any>{
    return this.http.patch<any>(`${this.Url}/v2/manager/user/${id}`, body);
  }


}
