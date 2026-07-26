import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Navbar } from './@shared/navbar/navbar';
import { Footer } from './@shared/footer/footer';
import { AnnouncementBar } from './@shared/announcement-bar/announcement-bar';
import { CartDrawer } from './@shared/cart-drawer/cart-drawer';
import { AnnouncementService } from './core/services/announcement.service';
import { TranslocoService } from '@jsverse/transloco';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, AnnouncementBar, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private transloco = inject(TranslocoService);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  announcement = inject(AnnouncementService);

  // The admin section (/admin/**) has its own sidebar + topbar (AdminShell),
  // so the storefront navbar/footer/announcement bar must not render there —
  // otherwise you get two navbars stacked on top of each other.
  isAdminSection = signal(this.router.url.startsWith('/admin'));

  constructor() {
    this.transloco.langChanges$.subscribe((lang) => {
      this.document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      this.document.documentElement.setAttribute('lang', lang);
    });

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.isAdminSection.set((e as NavigationEnd).urlAfterRedirects.startsWith('/admin'));
    });
  }
}
