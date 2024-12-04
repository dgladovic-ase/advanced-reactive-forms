import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit {
  searchControl: FormControl = new FormControl('');
  searchVisible: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // Determine if the search bar should be visible based on the route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.searchVisible = this.router.url.includes('/tasks');
    });

    // React to changes in the search input value
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Replace MAIN_MENU_CONSTANTS.DEBOUNCE_TIME with 300ms
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.updateQueryParams(query ?? '');
      });
  }

  updateQueryParams(query: string): void {
    this.router.navigate([], {
      queryParams: { keyword: query || null },
      queryParamsHandling: 'merge' // This keeps the other query params while adding/updating `keyword`
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
  }
}
