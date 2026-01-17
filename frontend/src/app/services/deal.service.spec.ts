import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { DealService } from './deal.service';
import { environment } from '../../environments/environment';
import { CreateDealRequest, UpdateDealRequest, AddNoteRequest, Deal } from '../models/deal.model';

describe('DealService', () => {
  let service: DealService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DealService]
    });
    service = TestBed.inject(DealService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllDeals', () => {
    it('should return array of deals', () => {
      const mockDeals: Deal[] = [
        {
          id: 1,
          dealName: 'Test Deal',
          dealValue: 100000,
          stage: 'Prospect',
          clientName: 'Test Client',
          description: 'Test Description',
          expectedCloseDate: '2024-12-31',
          notes: []
        }
      ];

      service.getAllDeals().subscribe(deals => {
        expect(deals).toEqual(mockDeals);
        expect(deals.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDeals);
    });

    it('should handle nested response structure with data array', () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            dealName: 'Test Deal',
            dealValue: 100000,
            currentStage: 'Prospect',
            clientName: 'Test Client',
            description: 'Test Description',
            expectedCloseDate: '2024-12-31'
          }
        ]
      };

      service.getAllDeals().subscribe(deals => {
        expect(deals.length).toBe(1);
        expect(deals[0].stage).toBe('Prospect');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals`);
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'Server Error',
        status: 500,
        statusText: 'Internal Server Error'
      });

      service.getAllDeals().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals`);
      req.flush(errorResponse, errorResponse);
    });
  });

  describe('getDealById', () => {
    it('should return a single deal', () => {
      const mockDeal: Deal = {
        id: 1,
        dealName: 'Test Deal',
        dealValue: 100000,
        stage: 'Prospect',
        clientName: 'Test Client',
        description: 'Test Description',
        expectedCloseDate: '2024-12-31',
        notes: []
      };

      service.getDealById(1).subscribe(deal => {
        expect(deal).toEqual(mockDeal);
        expect(deal.id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDeal);
    });

    it('should handle currentStage field mapping', () => {
      const mockResponse = {
        id: 1,
        dealName: 'Test Deal',
        currentStage: 'UnderEvaluation',
        clientName: 'Test Client',
        description: 'Test',
        expectedCloseDate: '2024-12-31'
      };

      service.getDealById(1).subscribe(deal => {
        expect((deal as any).stage).toBe('UnderEvaluation');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1`);
      req.flush(mockResponse);
    });

    it('should handle string id', () => {
      const mockDeal: Deal = {
        id: 'abc123',
        dealName: 'Test Deal',
        dealValue: 100000,
        stage: 'Prospect',
        clientName: 'Test Client',
        description: 'Test Description',
        expectedCloseDate: '2024-12-31',
        notes: []
      };

      service.getDealById('abc123').subscribe(deal => {
        expect(deal.id).toBe('abc123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/abc123`);
      req.flush(mockDeal);
    });
  });

  describe('createDeal', () => {
    const mockCreateRequest: CreateDealRequest = {
      dealName: 'New Deal',
      clientName: 'New Client',
      dealType: 'M&A',
      sector: 'Technology',
      summary: 'Test summary',
      currentStage: 'Prospect'
    };

    it('should create a deal with valid payload', () => {
      const mockDeal: Deal = {
        id: 1,
        dealName: 'New Deal',
        dealValue: 0,
        stage: 'Prospect',
        clientName: 'New Client',
        description: 'Test summary',
        expectedCloseDate: '',
        notes: []
      };

      service.createDeal(mockCreateRequest).subscribe(deal => {
        expect(deal.dealName).toBe('New Deal');
        expect(deal.stage).toBe('Prospect');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.dealName).toBe('New Deal');
      expect(req.request.body.currentStage).toBe('Prospect');
      req.flush(mockDeal);
    });

    it('should trim whitespace from string fields', () => {
      const requestWithWhitespace: CreateDealRequest = {
        dealName: '  New Deal  ',
        clientName: '  New Client  ',
        dealType: '  M&A  ',
        sector: '  Technology  ',
        summary: '  Test summary  ',
        currentStage: 'Prospect'
      };

      service.createDeal(requestWithWhitespace).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/deals`);
      expect(req.request.body.dealName).toBe('New Deal');
      expect(req.request.body.clientName).toBe('New Client');
      req.flush({});
    });

    it('should throw error if required fields are missing', () => {
      const invalidRequest = {
        dealName: '',
        clientName: 'Client',
        dealType: 'M&A',
        sector: 'Tech',
        summary: 'Summary',
        currentStage: 'Prospect'
      } as CreateDealRequest;

      service.createDeal(invalidRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('required');
        }
      });
    });

    it('should throw error if currentStage is invalid', () => {
      const invalidRequest = {
        ...mockCreateRequest,
        currentStage: 'InvalidStage' as any
      };

      service.createDeal(invalidRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Invalid currentStage');
        }
      });
    });

    it('should handle error response', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Validation failed' },
        status: 400,
        statusText: 'Bad Request'
      });

      service.createDeal(mockCreateRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals`);
      req.flush(errorResponse, errorResponse);
    });
  });

  describe('updateDeal', () => {
    const mockUpdateRequest: UpdateDealRequest = {
      summary: 'Updated summary',
      sector: 'Updated sector',
      dealType: 'Updated type'
    };

    it('should update a deal with valid payload', () => {
      const mockDeal: Deal = {
        id: 1,
        dealName: 'Test Deal',
        dealValue: 100000,
        stage: 'Prospect',
        clientName: 'Test Client',
        description: 'Updated summary',
        expectedCloseDate: '2024-12-31',
        notes: []
      };

      service.updateDeal(1, mockUpdateRequest).subscribe(deal => {
        expect(deal.id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.summary).toBe('Updated summary');
      expect(req.request.body.sector).toBe('Updated sector');
      expect(req.request.body.dealType).toBe('Updated type');
      req.flush(mockDeal);
    });

    it('should exclude undefined values from payload', () => {
      const partialRequest: UpdateDealRequest = {
        summary: 'Updated summary'
      };

      service.updateDeal(1, partialRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1`);
      expect(req.request.body.summary).toBe('Updated summary');
      expect(req.request.body.sector).toBeUndefined();
      expect(req.request.body.dealType).toBeUndefined();
      req.flush({});
    });

    it('should handle error response', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Not found' },
        status: 404,
        statusText: 'Not Found'
      });

      service.updateDeal(1, mockUpdateRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1`);
      req.flush(errorResponse, errorResponse);
    });
  });

  describe('updateDealStage', () => {
    it('should update deal stage with valid backend stage', () => {
      const mockDeal: Deal = {
        id: 1,
        dealName: 'Test Deal',
        dealValue: 100000,
        stage: 'UnderEvaluation',
        clientName: 'Test Client',
        description: 'Test',
        expectedCloseDate: '2024-12-31',
        notes: []
      };

      service.updateDealStage(1, 'UnderEvaluation').subscribe(deal => {
        expect(deal.stage).toBe('UnderEvaluation');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1/stage`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.stage).toBe('UnderEvaluation');
      req.flush(mockDeal);
    });

    it('should map frontend stage values to backend format', () => {
      service.updateDealStage(1, 'PROSPECTING').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1/stage`);
      expect(req.request.body.stage).toBe('Prospect');
      req.flush({});
    });

    it('should throw error if stage is invalid', () => {
      service.updateDealStage(1, 'InvalidStage').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Invalid stage');
        }
      });
    });

    it('should handle error response', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Bad Request' },
        status: 400,
        statusText: 'Bad Request'
      });

      service.updateDealStage(1, 'Prospect').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1/stage`);
      req.flush(errorResponse, errorResponse);
    });
  });

  describe('addNoteToDeal', () => {
    const mockNoteRequest: AddNoteRequest = {
      noteText: 'Test note'
    };

    it('should add note to deal with valid payload', () => {
      const mockDeal: Deal = {
        id: 1,
        dealName: 'Test Deal',
        dealValue: 100000,
        stage: 'Prospect',
        clientName: 'Test Client',
        description: 'Test',
        expectedCloseDate: '2024-12-31',
        notes: [
          {
            id: 1,
            content: 'Test note',
            createdDate: new Date().toISOString(),
            createdBy: 'testuser'
          }
        ]
      };

      service.addNoteToDeal(1, mockNoteRequest).subscribe(deal => {
        expect(deal.notes?.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1/notes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.noteText).toBe('Test note');
      req.flush(mockDeal);
    });

    it('should trim whitespace from note text', () => {
      const requestWithWhitespace: AddNoteRequest = {
        noteText: '  Test note  '
      };

      service.addNoteToDeal(1, requestWithWhitespace).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1/notes`);
      expect(req.request.body.noteText).toBe('Test note');
      req.flush({});
    });

    it('should throw error if noteText is empty', () => {
      const emptyRequest: AddNoteRequest = {
        noteText: ''
      };

      service.addNoteToDeal(1, emptyRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('empty');
        }
      });
    });

    it('should throw error if noteText is only whitespace', () => {
      const whitespaceRequest: AddNoteRequest = {
        noteText: '   '
      };

      service.addNoteToDeal(1, whitespaceRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('empty');
        }
      });
    });

    it('should handle error response', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Validation failed', data: { noteText: 'Note text is required' } },
        status: 400,
        statusText: 'Bad Request'
      });

      service.addNoteToDeal(1, mockNoteRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/deals/1/notes`);
      req.flush(errorResponse, errorResponse);
    });
  });
});