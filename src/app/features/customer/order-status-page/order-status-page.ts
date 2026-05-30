import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { formatMoney } from '../../../core/money';
import { Order, OrderStatus, TableBill } from '../../../core/models';
import { isTableBillOrder, OrderService } from '../../../core/order.service';

type StatusStep = { status: OrderStatus; label: string; hint: string };

const DINE_IN_STEPS: StatusStep[] = [
  { status: 'RECEIVED', label: 'Sent to kitchen', hint: 'Kitchen has your order.' },
  { status: 'PREPARING', label: 'Preparing', hint: 'Your meal is being cooked.' },
  { status: 'READY', label: 'Ready', hint: 'Almost at your table.' },
  { status: 'SERVED', label: 'Served', hint: 'Enjoy your meal.' },
];

const TAKEOUT_STEPS: StatusStep[] = [
  { status: 'RECEIVED', label: 'Sent to kitchen', hint: 'Kitchen has your takeout order.' },
  { status: 'PREPARING', label: 'Preparing', hint: 'Your food is being packed fresh.' },
  { status: 'READY', label: 'Ready for pickup', hint: 'Please collect it at the counter.' },
  { status: 'SERVED', label: 'Picked up', hint: 'Thanks for ordering with us.' },
];

const PACKED_TO_GO_STEPS: StatusStep[] = [
  { status: 'RECEIVED', label: 'Sent to kitchen', hint: 'Kitchen has your packed order.' },
  { status: 'PREPARING', label: 'Packing fresh', hint: 'Your food is being prepared to go.' },
  { status: 'READY', label: 'Ready to collect', hint: 'Please collect the packed order soon.' },
  { status: 'SERVED', label: 'Packed', hint: 'This round is ready on your table bill.' },
];

@Component({
  selector: 'app-order-status-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-status-page.html',
  styleUrl: './order-status-page.css',
})
export class OrderStatusPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly timer: number;

  readonly order = signal<Order | null>(null);
  readonly tableBill = signal<TableBill | null>(null);
  readonly orderNumber = signal('A1001');
  readonly steps = computed(() =>
    this.order()?.orderType === 'TAKEOUT'
      ? TAKEOUT_STEPS
      : this.order()?.orderType === 'PACKED_TO_GO'
        ? PACKED_TO_GO_STEPS
        : DINE_IN_STEPS,
  );
  readonly currentStepIndex = computed(() => {
    const status = this.order()?.status ?? 'RECEIVED';
    return this.steps().findIndex((step) => step.status === status);
  });
  readonly orderLabel = computed(() => {
    const order = this.order();
    if (order?.orderType === 'TAKEOUT') {
      return `Takeout for ${order.pickupName ?? 'pickup'}`;
    }

    if (order?.orderType === 'PACKED_TO_GO') {
      return `Packed to go for Table ${order.tableNumber ?? 'T12'}`;
    }

    return `Table ${order?.tableNumber ?? 'T12'}`;
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.orderNumber.set(params.get('orderNumber') ?? 'A1001');
      this.refreshOrder();
    });

    this.timer = window.setInterval(() => this.refreshOrder(), 5000);
  }

  formatMoney = formatMoney;

  ngOnDestroy(): void {
    window.clearInterval(this.timer);
  }

  isStepComplete(index: number) {
    return index <= this.currentStepIndex();
  }

  private refreshOrder() {
    this.orderService.getOrderStatus(this.orderNumber()).subscribe((order) => {
      this.order.set(order);
      if (isTableBillOrder(order.orderType) && order.tableNumber) {
        this.orderService.getTableBill(order.tableNumber).subscribe((bill) => {
          this.tableBill.set(
            bill.orders.some((billOrder) => billOrder.orderNumber === order.orderNumber)
              ? bill
              : null,
          );
        });
      } else {
        this.tableBill.set(null);
      }
    });
  }
}
