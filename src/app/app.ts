import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './@shared/navbar/navbar';
import { Footer } from './@shared/footer/footer';
import { TranslocoService } from '@jsverse/transloco';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private transloco = inject(TranslocoService);
  private document = inject(DOCUMENT);

  constructor() {
    this.transloco.langChanges$.subscribe((lang) => {
      this.document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      this.document.documentElement.setAttribute('lang', lang);
    });
  }
}
