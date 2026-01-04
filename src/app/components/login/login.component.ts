import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    loginForm: FormGroup;
    error: string = '';
    isLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            pass: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.error = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/trading']);
            },
            error: (err) => {
                this.isLoading = false;
                this.error = 'Login failed. Please check your credentials.';
                console.error(err);
            }
        });
    }
}
