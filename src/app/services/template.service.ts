import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Template, TemplateUpdateDto } from '../models/template.model';

@Injectable({
    providedIn: 'root'
})
export class TemplateService {
    private apiUrl = `${environment.apiUrl}/template`;

    constructor(private http: HttpClient) { }

    getAllTemplates(): Observable<Template[]> {
        return this.http.get<Template[]>(this.apiUrl);
    }

    getTemplateById(id: string): Observable<Template> {
        return this.http.get<Template>(`${this.apiUrl}/${id}`);
    }

    createTemplate(template: Template): Observable<Template> {
        return this.http.post<Template>(this.apiUrl, template);
    }

    updateTemplate(id: string, template: TemplateUpdateDto): Observable<TemplateUpdateDto> {
        return this.http.put<TemplateUpdateDto>(`${this.apiUrl}/${id}`, template);
    }
}
