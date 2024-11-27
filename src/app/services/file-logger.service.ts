import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable()
export class FileLoggerService extends LoggerService {
    log(message: string): void {
        console.log(`File Logger: ${message}`); // Placeholder for writing to a file or external system
    }
}