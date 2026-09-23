import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

// Carga los datos de formato de 'es-PE'. Sin este import, `LOCALE_ID` apunta a
// un locale desconocido y los pipes `| number`, `| date`, etc. lanzan NG0701,
// abortando el change detection a media plantilla.
import './core/i18n/locale-es-pe';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync(),
    provideHttpClient(),
    provideNativeDateAdapter(), 
    provideAnimations(),
   /// provideDateFnsAdapter, provideLuxonDateAdapter, provideMomentDateAdapter
    { provide: LOCALE_ID, useValue: 'es-PE' }
  ]
};
