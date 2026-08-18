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
    groupsIds: ['DEFAULT', 'RSI_OVERSOLD_REVERSING', 'RSI_OVERBOUGHT_REVERSING'],
    fields: ['EMA_9', 'minDistancePercent', 'rsiCurrentPosition'],
    values: ['NONE', 'rsiOversoldReversing', 'rsiOverboughtReversing'],
    actions: ['DEFAULT', 'OPEN_LONG_POSITION', 'CLOSE_LONG_POSITION'],
    strategies: ['DEFAULT', 'RSI_STRATEGY'],
    steps: ['MAIN_TIMEFRAME', 'PRE_VALIDATION'],
    tickers: ['BTCUSDT', 'ETHUSDT'],
    timeFrames: ['60', 'D'],
    logicalOperators: ['AND', 'OR']
  };

  const mockWorkflowListResponse = {
    ticker: 'BTCUSDT',
    timeFrame: '60',
    decisions: [
      {
        strategy: 'RSI_STRATEGY',
        timeFrame: '60',
        field: 'minDistancePercent',
        value: '1.5',
        operator: 'GREATER_THAN',
        groupId: 'RSI_OVERSOLD_REVERSING',
        logicalOperator: 'OR',
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

    fixture.detectChanges();
  });

  it('should initialize on Tab 1 (Workflows) with BTCUSDT selected by default', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab).toBe('workflows');
    expect(component.selectedTicker).toBe('BTCUSDT');
    expect(component.workflowList.length).toBe(1);
    expect(component.workflowList[0].field).toBe('minDistancePercent');
  });

  it('should switch to Tab 2 (Detail) and present clean form', () => {
    component.switchTab('detail');
    expect(component.activeTab).toBe('detail');
    expect(component.decisions.length).toBe(1);
  });

  it('should submit form, reset state, and redirect to Tab 1 with created ticker upon HTTP 200', () => {
    component.switchTab('detail');
    component.workflowForm.get('ticker')?.setValue('ETHUSDT');
    component.workflowForm.get('timeFrame')?.setValue('60');

    component.onSubmit();

    expect(component.activeTab).toBe('workflows');
    expect(component.selectedTicker).toBe('ETHUSDT');
    expect(service.createWorkflowDecision).toHaveBeenCalled();
  });

  it('should open delete confirmation modal when delete action is triggered and close on Nao', () => {
    const item = { id: 10, strategy: 'RSI_STRATEGY', timeFrame: '60', field: 'EMA_9', value: 'NONE', operator: 'EQUALS', groupId: 'DEFAULT', logicalOperator: 'OR', action: 'DEFAULT', step: 'MAIN_TIMEFRAME' };
    component.openDeleteModal(item);
    expect(component.showDeleteModal).toBe(true);
    expect(component.itemToDelete).toEqual(item);

    component.closeDeleteModal();
    expect(component.showDeleteModal).toBe(false);
    expect(component.itemToDelete).toBeNull();
  });

  it('should call deleteWorkflowDecisionsById and refresh workflow list when Sim is clicked and 204 is returned', () => {
    const item = { id: 42, strategy: 'RSI_STRATEGY', timeFrame: '60', field: 'minDistancePercent', value: '1.5', operator: 'GREATER_THAN', groupId: 'DEFAULT', logicalOperator: 'OR', action: 'DEFAULT', step: 'MAIN_TIMEFRAME' };
    vi.spyOn(service, 'deleteWorkflowDecisionsById').mockReturnValue(of({ status: 204 }));
    const loadListSpy = vi.spyOn(component, 'loadWorkflowList');

    component.openDeleteModal(item);
    component.confirmDelete();

    expect(service.deleteWorkflowDecisionsById).toHaveBeenCalledWith(42);
    expect(component.showDeleteModal).toBe(false);
    expect(loadListSpy).toHaveBeenCalledWith('BTCUSDT');
  });
});
