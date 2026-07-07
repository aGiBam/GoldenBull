import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, TranslocoModule, AsyncPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cart = inject(CartService);
  items$ = this.cart.items$;

  get subtotal(): number {
    return this.cart.subtotal;
  }

  updateQty(id: number, qty: number) {
    this.cart.updateQuantity(id, qty);
  }

  remove(id: number) {
    this.cart.removeItem(id);
  }
}
