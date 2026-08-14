export interface SignalDomain {
    id?: number;
    ticker: string;
    indicator: string;
    indicatorPkg: string;
    indicatorValue: string;
    strategy: string;
    price?: string;
    volume?: string;
    timeFrame?: string;
    tradeType?: string;
    json?: string;
    createdAt?: string;
    forceBuyOrSell?: boolean;
}

export interface OrderHistory {
    id: number;
    ticker: string;
    category: string;
    side: string;
    qty: string;
    gridSlotId: number;
    statusWorkflow: string;
    origin: string;
    timeFrame: string;
    strategy: string;
    indicator: string;
    execPrice: number;
    realTimeProfitPercent: number;
    openHours: number;
    amount: number;
    execValue: string;
}
