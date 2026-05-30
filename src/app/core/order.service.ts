import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

import { SAMPLE_ORDER } from './mock-data';
import {
  CartItem,
  KitchenTicket,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  TableBill,
} from './models';

const ORDERS_KEY = 'tabletap.orders';
const KITCHEN_TICKETS_KEY = 'tabletap.kitchenTickets';
const ORDER_SEQUENCE_KEY = 'tabletap.orderSequence';

@Injectable({ providedIn: 'root' })
export class OrderService {
  createOrder(input: {
    orderType: OrderType;
    tableNumber?: string;
    pickupName?: string;
    pickupPhone?: string;
    customerNote: string;
    cartItems: CartItem[];
    subtotal: number;
    serviceCharge: number;
    totalAmount: number;
  }) {
    const order: Order = {
      orderNumber: this.nextOrderNumber(),
      orderType: input.orderType,
      tableNumber: isTableBillOrder(input.orderType) ? input.tableNumber : undefined,
      pickupName: input.orderType === 'TAKEOUT' ? input.pickupName : undefined,
      pickupPhone: input.orderType === 'TAKEOUT' ? input.pickupPhone : undefined,
      status: 'RECEIVED',
      items: input.cartItems.map(toOrderItem),
      subtotal: input.subtotal,
      serviceCharge: input.serviceCharge,
      totalAmount: input.totalAmount,
      paymentMethod: 'PAY_AT_COUNTER',
      paymentStatus: 'UNPAID',
      customerNote: input.customerNote,
      createdAt: new Date().toISOString(),
    };

    this.saveOrder(order);
    this.sendToKitchen(order);
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

  markOrderPaid(orderNumber: string) {
    const orders = this.restoreOrders();
    const paidAt = new Date().toISOString();
    let paidOrder: Order | null = null;
    const updatedOrders = orders.map((order) => {
      if (order.orderNumber !== orderNumber) {
        return order;
      }

      paidOrder = {
        ...order,
        status: 'RECEIVED',
        paymentStatus: 'PAID',
        paidAt,
      };
      return paidOrder;
    });

    if (!paidOrder) {
      return of(null).pipe(delay(180));
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    this.sendToKitchen(paidOrder);
    return of(paidOrder).pipe(delay(180));
  }

  getCounterOrders() {
    return of(this.restoreOrders()).pipe(delay(140));
  }

  getTableBill(tableNumber: string) {
    return of(this.buildTableBill(tableNumber)).pipe(delay(120));
  }

  private findOrder(orderNumber: string): Order | null {
    const orders = this.restoreOrders();
    return orders.find((order) => order.orderNumber === orderNumber) ?? null;
  }

  private saveOrder(order: Order) {
    const orders = this.restoreOrders();
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  }

  private sendToKitchen(order: Order) {
    const tickets = this.restoreKitchenTickets();
    if (tickets.some((ticket) => ticket.orderNumber === order.orderNumber)) {
      return;
    }

    const ticket: KitchenTicket = {
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      pickupName: order.pickupName,
      items: order.items,
      customerNote: order.customerNote,
      status: 'RECEIVED',
      receivedAt: new Date().toISOString(),
    };
    localStorage.setItem(KITCHEN_TICKETS_KEY, JSON.stringify([ticket, ...tickets]));
  }

  private restoreOrders(): Order[] {
    const rawOrders = localStorage.getItem(ORDERS_KEY);
    if (!rawOrders) {
      return [];
    }

    try {
      return (JSON.parse(rawOrders) as Order[]).map(normalizeOrder);
    } catch {
      localStorage.removeItem(ORDERS_KEY);
      return [];
    }
  }

  private restoreKitchenTickets(): KitchenTicket[] {
    const rawTickets = localStorage.getItem(KITCHEN_TICKETS_KEY);
    if (!rawTickets) {
      return [];
    }

    try {
      return JSON.parse(rawTickets) as KitchenTicket[];
    } catch {
      localStorage.removeItem(KITCHEN_TICKETS_KEY);
      return [];
    }
  }

  private buildTableBill(tableNumber: string): TableBill {
    const orders = this.restoreOrders();
    const billOrders = orders.filter(
      (order) =>
        isTableBillOrder(order.orderType) &&
        order.paymentStatus === 'UNPAID' &&
        order.tableNumber === tableNumber,
    );

    return {
      tableNumber,
      orders: billOrders,
      subtotal: roundMoney(billOrders.reduce((total, order) => total + order.subtotal, 0)),
      serviceCharge: roundMoney(
        billOrders.reduce((total, order) => total + order.serviceCharge, 0),
      ),
      totalDue: roundMoney(billOrders.reduce((total, order) => total + order.totalAmount, 0)),
      itemCount: billOrders.reduce(
        (total, order) =>
          total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
        0,
      ),
    };
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

function normalizeOrder(order: Order): Order {
  const orderType = order.orderType ?? (order.tableNumber ? 'DINE_IN' : 'TAKEOUT');
  const paymentStatus = order.paymentStatus ?? 'UNPAID';

  return {
    ...order,
    orderType,
    status: order.status === 'AWAITING_PAYMENT' ? 'RECEIVED' : (order.status ?? 'RECEIVED'),
    paymentMethod: order.paymentMethod ?? 'PAY_AT_COUNTER',
    paymentStatus,
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isTableBillOrder(orderType: OrderType): boolean {
  return orderType === 'DINE_IN' || orderType === 'PACKED_TO_GO';
}
