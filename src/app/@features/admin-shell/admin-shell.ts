import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { AdminNotificationsService } from '../../core/services/admin-notifications.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslocoModule],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell implements OnInit {
  auth = inject(AuthService);
  notifications = inject(AdminNotificationsService);
  private router = inject(Router);
  private transloco = inject(TranslocoService);

  sidebarOpen = signal(false);
  bellOpen = signal(false);

  get currentLang(): string {
    return this.transloco.getActiveLang();
  }

  ngOnInit() {
    this.notifications.start();
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  toggleBell() {
    this.bellOpen.update((v) => !v);
    if (this.bellOpen()) this.notifications.refresh();
  }

  closeBell() {
    this.bellOpen.set(false);
  }

  goToMessages() {
    this.closeBell();
    this.router.navigate(['/admin/messages']);
  }

  goToOrders() {
    this.closeBell();
    this.router.navigate(['/admin/orders']);
  }

  switchLang() {
    this.transloco.setActiveLang(this.currentLang === 'en' ? 'ar' : 'en');
  }

  logout() {
    this.auth.logout();
  }
}
