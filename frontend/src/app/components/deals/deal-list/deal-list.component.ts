import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DealService } from '../../../services/deal.service';
import { AuthService } from '../../../services/auth.service';
import { Deal, DealStage } from '../../../models/deal.model';
import { UpdateStageDialogComponent } from '../update-stage-dialog/update-stage-dialog.component';
import { AddNoteDialogComponent } from '../add-note-dialog/add-note-dialog.component';
import { NavigationComponent } from '../../shared/navigation/navigation.component';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-deal-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    NavigationComponent
  ],
  templateUrl: './deal-list.component.html',
  styleUrl: './deal-list.component.css'
})
export class DealListComponent implements OnInit, OnDestroy {
  deals: Deal[] = [];
  displayedColumns: string[] = ['clientName', 'dealType', 'sector', 'stage'];
  loading = false;
  isAdmin = false;
  private destroy$ = new Subject<void>();

  constructor(
    private dealService: DealService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.isAdmin = this.authService.isAdmin();
    // Add Deal Value column for ADMIN, then Actions column
    if (this.isAdmin) {
      this.displayedColumns.push('dealValue');
    }
    this.displayedColumns.push('actions');
  }

  ngOnInit(): void {
    // AuthGuard already protects this route, so if we reach here, user is authenticated
    // No need to check token again - just load deals
    this.loadDeals();
    
    // Subscribe to router events to reload deals when navigating back to /deals
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => event.url === '/deals' || event.urlAfterRedirects === '/deals'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Reload deals when navigating to /deals route
        this.loadDeals();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDeals(): void {
    this.loading = true;
    this.dealService.getAllDeals().subscribe({
      next: (deals) => {
        console.log('Deals received:', deals);
        // Ensure deals is always an array
        this.deals = Array.isArray(deals) ? deals : [];
        // Log each deal to check structure
        this.deals.forEach((deal, index) => {
          console.log(`Deal ${index}:`, deal);
          console.log(`  Stage:`, deal.stage, typeof deal.stage);
        });
        console.log('Deals array set:', this.deals.length, 'deals');
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading deals:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        // Ensure deals is always an array even on error
        this.deals = [];
        const errorMessage = err.error?.message || err.error?.error || err.message || 'Failed to load deals';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
      }
    });
  }

  createDeal(): void {
    this.router.navigate(['/deals/new']);
  }

  viewDeal(deal: Deal): void {
    this.router.navigate(['/deals', deal.id]);
  }

  editDeal(deal: Deal): void {
    this.router.navigate(['/deals', deal.id, 'edit']);
  }

  deleteDeal(deal: Deal): void {
    if (!this.isAdmin) {
      this.snackBar.open('You do not have permission to delete deals', 'Close', { duration: 3000 });
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete deal "${deal.dealName || deal.clientName}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.dealService.deleteDeal(deal.id).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Deal deleted successfully', 'Close', { duration: 3000 });
        this.loadDeals();
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = this.extractErrorMessage(err);
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
      }
    });
  }

  updateStage(deal: Deal): void {
    const currentStage = this.getStageDisplay(deal);
    const dialogRef = this.dialog.open(UpdateStageDialogComponent, {
      width: '400px',
      data: { currentStage: currentStage }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.dealService.updateDealStage(deal.id, result).subscribe({
          next: (updatedDeal) => {
            this.loading = false;
            this.snackBar.open('Deal stage updated successfully', 'Close', { duration: 3000 });
            // Refresh the deal list to show updated stage
            this.loadDeals();
          },
          error: (err) => {
            this.loading = false;
            console.error('Error updating deal stage:', err);
            console.error('Error status:', err.status);
            console.error('Error statusText:', err.statusText);
            if (err.error) {
              console.error('Error body:', JSON.stringify(err.error, null, 2));
            }
            const errorMessage = this.extractErrorMessage(err);
            this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
          }
        });
      }
    });
  }

  addNote(deal: Deal): void {
    const existingNotes = deal.notes && Array.isArray(deal.notes) ? deal.notes : [];
    const dialogRef = this.dialog.open(AddNoteDialogComponent, {
      width: '600px',
      data: { 
        dealName: deal.dealName,
        notes: existingNotes,
        viewMode: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Prevent submitting empty notes - validate before sending
      const noteText = result ? result.trim() : '';
      if (!noteText || noteText.length === 0) {
        // User cancelled or entered empty note - don't show error for cancellation
        if (result !== null && result !== undefined) {
          // User tried to submit empty note
          this.snackBar.open('Error: Note cannot be empty', 'Close', { duration: 3000 });
        }
        return;
      }
      
      this.loading = true;
      const notePayload = { noteText: noteText };
      console.log('Adding note to deal - ID:', deal.id);
      console.log('Note payload:', JSON.stringify(notePayload, null, 2));
      
      this.dealService.addNoteToDeal(deal.id, notePayload).subscribe({
        next: (updatedDeal) => {
          this.loading = false;
          console.log('Note added successfully:', updatedDeal);
          this.snackBar.open('Note added successfully', 'Close', { duration: 3000 });
          // Refresh the deal list to show updated notes
          this.loadDeals();
        },
        error: (err) => {
          this.loading = false;
          console.error('Error adding note:', err);
          console.error('Error status:', err.status);
          console.error('Error statusText:', err.statusText);
          if (err.error) {
            console.error('Error body:', JSON.stringify(err.error, null, 2));
          }
          
          // Extract backend validation message
          const errorMessage = this.extractErrorMessage(err);
          this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
        }
      });
    });
  }

  getNotesCount(deal: Deal): number {
    return deal.notes && Array.isArray(deal.notes) ? deal.notes.length : 0;
  }

  getStageDisplay(deal: Deal): string | null {
    // Backend may send 'currentStage' field or 'stage' field
    // Backend values: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
    let stageValue: string | null = null;
    
    // Check currentStage first (backend field name)
    if ((deal as any).currentStage) {
      stageValue = String((deal as any).currentStage);
    } else if (deal.stage) {
      if (typeof deal.stage === 'string') {
        stageValue = deal.stage;
      } else if (typeof deal.stage === 'object' && deal.stage !== null) {
        stageValue = (deal.stage as any).name || (deal.stage as any).value || String(deal.stage);
      } else {
        stageValue = String(deal.stage);
      }
    }
    
    // Try alternative field names if still no value
    if (!stageValue) {
      const altStage = (deal as any).dealStage || 
                       (deal as any).stageType || 
                       (deal as any).stageName ||
                       (deal as any).deal_stage;
      
      if (altStage) {
        stageValue = typeof altStage === 'string' ? altStage : String(altStage);
      }
    }
    
    return stageValue;
  }

  getStageColor(stage: DealStage | string | null | undefined): string {
    if (!stage) return 'primary';
    
    // Handle both frontend stage values and backend stage values
    // Backend: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
    // Frontend: PROSPECTING, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST
    const stageStr = String(stage);
    const stageUpper = stageStr.toUpperCase();
    
    const colors: Record<string, string> = {
      // Frontend values
      'PROSPECTING': 'primary',
      'QUALIFICATION': 'accent',
      'PROPOSAL': 'warn',
      'NEGOTIATION': 'primary',
      'CLOSED_WON': 'primary',
      'CLOSED_LOST': 'warn',
      // Backend values
      'PROSPECT': 'primary',
      'UNDEREVALUATION': 'accent',
      'TERMSHEETSUBMITTED': 'warn',
      'CLOSED': 'primary',
      'LOST': 'warn'
    };
    
    return colors[stageUpper] || 'primary';
  }


  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'An unexpected error occurred';
    
    // Check for backend validation messages
    if (err.error) {
      // String error
      if (typeof err.error === 'string') {
        return err.error;
      }
      
      // Object error - check common validation error structures
      if (typeof err.error === 'object') {
        // Spring Boot validation errors
        if (err.error.errors && Array.isArray(err.error.errors)) {
          const validationErrors = err.error.errors.map((e: any) => 
            e.defaultMessage || e.message || `${e.field}: ${e.rejectedValue || 'invalid'}`
          ).join(', ');
          return validationErrors || err.error.message || 'Validation failed';
        }
        
        // Direct message fields
        if (err.error.message) return err.error.message;
        if (err.error.error) return err.error.error;
        if (err.error.details) return err.error.details;
        if (err.error.msg) return err.error.msg;
        
        // Nested error structure - check for field-specific validation errors
        if (err.error.data && typeof err.error.data === 'object') {
          // Check for field-specific errors (e.g., { noteText: "Note text is required" })
          const fieldErrors = Object.keys(err.error.data)
            .filter(key => typeof err.error.data[key] === 'string')
            .map(key => err.error.data[key]);
          if (fieldErrors.length > 0) {
            return fieldErrors.join(', ');
          }
          // Check for message in data object
          if (err.error.data.message) return err.error.data.message;
          if (err.error.data.error) return err.error.data.error;
          if (Array.isArray(err.error.data)) {
            return err.error.data.map((e: any) => e.message || e).join(', ');
          }
        }
        
        // Fallback to general error structure
        const errorData = err.error.data || err.error;
        if (errorData && typeof errorData === 'object') {
          if (errorData.message) return errorData.message;
          if (errorData.error) return errorData.error;
          if (Array.isArray(errorData)) {
            return errorData.map((e: any) => e.message || e).join(', ');
          }
        }
      }
    }
    
    // HTTP status-based messages (check backend message first)
    if (err.status === 400) {
      // Try to extract backend validation message first
      if (err.error?.message) return err.error.message;
      return 'Bad Request: Invalid data provided. Please check your input.';
    }
    if (err.status === 401) return 'Unauthorized. Please log in again.';
    if (err.status === 403) return 'Forbidden. You do not have permission.';
    if (err.status === 404) return 'Resource not found.';
    if (err.status === 500) {
      // Extract backend error message for 500 errors
      if (err.error?.message) return err.error.message;
      if (err.error?.error) return err.error.error;
      return 'Server Error: An unexpected error occurred on the server.';
    }
    
    return err.message || 'An unexpected error occurred. Please try again.';
  }
}
