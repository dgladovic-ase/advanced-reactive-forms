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

import { provideStore } from '@ngrx/store'
import { provideEffects } from '@ngrx/effects'
import { taskReducer } from './store/task.reducer';
import { TaskEffects } from './store/task.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools'

export function loggerFactory(): LoggerService {
  const isDev = true; // Determine this dynamically based on environment
  return isDev ? new ConsoleLoggerService() : new FileLoggerService();
}

const rootReducers = {
  tasks: taskReducer
};

const rootEffects = [TaskEffects];

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(rootReducers),
    provideEffects(rootEffects),
    provideStoreDevtools({maxAge: 25}),
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
