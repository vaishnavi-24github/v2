import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';
import { DealListComponent } from './deal-list.component';
import { DealService } from '../../../services/deal.service';
import { AuthService } from '../../../services/auth.service';
import { Deal } from '../../../models/deal.model';
import { UpdateStageDialogComponent } from '../update-stage-dialog/update-stage-dialog.component';
import { AddNoteDialogComponent } from '../add-note-dialog/add-note-dialog.component';

describe('DealListComponent', () => {
  let component: DealListComponent;
  let fixture: ComponentFixture<DealListComponent>;
  let dealService: jasmine.SpyObj<DealService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let routerEvents: Subject<any>;

  const mockDeals: Deal[] = [
    {
      id: 1,
      dealName: 'Deal 1',
      dealValue: 100000,
      stage: 'Prospect',
      clientName: 'Client 1',
      description: 'Description 1',
      expectedCloseDate: '2024-12-31',
      notes: []
    },
    {
      id: 2,
      dealName: 'Deal 2',
      dealValue: 200000,
      stage: 'UnderEvaluation',
      clientName: 'Client 2',
      description: 'Description 2',
      expectedCloseDate: '2024-12-31',
      notes: [
        {
          id: 1,
          content: 'Note 1',
          createdDate: '2024-01-01',
          createdBy: 'user1'
        }
      ]
    }
  ];

  beforeEach(async () => {
    routerEvents = new Subject();
    const dealServiceSpy = jasmine.createSpyObj('DealService', ['getAllDeals', 'updateDealStage', 'addNoteToDeal']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    Object.defineProperty(routerSpy, 'events', { value: routerEvents, writable: true });
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [DealListComponent, NoopAnimationsModule],
      providers: [
        { provide: DealService, useValue: dealServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DealListComponent);
    component = fixture.componentInstance;
    dealService = TestBed.inject(DealService) as jasmine.SpyObj<DealService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    authService.isAdmin.and.returnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load deals on init', () => {
      dealService.getAllDeals.and.returnValue(of(mockDeals));

      component.ngOnInit();

      expect(dealService.getAllDeals).toHaveBeenCalled();
      expect(component.deals).toEqual(mockDeals);
      expect(component.loading).toBeFalse();
    });

    it('should subscribe to router events and reload deals on NavigationEnd', () => {
      dealService.getAllDeals.and.returnValue(of(mockDeals));
      component.ngOnInit();

      // Simulate NavigationEnd event
      const navEnd = new NavigationEnd(1, '/deals', '/deals');
      routerEvents.next(navEnd);

      expect(dealService.getAllDeals).toHaveBeenCalledTimes(2);
    });

    it('should not reload deals on NavigationEnd to different route', () => {
      dealService.getAllDeals.and.returnValue(of(mockDeals));
      component.ngOnInit();
      dealService.getAllDeals.calls.reset();

      // Simulate NavigationEnd event to different route
      const navEnd = new NavigationEnd(1, '/login', '/login');
      routerEvents.next(navEnd);

      expect(dealService.getAllDeals).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('loadDeals', () => {
    it('should load deals successfully', () => {
      dealService.getAllDeals.and.returnValue(of(mockDeals));

      component.loadDeals();

      expect(component.loading).toBeTrue();
      expect(dealService.getAllDeals).toHaveBeenCalled();
      expect(component.deals).toEqual(mockDeals);
      expect(component.loading).toBeFalse();
    });

    it('should handle empty array response', () => {
      dealService.getAllDeals.and.returnValue(of([]));

      component.loadDeals();

      expect(component.deals).toEqual([]);
      expect(component.loading).toBeFalse();
    });

    it('should handle error response', () => {
      const error = { status: 500, statusText: 'Error', error: { message: 'Server Error' }, message: '' };
      dealService.getAllDeals.and.returnValue(throwError(() => error));

      component.loadDeals();

      expect(component.loading).toBeFalse();
      expect(component.deals).toEqual([]);
      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  describe('createDeal', () => {
    it('should navigate to new deal route', () => {
      component.createDeal();

      expect(router.navigate).toHaveBeenCalledWith(['/deals/new']);
    });
  });

  describe('editDeal', () => {
    it('should navigate to edit deal route', () => {
      const deal = mockDeals[0];
      component.editDeal(deal);

      expect(router.navigate).toHaveBeenCalledWith(['/deals', deal.id, 'edit']);
    });
  });

  describe('updateStage', () => {
    it('should open update stage dialog', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(null));
      dialog.open.and.returnValue(dialogRef);

      component.updateStage(deal);

      expect(dialog.open).toHaveBeenCalledWith(UpdateStageDialogComponent, jasmine.any(Object));
    });

    it('should update deal stage when dialog returns result', () => {
      const deal = mockDeals[0];
      const updatedDeal = { ...deal, stage: 'UnderEvaluation' };
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of('UnderEvaluation'));
      dialog.open.and.returnValue(dialogRef);
      dealService.updateDealStage.and.returnValue(of(updatedDeal));
      dealService.getAllDeals.and.returnValue(of([updatedDeal]));

      component.updateStage(deal);

      expect(dealService.updateDealStage).toHaveBeenCalledWith(deal.id, 'UnderEvaluation');
      expect(snackBar.open).toHaveBeenCalledWith('Deal stage updated successfully', 'Close', jasmine.any(Object));
    });

    it('should handle error when updating stage', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of('UnderEvaluation'));
      dialog.open.and.returnValue(dialogRef);
      const error = { status: 400, statusText: 'Error', error: { message: 'Bad Request' }, message: '' };
      dealService.updateDealStage.and.returnValue(throwError(() => error));

      component.updateStage(deal);

      expect(component.loading).toBeFalse();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('should not update if dialog is cancelled', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(null));
      dialog.open.and.returnValue(dialogRef);

      component.updateStage(deal);

      expect(dealService.updateDealStage).not.toHaveBeenCalled();
    });
  });

  describe('addNote', () => {
    it('should open add note dialog', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(null));
      dialog.open.and.returnValue(dialogRef);

      component.addNote(deal);

      expect(dialog.open).toHaveBeenCalledWith(AddNoteDialogComponent, jasmine.any(Object));
    });

    it('should add note when dialog returns note text', () => {
      const deal = mockDeals[0];
      const updatedDeal = {
        ...deal,
        notes: [{ id: 1, content: 'New note', createdDate: '2024-01-01', createdBy: 'user1' }]
      };
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of('New note'));
      dialog.open.and.returnValue(dialogRef);
      dealService.addNoteToDeal.and.returnValue(of(updatedDeal));
      dealService.getAllDeals.and.returnValue(of([updatedDeal]));

      component.addNote(deal);

      expect(dealService.addNoteToDeal).toHaveBeenCalledWith(deal.id, { noteText: 'New note' });
      expect(snackBar.open).toHaveBeenCalledWith('Note added successfully', 'Close', jasmine.any(Object));
    });

    it('should trim note text before sending', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of('  Note with spaces  '));
      dialog.open.and.returnValue(dialogRef);
      dealService.addNoteToDeal.and.returnValue(of(deal));
      dealService.getAllDeals.and.returnValue(of([deal]));

      component.addNote(deal);

      expect(dealService.addNoteToDeal).toHaveBeenCalledWith(deal.id, { noteText: 'Note with spaces' });
    });

    it('should show error if empty note is submitted', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(''));
      dialog.open.and.returnValue(dialogRef);

      component.addNote(deal);

      expect(dealService.addNoteToDeal).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith('Error: Note cannot be empty', 'Close', jasmine.any(Object));
    });

    it('should not show error if dialog is cancelled', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(null));
      dialog.open.and.returnValue(dialogRef);

      component.addNote(deal);

      expect(dealService.addNoteToDeal).not.toHaveBeenCalled();
      expect(snackBar.open).not.toHaveBeenCalled();
    });

    it('should handle error when adding note', () => {
      const deal = mockDeals[0];
      const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of('New note'));
      dialog.open.and.returnValue(dialogRef);
      const error = { status: 400, statusText: 'Error', error: { message: 'Validation failed', data: { noteText: 'Required' } }, message: '' };
      dealService.addNoteToDeal.and.returnValue(throwError(() => error));

      component.addNote(deal);

      expect(component.loading).toBeFalse();
      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  describe('getNotesCount', () => {
    it('should return correct notes count', () => {
      const deal = mockDeals[1];
      expect(component.getNotesCount(deal)).toBe(1);
    });

    it('should return 0 if no notes', () => {
      const deal = mockDeals[0];
      expect(component.getNotesCount(deal)).toBe(0);
    });

    it('should return 0 if notes is not an array', () => {
      const deal = { ...mockDeals[0], notes: null as any };
      expect(component.getNotesCount(deal)).toBe(0);
    });
  });

  describe('getStageDisplay', () => {
    it('should return currentStage if present', () => {
      const deal = { ...mockDeals[0], currentStage: 'Prospect' };
      expect(component.getStageDisplay(deal)).toBe('Prospect');
    });

    it('should return stage string if present', () => {
      const deal = mockDeals[0];
      expect(component.getStageDisplay(deal)).toBe('Prospect');
    });

    it('should return null if no stage', () => {
      const deal = { ...mockDeals[0], stage: null, currentStage: undefined };
      expect(component.getStageDisplay(deal)).toBeNull();
    });
  });

  describe('getStageColor', () => {
    it('should return primary for Prospect', () => {
      expect(component.getStageColor('Prospect')).toBe('primary');
    });

    it('should return accent for UnderEvaluation', () => {
      expect(component.getStageColor('UnderEvaluation')).toBe('accent');
    });

    it('should return warn for Lost', () => {
      expect(component.getStageColor('Lost')).toBe('warn');
    });

    it('should return primary for default', () => {
      expect(component.getStageColor('UnknownStage')).toBe('primary');
    });

    it('should return primary for null', () => {
      expect(component.getStageColor(null)).toBe('primary');
    });
  });

  describe('logout', () => {
    it('should call authService logout and navigate to login', () => {
      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = component.formatCurrency(100000);
      expect(result).toContain('100,000');
      expect(result).toContain('$');
    });

    it('should handle zero', () => {
      const result = component.formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = component.formatDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
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

    it('should extract field-specific errors from data object', () => {
      const error = {
        error: {
          data: {
            noteText: 'Note text is required'
          }
        }
      };
      const result = component['extractErrorMessage'](error);
      expect(result).toBe('Note text is required');
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

    it('should return default message for null error', () => {
      const result = component['extractErrorMessage'](null);
      expect(result).toBe('An unexpected error occurred');
    });
  });
});