import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu/table/T12',
    pathMatch: 'full',
  },
  {
    path: 'menu/table/:tableNumber',
    loadComponent: () => import('./features/customer/menu-page/menu-page').then((m) => m.MenuPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/customer/cart-page/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'order/:orderNumber',
    loadComponent: () =>
      import('./features/customer/order-status-page/order-status-page').then(
        (m) => m.OrderStatusPage,
      ),
  },
  {
    path: 'cashier',
    loadComponent: () =>
      import('./features/staff/cashier-page/cashier-page').then((m) => m.CashierPage),
  },
  {
    path: 'admin/menu',
    loadComponent: () =>
      import('./features/staff/admin-menu-page/admin-menu-page').then((m) => m.AdminMenuPage),
  },
  {
    path: '**',
    redirectTo: 'menu/table/T12',
  },
];
