import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'daysUntilDue',
    standalone: true
})
export class DaysUntilDuePipe implements PipeTransform {
    transform(dueDate: string): string {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `${diffDays} days left`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else {
            return 'Overdue';
        }
    }
}
