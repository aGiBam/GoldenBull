import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [TranslocoModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private transloco = inject(TranslocoService);
  private cart = inject(CartService);
  themeService = inject(ThemeService);
  auth = inject(AuthService);

  isMenuOpen = signal(false);
  isScrolled = signal(false);

  cartCount = this.cart.count;

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
