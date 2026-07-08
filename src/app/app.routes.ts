import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./@features/home/home').then(c => c.Home) },
  { path: 'products', loadComponent: () => import('./@features/products/products').then(c => c.Products) },
  { path: 'products/:id', loadComponent: () => import('./@features/product-detail/product-detail').then(c => c.ProductDetail) },
  { path: 'cart', loadComponent: () => import('./@features/cart/cart').then(c => c.Cart) },
  { path: 'checkout', loadComponent: () => import('./@features/checkout/checkout').then(c => c.Checkout), canActivate: [authGuard] },
  { path: 'login', loadComponent: () => import('./@features/auth/login').then(c => c.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./@features/auth/register').then(c => c.Register), canActivate: [guestGuard] },
  { path: 'forgot-password', loadComponent: () => import('./@features/forgot-password/forgot-password').then(c => c.ForgotPassword), canActivate: [guestGuard] },
  { path: 'profile', loadComponent: () => import('./@features/profile/profile').then(c => c.Profile), canActivate: [authGuard] },
  { path: 'admin/orders', loadComponent: () => import('./@features/admin-orders/admin-orders').then(c => c.AdminOrders), canActivate: [adminGuard] },
  { path: 'admin/products', loadComponent: () => import('./@features/admin-products/admin-products').then(c => c.AdminProducts), canActivate: [adminGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
