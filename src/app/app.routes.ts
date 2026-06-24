import { Routes } from '@angular/router';
import { Home } from './@features/home/home';
import { Products } from './@features/products/products';
import { Cart } from './@features/cart/cart';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./@features/home/home').then((c) => c.Home),
  },
  {
    path: 'products',
    loadComponent: () => import('./@features/products/products').then((c) => c.Products),
  },
  {
    path: 'cart',
    loadComponent: () => import('./@features/cart/cart').then((c) => c.Cart),
  },
  { path: '**', redirectTo: 'home' },
];
