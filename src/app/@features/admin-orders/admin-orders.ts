import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { OrdersService, OrderDto, OrderStatus } from '../../core/services/orders.service';
import { getErrorMessage } from '../../core/utils/http-error';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'app-admin-orders',
  imports: [TranslocoModule, DatePipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrders {
  private ordersService = inject(OrdersService);

  orders = signal<OrderDto[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  statuses = STATUSES;
  lightboxImage = signal<string | null>(null);
  updatingId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.ordersService.getAll().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (e) => {
        this.errorMsg.set(getErrorMessage(e, 'Could not load orders.'));
        this.loading.set(false);
      },
    });
  }

  onStatusChange(order: OrderDto, status: string) {
    this.updatingId.set(order.id);
    this.ordersService.updateStatus(order.id, status as OrderStatus).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
        this.updatingId.set(null);
      },
      error: (e) => {
        this.errorMsg.set(getErrorMessage(e, 'Could not update order status.'));
        this.updatingId.set(null);
      },
    });
  }

  openProof(url: string) {
    this.lightboxImage.set(url);
  }

  closeProof() {
    this.lightboxImage.set(null);
  }

  orderTotal(order: OrderDto): number {
    return order.subtotal;
  }
}
