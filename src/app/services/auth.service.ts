import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, JwtAuthenticationResponse } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private readonly TOKEN_KEY = 'auth-token';

    constructor(private http: HttpClient, private router: Router) { }

    login(loginRequest: LoginRequest): Observable<JwtAuthenticationResponse> {
        return this.http.post<JwtAuthenticationResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
            tap(response => {
                this.setToken(response.accessToken);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }
}
