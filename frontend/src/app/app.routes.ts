import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  //Reindirizzamento iniziale
  {
    path: '',
    redirectTo: 'home',
    pathMatch:'full'
  },
  {
    path: 'home',
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
  
  //Pagine protette
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
        path: 'catalog',
        loadComponent: () => import('./pages/product/product.page').then((m) => m.ProductPage)
      },
      {
        path: 'pantry',
        loadComponent: () => import('./pages/pantry/pantry.page').then((m) => m.PantryPage)
      },
      {
        path: 'shopping-list',
        loadComponent: () => import('./pages/shopping-list/shopping-list.page').then((m) => m.ShoppingListPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'goals',
        loadComponent: () => import('./pages/nutrition-goals/nutrition-goals.page').then(m => m.NutritionGoalsPage)
      }
    ]
  },

  //Fallback per le rotte che non esistono
  {
    path: '**',
    redirectTo: 'home'
  },
  {
    path: 'shopping-list',
    loadComponent: () => import('./pages/shopping-list/shopping-list.page').then( m => m.ShoppingListPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'nutrition-goals',
    loadComponent: () => import('./pages/nutrition-goals/nutrition-goals.page').then( m => m.NutritionGoalsPage)
  }
];
