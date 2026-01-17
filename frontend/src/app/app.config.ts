import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router configuration ensures proper routing on app startup
    provideRouter(
      routes,
      withComponentInputBinding() // Enable component input binding from route params
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ]
};
