import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideMinus, LucidePlus } from '@lucide/angular';

import { CartService } from '../../../core/cart.service';
import { formatMoney } from '../../../core/money';
import { OrderService } from '../../../core/order.service';
import { TableService } from '../../../core/table.service';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideMinus, LucidePlus],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  readonly cart = inject(CartService);
  readonly tableService = inject(TableService);
  readonly customerNote = signal('');
  readonly isSubmitting = signal(false);

  readonly tableNumber = computed(() => this.tableService.currentTableNumber());

  formatMoney = formatMoney;

  updateQuantity(cartId: string, quantity: number) {
    this.cart.updateQuantity(cartId, quantity);
  }

  updateNotes(cartId: string, notes: string) {
    this.cart.updateNotes(cartId, notes);
  }

  removeItem(cartId: string) {
    this.cart.removeItem(cartId);
  }

  submitOrder() {
    if (!this.cart.items().length || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.orderService
      .createOrder({
        tableNumber: this.tableNumber(),
        customerNote: this.customerNote(),
        cartItems: this.cart.items(),
        subtotal: this.cart.subtotal(),
        serviceCharge: this.cart.serviceCharge(),
        totalAmount: this.cart.total(),
      })
      .subscribe((order) => {
        this.cart.clear();
        this.isSubmitting.set(false);
        this.router.navigate(['/order', order.orderNumber]);
      });
  }
}
