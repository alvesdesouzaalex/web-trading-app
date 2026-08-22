import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WdConfiguration, WorkflowDecisionCreatePayload, WorkflowDecisionItem } from '../models/workflow-decision.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowDecisionService {
  private configUrl = `${environment.apiUrl}/configuration/wd`;
  private createUrl = `${environment.apiUrl}/workflow-decisions/create`;
  private baseUrl = `${environment.apiUrl}/workflow-decisions`;

  constructor(private http: HttpClient) { }

  getConfiguration(): Observable<WdConfiguration> {
    return this.http.get<WdConfiguration>(this.configUrl);
  }

  createWorkflowDecision(payload: WorkflowDecisionCreatePayload): Observable<any> {
    return this.http.post<any>(this.createUrl, payload);
  }

  getWorkflowDecisionsByTicker(tickerId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${tickerId}`);
  }

  deleteWorkflowDecisionsById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { observe: 'response' });
  }

  updateWorkflowDecision(id: number, payload: Partial<WorkflowDecisionItem>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload, { observe: 'response' });
  }
}
