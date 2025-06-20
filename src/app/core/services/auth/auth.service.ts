import { LoginDto, Usuario } from '../../../models/Usuario';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { JwtPayload } from '../../../models/JwtPayload';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _jwtData: JwtPayload | null = null;
  private _token: string | null = null;

  UrlAuth: string = 'http://localhost:8080/ucacue/auth';

  constructor(private http: HttpClient) {}

  // ! No Disponible
  register(usuario: Usuario): Observable<any> {
    const params = JSON.stringify(usuario);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.UrlAuth}/sign-up`, params, { headers });
  }

  login(loginDto: LoginDto): Observable<any> {
    const urlEndpoint = `${this.UrlAuth}/log-in`;

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(urlEndpoint, loginDto, { headers: httpHeaders })
      .pipe(
        map((response) => {
          const token = response.jwt;
          if (token) {
            this.guardarToken(token);
            this._jwtData = this.obtenerDatosToken(token);
            localStorage.setItem('usuario', JSON.stringify(this._jwtData));
          }
          return response;
        })
      );
  }

  // Guarda el token en el localStorage
  guardarToken(accessToken: string): void {
    this._token = accessToken;
    localStorage.setItem('token', accessToken);
  }

  // Obtiene los datos del token
  obtenerDatosToken(accessToken: string): any {
    if (accessToken != null) {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      // console.log("obtenerDatoToken (stringified): " + JSON.stringify(payload));
      return payload;
    }
    return null;
  }

  // Comprueba si el usuario está autenticado
  isAuthenticated(): boolean {
    let payload = this.obtenerDatosToken(this.tokencito!);
    if (payload != null && payload.sub && payload.sub.length > 0) {
      return true;
    }
    return false;
  }

  // Obtiene el token del localStorage
  public get tokencito(): string | null {
    if (typeof localStorage !== 'undefined') {
      if (this._token != null) {
        return this._token;
      } else if (this._token == null && localStorage.getItem('token') != null) {
        this._token = localStorage.getItem('token');
        return this._token;
      }
    }
    return null;
  }

  // Cierra sesión
  logout() {
    const urlEndpoint = `${this.UrlAuth}/log-out`;
    const httpHeaders = new HttpHeaders({
      'Content-Length': 0,
    });

    return this.http.post<any>(urlEndpoint, {}, { headers: httpHeaders }).pipe(
      // limpieza de almacenamiento después de recibir respuesta del servidor
      tap(() => {
        this._token = null;
        this._jwtData = null;
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.clear();
      })
    );
  }


  // Verifica si el usuario tiene el rol de administrador
  capturoRol(): boolean {
    let payload = this.obtenerDatosToken(this.tokencito!);
    let _rol = payload.authorities;
    return _rol.includes('ROLE_ADMIN');
  }

  // Comprueba si el usuario tiene un rol específico
  hasRole(role: any): boolean {
    if (this.dataPayload.authorities.includes(role)) {
      return true;
    }
    return false;
  }

  // verificar si el usuario tiene un rol especificado
  includesRole(roles: string[]): boolean {
    let userRoles: string = this.dataPayload.authorities! ;
    return roles.some(role => userRoles.includes(role));
  }

  includesPermission(permissions: string[]): boolean{
    let userPermissioins: string = this.dataPayload.authorities! ;
    return permissions.some(permissions => userPermissioins.includes(permissions));
  }


  // Obtiene el usuario activo del payload token
  public get dataPayload(): JwtPayload {
    if (this._jwtData != null) {
      return this._jwtData;
    } else if (this._jwtData == null && typeof window !== 'undefined' && localStorage.getItem('usuario') != null) {
      // Solo accede a localStorage si estamos en el navegador
      this._jwtData = JSON.parse(localStorage.getItem('usuario')!) as JwtPayload;
      return this._jwtData;
    }
    return {
      iss: '',
      sub: 'anonymous@email.com',
      authorities: '',
      iat: 0,
      exp: 0,
      jti: '',
      nbf: 0,
    };
  }
}
