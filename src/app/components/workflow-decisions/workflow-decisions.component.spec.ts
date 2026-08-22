import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowDecisionsComponent } from './workflow-decisions.component';
import { WorkflowDecisionService } from '../../services/workflow-decision.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('WorkflowDecisionsComponent', () => {
  let component: WorkflowDecisionsComponent;
  let fixture: ComponentFixture<WorkflowDecisionsComponent>;
  let service: WorkflowDecisionService;

  const mockConfig = {
    operators: ['GREATER_THAN', 'LESS_THAN', 'IN', 'EQUALS'],
    fields: ['EMA_9', 'minDistancePercent', 'rsiCurrentPosition'],
    values: ['NONE', 'rsiOversoldReversing', 'rsiOverboughtReversing'],
    actions: ['DEFAULT', 'OPEN_LONG_POSITION', 'CLOSE_LONG_POSITION'],
    strategies: ['DEFAULT', 'RSI_STRATEGY'],
    strategiesType: ['DEFAULT', 'RSI_STRATEGY'],
    steps: ['MAIN_TIMEFRAME', 'PRE_VALIDATION'],
    tickers: ['BTCUSDT', 'ETHUSDT'],
    timeFrames: ['60', 'D']
  };

  const mockWorkflowListResponse = {
    ticker: 'BTCUSDT',
    timeFrame: '60',
    decisions: [
      {
        id: 15,
        strategy: 'RSI_STRATEGY',
        strategyType: 'RSI_STRATEGY',
        timeFrame: '60',
        ticker: 'BTCUSDT', 
        tickerId: 'BTCUSDT',
        field: 'minDistancePercent',
        value: '1.5',
        operator: 'GREATER_THAN',
        groupId: 1,
        action: 'OPEN_LONG_POSITION',
        step: 'MAIN_TIMEFRAME'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowDecisionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDecisionsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(WorkflowDecisionService);

    vi.spyOn(service, 'getConfiguration').mockReturnValue(of(mockConfig));
    vi.spyOn(service, 'getWorkflowDecisionsByTicker').mockReturnValue(of(mockWorkflowListResponse));
    vi.spyOn(service, 'createWorkflowDecision').mockReturnValue(of({ success: true }));
    vi.spyOn(service, 'updateWorkflowDecision').mockReturnValue(of({ status: 200 }));
    vi.spyOn(service, 'deleteWorkflowDecisionsById').mockReturnValue(of({ status: 204 }));

    fixture.detectChanges();
  });

  it('should initialize on Tab 1 (Workflows) with BTCUSDT selected by default', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab).toBe('workflows');
    expect(component.selectedTicker).toBe('BTCUSDT');
    expect(component.workflowList.length).toBe(1);
    expect(component.workflowList[0].field).toBe('minDistancePercent');
  });

  it('should switch to Tab 2 (Detail) and present clean form with integer groupId and strategyType', () => {
    component.switchTab('detail');
    expect(component.activeTab).toBe('detail');
    expect(component.decisions.length).toBe(1);

    const firstDecision = component.decisions.at(0);
    expect(typeof firstDecision.get('groupId')?.value).toBe('number');
    expect(firstDecision.get('strategyType')?.value).toBeDefined();
  });

  it('should submit form with integer groupId and strategyType in payload', () => {
    component.switchTab('detail');
    component.workflowForm.get('ticker')?.setValue('ETHUSDT');
    component.workflowForm.get('timeFrame')?.setValue('60');

    const firstDecision = component.decisions.at(0);
    firstDecision.patchValue({
      field: 'EMA_9',
      operator: 'EQUALS',
      value: 'NONE',
      step: 'MAIN_TIMEFRAME',
      strategy: 'RSI_STRATEGY',
      strategyType: 'RSI_STRATEGY',
      action: 'OPEN_LONG_POSITION',
      groupId: 5,
      timeFrame: '60'
    });

    component.onSubmit();

    expect(component.activeTab).toBe('workflows');
    expect(component.selectedTicker).toBe('ETHUSDT');
    expect(service.createWorkflowDecision).toHaveBeenCalledWith({
      ticker: 'ETHUSDT',
      timeFrame: '60',
      decisions: [
        {
          strategy: 'RSI_STRATEGY',
          strategyType: 'RSI_STRATEGY',
          timeFrame: '60',
          field: 'EMA_9',
          value: 'NONE',
          operator: 'EQUALS',
          groupId: 5,
          action: 'OPEN_LONG_POSITION',
          step: 'MAIN_TIMEFRAME'
        }
      ]
    });
  });

  it('should open edit modal populated with item details and cancel cleanly', () => {
    const item = mockWorkflowListResponse.decisions[0];
    component.openEditModal(item);

    expect(component.showEditModal).toBe(true);
    expect(component.itemToEdit).toEqual(item);
    expect(component.editForm.get('field')?.value).toBe('minDistancePercent');

    component.closeEditModal();
    expect(component.showEditModal).toBe(false);
    expect(component.itemToEdit).toBeNull();
  });

  it('should update workflow decision via PUT: /trading/workflow-decisions/{id} and refresh list upon save', () => {
    const item = mockWorkflowListResponse.decisions[0];
    const loadListSpy = vi.spyOn(component, 'loadWorkflowList');

    component.openEditModal(item);
    component.editForm.patchValue({
      field: 'EMA_21',
      groupId: 2
    });

    component.confirmEdit();

    expect(service.updateWorkflowDecision).toHaveBeenCalledWith(15, {
      id: 15,
      strategy: 'RSI_STRATEGY',
      strategyType: 'RSI_STRATEGY',
      ticker: 'BTCUSDT',
      tickerId: 'BTCUSDT',
      timeFrame: '60',
      field: 'EMA_21',
      value: '1.5',
      operator: 'GREATER_THAN',
      groupId: 2,
      action: 'OPEN_LONG_POSITION',
      step: 'MAIN_TIMEFRAME'
    });
    expect(component.showEditModal).toBe(false);
    expect(loadListSpy).toHaveBeenCalledWith('BTCUSDT');
    expect(component.successMessage).toContain('atualizado com sucesso');
  });

  it('should open delete confirmation modal when delete action is triggered and close on Nao', () => {
    const item = { id: 10, ticker: 'BTCUSDT', tickerId: 'BTCUSDT', strategy: 'RSI_STRATEGY', strategyType: 'RSI_STRATEGY', timeFrame: '60', field: 'EMA_9', value: 'NONE', operator: 'EQUALS', groupId: 1, action: 'DEFAULT', step: 'MAIN_TIMEFRAME' };
    component.openDeleteModal(item);
    expect(component.showDeleteModal).toBe(true);
    expect(component.itemToDelete).toEqual(item);

    component.closeDeleteModal();
    expect(component.showDeleteModal).toBe(false);
    expect(component.itemToDelete).toBeNull();
  });

  it('should call deleteWorkflowDecisionsById and refresh workflow list when Sim is clicked and 204 is returned', () => {
    const item = { id: 42, ticker: 'BTCUSDT', tickerId: 'BTCUSDT', strategy: 'RSI_STRATEGY', strategyType: 'RSI_STRATEGY', timeFrame: '60', field: 'minDistancePercent', value: '1.5', operator: 'GREATER_THAN', groupId: 1, action: 'DEFAULT', step: 'MAIN_TIMEFRAME' };
    const loadListSpy = vi.spyOn(component, 'loadWorkflowList');

    component.openDeleteModal(item);
    component.confirmDelete();

    expect(service.deleteWorkflowDecisionsById).toHaveBeenCalledWith(42);
    expect(component.showDeleteModal).toBe(false);
    expect(loadListSpy).toHaveBeenCalledWith('BTCUSDT');
  });
});
