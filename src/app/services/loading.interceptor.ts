import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from './loading.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService); // Inject the service dynamically
    loadingService.show();

    return next(req).pipe(
        finalize(() => loadingService.hide())
    );
};
