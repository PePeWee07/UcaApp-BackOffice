import { LoginDto, Usuario } from '../../../models/User';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _usuario: Usuario | null = null;
  private _token: string | null = null;

  UrlAuth: string = 'http://localhost:8080/ucacue/auth';

  constructor(private http: HttpClient) {}

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
            this._usuario = this.obtenerDatosToken(token);
            localStorage.setItem('usuario', JSON.stringify(this._usuario));
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
      //console.log("obtenerDatoToken (stringified): " + JSON.stringify(payload));
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
  logout(): void {
    this._token = null;
    this._usuario = null;
    sessionStorage.clear();
    localStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  // Verifica si el usuario tiene el rol de administrador
  capturoRol(): boolean {
    let payload = this.obtenerDatosToken(this.tokencito!);
    let _rol = payload.authorities;
    return _rol.includes('ROLE_ADMIN');
  }

  // Comprueba si el usuario tiene un rol específico
  hasRole(role: any): boolean {
    if (this.usuario.authorities!.includes(role)) {
      return true;
    }
    return false;
  }

  // Obtiene el usuario activo
  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } else if (
      this._usuario == null &&
      localStorage.getItem('usuario') != null
    ) {
      this._usuario = JSON.parse(localStorage.getItem('usuario')!) as Usuario;
      return this._usuario;
    }
    return new Usuario();
  }
}
