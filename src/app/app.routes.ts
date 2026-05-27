import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu/table/T12',
    pathMatch: 'full',
  },
  {
    path: 'menu/table/:tableNumber',
    loadComponent: () =>
      import('./features/customer/menu-page/menu-page').then((m) => m.MenuPage),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/customer/cart-page/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'order/:orderNumber',
    loadComponent: () =>
      import('./features/customer/order-status-page/order-status-page').then(
        (m) => m.OrderStatusPage,
      ),
  },
  {
    path: '**',
    redirectTo: 'menu/table/T12',
  },
];
