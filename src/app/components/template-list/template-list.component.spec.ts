import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateListComponent } from './template-list.component';
import { TemplateService } from '../../services/template.service';
import { Template } from '../../models/template.model';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('TemplateListComponent', () => {
    let component: TemplateListComponent;
    let fixture: ComponentFixture<TemplateListComponent>;
    let service: TemplateService;

    const mockTemplates: Template[] = [
        {
            ticker: 'BTCUSDT',
            category: 'SCALPING',
            active: true,
            minProfitPercent: '1.0',
            marginProfit: '0.5',
            initialBalance: 1000,
            totalBalance: 1050,
            accumulatedProfit: 50,
            amount: 100
        },
        {
            ticker: 'ETHUSDT',
            category: 'TREND',
            active: false,
            minProfitPercent: '1.5',
            marginProfit: '0.7',
            initialBalance: 500,
            totalBalance: 520,
            accumulatedProfit: 20,
            amount: 50
        }
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TemplateListComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([])
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TemplateListComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(TemplateService);

        vi.spyOn(service, 'getAllTemplates').mockReturnValue(of(mockTemplates));
        fixture.detectChanges();
    });

    it('should initialize and load template list', () => {
        expect(component).toBeTruthy();
        expect(service.getAllTemplates).toHaveBeenCalled();
        expect(component.templates.length).toBe(2);
    });

    // Cenário 1: Ativar template (PATCH /{ticker}/active-inactive -> 204)
    it('should activate template, show "Template ativado com sucesso" banner, and reload list upon HTTP 204', () => {
        const inactiveTemplate = mockTemplates[1]; // ETHUSDT (active: false)
        vi.spyOn(service, 'toggleActiveInactive').mockReturnValue(of({ status: 204 }));
        const loadTemplatesSpy = vi.spyOn(component, 'loadTemplates');

        component.toggleActive(inactiveTemplate);

        expect(service.toggleActiveInactive).toHaveBeenCalledWith('ETHUSDT');
        expect(component.successMessage).toBe('Template ativado com sucesso');
        expect(loadTemplatesSpy).toHaveBeenCalled();
    });

    // Cenário 2: Inativar template (PATCH /{ticker}/active-inactive -> 204)
    it('should inactivate template, show "Template inativado com sucesso" banner, and reload list upon HTTP 204', () => {
        const activeTemplate = mockTemplates[0]; // BTCUSDT (active: true)
        vi.spyOn(service, 'toggleActiveInactive').mockReturnValue(of({ status: 204 }));
        const loadTemplatesSpy = vi.spyOn(component, 'loadTemplates');

        component.toggleActive(activeTemplate);

        expect(service.toggleActiveInactive).toHaveBeenCalledWith('BTCUSDT');
        expect(component.successMessage).toBe('Template inativado com sucesso');
        expect(loadTemplatesSpy).toHaveBeenCalled();
    });

    // Cenário 3: Deletar template (DELETE /{ticker} -> 204)
    it('should delete template, show "Template deletado com sucesso" banner, and reload list upon HTTP 204', () => {
        vi.spyOn(service, 'deleteTemplate').mockReturnValue(of({ status: 204 }));
        const loadTemplatesSpy = vi.spyOn(component, 'loadTemplates');

        component.deleteTemplate('BTCUSDT');

        expect(service.deleteTemplate).toHaveBeenCalledWith('BTCUSDT');
        expect(component.successMessage).toBe('Template deletado com sucesso');
        expect(loadTemplatesSpy).toHaveBeenCalled();
    });
});
