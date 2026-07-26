import { Injectable, signal } from '@angular/core';

const SHOW_DELAY_MS = 200; // avoid flashing the overlay for near-instant requests

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _requestCount = signal(0);
  private _showTimer: ReturnType<typeof setTimeout> | null = null;

  /** True the instant a request starts (drives logic that doesn't need to be
   * debounced). */
  readonly active = signal(false);

  /** True only once loading has been active for a bit — this is what the
   * visible progress bar / blur overlay bind to, so a fast request (e.g. a
   * cached/local response) never causes a visible flash. */
  readonly visible = signal(false);

  start() {
    this._requestCount.update((n) => n + 1);
    this.active.set(true);
    if (!this._showTimer) {
      this._showTimer = setTimeout(() => {
        if (this.active()) this.visible.set(true);
      }, SHOW_DELAY_MS);
    }
  }

  stop() {
    this._requestCount.update((n) => Math.max(0, n - 1));
    if (this._requestCount() === 0) {
      this.active.set(false);
      this.visible.set(false);
      if (this._showTimer) {
        clearTimeout(this._showTimer);
        this._showTimer = null;
      }
    }
  }
}
