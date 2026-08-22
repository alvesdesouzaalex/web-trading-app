export interface WdConfiguration {
  operators: string[];
  groupsIds?: string[];
  fields: string[];
  values: string[];
  actions: string[];
  strategies: string[];
  strategiesType?: string[];
  steps: string[];
  tickers: string[];
  timeFrames: string[];
}

export interface WorkflowDecisionItem {
  id?: number;
  tickerId: string;
  ticker: string;
  strategy: string;
  strategyType: string;
  timeFrame: string;
  field: string;
  value: string;
  operator: string;
  groupId: number;
  action: string;
  step: string;
}

export interface WorkflowDecisionCreatePayload {
  ticker: string;
  timeFrame: string;
  decisions: WorkflowDecisionItem[];
}
