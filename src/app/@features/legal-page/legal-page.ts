import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LEGAL_PAGES } from '../../core/constants/legal-content';

@Component({
  selector: 'app-legal-page',
  imports: [RouterLink],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
})
export class LegalPage {
  private route = inject(ActivatedRoute);
  private transloco = inject(TranslocoService);

  private slug = toSignal(this.route.data.pipe(map((d) => d['page'] as string)), { initialValue: '' });

  get content() {
    return LEGAL_PAGES[this.slug()];
  }

  get isAr(): boolean {
    return this.transloco.getActiveLang() === 'ar';
  }
}
