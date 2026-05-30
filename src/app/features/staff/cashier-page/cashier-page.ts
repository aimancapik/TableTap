import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { formatMoney } from '../../../core/money';
import { Order } from '../../../core/models';
import { isTableBillOrder, OrderService } from '../../../core/order.service';

interface TableCounterBill {
  tableNumber: string;
  orders: Order[];
  totalDue: number;
  itemCount: number;
}

@Component({
  selector: 'app-cashier-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cashier-page.html',
  styleUrl: './cashier-page.css',
})
export class CashierPage {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);
  readonly activeOrderNumber = signal<string | null>(null);
  readonly activeTableNumber = signal<string | null>(null);
  readonly tableSearch = signal('');
  readonly unpaidOrders = computed(() =>
    this.orders().filter((order) => order.paymentStatus === 'UNPAID'),
  );
  readonly tableBills = computed(() => this.groupTableBills(this.unpaidOrders()));
  readonly visibleTableBills = computed(() => {
    const search = this.normalizeTableSearch(this.tableSearch());
    if (!search) {
      return this.tableBills();
    }

    return this.tableBills().filter((bill) =>
      this.normalizeTableSearch(bill.tableNumber).includes(search),
    );
  });
  readonly unpaidTakeoutOrders = computed(() =>
    this.unpaidOrders().filter((order) => order.orderType === 'TAKEOUT'),
  );
  readonly openBillCount = computed(
    () => this.tableBills().length + this.unpaidTakeoutOrders().length,
  );
  readonly paidOrders = computed(() =>
    this.orders()
      .filter((order) => order.paymentStatus === 'PAID')
      .slice(0, 4),
  );
  readonly unpaidTotal = computed(() =>
    this.unpaidOrders().reduce((total, order) => total + order.totalAmount, 0),
  );

  formatMoney = formatMoney;

  constructor() {
    this.loadOrders();
  }

  markPaid(orderNumber: string) {
    if (this.activeOrderNumber() || this.activeTableNumber()) {
      return;
    }

    this.activeOrderNumber.set(orderNumber);
    this.orderService.markOrderPaid(orderNumber).subscribe(() => {
      this.activeOrderNumber.set(null);
      this.loadOrders();
    });
  }

  markTablePaid(table: TableCounterBill) {
    if (this.activeOrderNumber() || this.activeTableNumber()) {
      return;
    }

    this.activeTableNumber.set(table.tableNumber);
    const orderNumbers = table.orders.map((order) => order.orderNumber);
    let remaining = orderNumbers.length;

    for (const orderNumber of orderNumbers) {
      this.orderService.markOrderPaid(orderNumber).subscribe(() => {
        remaining -= 1;
        if (remaining === 0) {
          this.activeTableNumber.set(null);
          this.loadOrders();
        }
      });
    }
  }

  itemCount(order: Order) {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  private loadOrders() {
    this.orderService.getCounterOrders().subscribe((orders) => {
      this.orders.set(orders);
      this.isLoading.set(false);
    });
  }

  private groupTableBills(orders: Order[]): TableCounterBill[] {
    const tableMap = new Map<string, Order[]>();
    for (const order of orders) {
      if (!isTableBillOrder(order.orderType) || !order.tableNumber) {
        continue;
      }

      tableMap.set(order.tableNumber, [...(tableMap.get(order.tableNumber) ?? []), order]);
    }

    return Array.from(tableMap.entries()).map(([tableNumber, tableOrders]) => ({
      tableNumber,
      orders: tableOrders,
      totalDue: tableOrders.reduce((total, order) => total + order.totalAmount, 0),
      itemCount: tableOrders.reduce(
        (total, order) =>
          total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
        0,
      ),
    }));
  }

  private normalizeTableSearch(value: string) {
    return value.trim().toUpperCase().replace(/\s+/g, '');
  }
}
