import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { DiscountsService } from '../../core/services/discounts.service';
import { getErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslocoModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private discounts = inject(DiscountsService);

  year = new Date().getFullYear();
  email = signal('');
  subscribing = signal(false);
  subscribedCode = signal<string | null>(null);
  subscribeError = signal('');

  subscribe() {
    const value = this.email().trim();
    if (!value || this.subscribing()) return;
    this.subscribing.set(true);
    this.subscribeError.set('');
    this.discounts.subscribe(value).subscribe({
      next: (res) => {
        this.subscribing.set(false);
        this.subscribedCode.set(res.code);
        this.email.set('');
      },
      error: (e) => {
        this.subscribing.set(false);
        this.subscribeError.set(getErrorMessage(e, 'Could not subscribe — please try again.'));
      },
    });
  }
}
