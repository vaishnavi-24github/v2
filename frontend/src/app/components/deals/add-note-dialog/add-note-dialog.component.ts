import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { DealNote } from '../../../models/deal.model';

@Component({
  selector: 'app-add-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ viewMode ? 'View Notes' : 'Add Note to Deal' }}{{ dealName ? ': ' + dealName : '' }}</h2>
    <mat-dialog-content>
      <div *ngIf="viewMode && notes && notes.length > 0" class="notes-list">
        <mat-list>
          <mat-list-item *ngFor="let note of notes">
            <div class="note-item">
              <div class="note-content">{{ note.content }}</div>
              <div class="note-meta">
                <small>By {{ note.createdBy }} on {{ formatDate(note.createdDate) }}</small>
              </div>
            </div>
          </mat-list-item>
        </mat-list>
      </div>
      <div *ngIf="viewMode && (!notes || notes.length === 0)" class="no-notes">
        <p>No notes yet. Add a note to track important information about this deal.</p>
      </div>
      <form *ngIf="!viewMode" [formGroup]="noteForm" (ngSubmit)="onSave()" id="noteForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Note</mat-label>
          <textarea matInput formControlName="noteText" rows="5" required placeholder="Enter your note here..."></textarea>
          <mat-error *ngIf="noteForm.get('noteText')?.hasError('required')">
            Note is required
          </mat-error>
          <mat-error *ngIf="noteForm.get('noteText')?.hasError('whitespace')">
            Note cannot be empty
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">{{ viewMode ? 'Close' : 'Cancel' }}</button>
      <button *ngIf="!viewMode" mat-raised-button color="primary" type="submit" form="noteForm" [disabled]="!noteForm.valid">
        Add Note
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      min-width: 400px;
    }
    mat-dialog-content {
      padding: 20px;
      max-height: 500px;
      overflow-y: auto;
    }
    .notes-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .note-item {
      width: 100%;
      padding: 10px 0;
    }
    .note-content {
      margin-bottom: 5px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .note-meta {
      color: rgba(0, 0, 0, 0.54);
      font-size: 0.75rem;
    }
    .no-notes {
      text-align: center;
      padding: 20px;
      color: rgba(0, 0, 0, 0.54);
    }
  `]
})
export class AddNoteDialogComponent {
  noteForm: FormGroup;
  dealName?: string;
  notes?: DealNote[];
  viewMode = false;

  // Custom validator to ensure note is not just whitespace
  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    // Validators.required already handles null/undefined/empty string
    // This validator only checks for whitespace-only strings
    if (control.value && typeof control.value === 'string') {
      const trimmed = control.value.trim();
      if (trimmed.length === 0) {
        return { whitespace: true };
      }
    }
    return null;
  }

  constructor(
    public dialogRef: MatDialogRef<AddNoteDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { dealName?: string; notes?: DealNote[]; viewMode?: boolean }
  ) {
    // Create form group with a control named "noteText"
    this.noteForm = new FormGroup({
      noteText: new FormControl('', [
        Validators.required,
        this.noWhitespaceValidator.bind(this)
      ])
    });

    if (data) {
      this.dealName = data.dealName;
      this.notes = data.notes || [];
      this.viewMode = data.viewMode || false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Mark form as touched to show validation errors
    this.noteForm.markAllAsTouched();

    // Check if form is valid
    if (!this.noteForm.valid) {
      return;
    }

    // Get the noteText value and trim it
    const noteValue = this.noteForm.get('noteText')?.value;
    const trimmedNote = noteValue ? String(noteValue).trim() : '';
    
    // Final validation - ensure noteText is not empty after trimming
    if (!trimmedNote || trimmedNote.length === 0) {
      this.noteForm.get('noteText')?.setErrors({ whitespace: true });
      this.noteForm.get('noteText')?.markAsTouched();
      return;
    }
    
    // Return the trimmed noteText value - it will be wrapped in { noteText: string } by the parent component
    this.dialogRef.close(trimmedNote);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
