import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingService } from '../../services/trading.service';
import { OrderHistory } from '../../models/signal.model';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
    orders: OrderHistory[] = [];
    isLoading: boolean = true;
    selectedOrder: OrderHistory | null = null;
    isModalOpen: boolean = false;

    constructor(private tradingService: TradingService, private cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.tradingService.getAllOpenedOrders().subscribe({
            next: (data: OrderHistory[]) => {
                this.orders = data;
                this.isLoading = false;
                this.cd.detectChanges();
            },
            error: (err) => {
                console.error('Error loading orders', err);
                this.isLoading = false;
                this.cd.detectChanges();
            }
        });
    }

    openModal(order: OrderHistory): void {
        this.selectedOrder = order;
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.selectedOrder = null;
    }
}
