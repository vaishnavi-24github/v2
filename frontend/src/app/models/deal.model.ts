export interface Deal {
  id: number | string;
  dealName: string;
  dealValue: number;
  stage: DealStage | string | null;
  currentStage?: string; // Backend may send this field
  clientName: string;
  dealType?: string;
  sector?: string;
  summary?: string;
  description: string;
  expectedCloseDate: string;
  createdDate?: string;
  lastModifiedDate?: string;
  createdBy?: string;
  notes?: DealNote[];
}

export interface DealNote {
  id: number;
  content: string;
  createdDate: string;
  createdBy: string;
}

export type DealStage = 
  | 'PROSPECTING'
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

// Backend expects: dealName (REQUIRED), clientName, dealType, sector, summary, currentStage
export interface CreateDealRequest {
  dealName: string;
  clientName: string;
  dealType: string;
  sector: string;
  summary: string;
  currentStage: 'Prospect' | 'UnderEvaluation' | 'TermSheetSubmitted' | 'Closed' | 'Lost';
}

export interface UpdateDealRequest {
  summary?: string;
  sector?: string;
  dealType?: string;
}

export interface AddNoteRequest {
  noteText: string;
}
