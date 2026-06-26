import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { TranslocoService } from '@jsverse/transloco';
@Component({
  selector: 'app-navbar',
  imports: [TranslocoModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private transloco = inject(TranslocoService);
  switchLang() {
    this.transloco.setActiveLang(this.transloco.getActiveLang() === 'en' ? 'ar' : 'en');
  }
}
