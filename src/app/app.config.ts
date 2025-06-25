import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  provideHttpClient,
  withInterceptors,
  withFetch,
  HttpClient,
} from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // provideI18Next(),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, tokenInterceptor])
    ),
    provideHttpClient(withFetch()),
    TranslateService,
    importProvidersFrom(
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      }
    }),
    )
  ]
};
