import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

type PaymentMethod = 'card' | 'cod' | 'vodafone' | 'instapay';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cart = inject(CartService);
  items$ = this.cart.items$;

  selectedPayment = signal<PaymentMethod>('cod');
  orderPlaced = signal(false);
  loading = signal(false);

  form = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
  });

  get subtotal(): number { return this.cart.subtotal; }
  get deposit(): number { return Math.ceil(this.subtotal * 0.2); }
  get needsDeposit(): boolean {
    return this.selectedPayment() === 'cod' || this.selectedPayment() === 'vodafone' || this.selectedPayment() === 'instapay';
  }

  selectPayment(method: PaymentMethod) { this.selectedPayment.set(method); }

  placeOrder() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.orderPlaced.set(true);
      this.cart.clear();
    }, 1400);
  }
}
