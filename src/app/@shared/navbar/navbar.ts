import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [TranslocoModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private transloco = inject(TranslocoService);
  private cart = inject(CartService);
  themeService = inject(ThemeService);
  auth = inject(AuthService);

  isMenuOpen = signal(false);
  isScrolled = signal(false);

  cartCount = toSignal(
    this.cart.items$.pipe(map((items) => items.reduce((s, i) => s + i.quantity, 0))),
    { initialValue: 0 }
  );

  get currentLang(): string {
    return this.transloco.getActiveLang();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  switchLang() {
    this.transloco.setActiveLang(this.currentLang === 'en' ? 'ar' : 'en');
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
