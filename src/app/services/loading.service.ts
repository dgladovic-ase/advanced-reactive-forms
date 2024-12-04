import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);

    // Observable for loading status
    get loading$(): Observable<boolean> {
        return this.loadingSubject.asObservable();
    }

    // Show the spinner
    show(): void {
        this.loadingSubject.next(true);
    }

    // Hide the spinner
    hide(): void {
        this.loadingSubject.next(false);
    }
}