import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TemplateService } from '../../services/template.service';
import { Template } from '../../models/template.model';

@Component({
    selector: 'app-template-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './template-list.component.html',
})
export class TemplateListComponent implements OnInit {
    templates: Template[] = [];
    isLoading: boolean = true;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(private templateService: TemplateService, private cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadTemplates();
    }

    loadTemplates(): void {
        this.templateService.getAllTemplates().subscribe({
            next: (data) => {
                this.templates = data;
                this.isLoading = false;
                this.cd.detectChanges();
            },
            error: (err) => {
                console.error('Error loading templates', err);
                this.isLoading = false;
                this.cd.detectChanges();
            }
        });
    }

    toggleActive(template: Template): void {
        const isActivating = !template.active;
        this.errorMessage = '';
        this.templateService.toggleActiveInactive(template.ticker).subscribe({
            next: (response: any) => {
                const status = response?.status;
                if (status === 204 || status === 200 || response === null || response === undefined || response?.status === 204) {
                    this.successMessage = isActivating
                        ? 'Template ativado com sucesso'
                        : 'Template inativado com sucesso';
                    this.loadTemplates();
                } else {
                    this.loadTemplates();
                }
            },
            error: (err) => {
                console.error(`Error toggling status for template ${template.ticker}`, err);
                this.errorMessage = `Falha ao alterar status do template ${template.ticker}`;
                this.cd.detectChanges();
            }
        });
    }

    deleteTemplate(ticker: string): void {
        this.errorMessage = '';
        this.templateService.deleteTemplate(ticker).subscribe({
            next: (response: any) => {
                const status = response?.status;
                if (status === 204 || status === 200 || response === null || response === undefined || response?.status === 204) {
                    this.successMessage = 'Template deletado com sucesso';
                    this.loadTemplates();
                } else {
                    this.loadTemplates();
                }
            },
            error: (err) => {
                console.error(`Error deleting template ${ticker}`, err);
                this.errorMessage = `Falha ao deletar o template ${ticker}`;
                this.cd.detectChanges();
            }
        });
    }
}
