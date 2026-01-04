import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TradingService } from '../../services/trading.service';

@Component({
    selector: 'app-signal-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './signal-form.component.html',
})
export class SignalFormComponent {
    signalForm: FormGroup;
    isLoading: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(private fb: FormBuilder, private tradingService: TradingService) {
        this.signalForm = this.fb.group({
            ticker: ['', Validators.required],
            indicator: ['MANUAL'],
            indicatorPkg: ['MANUAL_PKG'],
            indicatorValue: ['BUY'], // Example default
            strategy: ['GRID', Validators.required],
            timeFrame: ['15m'],
            tradeType: ['LONG'],
            price: [''],
        });
    }

    onSubmit(): void {
        if (this.signalForm.invalid) return;

        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';

        this.tradingService.registerSignal(this.signalForm.value).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Signal sent successfully!';
                this.signalForm.reset({
                    indicator: 'MANUAL',
                    indicatorPkg: 'MANUAL_PKG',
                    indicatorValue: 'BUY',
                    strategy: 'GRID',
                    timeFrame: '15m',
                    tradeType: 'LONG'
                });
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = 'Failed to send signal.';
                console.error(err);
            }
        });
    }
}
