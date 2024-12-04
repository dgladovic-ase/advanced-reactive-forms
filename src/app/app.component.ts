import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from './shared/navigation/navigation.component';
import { FooterComponent } from './shared/footer/footer.component';
import { GlobalSpinnerComponent } from './shared/global-spinner/global-spinner.component';
import { LoadingService } from './services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavigationComponent, FooterComponent, GlobalSpinnerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'advanced-reactive-forms';

  constructor(public loadingService: LoadingService) { }

  ngOnInit(): void {
    // Subscribe to loading updates
    this.loadingService.loading$.subscribe();
  }
}
