import { Injectable, signal } from '@angular/core';

const DISMISSED_KEY = 'gb_announcement_dismissed';

/** Controls the top announcement bar shown site-wide. Replaces the old
 * repeating discount popup — this shows once, and once dismissed stays
 * hidden for the rest of the browser session (sessionStorage, not
 * localStorage, so it comes back on the next visit rather than being gone
 * forever). */
@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  visible = signal(sessionStorage.getItem(DISMISSED_KEY) !== '1');

  dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    this.visible.set(false);
  }
}
