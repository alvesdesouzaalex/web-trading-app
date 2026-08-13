import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WorkflowDecisionService } from '../../services/workflow-decision.service';
import { WdConfiguration, WorkflowDecisionCreatePayload, WorkflowDecisionItem } from '../../models/workflow-decision.model';

@Component({
  selector: 'app-workflow-decisions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './workflow-decisions.component.html',
})
export class WorkflowDecisionsComponent implements OnInit {
  workflowForm!: FormGroup;
  config: WdConfiguration = {
    operators: ['GREATER_THAN', 'LESS_THAN', 'IN', 'EQUALS'],
    groupsIds: [
      'DEFAULT',
      'TREND_LONG_ENTRY',
      'TREND_SHORT_ENTRY',
      'RSI_EKC_OVERBOUGHT',
      'DCA_LONG_ENTRY',
      'DCA_CLOSE_ENTRY',
      'RANGE',
      'PULLBACK_ENTRY',
      'CLOSE_LONG_ENTRY',
      'RSI_OVERSOLD_REVERSING',
      'RSI_OVERBOUGHT_REVERSING'
    ],
    fields: [
      'EMA_9',
      'EMA_21',
      'EMA_50',
      'EMA_200',
      'EMA_9_CURRENT_POSITION',
      'EMA_9_DIRECTION',
      'EMA_21_DIRECTION',
      'EMA_50_DIRECTION',
      'EMA_200_DIRECTION',
      'NONE',
      'minDistancePercent',
      'rsiCurrentPosition'
    ],
    values: [
      'NONE',
      'FLAT',
      'INCLINED_UPWARD',
      'INCLINED_DOWNWARD',
      'INCREASING',
      'DECREASING',
      'rsiOversoldReversing',
      'rsiOverboughtReversing'
    ],
    actions: [
      'DEFAULT',
      'DEFAULT_CLOSE_POSITION',
      'OPEN_LONG_POSITION',
      'CLOSE_LONG_POSITION',
      'OPEN_SHORT_POSITION',
      'CLOSE_SHORT_POSITION',
      'CLOSE_SHORT_AND_OPEN_LONG_POSITION',
      'CLOSE_LONG_AND_OPEN_SHORT_POSITION'
    ],
    strategies: [
      'DEFAULT',
      'EMA_TREND_STRATEGY',
      'EMA_CROSSING_STRATEGY',
      'DCA_STRATEGY',
      'RSI_STRATEGY',
      'EKC_STRATEGY',
      'STOCHASTIC_STRATEGY',
      'CLOSE_POSITION_STRATEGY'
    ],
    steps: [
      'PRE_VALIDATION',
      'MAIN_VALIDATION',
      'EXIT_VALIDATION',
      'MAIN_TIMEFRAME',
      'HIGHER_TIMEFRAME'
    ],
    tickers: ['BTCUSDT', 'ETHUSDT', 'HYPEUSDT', 'SOLUSDT'],
    timeFrames: ['60', 'D'],
    logicalOperators: ['AND', 'OR', 'NONE']
  };

  isLoadingConfig: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  submittedPayloadJson: string = '';

  constructor(
    private fb: FormBuilder,
    private workflowDecisionService: WorkflowDecisionService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  private initForm(): void {
    this.workflowForm = this.fb.group({
      ticker: ['', Validators.required],
      timeFrame: ['', Validators.required],
      decisions: this.fb.array([])
    });
  }

  get decisions(): FormArray {
    return this.workflowForm.get('decisions') as FormArray;
  }

  createDecisionGroup(initialValues?: Partial<WorkflowDecisionItem>): FormGroup {
    const defaultTimeFrame = this.workflowForm.get('timeFrame')?.value || (this.config.timeFrames.length > 0 ? this.config.timeFrames[0] : '60');
    
    return this.fb.group({
      field: [initialValues?.field ?? (this.config.fields[0] || 'EMA_9'), Validators.required],
      operator: [initialValues?.operator ?? (this.config.operators[0] || 'EQUALS'), Validators.required],
      value: [initialValues?.value ?? (this.config.values[0] || 'NONE'), Validators.required],
      step: [initialValues?.step ?? (this.config.steps[0] || 'MAIN_TIMEFRAME'), Validators.required],
      strategy: [initialValues?.strategy ?? (this.config.strategies[0] || 'DEFAULT'), Validators.required],
      action: [initialValues?.action ?? (this.config.actions[0] || 'DEFAULT'), Validators.required],
      groupId: [initialValues?.groupId ?? (this.config.groupsIds[0] || 'DEFAULT'), Validators.required],
      logicalOperator: [initialValues?.logicalOperator ?? 'OR', Validators.required],
      timeFrame: [initialValues?.timeFrame ?? defaultTimeFrame, Validators.required]
    });
  }

  addDecision(): void {
    this.decisions.push(this.createDecisionGroup());
    this.cdr.markForCheck();
  }

  removeDecision(index: number): void {
    if (this.decisions.length > 1) {
      this.decisions.removeAt(index);
      this.cdr.markForCheck();
    }
  }

  loadConfiguration(): void {
    this.isLoadingConfig = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    
    this.workflowDecisionService.getConfiguration().subscribe({
      next: (config) => {
        try {
          const rawConfig = config || {};
          const ensureArray = (arr: any) => Array.isArray(arr) ? arr : [];

          const fields = Array.from(new Set([
            ...ensureArray(rawConfig.fields),
            'minDistancePercent',
            'rsiCurrentPosition'
          ]));

          const groupsIds = Array.from(new Set([
            ...ensureArray(rawConfig.groupsIds),
            'RSI_OVERSOLD_REVERSING',
            'RSI_OVERBOUGHT_REVERSING'
          ]));

          const values = Array.from(new Set([
            ...ensureArray(rawConfig.values),
            'rsiOversoldReversing',
            'rsiOverboughtReversing'
          ]));

          this.config = {
            operators: ensureArray(rawConfig.operators).length ? rawConfig.operators : this.config.operators,
            groupsIds: groupsIds.length ? groupsIds : this.config.groupsIds,
            fields: fields.length ? fields : this.config.fields,
            values: values.length ? values : this.config.values,
            actions: ensureArray(rawConfig.actions).length ? rawConfig.actions : this.config.actions,
            strategies: ensureArray(rawConfig.strategies).length ? rawConfig.strategies : this.config.strategies,
            steps: ensureArray(rawConfig.steps).length ? rawConfig.steps : this.config.steps,
            tickers: ensureArray(rawConfig.tickers).length ? rawConfig.tickers : this.config.tickers,
            timeFrames: ensureArray(rawConfig.timeFrames).length ? rawConfig.timeFrames : this.config.timeFrames,
            logicalOperators: ensureArray(rawConfig.logicalOperators).length > 0 
              ? rawConfig.logicalOperators 
              : ['AND', 'OR', 'NONE']
          };

          if (this.config.tickers.length > 0 && !this.workflowForm.get('ticker')?.value) {
            this.workflowForm.get('ticker')?.setValue(this.config.tickers[0]);
          }
          if (this.config.timeFrames.length > 0 && !this.workflowForm.get('timeFrame')?.value) {
            this.workflowForm.get('timeFrame')?.setValue(this.config.timeFrames[0]);
          }

          if (this.decisions.length === 0) {
            this.addDecision();
          }
        } catch (err) {
          console.error('Error parsing configuration payload:', err);
        } finally {
          this.isLoadingConfig = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading workflow decision configuration:', err);
        this.errorMessage = 'Não foi possível se conectar com localhost:8080/trading/configuration/wd. As opções padrão foram carregadas para testes.';
        this.isLoadingConfig = false;
        
        if (this.config.tickers.length > 0 && !this.workflowForm.get('ticker')?.value) {
          this.workflowForm.get('ticker')?.setValue(this.config.tickers[0]);
        }
        if (this.config.timeFrames.length > 0 && !this.workflowForm.get('timeFrame')?.value) {
          this.workflowForm.get('timeFrame')?.setValue(this.config.timeFrames[0]);
        }

        if (this.decisions.length === 0) {
          this.addDecision();
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  fillExamplePayloadRule(): void {
    this.workflowForm.get('ticker')?.setValue('BTCUSDT');
    this.workflowForm.get('timeFrame')?.setValue('60');

    // Clear existing decisions
    while (this.decisions.length !== 0) {
      this.decisions.removeAt(0);
    }

    // Add decision 1
    this.decisions.push(this.createDecisionGroup({
      strategy: 'RSI_STRATEGY',
      timeFrame: '60',
      field: 'minDistancePercent',
      value: '1.5',
      operator: 'GREATER_THAN',
      groupId: 'RSI_OVERSOLD_REVERSING',
      logicalOperator: 'OR',
      action: 'OPEN_LONG_POSITION',
      step: 'MAIN_TIMEFRAME'
    }));

    // Add decision 2
    this.decisions.push(this.createDecisionGroup({
      strategy: 'RSI_STRATEGY',
      timeFrame: '60',
      field: 'rsiCurrentPosition',
      value: 'rsiOversoldReversing',
      operator: 'EQUALS',
      groupId: 'RSI_OVERSOLD_REVERSING',
      logicalOperator: 'OR',
      action: 'OPEN_LONG_POSITION',
      step: 'MAIN_TIMEFRAME'
    }));

    // Add decision 3
    this.decisions.push(this.createDecisionGroup({
      strategy: 'RSI_STRATEGY',
      timeFrame: '60',
      field: 'rsiCurrentPosition',
      value: 'rsiOverboughtReversing',
      operator: 'EQUALS',
      groupId: 'RSI_OVERBOUGHT_REVERSING',
      logicalOperator: 'OR',
      action: 'CLOSE_LONG_POSITION',
      step: 'MAIN_TIMEFRAME'
    }));

    this.successMessage = 'Regra de exemplo RSI preenchida no formulário com sucesso!';
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  isNumberOperator(operatorValue: string): boolean {
    return operatorValue === 'GREATER_THAN' || operatorValue === 'LESS_THAN';
  }

  formatLabel(value: string): string {
    if (!value) return '';
    if (/^\d+$/.test(value)) {
      return `${value} min`;
    }
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  onSubmit(): void {
    if (this.workflowForm.invalid) {
      this.workflowForm.markAllAsTouched();
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios do formulário.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.submittedPayloadJson = '';
    this.cdr.markForCheck();

    const formValues = this.workflowForm.getRawValue();
    const payload: WorkflowDecisionCreatePayload = {
      ticker: formValues.ticker,
      timeFrame: formValues.timeFrame,
      decisions: formValues.decisions.map((item: any) => ({
        strategy: item.strategy,
        timeFrame: item.timeFrame || formValues.timeFrame,
        field: item.field,
        value: String(item.value),
        operator: item.operator,
        groupId: item.groupId,
        logicalOperator: item.logicalOperator,
        action: item.action,
        step: item.step
      }))
    };

    this.submittedPayloadJson = JSON.stringify(payload, null, 2);

    this.workflowDecisionService.createWorkflowDecision(payload).subscribe({
      next: (response) => {
        this.successMessage = 'Workflow Decision cadastrado com sucesso!';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating workflow decision:', err);
        this.errorMessage = 'Falha ao cadastrar Workflow Decision. Verifique a API POST localhost:8080/trading/workflow-decisions/create';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
