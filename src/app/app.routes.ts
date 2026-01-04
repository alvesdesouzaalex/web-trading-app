import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { TemplateFormComponent } from './components/template-form/template-form.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { SignalFormComponent } from './components/signal-form/signal-form.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'templates',
        component: TemplateListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'templates/new',
        component: TemplateFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'templates/:ticker/edit',
        component: TemplateFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'trading',
        component: OrderListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'trading/signal',
        component: SignalFormComponent,
        canActivate: [authGuard]
    },
    { path: '', redirectTo: '/templates', pathMatch: 'full' },
    { path: '**', redirectTo: '/templates' }
];
