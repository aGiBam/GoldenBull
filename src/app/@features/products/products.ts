import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductsService, Product } from '../../core/services/products.service';

@Component({
  selector: 'app-products',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private route = inject(ActivatedRoute);
  private cart = inject(CartService);
  private productsService = inject(ProductsService);

  activeFilter = signal<string>('all');

  readonly filters = ['all', 'belts', 'wallets', 'longWallets', 'portefeuille', 'cardHolders', 'slippers'];

  get filteredProducts(): Product[] {
    return this.productsService.getByCategory(this.activeFilter());
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
