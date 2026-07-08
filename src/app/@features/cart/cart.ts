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

  updateQty(id: number, qty: number) {
    this.cart.updateQuantity(id, qty);
  }

  remove(id: number) {
    this.cart.removeItem(id);
  }
}
