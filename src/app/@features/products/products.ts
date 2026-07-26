import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { ProductsService, Product, ColorOption } from '../../core/services/products.service';

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

  // Distinct from "this category has 0 products" — without it, "No products
  // found" flashed on screen for every request (including just switching
  // tabs), which made the page look briefly empty before the real grid
  // arrived.
  loading = signal(true);

  /**
   * Re-fetches from the API whenever the filter changes. switchMap cancels any
   * in-flight request for the previous filter, so rapid tab-clicking can't
   * resolve out of order.
   */
  filteredProducts = toSignal(
    toObservable(this.activeFilter).pipe(
      tap(() => this.loading.set(true)),
      switchMap((filter) =>
        this.productsService.getByCategory(filter).pipe(catchError(() => of([] as Product[])))
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] as Product[] }
  );

  // Which color swatch is currently previewed on each product card, keyed by
  // product id. Clicking a swatch swaps the card's thumbnail to that color
  // (previously the dots were purely decorative — clicking one did nothing,
  // and the card always opened the product on its default/first color).
  cardColor = signal<Record<number, ColorOption>>({});

  cardImage(product: Product): string {
    return this.cardColor()[product.id]?.image ?? product.image;
  }

  selectCardColor(product: Product, color: ColorOption, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cardColor.update((map) => ({ ...map, [product.id]: color }));
  }

  detailQueryParams(product: Product) {
    const chosen = this.cardColor()[product.id];
    return chosen ? { color: chosen.name } : {};
  }

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
    const color = this.cardColor()[product.id] ?? product.colors?.[0];
    this.cart.addItem({
      id: product.id,
      name: product.nameEn,
      nameAr: product.nameAr,
      price: product.price,
      image: color?.image ?? product.image,
      category: product.category,
      color: color?.name,
      colorAr: color?.nameAr,
      colorHex: color?.hex,
    });
  }
}
