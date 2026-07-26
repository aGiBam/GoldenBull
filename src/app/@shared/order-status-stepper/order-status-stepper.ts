import { Component, Input, computed, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { OrderStatus } from '../../core/services/orders.service';

const STAGE_ORDER: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'outForDelivery', 'delivered'];

@Component({
  selector: 'app-order-status-stepper',
  imports: [TranslocoModule],
  templateUrl: './order-status-stepper.html',
  styleUrl: './order-status-stepper.scss',
})
export class OrderStatusStepper {
  private _status = signal<OrderStatus>('pending');

  @Input({ required: true })
  set status(value: OrderStatus) {
    this._status.set(value);
  }

  // "pending" and "confirmed" both read as the same customer-facing stage
  // ("we're working on your piece") — the distinction between them is
  // internal/admin-only (has the admin actually reviewed the deposit proof
  // yet), not something a customer needs a separate step for.
  readonly stages = ['pending', 'shipped', 'outForDelivery', 'delivered'] as const;

  isCancelled = computed(() => this._status() === 'cancelled');

  currentIndex = computed(() => {
    const s = this._status();
    const normalized = s === 'confirmed' ? 'pending' : s;
    const idx = this.stages.indexOf(normalized as (typeof this.stages)[number]);
    return idx === -1 ? 0 : idx;
  });

  stageState(index: number): 'done' | 'current' | 'upcoming' {
    const current = this.currentIndex();
    if (index < current) return 'done';
    if (index === current) return 'current';
    return 'upcoming';
  }
}
