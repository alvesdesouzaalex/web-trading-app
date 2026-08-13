export interface WdConfiguration {
  operators: string[];
  groupsIds: string[];
  fields: string[];
  values: string[];
  actions: string[];
  strategies: string[];
  steps: string[];
  tickers: string[];
  timeFrames: string[];
  logicalOperators?: string[];
}

export interface WorkflowDecisionItem {
  strategy: string;
  timeFrame: string;
  field: string;
  value: string;
  operator: string;
  groupId: string;
  logicalOperator: string;
  action: string;
  step: string;
}

export interface WorkflowDecisionCreatePayload {
  ticker: string;
  timeFrame: string;
  decisions: WorkflowDecisionItem[];
}
