import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!localStorage.getItem('authToken');
    if (!isLoggedIn) {
      // Redirect to the login page if the user is not authenticated
      this.router.navigate(['/login']);
    }
    return isLoggedIn;
  }
}
