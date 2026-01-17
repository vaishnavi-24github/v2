import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Deal Pipeline Management';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check the actual browser URL on app initialization
    // If browser opened directly to /deals (from history/bookmark), redirect to /login first
    // This ensures login page always shows first on fresh app load
    const browserPath = window.location.pathname;
    const browserSearch = window.location.search;
    
    // If browser path is /deals (or starts with /deals) and NOT coming from AuthGuard redirect
    // (no returnUrl query param), redirect to /login first
    // This handles cases where browser restores /deals from history on app load
    if ((browserPath === '/deals' || browserPath.startsWith('/deals/')) && !browserSearch.includes('returnUrl=')) {
      // Redirect to login first - ensures login page shows first on fresh app load
      // User must go through login page, even if token exists
      this.router.navigate(['/login'], { replaceUrl: true });
    }
    // Otherwise, let Angular Router handle the navigation normally
  }
}
