import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ProductsService, Product, ColorOption } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private cart = inject(CartService);
  private transloco = inject(TranslocoService);

  product = signal<Product | null>(null);
  added = signal(false);
  selectedColor = signal<ColorOption | null>(null);
  lightboxOpen = signal(false);

  get lang() { return this.transloco.getActiveLang(); }

  related = signal<Product[]>([]);

  /** Active image: prefer color-specific image, fallback to product default */
  activeImage = computed(() => {
    const c = this.selectedColor();
    const p = this.product();
    if (!p) return '';
    return (c?.image) ?? p.image;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const p = this.productsService.getById(id) ?? null;
      this.product.set(p);
      if (p) {
        this.selectedColor.set(p.colors[0] ?? null);
        this.related.set(
          this.productsService.getByCategory(p.category)
            .filter(r => r.id !== p.id)
            .slice(0, 3)
        );
      }
    });
  }

  selectColor(color: ColorOption) { this.selectedColor.set(color); }

  openLightbox() { this.lightboxOpen.set(true); }
  closeLightbox() { this.lightboxOpen.set(false); }

  addToCart() {
    const p = this.product();
    if (!p || !p.inStock) return;
    this.cart.addItem({ id: p.id, name: p.nameEn, nameAr: p.nameAr, price: p.price, image: p.image, category: p.category });
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }
}
