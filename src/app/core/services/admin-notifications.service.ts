import { Injectable, inject, signal, computed } from '@angular/core';
import { OrdersService } from './orders.service';
import { ContactService, ContactMessageDto } from './contact.service';
import { AuthService } from './auth.service';

const POLL_MS = 30000;

@Injectable({ providedIn: 'root' })
export class AdminNotificationsService {
  private orders = inject(OrdersService);
  private contact = inject(ContactService);
  private auth = inject(AuthService);

  private _pendingOrdersCount = signal(0);
  private _unreadMessages = signal<ContactMessageDto[]>([]);

  readonly pendingOrdersCount = this._pendingOrdersCount.asReadonly();
  readonly unreadMessages = this._unreadMessages.asReadonly();
  readonly unreadMessagesCount = computed(() => this._unreadMessages().length);
  readonly totalBadge = computed(() => this._pendingOrdersCount() + this.unreadMessagesCount());

  private started = false;

  /** Call once (e.g. from the admin shell) to start polling. Safe to call repeatedly. */
  start() {
    if (this.started || !this.auth.isAdmin()) return;
    this.started = true;
    this.refresh();
    setInterval(() => this.refresh(), POLL_MS);
  }

  refresh() {
    if (!this.auth.isAdmin()) return;
    this.orders.getAll().subscribe({
      next: (orders) => this._pendingOrdersCount.set(orders.filter((o) => o.status === 'pending').length),
      error: () => {},
    });
    this.contact.getAll().subscribe({
      next: (messages) => this._unreadMessages.set(messages.filter((m) => !m.read)),
      error: () => {},
    });
  }
}
