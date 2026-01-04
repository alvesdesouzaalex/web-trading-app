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
}
