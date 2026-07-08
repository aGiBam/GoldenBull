import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService, OrderDto } from '../../core/services/orders.service';
import { getErrorMessage } from '../../core/utils/http-error';

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

  passwordSaving = signal(false);
  passwordSaved = signal(false);
  passwordError = signal('');

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
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

  async changePassword() {
    this.passwordError.set('');
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordError.set('New password and confirmation do not match.');
      return;
    }
    this.passwordSaving.set(true);
    try {
      await this.auth.changePassword(currentPassword!, newPassword!);
      this.passwordForm.reset();
      this.passwordSaved.set(true);
      setTimeout(() => this.passwordSaved.set(false), 2500);
    } catch (e) {
      this.passwordError.set(getErrorMessage(e, 'Could not change password — please try again.'));
    } finally {
      this.passwordSaving.set(false);
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
