import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { OrdersService, OrderDto } from '../../core/services/orders.service';
import { ProductsService, Product } from '../../core/services/products.service';
import { ContactService, ContactMessageDto } from '../../core/services/contact.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, TranslocoModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  private ordersService = inject(OrdersService);
  private productsService = inject(ProductsService);
  private contactService = inject(ContactService);

  loading = signal(true);
  orders = signal<OrderDto[]>([]);
  products = signal<Product[]>([]);
  messages = signal<ContactMessageDto[]>([]);

  constructor() {
    this.ordersService.getAll().subscribe((orders) => {
      this.orders.set(orders);
      this.loading.set(false);
    });
    this.productsService.getAll().subscribe((products) => this.products.set(products));
    this.contactService.getAll().subscribe((messages) => this.messages.set(messages));
  }

  get pendingOrders() {
    return this.orders().filter((o) => o.status === 'pending');
  }

  get unreadMessages() {
    return this.messages().filter((m) => !m.read);
  }

  get outOfStockCount() {
    return this.products().filter((p) => !p.inStock).length;
  }

  get totalRevenue() {
    return this.orders().reduce((sum, o) => sum + o.subtotal, 0);
  }

  get recentOrders() {
    return this.orders().slice(0, 5);
  }
}
