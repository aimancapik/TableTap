import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

import { SAMPLE_ORDER } from './mock-data';
import { CartItem, Order, OrderItem, OrderStatus } from './models';

const ORDERS_KEY = 'tabletap.orders';
const ORDER_SEQUENCE_KEY = 'tabletap.orderSequence';

@Injectable({ providedIn: 'root' })
export class OrderService {
  createOrder(input: {
    tableNumber: string;
    customerNote: string;
    cartItems: CartItem[];
    subtotal: number;
    serviceCharge: number;
    totalAmount: number;
  }) {
    const order: Order = {
      orderNumber: this.nextOrderNumber(),
      tableNumber: input.tableNumber,
      status: 'RECEIVED',
      items: input.cartItems.map(toOrderItem),
      subtotal: input.subtotal,
      serviceCharge: input.serviceCharge,
      totalAmount: input.totalAmount,
      customerNote: input.customerNote,
      createdAt: new Date().toISOString(),
    };

    this.saveOrder(order);
    return of(order).pipe(delay(350));
  }

  getOrderStatus(orderNumber: string) {
    const order = this.findOrder(orderNumber) ?? SAMPLE_ORDER;
    const updatedOrder = {
      ...order,
      status: this.statusForElapsed(order.createdAt),
    };

    return of(updatedOrder).pipe(delay(140));
  }

  private findOrder(orderNumber: string): Order | null {
    const orders = this.restoreOrders();
    return orders.find((order) => order.orderNumber === orderNumber) ?? null;
  }

  private saveOrder(order: Order) {
    const orders = this.restoreOrders();
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  }

  private restoreOrders(): Order[] {
    const rawOrders = localStorage.getItem(ORDERS_KEY);
    if (!rawOrders) {
      return [];
    }

    try {
      return JSON.parse(rawOrders) as Order[];
    } catch {
      localStorage.removeItem(ORDERS_KEY);
      return [];
    }
  }

  private nextOrderNumber(): string {
    const current = Number(localStorage.getItem(ORDER_SEQUENCE_KEY) ?? '1001');
    localStorage.setItem(ORDER_SEQUENCE_KEY, String(current + 1));
    return `A${current}`;
  }

  private statusForElapsed(createdAt: string): OrderStatus {
    const elapsedSeconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    if (elapsedSeconds > 42) {
      return 'SERVED';
    }
    if (elapsedSeconds > 26) {
      return 'READY';
    }
    if (elapsedSeconds > 10) {
      return 'PREPARING';
    }
    return 'RECEIVED';
  }
}

function toOrderItem(item: CartItem): OrderItem {
  return {
    menuItemId: item.menuItemId,
    itemNameSnapshot: item.itemNameSnapshot,
    priceSnapshot: item.priceSnapshot,
    quantity: item.quantity,
    notes: item.notes,
    addOns: item.addOns,
    subtotal: item.subtotal,
  };
}
