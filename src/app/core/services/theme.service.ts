import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  theme = signal<Theme>('dark');

  constructor() {
    const saved = localStorage.getItem('lh-theme') as Theme | null;
    if (saved) this.theme.set(saved);
    effect(() => {
      const t = this.theme();
      this.document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('lh-theme', t);
    });
  }

  toggle() {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }
}
