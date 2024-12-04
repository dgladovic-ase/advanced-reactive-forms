import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private router: Router) { }

    login(): void {
        // Save a mock token to simulate authentication
        localStorage.setItem('authToken', 'mock-token');
        // Redirect to the tasks page after logging in
        this.router.navigate(['/tasks']);
    }

    logout(): void {
        // Remove the token to log out the user
        localStorage.removeItem('authToken');
        // Redirect to the login page
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('authToken');
    }
}
