import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/sign-up/sign-up-page.component').then(
        (m) => m.SignUpPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
