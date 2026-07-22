import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, catchError, of } from 'rxjs';
import { ProductsService, Product } from '../../core/services/products.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslocoModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
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

  featuredProducts = toSignal(
    this.ps.getAll().pipe(
      map((products) => products.filter((p) => p.inStock).slice(0, 4)),
      catchError(() => of([] as Product[]))
    ),
    { initialValue: [] as Product[] }
  );

  testimonials = [
    { key: 'testimonial1' },
    { key: 'testimonial2' },
    { key: 'testimonial3' },
  ];

  ngOnInit() {
    this._timer = setInterval(() => {
      this.activeSlide.update(s => (s + 1) % this.heroSlides.length);
    }, 5500);
  }

  ngOnDestroy() { if (this._timer) clearInterval(this._timer); }

  /** Smooth-scrolls just for this one link, since scroll-behavior: smooth was
   * removed globally (it was making router navigation look like scrolling —
   * see styles.scss). */
  scrollToValueBar(event: Event) {
    event.preventDefault();
    document.getElementById('value-bar')?.scrollIntoView({ behavior: 'smooth' });
  }

  goToSlide(i: number) {
    this.activeSlide.set(i);
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => {
      this.activeSlide.update(s => (s + 1) % this.heroSlides.length);
    }, 5500);
  }

}
