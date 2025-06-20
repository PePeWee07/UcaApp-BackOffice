import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

import { provideI18Next } from 'angular-i18next';
import i18next from 'i18next';
// import Backend from 'i18next-http-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';

import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';

// // Initialize i18next
// i18next
//   // .use(Backend)
//   // .use(LanguageDetector)
//   .init({
//     fallbackLng: 'en',
//     debug: true,
//     interpolation: { escapeValue: false },
//     backend: {
//       loadPath: '/assets/locales/{{lng}}/{{ns}}.json',
//     },
//   });

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, tokenInterceptor])
    ),
  ],
};
