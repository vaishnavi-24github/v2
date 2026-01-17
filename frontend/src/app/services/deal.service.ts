import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Deal, CreateDealRequest, UpdateDealRequest, AddNoteRequest } from '../models/deal.model';

@Injectable({
  providedIn: 'root'
})
export class DealService {
  constructor(private http: HttpClient) {}

  private extractDealData(response: any): Deal {
    // Handle nested response structure
    const dealData = response.data || response;
    
    // Normalize field names if needed (handle camelCase vs snake_case)
    if (dealData) {
      // Handle stage field - check currentStage first (backend field name)
      // Backend may send 'currentStage' with values like: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
      if (dealData.currentStage) {
        dealData.stage = dealData.currentStage;
      } else if (dealData.stage && typeof dealData.stage === 'object' && dealData.stage !== null) {
        // Extract value from stage object
        dealData.stage = dealData.stage.name || 
                        dealData.stage.value || 
                        dealData.stage.toString() ||
                        dealData.stage;
      } else if (!dealData.stage || dealData.stage === null || dealData.stage === undefined) {
        // Try various stage field name variations
        dealData.stage = dealData.dealStage || 
                        dealData.stageType || 
                        dealData.stageName ||
                        dealData.deal_stage ||
                        dealData.stage_type ||
                        dealData.stage_name;
      }
      
      // Preserve currentStage if it exists
      if (dealData.currentStage && !dealData.stage) {
        dealData.stage = dealData.currentStage;
      }
      
      // Handle other potential field name variations
      if (!dealData.dealName && dealData.deal_name) {
        dealData.dealName = dealData.deal_name;
      }
      if (!dealData.clientName && dealData.client_name) {
        dealData.clientName = dealData.client_name;
      }
      if (!dealData.expectedCloseDate && dealData.expected_close_date) {
        dealData.expectedCloseDate = dealData.expected_close_date;
      }
      if (dealData.expectedCloseDate && dealData.expected_close_date && !dealData.expectedCloseDate) {
        dealData.expectedCloseDate = dealData.expected_close_date;
      }
      if (!dealData.dealValue && dealData.deal_value) {
        dealData.dealValue = dealData.deal_value;
      }
      if (!dealData.dealType && dealData.deal_type) {
        dealData.dealType = dealData.deal_type;
      }
      if (!dealData.sector && dealData.sector) {
        // sector field name is the same, but check for summary field mapping
        dealData.sector = dealData.sector;
      }
      if (!dealData.summary && dealData.description) {
        dealData.summary = dealData.description;
      }
      
      // Ensure notes array exists
      if (!dealData.notes) {
        dealData.notes = [];
      }
    }
    
    return dealData;
  }

  private extractDealsArray(response: any): Deal[] {
    // Handle nested response structure
    let deals: any[] = [];
    
    if (Array.isArray(response)) {
      deals = response;
    } else if (response.data && Array.isArray(response.data)) {
      deals = response.data;
    } else if (response.content && Array.isArray(response.content)) {
      deals = response.content;
    } else {
      console.warn('Unexpected response structure:', response);
      return [];
    }
    
    // Normalize each deal's field names
    return deals.map(deal => this.extractDealData(deal));
  }

  getAllDeals(): Observable<Deal[]> {
    return this.http.get<any>(`${environment.apiUrl}/deals`).pipe(
      map(response => {
        console.log('Raw deals response from API:', response);
        console.log('Response type:', typeof response);
        console.log('Is array?', Array.isArray(response));
        if (response && typeof response === 'object') {
          console.log('Response keys:', Object.keys(response));
        }
        
        const deals = this.extractDealsArray(response);
        console.log('Extracted deals array:', deals);
        
        // Log detailed info about each deal's stage
        deals.forEach((deal, index) => {
          console.log(`\nDeal ${index} (${deal.dealName || 'unnamed'}):`);
          console.log('  All keys:', Object.keys(deal));
          console.log('  stage value:', deal.stage);
          console.log('  stage type:', typeof deal.stage);
          if (deal.stage && typeof deal.stage === 'object') {
            console.log('  stage object:', JSON.stringify(deal.stage, null, 2));
          }
        });
        
        return deals;
      })
    );
  }

  getDealById(id: number | string): Observable<Deal> {
    console.log('Getting deal by ID:', id, typeof id);
    return this.http.get<any>(`${environment.apiUrl}/deals/${id}`).pipe(
      map(response => {
        console.log('Get deal by ID response:', response);
        const deal = this.extractDealData(response);
        console.log('Extracted deal:', deal);
        return deal;
      })
    );
  }

  createDeal(deal: CreateDealRequest): Observable<Deal> {
    console.log('Creating deal - Input payload:', deal);
    
    // Backend expects: dealName (REQUIRED), clientName, dealType, sector, summary, currentStage
    // DO NOT send: dealValue, expectedCloseDate, id, notes, or any other fields
    const payload = {
      dealName: deal.dealName?.trim() || '',
      clientName: deal.clientName?.trim() || '',
      dealType: deal.dealType?.trim() || '',
      sector: deal.sector?.trim() || '',
      summary: deal.summary?.trim() || '',
      currentStage: deal.currentStage || 'Prospect'
    };
    
    // Validate required fields
    if (!payload.dealName || !payload.clientName || !payload.dealType || !payload.sector || !payload.summary || !payload.currentStage) {
      console.error('Create deal validation failed - missing required fields:', payload);
      return throwError(() => new Error('All fields (dealName, clientName, dealType, sector, summary, currentStage) are required'));
    }
    
    // Validate currentStage is a valid backend enum value
    const validStages = ['Prospect', 'UnderEvaluation', 'TermSheetSubmitted', 'Closed', 'Lost'];
    if (!validStages.includes(payload.currentStage)) {
      console.error('Create deal validation failed - invalid currentStage:', payload.currentStage);
      return throwError(() => new Error(`Invalid currentStage. Must be one of: ${validStages.join(', ')}`));
    }
    
    console.log('Sending POST request to:', `${environment.apiUrl}/deals`);
    console.log('Create deal payload (JSON):', JSON.stringify(payload, null, 2));
    
    return this.http.post<any>(`${environment.apiUrl}/deals`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('Create deal response (success):', response);
        return this.extractDealData(response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Create deal HTTP error:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error URL:', error.url);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  updateDeal(id: number | string, deal: UpdateDealRequest): Observable<Deal> {
    console.log('Updating deal with ID:', id);
    console.log('Update payload (summary, sector, dealType only):', deal);
    
    // Backend expects ONLY: summary, sector, dealType
    // DO NOT send: id, dealValue, stage, notes, or any other fields
    const updatePayload: any = {};
    if (deal.summary !== undefined && deal.summary !== null && deal.summary !== '') {
      updatePayload.summary = deal.summary;
    }
    if (deal.sector !== undefined && deal.sector !== null && deal.sector !== '') {
      updatePayload.sector = deal.sector;
    }
    if (deal.dealType !== undefined && deal.dealType !== null && deal.dealType !== '') {
      updatePayload.dealType = deal.dealType;
    }
    
    console.log('Sending PUT request to:', `${environment.apiUrl}/deals/${id}`);
    console.log('Final payload:', updatePayload);
    
    return this.http.put<any>(`${environment.apiUrl}/deals/${id}`, updatePayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('Update deal response (success):', response);
        return this.extractDealData(response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Update deal error:', error);
        return throwError(() => error);
      })
    );
  }

  updateDealStage(id: number | string, stage: string): Observable<Deal> {
    console.log('Updating deal stage - ID:', id, 'Stage:', stage);
    // Backend expects: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
    // The dialog now sends backend format directly, but handle mapping for backward compatibility
    const stageMapping: Record<string, string> = {
      'PROSPECTING': 'Prospect',
      'QUALIFICATION': 'UnderEvaluation',
      'PROPOSAL': 'TermSheetSubmitted',
      'NEGOTIATION': 'TermSheetSubmitted',
      'CLOSED_WON': 'Closed',
      'CLOSED_LOST': 'Lost'
    };
    
    // Use mapping if stage is frontend format, otherwise use as-is (already backend format)
    const backendStage = stageMapping[stage] || stage;
    
    // Validate stage is a valid backend enum value
    const validStages = ['Prospect', 'UnderEvaluation', 'TermSheetSubmitted', 'Closed', 'Lost'];
    if (!validStages.includes(backendStage)) {
      console.error('Update stage validation failed - invalid stage:', backendStage);
      return throwError(() => new Error(`Invalid stage. Must be one of: ${validStages.join(', ')}`));
    }
    
    // PATCH /api/deals/{id}/stage expects: { stage: "..." }
    const payload = { stage: backendStage };
    
    console.log('Sending PATCH request to:', `${environment.apiUrl}/deals/${id}/stage`);
    console.log('Stage update payload (JSON):', JSON.stringify(payload, null, 2));
    
    return this.http.patch<any>(`${environment.apiUrl}/deals/${id}/stage`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('Stage update response (success):', response);
        return this.extractDealData(response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Stage update HTTP error:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error URL:', error.url);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  addNoteToDeal(id: number | string, note: AddNoteRequest): Observable<Deal> {
    console.log('Adding note to deal - ID:', id, 'Note request:', note);
    
    // Backend expects EXACTLY: { "noteText": "<text>" }
    // Validate noteText is not empty
    const noteText = note.noteText ? note.noteText.trim() : '';
    if (!noteText || noteText.length === 0) {
      console.error('Add note validation failed - noteText is empty');
      return throwError(() => new Error('Note cannot be empty'));
    }
    
    const payload = {
      noteText: noteText
    };
    
    console.log('Sending POST request to:', `${environment.apiUrl}/deals/${id}/notes`);
    console.log('Add note payload (JSON):', JSON.stringify(payload, null, 2));
    
    return this.http.post<any>(`${environment.apiUrl}/deals/${id}/notes`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('Add note response (success):', response);
        return this.extractDealData(response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Add note HTTP error:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error URL:', error.url);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  deleteDeal(id: number | string): Observable<void> {
    console.log('Deleting deal - ID:', id);
    
    return this.http.delete<void>(`${environment.apiUrl}/deals/${id}`).pipe(
      map(() => {
        console.log('Delete deal response (success)');
        return;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Delete deal HTTP error:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error URL:', error.url);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  updateDealValue(id: number | string, dealValue: number): Observable<Deal> {
    console.log('Updating deal value - ID:', id, 'Deal Value:', dealValue);
    
    // Validate dealValue is a positive number
    if (!dealValue || dealValue < 0) {
      console.error('Update deal value validation failed - invalid dealValue:', dealValue);
      return throwError(() => new Error('Deal value must be a positive number'));
    }
    
    const payload = {
      dealValue: dealValue
    };
    
    console.log('Sending PATCH request to:', `${environment.apiUrl}/deals/${id}/value`);
    console.log('Update deal value payload (JSON):', JSON.stringify(payload, null, 2));
    
    return this.http.patch<any>(`${environment.apiUrl}/deals/${id}/value`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        console.log('Update deal value response (success):', response);
        return this.extractDealData(response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Update deal value HTTP error:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error URL:', error.url);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }
}
