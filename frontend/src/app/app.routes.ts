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
      {
        path: 'catalog',
        loadComponent: () => import('./pages/product/product.page').then((m) => m.ProductPage)
      },
      {
        path: 'pantry',
        loadComponent: () => import('./pages/pantry/pantry.page').then((m) => m.PantryPage)
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
    redirectTo: 'login'
  }
];
