import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';

type PaymentMethod = 'card' | 'cod' | 'vodafone' | 'instapay';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private orders = inject(OrdersService);
  cart = inject(CartService);
  items = this.cart.items;

  selectedPayment = signal<PaymentMethod>('cod');
  orderPlaced = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
  });

  subtotal = this.cart.subtotal;
  deposit = computed(() => Math.ceil(this.subtotal() * 0.2));

  get needsDeposit(): boolean {
    return this.selectedPayment() === 'cod' || this.selectedPayment() === 'vodafone' || this.selectedPayment() === 'instapay';
  }

  selectPayment(method: PaymentMethod) {
    this.selectedPayment.set(method);
  }

  placeOrder() {
    if (this.form.invalid || this.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const payload = {
      paymentMethod: this.selectedPayment(),
      shippingName: this.form.value.fullName!,
      shippingPhone: this.form.value.phone!,
      shippingAddress: this.form.value.address!,
      shippingCity: this.form.value.city!,
      items: this.items().map((i) => ({
        productId: i.id,
        nameEn: i.name,
        nameAr: i.nameAr,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
    };

    this.orders.create(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.orderPlaced.set(true);
        this.cart.clear();
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Could not place order — please try again.');
      },
    });
  }
}
