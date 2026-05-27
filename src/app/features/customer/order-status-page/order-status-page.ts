import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { formatMoney } from '../../../core/money';
import { Order, OrderStatus } from '../../../core/models';
import { OrderService } from '../../../core/order.service';

const STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'RECEIVED', label: 'Received', hint: 'Kitchen has your order.' },
  { status: 'PREPARING', label: 'Preparing', hint: 'Your meal is being cooked.' },
  { status: 'READY', label: 'Ready', hint: 'Almost at your table.' },
  { status: 'SERVED', label: 'Served', hint: 'Enjoy your meal.' },
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
  readonly orderNumber = signal('A1001');
  readonly steps = STEPS;
  readonly currentStepIndex = computed(() => {
    const status = this.order()?.status ?? 'RECEIVED';
    return STEPS.findIndex((step) => step.status === status);
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
    });
  }
}
