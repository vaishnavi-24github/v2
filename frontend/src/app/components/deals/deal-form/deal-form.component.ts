import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { DealService } from '../../../services/deal.service';
import { AuthService } from '../../../services/auth.service';
import { Deal, UpdateDealRequest } from '../../../models/deal.model';
import { NavigationComponent } from '../../shared/navigation/navigation.component';

// Backend stage enum values: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
export type BackendStage = 'Prospect' | 'UnderEvaluation' | 'TermSheetSubmitted' | 'Closed' | 'Lost';

const DEAL_STAGES: { value: BackendStage; label: string }[] = [
  { value: 'Prospect', label: 'Prospect' },
  { value: 'UnderEvaluation', label: 'Under Evaluation' },
  { value: 'TermSheetSubmitted', label: 'Term Sheet Submitted' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Lost', label: 'Lost' }
];

@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavigationComponent
  ],
  templateUrl: './deal-form.component.html',
  styleUrl: './deal-form.component.css'
})
export class DealFormComponent implements OnInit {
  dealForm: FormGroup;
  loading = false;
  isEditMode = false;
  dealId: number | string | null = null;
  isAdmin = false;
  dealStages = DEAL_STAGES;

  constructor(
    private fb: FormBuilder,
    private dealService: DealService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.isAdmin = this.authService.isAdmin();
    // Initialize with create mode form - Backend expects: dealName (REQUIRED), clientName, dealType, sector, summary, currentStage
    // Will be updated in ngOnInit if edit mode
    this.dealForm = this.fb.group({
      dealName: ['', [Validators.required]],
      clientName: ['', [Validators.required]],
      dealType: ['', [Validators.required]],
      sector: ['', [Validators.required]],
      summary: ['', [Validators.required]],
      currentStage: ['Prospect', [Validators.required]], // Default to 'Prospect'
      notes: [''], // Optional notes field
      dealValue: [0, this.isAdmin ? [Validators.min(0)] : []] // Deal value - ADMIN only
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      const parsedId = Number(id);
      this.dealId = !isNaN(parsedId) && isFinite(parsedId) ? parsedId : (id as any);
      console.log('Edit mode - Deal ID:', this.dealId, typeof this.dealId);
      
      // Reinitialize form for edit mode with only summary, sector, dealType
      this.dealForm = this.fb.group({
        summary: ['', [Validators.required]],
        sector: ['', [Validators.required]],
        dealType: ['', [Validators.required]]
      });
      
      this.loadDeal();
    }
  }

  loadDeal(): void {
    if (!this.dealId) {
      console.warn('Cannot load deal: dealId is null');
      return;
    }

    this.loading = true;
    const dealId: number | string = this.dealId;
    this.dealService.getDealById(dealId).subscribe({
      next: (deal) => {
        console.log('Loaded deal for editing:', deal);
        
        // For edit mode, map backend fields to form fields
        // Backend may send: summary, sector, dealType
        // Also check for alternative field names
        const dealData = deal as any;
        
        this.dealForm.patchValue({
          summary: dealData.summary || dealData.dealName || dealData.description || '',
          sector: dealData.sector || dealData.clientName || '',
          dealType: dealData.dealType || dealData.stage || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading deal:', err);
        const errorMessage = this.extractErrorMessage(err);
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        this.router.navigate(['/deals']);
      }
    });
  }

  onSubmit(): void {
    if (this.dealForm.valid) {
      this.loading = true;
      const formValue = this.dealForm.getRawValue();

      console.log('Submitting deal form (before formatting):', formValue);

      if (this.isEditMode && this.dealId) {
        // Edit mode: Send ONLY summary, sector, dealType (backend requirements)
        // DO NOT send id, dealValue, stage, notes, or any other fields
        const updatePayload: UpdateDealRequest = {
          summary: formValue.summary || undefined,
          sector: formValue.sector || undefined,
          dealType: formValue.dealType || undefined
        };
        
        // Remove undefined/empty values
        Object.keys(updatePayload).forEach(key => {
          const value = updatePayload[key as keyof UpdateDealRequest];
          if (value === undefined || value === null || value === '') {
            delete updatePayload[key as keyof UpdateDealRequest];
          }
        });

        console.log('Updating deal with ID:', this.dealId);
        console.log('Update payload (summary, sector, dealType only):', updatePayload);
        
        const dealIdForUpdate: number | string = this.dealId;
        
        this.dealService.updateDeal(dealIdForUpdate, updatePayload).subscribe({
          next: (deal) => {
            console.log('Deal updated successfully:', deal);
            this.loading = false;
            this.snackBar.open('Deal updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/deals']);
          },
          error: (err) => {
            this.loading = false;
            const errorMessage = this.extractErrorMessage(err);
            this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
          }
        });
      } else {
        // Create mode: Backend expects: dealName (REQUIRED), clientName, dealType, sector, summary, currentStage
        // Notes and dealValue are handled separately (notes via POST /api/deals/{id}/notes, dealValue via PATCH /api/deals/{id}/value)
        const createPayload = {
          dealName: formValue.dealName?.trim() || '',
          clientName: formValue.clientName?.trim() || '',
          dealType: formValue.dealType?.trim() || '',
          sector: formValue.sector?.trim() || '',
          summary: formValue.summary?.trim() || '',
          currentStage: formValue.currentStage || 'Prospect'
        };
        
        // Validate that all required fields are present and not empty
        if (!createPayload.dealName || !createPayload.clientName || !createPayload.dealType || !createPayload.sector || !createPayload.summary || !createPayload.currentStage) {
          this.loading = false;
          this.snackBar.open('Error: All fields are required', 'Close', { duration: 5000 });
          return;
        }
        
        console.log('Creating deal - Request payload:', JSON.stringify(createPayload, null, 2));
        this.dealService.createDeal(createPayload).subscribe({
          next: (deal) => {
            console.log('Deal created successfully:', deal);
            
            // If ADMIN provided deal value, update it separately
            if (this.isAdmin && formValue.dealValue && formValue.dealValue > 0) {
              this.dealService.updateDealValue(deal.id, formValue.dealValue).subscribe({
                next: () => {
                  console.log('Deal value updated successfully');
                },
                error: (err) => {
                  console.error('Error updating deal value:', err);
                  // Don't fail the whole operation if deal value update fails
                }
              });
            }
            
            // If notes were provided, add them separately
            if (formValue.notes && formValue.notes.trim().length > 0) {
              const notePayload = { noteText: formValue.notes.trim() };
              this.dealService.addNoteToDeal(deal.id, notePayload).subscribe({
                next: () => {
                  console.log('Note added successfully');
                },
                error: (err) => {
                  console.error('Error adding note:', err);
                  // Don't fail the whole operation if note addition fails
                }
              });
            }
            
            this.loading = false;
            this.snackBar.open('Deal created successfully', 'Close', { duration: 3000 });
            // Navigate back to deals list - router subscription will reload the list
            this.router.navigate(['/deals']);
          },
          error: (err) => {
            this.loading = false;
            console.error('Create deal error:', err);
            const errorMessage = this.extractErrorMessage(err);
            this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 7000 });
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/deals']);
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
        
        // Nested error structure
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
