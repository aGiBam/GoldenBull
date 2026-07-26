import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, TranslocoModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cart = inject(CartService);
  items = this.cart.items;
  subtotal = this.cart.subtotal;

  updateQty(variantKey: string, qty: number) {
    this.cart.updateQuantity(variantKey, qty);
  }

  remove(variantKey: string) {
    this.cart.removeItem(variantKey);
  }
}
