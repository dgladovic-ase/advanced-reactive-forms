import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function forbiddenTitleValidator(forbiddenWords: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }
        const forbidden = forbiddenWords.some(word => control.value.includes(word));
        return forbidden ? { forbiddenTitle: { value: control.value } } : null;
    };
}