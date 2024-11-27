import { InjectionToken } from '@angular/core';
import { LoggerService } from './logger.service';

export const LOGGER_SERVICES = new InjectionToken<LoggerService[]>('LOGGER_SERVICES');