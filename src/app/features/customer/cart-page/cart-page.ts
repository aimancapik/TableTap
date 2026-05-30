import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideMinus, LucidePlus } from '@lucide/angular';

import { CartService } from '../../../core/cart.service';
import { formatMoney } from '../../../core/money';
import { OrderType } from '../../../core/models';
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
  readonly orderType = signal<OrderType>('DINE_IN');
  readonly pickupName = signal('');
  readonly pickupPhone = signal('');
  readonly customerNote = signal('');
  readonly isSubmitting = signal(false);
  readonly showPaymentPrompt = signal(false);

  readonly tableNumber = computed(() => this.tableService.currentTableNumber());
  readonly canSubmit = computed(() => {
    if (!this.cart.items().length || this.isSubmitting()) {
      return false;
    }

    return this.orderType() !== 'TAKEOUT' || this.pickupName().trim().length > 0;
  });

  readonly submitLabel = computed(() => {
    if (this.isSubmitting()) {
      return 'Sending order...';
    }

    if (this.orderType() === 'TAKEOUT') {
      return 'Place takeout order';
    }

    if (this.orderType() === 'PACKED_TO_GO') {
      return 'Place pack-to-go order';
    }

    return 'Place order';
  });

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

  selectOrderType(orderType: OrderType) {
    this.orderType.set(orderType);
  }

  openPaymentPrompt() {
    if (!this.canSubmit()) {
      return;
    }

    this.showPaymentPrompt.set(true);
  }

  closePaymentPrompt() {
    if (this.isSubmitting()) {
      return;
    }

    this.showPaymentPrompt.set(false);
  }

  submitOrder() {
    if (!this.canSubmit()) {
      return;
    }

    this.showPaymentPrompt.set(false);
    this.isSubmitting.set(true);
    this.orderService
      .createOrder({
        orderType: this.orderType(),
        tableNumber: this.tableNumber(),
        pickupName: this.pickupName().trim(),
        pickupPhone: this.pickupPhone().trim(),
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
