import { Component } from '@angular/core';
import { ProfileService } from '../../core/services/user-profile/profile.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { Inject } from '@angular/core';
import { PermissionList, UserProfile } from '../../models/UserProfile';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider, icons } from 'lucide-angular';
import { NavModule } from '../../component/tab/tab.module';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [LucideAngularModule, NavModule, CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers:[{provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(icons)}, LanguageService]
})
export class ProfileComponent {
  constructor(
      private profileService: ProfileService,
      private authService: AuthService,
      private sanitizer: DomSanitizer, 
      private formBuilder: FormBuilder,
          @Inject(AlertToastService) private alertToast: AlertToastService
      , public translate: TranslateService
  ) { translate.setDefaultLang('en'); }

  profileInfo: any | null = null;
  permissions: PermissionList[] = [];
  profileKeys: string[] = [];

  // parametros para actualizar la informacion del usuario
  profileForm = this.formBuilder.group({
    name: [{ value: '', disabled: !this.withPermissions(['UPDATE']) }],
    lastName: [{ value: '', disabled: !this.withPermissions(['UPDATE']) }],
    address: '',
    email: '',
    phoneNumber:'',
    identification:  '',
    password: '',
    passwordConfirmation: '',
  },
  { validators: this.checkPassword, }
  );

  ngOnInit(): void{
    this.getProfile()
  }

  withPermissions(permissions: string[]): boolean{
    return this.authService.includesPermission(permissions)
  }

  getProfile(){
    this.profileService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.profileInfo = profile;

        this.profileInfo.roles?.forEach((role: any) => 
          {if(role.permissionList){
            this.permissions.push(role.permissionList)
            this.permissions = this.permissions?.flatMap((permission: PermissionList) => permission);
          }else{
            this.permissions = []
          }
          }
        )

        this.profileKeys = Object.keys(this.profileInfo).map((key) =>
          key === 'phoneNumber' ? 'phone number' : key &&
          key === 'lastName' ? 'last name' : key 
        )
      

      },error(err) {
        console.log('No se pudo obtener perfil', err)
      },

    })
  }

  checkPassword(form: FormGroup){
    const password = form.get('password')?.value;
    const confirm = form.get('passwordConfirmation')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
  
  updateProfile(){
    const formData: any = this.profileForm.value;

    // Remove empty or unchanged fields
    const filteredData: any = {};
    for (const key in formData) {
      const value = formData[key];
      if (value && value !== this.profileInfo?.[key]) {
        filteredData[key] = value;
      }
    }
    console.log(filteredData)
    const body = filteredData

    this.profileService.editProfile(body).subscribe({
      next: (data) => {
        console.log('Actualizacion Exitosa: ', body)
      },
      error: (err) => {
        console.error('Error al cambiar el estado del usuario:', err);
      }
    });
  }

  getPermissionBadge(permission: string): SafeHtml{
    let badge = ``;
    switch(permission){
      case 'DELETE':
        badge = `<p class="dark:text-zink-200 border border-red-200 bg-red-100 text-red-500 dark:bg-red-500/20 w-fit text-center px-3 my-1 rounded-full">
                  ${permission}
                </p>`
        break;
      case 'UPDATE': 
        badge =`<p class="dark:text-zink-200 border border-yellow-200 bg-yellow-100 text-yellow-500 dark:bg-yellow-500/20 w-fit text-center px-3 my-1 rounded-full">
                  ${permission}
                </p>`
      break;
      case 'READ': 
        badge = `<p class=" dark:text-zink-200 border border-sky-200 bg-sky-100 text-sky-500 dark:bg-sky-500/20 w-fit text-center px-3 my-1 rounded-full">
                  ${permission}
                </p>`
      break;
      case 'WRITE': 
        badge = `<p class=" dark:text-zink-200 border border-green-200 bg-green-100 text-green-500 dark:bg-green-500/20 w-fit text-center px-3 my-1 rounded-full">
                  ${permission}
                </p>`
      break;
      case 'CREATE': 
        badge = `<p class=" dark:text-zink-200 border border-purple-200 bg-purple-100 text-purple-500 dark:bg-purple-500/20 w-fit text-center px-3 my-1 rounded-full">
                  ${permission}
                </p>`
      break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(badge);
  }

}
