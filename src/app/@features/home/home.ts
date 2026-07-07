import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslocoModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private ps = inject(ProductsService);
  private _timer: ReturnType<typeof setInterval> | null = null;

  heroSlides = [
    { image: 'images/hero-bg.jpg',   tagline: 'hero.tagline1' },
    { image: 'images/belt-3.jpg',    tagline: 'hero.tagline2' },
    { image: 'images/wallet-3.jpg',  tagline: 'hero.tagline3' },
  ];

  activeSlide = signal(0);
  promoVisible = signal(false);

  valueBars = [
    { key: 'handmade', icon: '✋' },
    { key: 'genuine',  icon: '🏅' },
    { key: 'quality',  icon: '⭐' },
    { key: 'custom',   icon: '🎨' },
  ];

  categories = [
    { key: 'belts',       keyDesc: 'beltsDesc',       image: 'images/belt-2.jpg'    },
    { key: 'wallets',     keyDesc: 'walletsDesc',      image: 'images/wallet-6.jpg'  },
    { key: 'cardHolders', keyDesc: 'cardHoldersDesc',  image: 'images/card-1.jpg'    },
    { key: 'slippers',    keyDesc: 'slippersDesc',     image: 'images/belt-4.jpg'    },
  ];

  featuredProducts = this.ps.all.filter(p => p.inStock).slice(0, 4);

  testimonials = [
    { name: 'Ahmed K.',   text: 'The belt I ordered is absolutely stunning. You can feel the quality in every stitch.' },
    { name: 'Sara M.',    text: "My husband loves the wallet. It's slim, elegant and the leather smell is amazing." },
    { name: 'Youssef T.', text: 'Ordered a custom card holder and it exceeded all expectations. Fast delivery.' },
  ];

  ngOnInit() {
    this._timer = setInterval(() => {
      this.activeSlide.update(s => (s + 1) % this.heroSlides.length);
    }, 5500);
    // Show promo popup after 3 seconds
    setTimeout(() => this.promoVisible.set(true), 3000);
  }

  ngOnDestroy() { if (this._timer) clearInterval(this._timer); }

  goToSlide(i: number) {
    this.activeSlide.set(i);
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => {
      this.activeSlide.update(s => (s + 1) % this.heroSlides.length);
    }, 5500);
  }

  closePromo() { this.promoVisible.set(false); }
}
