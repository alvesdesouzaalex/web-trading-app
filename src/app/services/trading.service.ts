import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignalDomain, OrderHistory } from '../models/signal.model';

@Injectable({
    providedIn: 'root'
})
export class TradingService {
    private apiUrl = `${environment.apiUrl}/order`;

    constructor(private http: HttpClient) { }

    registerSignal(signal: SignalDomain): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/bot/signal`, signal);
    }

    getAllOpenedOrders(): Observable<any[]> { // Adjust return type if OrderHistory specific
        return this.http.get<any[]>(`${this.apiUrl}/open`);
    }

    getOrderDetail(orderLinkId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${orderLinkId}/detail`);
    }
}
