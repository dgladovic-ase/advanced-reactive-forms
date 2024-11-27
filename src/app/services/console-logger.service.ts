import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable()
export class ConsoleLoggerService extends LoggerService {
  log(message: string): void {
    console.log(`Console Logger: ${message}`);
  }
}