import {
    HttpInterceptorFn,
    HttpRequest,
    HttpHandlerFn,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const ErrorInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    return next(req).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse) {
                // Handle different HTTP error statuses
                switch (error.status) {
                    case 400:
                        console.error('Bad Request:', error.message);
                        alert('There was an issue with your request. Please try again.');
                        break;
                    case 401:
                        console.error('Unauthorized:', error.message);
                        alert('You are not authorized. Please log in.');
                        break;
                    case 404:
                        console.error('Not Found:', error.message);
                        alert('The requested resource was not found.');
                        break;
                    case 500:
                        console.error('Server Error:', error.message);
                        alert('An internal server error occurred. Please try again later.');
                        break;
                    default:
                        console.error('Unknown Error:', error.message);
                        alert('An unexpected error occurred. Please try again.');
                        break;
                }
            }

            // Always rethrow the error so that the caller can handle it if needed
            return throwError(() => error);
        })
    );
};
