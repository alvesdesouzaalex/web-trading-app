export interface Template {
    ticker: string;
    symbol?: string;
    category: string;
    totalPercentAllowedToUse?: number;
    minProfitPercent: string;
    marginProfit: string;
    initialBalance: number;
    totalBalance: number;
    accumulatedProfit: number;
    amount: number;
    nextAmount?: number;
    lastNetProfit?: number;
    minGridSlotQty?: number;
    maxRetry?: number;
    countRetry?: number;
    candlesLookBack?: number;
    basePrecision?: string;
    minOrderAmt?: string;
    maxLimitOrderQty?: string;
    maxMarketOrderQty?: string;
}

export interface TemplateUpdateDto {
    minProfitPercent?: string;
    marginProfit?: string;
    amount?: number;
    nextAmount?: number;
    lastNetProfit?: number;
    gridIncrementValue?: string;
    minGridSlotQty?: number;
    initialBalance?: number;
    totalPercentAllowedToUse?: number;
}
