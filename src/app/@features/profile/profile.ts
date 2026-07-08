import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService, OrderDto } from '../../core/services/orders.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  auth = inject(AuthService);
  cart = inject(CartService);
  private fb = inject(FormBuilder);
  private ordersService = inject(OrdersService);

  saving = signal(false);
  saved = signal(false);
  saveError = signal('');
  activeTab = signal<'profile' | 'orders' | 'settings'>('profile');

  orders = signal<OrderDto[]>([]);
  ordersLoading = signal(false);

  form = this.fb.group({
    name: [this.auth.user()?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
  });

  async saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.saveError.set('');
    try {
      await this.auth.updateProfile({ name: this.form.value.name!, email: this.form.value.email! });
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    } catch {
      this.saveError.set('Could not save changes — please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  openOrdersTab() {
    this.activeTab.set('orders');
    if (this.orders().length === 0) {
      this.ordersLoading.set(true);
      this.ordersService.getMine().subscribe({
        next: (orders) => {
          this.orders.set(orders);
          this.ordersLoading.set(false);
        },
        error: () => this.ordersLoading.set(false),
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
