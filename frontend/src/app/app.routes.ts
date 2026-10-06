import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '../layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from '../layout/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
      },
    ]
  },

  //Rotte protette racchiuse nel MainLayout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage)
      },
      {
        path: 'goal',
        loadComponent: () => import('./pages/goal/goal.page').then((m) => m.GoalPage)
      },
      /*{
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      }*/
    ]
  },

  //Fallback per le rotte che non esistono
  {
    path: '**',
    redirectTo: ''
  },
  {
    path: 'goal',
    loadComponent: () => import('./pages/goal/goal.page').then(m => m.GoalPage)
  }
];
