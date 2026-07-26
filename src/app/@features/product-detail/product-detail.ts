import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductsService, Product, ColorOption } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private cart = inject(CartService);
  private transloco = inject(TranslocoService);

  product = signal<Product | null>(null);
  added = signal(false);
  selectedColor = signal<ColorOption | null>(null);
  selectedSize = signal<string | null>(null);
  quantity = signal(1);
  lightboxOpen = signal(false);
  related = signal<Product[]>([]);
  sizeRequiredError = signal(false);

  get lang() {
    return this.transloco.getActiveLang();
  }

  /** Active image: prefer color-specific image, fallback to product default */
  activeImage = computed(() => {
    const c = this.selectedColor();
    const p = this.product();
    if (!p) return '';
    return c?.image ?? p.image;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          return this.productsService.getById(id).pipe(catchError(() => of(null)));
        }),
        tap((p) => {
          this.product.set(p);
          this.selectedColor.set(p?.colors[0] ?? null);
          this.selectedSize.set(p?.sizes?.[0] ?? null);
          this.quantity.set(1);
        }),
        switchMap((p) => (p ? this.productsService.getByCategory(p.category) : of([]))),
        takeUntilDestroyed()
      )
      .subscribe((related) => {
        const current = this.product();
        this.related.set(current ? related.filter((r) => r.id !== current.id).slice(0, 3) : []);
      });
  }

  selectColor(color: ColorOption) {
    this.selectedColor.set(color);
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
    this.sizeRequiredError.set(false);
  }

  increment() {
    this.quantity.update((q) => q + 1);
  }

  decrement() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  openLightbox() {
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  addToCart() {
    const p = this.product();
    if (!p || !p.inStock) return;
    if (p.sizes?.length && !this.selectedSize()) {
      this.sizeRequiredError.set(true);
      return;
    }
    const c = this.selectedColor();
    // Bug fix: previously this always added the product's default photo/name,
    // regardless of the color the customer actually selected (pick a brown
    // pair, cart showed the default black one). Now it uses the active
    // color's own image and label.
    this.cart.addItem(
      {
        id: p.id,
        name: p.nameEn,
        nameAr: p.nameAr,
        price: p.price,
        image: this.activeImage(),
        category: p.category,
        color: c?.name,
        colorAr: c?.nameAr,
        colorHex: c?.hex,
        size: this.selectedSize() ?? undefined,
      },
      this.quantity()
    );
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }
}
