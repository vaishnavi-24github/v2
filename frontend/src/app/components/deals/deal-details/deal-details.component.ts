import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DealService } from '../../../services/deal.service';
import { AuthService } from '../../../services/auth.service';
import { Deal, DealStage } from '../../../models/deal.model';
import { NavigationComponent } from '../../shared/navigation/navigation.component';
import { UpdateStageDialogComponent } from '../update-stage-dialog/update-stage-dialog.component';
import { AddNoteDialogComponent } from '../add-note-dialog/add-note-dialog.component';

@Component({
  selector: 'app-deal-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NavigationComponent
  ],
  templateUrl: './deal-details.component.html',
  styleUrl: './deal-details.component.css'
})
export class DealDetailsComponent implements OnInit {
  deal: Deal | null = null;
  loading = false;
  isAdmin = false;
  isEditMode = false;
  dealValueForm: FormGroup;

  constructor(
    private dealService: DealService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.dealValueForm = this.fb.group({
      dealValue: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const parsedId = Number(id);
      const dealId = !isNaN(parsedId) && isFinite(parsedId) ? parsedId : (id as any);
      this.loadDeal(dealId);
    } else {
      this.snackBar.open('Invalid deal ID', 'Close', { duration: 3000 });
      this.router.navigate(['/deals']);
    }
  }

  loadDeal(id: number | string): void {
    this.loading = true;
    this.dealService.getDealById(id).subscribe({
      next: (deal) => {
        this.deal = deal;
        this.dealValueForm.patchValue({ dealValue: deal.dealValue || 0 });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = this.extractErrorMessage(err);
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        this.router.navigate(['/deals']);
      }
    });
  }

  getStageDisplay(deal: Deal): string | null {
    if ((deal as any).currentStage) {
      return String((deal as any).currentStage);
    } else if (deal.stage) {
      if (typeof deal.stage === 'string') {
        return deal.stage;
      } else if (typeof deal.stage === 'object' && deal.stage !== null) {
        return (deal.stage as any).name || (deal.stage as any).value || String(deal.stage);
      } else {
        return String(deal.stage);
      }
    }
    return null;
  }

  getStageColor(stage: DealStage | string | null | undefined): string {
    if (!stage) return 'primary';
    const stageStr = String(stage);
    const stageUpper = stageStr.toUpperCase();
    const colors: Record<string, string> = {
      'PROSPECT': 'primary',
      'UNDEREVALUATION': 'accent',
      'TERMSHEETSUBMITTED': 'warn',
      'CLOSED': 'primary',
      'LOST': 'warn'
    };
    return colors[stageUpper] || 'primary';
  }

  updateStage(): void {
    if (!this.deal) return;
    const currentStage = this.getStageDisplay(this.deal);
    const dialogRef = this.dialog.open(UpdateStageDialogComponent, {
      width: '400px',
      data: { currentStage: currentStage }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.dealService.updateDealStage(this.deal!.id, result).subscribe({
          next: (updatedDeal) => {
            this.deal = updatedDeal;
            this.loading = false;
            this.snackBar.open('Deal stage updated successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.loading = false;
            const errorMessage = this.extractErrorMessage(err);
            this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
          }
        });
      }
    });
  }

  addNote(): void {
    if (!this.deal) return;
    const existingNotes = this.deal.notes && Array.isArray(this.deal.notes) ? this.deal.notes : [];
    const dialogRef = this.dialog.open(AddNoteDialogComponent, {
      width: '600px',
      data: { 
        dealName: this.deal.dealName,
        notes: existingNotes,
        viewMode: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const noteText = result ? result.trim() : '';
      if (!noteText || noteText.length === 0) {
        if (result !== null && result !== undefined) {
          this.snackBar.open('Error: Note cannot be empty', 'Close', { duration: 3000 });
        }
        return;
      }
      
      this.loading = true;
      const notePayload = { noteText: noteText };
      this.dealService.addNoteToDeal(this.deal!.id, notePayload).subscribe({
        next: (updatedDeal) => {
          this.deal = updatedDeal;
          this.loading = false;
          this.snackBar.open('Note added successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.loading = false;
          const errorMessage = this.extractErrorMessage(err);
          this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
        }
      });
    });
  }

  updateDealValue(): void {
    if (!this.deal || !this.isAdmin || !this.dealValueForm.valid) return;
    
    const newValue = this.dealValueForm.get('dealValue')?.value;
    if (newValue === this.deal.dealValue) {
      this.snackBar.open('Deal value unchanged', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.dealService.updateDealValue(this.deal.id, newValue).subscribe({
      next: (updatedDeal) => {
        this.deal = updatedDeal;
        this.dealValueForm.patchValue({ dealValue: updatedDeal.dealValue || 0 });
        this.loading = false;
        this.isEditMode = false;
        this.snackBar.open('Deal value updated successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = this.extractErrorMessage(err);
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
      }
    });
  }

  editDeal(): void {
    if (this.deal) {
      this.router.navigate(['/deals', this.deal.id, 'edit']);
    }
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }

  private extractErrorMessage(err: any): string {
    if (!err) return 'An unexpected error occurred';
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (typeof err.error === 'object') {
        if (err.error.errors && Array.isArray(err.error.errors)) {
          return err.error.errors.map((e: any) => e.defaultMessage || e.message).join(', ');
        }
        if (err.error.message) return err.error.message;
        if (err.error.error) return err.error.error;
      }
    }
    if (err.status === 400) return 'Bad Request: Invalid data provided.';
    if (err.status === 401) return 'Unauthorized. Please log in again.';
    if (err.status === 403) return 'Forbidden. You do not have permission.';
    if (err.status === 404) return 'Resource not found.';
    if (err.status === 500) return err.error?.message || 'Server Error: An unexpected error occurred.';
    return err.message || 'An unexpected error occurred.';
  }
}
