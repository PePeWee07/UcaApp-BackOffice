import { Component } from '@angular/core';
import { SidebarService } from '../../core/services/component/sidebar.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { LanguageService } from '../../core/services/language.service';
import { CookieService } from 'ngx-cookie-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MnDropdownComponent } from '../dropdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MnDropdownComponent, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers:[LanguageService]
})
export class HeaderComponent {
  sidebarVisible: boolean = true;
  cookieValue: any;
  flagvalue: any  = 'assets/images/flags/us.svg'; // Valor por defecto de la bandera

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private _route: Router,
    private alertToastService: AlertToastService,
    public translate: TranslateService,
    public languageService: LanguageService,
    public _cookiesService: CookieService,
  ) {translate.setDefaultLang('en')}

  isDropdownOpen = false;  // estado del dropdown
  email = this.authService.dataPayload.sub;  // email del usuario

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();  // Llama al servicio para alternar el sidebar
  }

  ngOnInit() {
    this.sidebarService.sidebarVisible$.subscribe((isVisible) => {
      this.sidebarVisible = isVisible;
    });
    
    let browserLang = navigator.language?.split('-')[0];  // Obtiene el idioma del navegador
    const foundLang = this.listLang.find(x => x.lang === browserLang);
    
    if (foundLang) {
      this.cookieValue = foundLang.lang;
      this.flagvalue = foundLang.flag;
      this.languageService.setLanguage(this.cookieValue);  // Establece el idioma en el servicio de lenguaje
    } else {
      // Utilizar cookies si no se puede determinar el idioma del navegador
      this.cookieValue = this._cookiesService.get('lang');
      const cookieLang = this.listLang.find(x => x.lang === this.cookieValue);

      if (cookieLang) {
        this.flagvalue = cookieLang.flag;
      } else {
        this.flagvalue = 'assets/images/flags/us.svg';  // Valor por defecto de la bandera
        this.cookieValue = 'en'; // idioma por defecto
      }
    }
  }

  SingOut(){
    this.authService.logout().subscribe(
      {
        next: (res) => {
          this.alertToastService.showToast('success', res.message, 1500);
          this._route.navigateByUrl("/login")
        },
        error: (err) => {
          console.log(err)
          this.alertToastService.showToast('error', err.error.message, 3000);
          this._route.navigateByUrl("/login")
        }
      }
    );
  }

  /***
  * Language Listing
  */
  listLang = [
    { text: 'English', flag: 'assets/images/flags/20/us.svg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/20/es.svg', lang: 'es'},
    { text: 'German', flag: 'assets/images/flags/20/de.svg', lang: 'gr' },
    { text: 'French', flag: 'assets/images/flags/20/fr.svg', lang: 'fr' },
    { text: 'Japanese', flag: 'assets/images/flags/20/jp.svg', lang: 'jp' },
    { text: 'Italian', flag: 'assets/images/flags/20/it.svg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/20/ru.svg', lang: 'ru' },
    { text: 'Portuguese', flag: 'assets/images/flags/br.svg', lang: 'br' },
    { text: 'Arabic', flag: 'assets/images/flags/20/ae.svg', lang: 'ar' }
  ];

  /***
  * Language Value Set
  */
  setLanguage(text: string, lang: string, flag: string) {
    this.isDropdownOpen = false; // Cierra el dropdown al seleccionar un idioma
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }
}
