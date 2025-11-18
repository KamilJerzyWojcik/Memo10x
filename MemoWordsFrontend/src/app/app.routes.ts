import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'cards'
  },
  {
    path: 'cards',
    loadComponent: () => import('./cards/cards.page').then(m => m.CardsPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.page').then(m => m.LoginPage)
  },
  {
    path: '**',
    redirectTo: 'cards'
  }
];


