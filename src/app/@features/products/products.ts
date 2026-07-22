import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { ProductsService, Product } from '../../core/services/products.service';

@Component({
  selector: 'app-products',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private route = inject(ActivatedRoute);
  private cart = inject(CartService);
  private productsService = inject(ProductsService);

  activeFilter = signal<string>('belts');

  readonly filters = ['belts', 'wallets', 'longWallets', 'portefeuille', 'cardHolders', 'slippers'];

  readonly filterIcons: Record<string, string> = {
    belts: '🎗️',
    wallets: '👛',
    longWallets: '💼',
    portefeuille: '👜',
    cardHolders: '💳',
    slippers: '🥿',
  };

  /**
   * Re-fetches from the API whenever the filter changes. switchMap cancels any
   * in-flight request for the previous filter, so rapid tab-clicking can't
   * resolve out of order.
   */
  filteredProducts = toSignal(
    toObservable(this.activeFilter).pipe(
      switchMap((filter) =>
        this.productsService.getByCategory(filter).pipe(catchError(() => of([] as Product[])))
      )
    ),
    { initialValue: [] as Product[] }
  );

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.activeFilter.set(params['category']);
      }
    });
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  addToCart(product: Product, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cart.addItem({
      id: product.id,
      name: product.nameEn,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  }
}
