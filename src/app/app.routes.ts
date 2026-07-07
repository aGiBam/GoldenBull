import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./@features/home/home').then(c => c.Home) },
  { path: 'products', loadComponent: () => import('./@features/products/products').then(c => c.Products) },
  { path: 'products/:id', loadComponent: () => import('./@features/product-detail/product-detail').then(c => c.ProductDetail) },
  { path: 'cart', loadComponent: () => import('./@features/cart/cart').then(c => c.Cart) },
  { path: 'checkout', loadComponent: () => import('./@features/checkout/checkout').then(c => c.Checkout) },
  { path: 'login', loadComponent: () => import('./@features/auth/login').then(c => c.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./@features/auth/register').then(c => c.Register), canActivate: [guestGuard] },
  { path: 'forgot-password', loadComponent: () => import('./@features/forgot-password/forgot-password').then(c => c.ForgotPassword), canActivate: [guestGuard] },
  { path: 'profile', loadComponent: () => import('./@features/profile/profile').then(c => c.Profile), canActivate: [authGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
