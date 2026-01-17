import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { DealFormComponent } from './deal-form.component';
import { DealService } from '../../../services/deal.service';
import { AuthService } from '../../../services/auth.service';
import { Deal, CreateDealRequest } from '../../../models/deal.model';

describe('DealFormComponent', () => {
  let component: DealFormComponent;
  let fixture: ComponentFixture<DealFormComponent>;
  let dealService: jasmine.SpyObj<DealService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let activatedRoute: any;

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

  beforeEach(async () => {
    const dealServiceSpy = jasmine.createSpyObj('DealService', ['getDealById', 'createDeal', 'updateDeal']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DealFormComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: DealService, useValue: dealServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DealFormComponent);
    component = fixture.componentInstance;
    dealService = TestBed.inject(DealService) as jasmine.SpyObj<DealService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    authService.isAdmin.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      activatedRoute.snapshot.paramMap.get.and.returnValue(null);
      fixture.detectChanges();
    });

    it('should initialize form with create mode fields', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.dealForm.contains('dealName')).toBeTrue();
      expect(component.dealForm.contains('clientName')).toBeTrue();
      expect(component.dealForm.contains('dealType')).toBeTrue();
      expect(component.dealForm.contains('sector')).toBeTrue();
      expect(component.dealForm.contains('summary')).toBeTrue();
      expect(component.dealForm.contains('currentStage')).toBeTrue();
    });

    it('should set default currentStage to Prospect', () => {
      expect(component.dealForm.get('currentStage')?.value).toBe('Prospect');
    });

    it('should not submit if form is invalid', () => {
      component.dealForm.patchValue({
        dealName: '',
        clientName: '',
        dealType: '',
        sector: '',
        summary: '',
        currentStage: 'Prospect'
      });

      component.onSubmit();

      expect(dealService.createDeal).not.toHaveBeenCalled();
    });

    it('should create deal with valid form data', () => {
      const createdDeal = { ...mockDeal, id: 2 };
      dealService.createDeal.and.returnValue(of(createdDeal));

      component.dealForm.patchValue({
        dealName: 'New Deal',
        clientName: 'New Client',
        dealType: 'M&A',
        sector: 'Technology',
        summary: 'Test summary',
        currentStage: 'Prospect'
      });

      component.onSubmit();

      expect(dealService.createDeal).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/deals']);
      expect(snackBar.open).toHaveBeenCalledWith('Deal created successfully', 'Close', jasmine.any(Object));
    });

    it('should trim whitespace from string fields in create payload', () => {
      dealService.createDeal.and.returnValue(of(mockDeal));

      component.dealForm.patchValue({
        dealName: '  New Deal  ',
        clientName: '  New Client  ',
        dealType: '  M&A  ',
        sector: '  Technology  ',
        summary: '  Test summary  ',
        currentStage: 'Prospect'
      });

      component.onSubmit();

      const callArgs = dealService.createDeal.calls.mostRecent().args[0];
      expect(callArgs.dealName).toBe('New Deal');
      expect(callArgs.clientName).toBe('New Client');
      expect(callArgs.dealType).toBe('M&A');
      expect(callArgs.sector).toBe('Technology');
      expect(callArgs.summary).toBe('Test summary');
    });

    it('should show error if required fields are missing', () => {
      component.dealForm.patchValue({
        dealName: '',
        clientName: 'Client',
        dealType: 'M&A',
        sector: 'Tech',
        summary: 'Summary',
        currentStage: 'Prospect'
      });

      component.onSubmit();

      expect(snackBar.open).toHaveBeenCalledWith('Error: All fields are required', 'Close', jasmine.any(Object));
    });

    it('should handle error when creating deal', () => {
      const error = { status: 400, statusText: 'Error', error: { message: 'Validation failed' }, message: '' };
      dealService.createDeal.and.returnValue(throwError(() => error));

      component.dealForm.patchValue({
        dealName: 'New Deal',
        clientName: 'New Client',
        dealType: 'M&A',
        sector: 'Technology',
        summary: 'Test summary',
        currentStage: 'Prospect'
      });

      component.onSubmit();

      expect(component.loading).toBeFalse();
      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('1');
      dealService.getDealById.and.returnValue(of(mockDeal));
      fixture.detectChanges();
    });

    it('should initialize form with edit mode fields', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.dealId).toBe(1);
      expect(component.dealForm.contains('summary')).toBeTrue();
      expect(component.dealForm.contains('sector')).toBeTrue();
      expect(component.dealForm.contains('dealType')).toBeTrue();
      expect(component.dealForm.contains('dealName')).toBeFalse();
      expect(component.dealForm.contains('clientName')).toBeFalse();
      expect(component.dealForm.contains('currentStage')).toBeFalse();
    });

    it('should load deal data on init', () => {
      expect(dealService.getDealById).toHaveBeenCalledWith(1);
      expect(component.loading).toBeFalse();
    });

    it('should patch form with deal data', () => {
      const dealData = {
        ...mockDeal,
        summary: 'Updated summary',
        sector: 'Updated sector',
        dealType: 'Updated type'
      };
      dealService.getDealById.and.returnValue(of(dealData));

      component.loadDeal();

      expect(component.dealForm.get('summary')?.value).toBe('Updated summary');
      expect(component.dealForm.get('sector')?.value).toBe('Updated sector');
      expect(component.dealForm.get('dealType')?.value).toBe('Updated type');
    });

    it('should update deal with valid form data', () => {
      const updatedDeal = { ...mockDeal, description: 'Updated summary' };
      dealService.getDealById.and.returnValue(of(mockDeal));
      dealService.updateDeal.and.returnValue(of(updatedDeal));

      component.loadDeal();
      component.dealForm.patchValue({
        summary: 'Updated summary',
        sector: 'Updated sector',
        dealType: 'Updated type'
      });

      component.onSubmit();

      expect(dealService.updateDeal).toHaveBeenCalledWith(1, jasmine.objectContaining({
        summary: 'Updated summary',
        sector: 'Updated sector',
        dealType: 'Updated type'
      }));
      expect(router.navigate).toHaveBeenCalledWith(['/deals']);
      expect(snackBar.open).toHaveBeenCalledWith('Deal updated successfully', 'Close', jasmine.any(Object));
    });

    it('should exclude undefined values from update payload', () => {
      dealService.getDealById.and.returnValue(of(mockDeal));
      dealService.updateDeal.and.returnValue(of(mockDeal));

      component.loadDeal();
      component.dealForm.patchValue({
        summary: 'Updated summary',
        sector: undefined,
        dealType: 'Updated type'
      });

      component.onSubmit();

      const callArgs = dealService.updateDeal.calls.mostRecent().args[1];
      expect(callArgs.summary).toBe('Updated summary');
      expect(callArgs.dealType).toBe('Updated type');
      expect(callArgs.sector).toBeUndefined();
    });

    it('should handle error when loading deal', () => {
      const error = { status: 404, statusText: 'Error', error: { message: 'Not found' }, message: '' };
      dealService.getDealById.and.returnValue(throwError(() => error));
      dealService.getDealById.calls.reset();
      
      // Call loadDeal directly to test error handling
      component.loadDeal();

      expect(dealService.getDealById).toHaveBeenCalledWith(1);
      expect(component.loading).toBeFalse();
      expect(snackBar.open).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/deals']);
    });

    it('should handle error when updating deal', () => {
      dealService.getDealById.and.returnValue(of(mockDeal));
      const error = { status: 400, statusText: 'Error', error: { message: 'Validation failed' }, message: '' };
      dealService.updateDeal.and.returnValue(throwError(() => error));

      component.loadDeal();
      component.dealForm.patchValue({
        summary: 'Updated summary',
        sector: 'Updated sector',
        dealType: 'Updated type'
      });

      component.onSubmit();

      expect(component.loading).toBeFalse();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('should handle string id in edit mode', () => {
      activatedRoute.snapshot.paramMap.get.and.returnValue('abc123');
      fixture.detectChanges();

      expect(component.isEditMode).toBeTrue();
      expect(component.dealId).toBe('abc123');
    });
  });

  describe('cancel', () => {
    it('should navigate to deals list', () => {
      component.cancel();

      expect(router.navigate).toHaveBeenCalledWith(['/deals']);
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from error.error.message', () => {
      const error = { error: { message: 'Custom error' } };
      const result = component['extractErrorMessage'](error);
      expect(result).toBe('Custom error');
    });

    it('should extract validation errors from errors array', () => {
      const error = {
        error: {
          errors: [{ defaultMessage: 'Field error 1' }, { defaultMessage: 'Field error 2' }]
        }
      };
      const result = component['extractErrorMessage'](error);
      expect(result).toContain('Field error');
    });

    it('should return default message for 400 status', () => {
      const error = { status: 400, error: {} };
      const result = component['extractErrorMessage'](error);
      expect(result).toContain('Bad Request');
    });

    it('should return default message for 401 status', () => {
      const error = { status: 401 };
      const result = component['extractErrorMessage'](error);
      expect(result).toContain('Unauthorized');
    });

    it('should return default message for 500 status', () => {
      const error = { status: 500, error: {} };
      const result = component['extractErrorMessage'](error);
      expect(result).toContain('Server Error');
    });

    it('should return default message for null error', () => {
      const result = component['extractErrorMessage'](null);
      expect(result).toBe('An unexpected error occurred');
    });
  });

  describe('dealStages', () => {
    it('should have correct stage options', () => {
      expect(component.dealStages.length).toBe(5);
      expect(component.dealStages.map(s => s.value)).toContain('Prospect');
      expect(component.dealStages.map(s => s.value)).toContain('UnderEvaluation');
      expect(component.dealStages.map(s => s.value)).toContain('TermSheetSubmitted');
      expect(component.dealStages.map(s => s.value)).toContain('Closed');
      expect(component.dealStages.map(s => s.value)).toContain('Lost');
    });
  });
});