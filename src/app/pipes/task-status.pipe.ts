import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'taskStatus',
    standalone: true
})
export class TaskStatusPipe implements PipeTransform {
    transform(status: string): string {
        switch (status) {
            case 'Pending':
                return '⏳ Pending';
            case 'Completed':
                return '✔️ Completed';
            default:
                return status;
        }
    }
}
