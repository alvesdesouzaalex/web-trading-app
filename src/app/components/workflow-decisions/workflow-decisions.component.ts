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
  activeTab: 'workflows' | 'detail' = 'workflows';

  // Config options
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

  // State for Form Creation (Tab 2: Detail)
  workflowForm!: FormGroup;
  isLoadingConfig: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  submittedPayloadJson: string = '';

  // State for Listing (Tab 1: Workflows)
  selectedTicker: string = 'BTCUSDT';
  workflowList: WorkflowDecisionItem[] = [];
  listTickerHeader: string = 'BTCUSDT';
  listTimeFrameHeader: string = '60';
  isLoadingList: boolean = false;
  listErrorMessage: string = '';

  // State for Delete Confirmation Modal
  showDeleteModal: boolean = false;
  itemToDelete: WorkflowDecisionItem | null = null;
  isDeleting: boolean = false;
  deleteErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private workflowDecisionService: WorkflowDecisionService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadConfiguration();
    this.loadWorkflowList(this.selectedTicker);
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

  switchTab(tab: 'workflows' | 'detail'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    
    if (tab === 'detail') {
      this.resetFormToCleanState();
    } else if (tab === 'workflows') {
      this.loadWorkflowList(this.selectedTicker);
    }
    this.cdr.markForCheck();
  }

  resetFormToCleanState(): void {
    const defaultTicker = this.config.tickers.length > 0 ? this.config.tickers[0] : 'BTCUSDT';
    const defaultTimeFrame = this.config.timeFrames.length > 0 ? this.config.timeFrames[0] : '60';

    this.workflowForm.reset({
      ticker: defaultTicker,
      timeFrame: defaultTimeFrame
    });

    while (this.decisions.length !== 0) {
      this.decisions.removeAt(0);
    }
    this.addDecision();
    this.submittedPayloadJson = '';
    this.cdr.markForCheck();
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

  loadWorkflowList(ticker: string): void {
    this.selectedTicker = ticker;
    this.isLoadingList = true;
    this.listErrorMessage = '';
    this.cdr.markForCheck();

    this.workflowDecisionService.getWorkflowDecisionsByTicker(ticker).subscribe({
      next: (response) => {
        this.listTickerHeader = ticker;
        
        if (Array.isArray(response)) {
          this.workflowList = response;
          this.listTimeFrameHeader = response.length > 0 ? (response[0].timeFrame || '60') : '60';
        } else if (response && Array.isArray(response.decisions)) {
          this.workflowList = response.decisions;
          this.listTickerHeader = response.ticker || ticker;
          this.listTimeFrameHeader = response.timeFrame || '60';
        } else if (response && Array.isArray(response.data)) {
          this.workflowList = response.data;
        } else if (typeof response === 'object' && response !== null) {
          // If response is a single object or dictionary
          this.workflowList = response.decisions || [response];
        } else {
          this.workflowList = [];
        }

        this.isLoadingList = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`Error loading workflow decisions for ticker ${ticker}:`, err);
        this.listErrorMessage = `Erro ao carregar workflows do ticker ${ticker}. Verifique a API GET localhost:8080/trading/workflow-decisions/${ticker}`;
        this.workflowList = [];
        this.isLoadingList = false;
        this.cdr.detectChanges();
      }
    });
  }

  onTickerSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.loadWorkflowList(target.value);
    }
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

  onEditItemPlaceholder(item: WorkflowDecisionItem, index: number): void {
    console.log('Edit item clicked (placeholder):', item, index);
  }

  onDeleteItemPlaceholder(item: WorkflowDecisionItem, index: number): void {
    this.openDeleteModal(item);
  }

  openDeleteModal(item: WorkflowDecisionItem): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
    this.deleteErrorMessage = '';
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
    this.isDeleting = false;
    this.deleteErrorMessage = '';
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.itemToDelete) {
      this.closeDeleteModal();
      return;
    }

    const id = this.itemToDelete.id;
    if (id === undefined || id === null) {
      console.warn('Item selecionado para exclusão não possui ID válido.');
      this.closeDeleteModal();
      return;
    }

    this.isDeleting = true;
    this.deleteErrorMessage = '';
    this.cdr.markForCheck();

    this.workflowDecisionService.deleteWorkflowDecisionsById(id).subscribe({
      next: (response: any) => {
        this.isDeleting = false;
        // Rule 2: Se tiver o retorno de 204 (ou sucesso da transação), chamar a rota de listagem novamente
        const status = response?.status;
        if (status === 204 || status === 200 || response === null || response === undefined || response?.success !== false) {
          this.successMessage = `Workflow Decision #${id} excluído com sucesso!`;
          this.closeDeleteModal();
          this.loadWorkflowList(this.selectedTicker);
        } else {
          this.closeDeleteModal();
          this.loadWorkflowList(this.selectedTicker);
        }
      },
      error: (err) => {
        console.error(`Erro ao excluir Workflow Decision #${id}:`, err);
        this.deleteErrorMessage = `Falha ao excluir Workflow Decision #${id}. Verifique a API DELETE.`;
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
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
    const createdTicker = formValues.ticker;

    const payload: WorkflowDecisionCreatePayload = {
      ticker: createdTicker,
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

    this.workflowDecisionService.createWorkflowDecision(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        // Rule 5: Upon 200 response, clean the form and redirect to Tab 1 (Workflows) with the created ticker
        this.resetFormToCleanState();
        this.selectedTicker = createdTicker;
        this.activeTab = 'workflows';
        this.loadWorkflowList(createdTicker);

        this.successMessage = `Workflow Decision cadastrado com sucesso para o ticker ${createdTicker}!`;
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
