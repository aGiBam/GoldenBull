import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { getErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, TranslocoModule],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawer {
  cart = inject(CartService);
  private orders = inject(OrdersService);

  items = this.cart.items;
  subtotal = this.cart.subtotal;
  isOpen = this.cart.isDrawerOpen;

  // Optional promo preview inside the drawer — the real, authoritative
  // application of the code still happens again at checkout, this is just
  // a convenience so the customer sees the discounted total without leaving
  // the drawer.
  promoInput = signal('');
  promoApplied = signal<{ code: string; percent: number; amount: number } | null>(null);
  promoChecking = signal(false);
  promoError = signal('');

  discountAmount = computed(() => this.promoApplied()?.amount ?? 0);
  total = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));

  close() {
    this.cart.closeDrawer();
  }

  updateQty(variantKey: string, qty: number) {
    this.cart.updateQuantity(variantKey, qty);
  }

  remove(variantKey: string) {
    this.cart.removeItem(variantKey);
  }

  applyPromo() {
    const code = this.promoInput().trim();
    if (!code) return;
    this.promoChecking.set(true);
    this.promoError.set('');
    this.orders.validateDiscount(code, this.subtotal()).subscribe({
      next: (res) => {
        this.promoApplied.set(res);
        this.promoChecking.set(false);
      },
      error: (e) => {
        this.promoApplied.set(null);
        this.promoError.set(getErrorMessage(e, 'Invalid discount code.'));
        this.promoChecking.set(false);
      },
    });
  }

  removePromo() {
    this.promoApplied.set(null);
    this.promoInput.set('');
    this.promoError.set('');
  }
}
