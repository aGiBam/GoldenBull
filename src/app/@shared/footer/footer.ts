import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslocoModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  year = new Date().getFullYear();
  email = signal('');

  subscribe() {
    if (this.email()) {
      alert('Thank you for subscribing!');
      this.email.set('');
    }
  }
}
