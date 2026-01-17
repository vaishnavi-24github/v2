import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

// Backend expects these stage values: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
export type BackendStage = 'Prospect' | 'UnderEvaluation' | 'TermSheetSubmitted' | 'Closed' | 'Lost';

const BACKEND_STAGES: BackendStage[] = [
  'Prospect',
  'UnderEvaluation',
  'TermSheetSubmitted',
  'Closed',
  'Lost'
];

@Component({
  selector: 'app-update-stage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Update Deal Stage</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>New Stage</mat-label>
        <mat-select [(ngModel)]="selectedStage">
          <mat-option *ngFor="let stage of stages" [value]="stage.value">
            {{ stage.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!selectedStage">
        Update
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      min-width: 300px;
    }
    mat-dialog-content {
      padding: 20px;
    }
  `]
})
export class UpdateStageDialogComponent {
  // Map backend stage values to display labels
  stages = [
    { value: 'Prospect', label: 'Prospect' },
    { value: 'UnderEvaluation', label: 'Under Evaluation' },
    { value: 'TermSheetSubmitted', label: 'Term Sheet Submitted' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Lost', label: 'Lost' }
  ];
  
  selectedStage: string;

  constructor(
    public dialogRef: MatDialogRef<UpdateStageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStage: string | null }
  ) {
    // Map current stage to backend format if needed
    // Backend values: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
    const currentStageStr = data.currentStage ? String(data.currentStage) : 'Prospect';
    
    // Map frontend stage values to backend format
    const stageMapping: Record<string, string> = {
      'PROSPECTING': 'Prospect',
      'QUALIFICATION': 'UnderEvaluation',
      'PROPOSAL': 'TermSheetSubmitted',
      'NEGOTIATION': 'TermSheetSubmitted',
      'CLOSED_WON': 'Closed',
      'CLOSED_LOST': 'Lost'
    };
    
    // Check if current stage needs mapping
    this.selectedStage = stageMapping[currentStageStr] || currentStageStr;
    
    // Ensure selected stage is valid, default to Prospect
    if (!this.stages.find(s => s.value === this.selectedStage)) {
      this.selectedStage = 'Prospect';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.selectedStage) {
      this.dialogRef.close(this.selectedStage);
    }
  }
}
