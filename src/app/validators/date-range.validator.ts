import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(startDateField: string, dueDateField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const startDate = control.get(startDateField)?.value;
        const dueDate = control.get(dueDateField)?.value;

        if (startDate && dueDate && new Date(dueDate) <= new Date(startDate)) {
            return { dateRangeInvalid: true };
        }
        return null;
    };
}
