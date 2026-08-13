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
    vi.spyOn(service, 'createWorkflowDecision').mockReturnValue(of({ success: true }));

    fixture.detectChanges();
  });

  it('should create component and load configuration without infinite spinner', () => {
    expect(component).toBeTruthy();
    expect(component.isLoadingConfig).toBe(false);
    expect(component.config.tickers).toContain('BTCUSDT');
  });

  it('should handle operator change and conditionally show input number for GREATER_THAN', () => {
    expect(component.isNumberOperator('GREATER_THAN')).toBe(true);
    expect(component.isNumberOperator('LESS_THAN')).toBe(true);
    expect(component.isNumberOperator('EQUALS')).toBe(false);
  });

  it('should auto fill example RSI payload rule and create payload correctly', () => {
    component.fillExamplePayloadRule();
    expect(component.workflowForm.get('ticker')?.value).toBe('BTCUSDT');
    expect(component.workflowForm.get('timeFrame')?.value).toBe('60');
    expect(component.decisions.length).toBe(3);

    const firstDecision = component.decisions.at(0).value;
    expect(firstDecision.field).toBe('minDistancePercent');
    expect(firstDecision.operator).toBe('GREATER_THAN');
    expect(firstDecision.value).toBe('1.5');
  });
});
