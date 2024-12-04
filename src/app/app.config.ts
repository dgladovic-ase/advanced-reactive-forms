import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { LoggerService } from './services/logger.service';
import { ConsoleLoggerService } from './services/console-logger.service';
import { FileLoggerService } from './services/file-logger.service';
import { LOGGER_SERVICES } from './services/logger.tokens';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LoadingInterceptor } from './services/loading.interceptor';
import { ErrorInterceptor } from './services/error.interceptor';

export function loggerFactory(): LoggerService {
  const isDev = true; // Determine this dynamically based on environment
  return isDev ? new ConsoleLoggerService() : new FileLoggerService();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        LoadingInterceptor,
        ErrorInterceptor
      ])
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: LOGGER_SERVICES,
      useClass: ConsoleLoggerService,
      multi: true
    },
    {
      provide: LOGGER_SERVICES,
      useClass: FileLoggerService,
      multi: true
    },
    {
      provide: LoggerService,
      useFactory: loggerFactory
    }
  ]
};
