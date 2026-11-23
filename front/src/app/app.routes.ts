import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    title: 'Sign in | The Owl Bank',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Open an account | The Owl Bank',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    title: 'My accounts | The Owl Bank',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'accounts/:id',
    title: 'Account details | The Owl Bank',
    loadComponent: () =>
      import('./pages/account-detail/account-detail').then((m) => m.AccountDetail),
  },
  {
    path: 'profile',
    title: 'My profile | The Owl Bank',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: '**',
    title: 'Page not found | The Owl Bank',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];