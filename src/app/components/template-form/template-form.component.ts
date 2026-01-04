import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../services/template.service';

@Component({
    selector: 'app-template-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './template-form.component.html',
})
export class TemplateFormComponent implements OnInit {
    templateForm: FormGroup;
    isEditMode: boolean = false;
    tickerId: string | null = null;
    isLoading: boolean = false;
    error: string = '';

    constructor(
        private fb: FormBuilder,
        private templateService: TemplateService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.templateForm = this.fb.group({
            ticker: ['', Validators.required],
            category: ['', Validators.required],
            minProfitPercent: ['', Validators.required],
            marginProfit: ['', Validators.required],
            totalPercentAllowedToUse: [30],
            initialBalance: [0],
            amount: [0, Validators.required],
            minGridSlotQty: [3],
            // Edit specific fields
            nextAmount: [null],
            lastNetProfit: [null],
            gridIncrementValue: [null]
        });
    }

    ngOnInit(): void {
        this.tickerId = this.route.snapshot.paramMap.get('ticker');
        if (this.tickerId) {
            this.isEditMode = true;
            this.loadTemplate(this.tickerId);
            // Ticker and Category are usually immutable or not in UpdateDTO, disable them or handle in template
            this.templateForm.get('ticker')?.disable();
            this.templateForm.get('category')?.disable();
        }
    }

    loadTemplate(id: string): void {
        this.isLoading = true;
        this.templateService.getTemplateById(id).subscribe({
            next: (template) => {
                this.templateForm.patchValue(template);
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Failed to load template.';
                this.isLoading = false;
            }
        });

    }

    onSubmit(): void {
        if (this.templateForm.invalid) return;

        this.isLoading = true;
        const formValue = this.templateForm.getRawValue(); // include disabled fields

        if (this.isEditMode && this.tickerId) {
            // Construct TemplateUpdateDto
            const updateDto = {
                minProfitPercent: formValue.minProfitPercent,
                marginProfit: formValue.marginProfit,
                amount: formValue.amount,
                nextAmount: formValue.nextAmount,
                lastNetProfit: formValue.lastNetProfit,
                gridIncrementValue: formValue.gridIncrementValue,
                minGridSlotQty: formValue.minGridSlotQty,
                initialBalance: formValue.initialBalance,
                totalPercentAllowedToUse: formValue.totalPercentAllowedToUse
            };

            this.templateService.updateTemplate(this.tickerId, updateDto).subscribe({
                next: () => {
                    this.router.navigate(['/templates']);
                },
                error: (err) => {
                    this.error = 'Failed to update template.';
                    this.isLoading = false;
                }
            });
        } else {
            this.templateService.createTemplate(formValue).subscribe({
                next: () => {
                    this.router.navigate(['/templates']);
                },
                error: (err) => {
                    this.error = 'Failed to create template.';
                    this.isLoading = false;
                }
            });
        }
    }
}
