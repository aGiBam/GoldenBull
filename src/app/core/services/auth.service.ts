import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this._loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  constructor(private router: Router) {
    // Persist user to localStorage whenever it changes
    effect(() => {
      const u = this._user();
      if (u) localStorage.setItem('gb_user', JSON.stringify(u));
      else localStorage.removeItem('gb_user');
    });
  }

  private _loadUser(): User | null {
    try {
      const raw = localStorage.getItem('gb_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  login(email: string, _password: string): Promise<User> {
    // Simulate API — accept any valid email/password (≥6 chars)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) { reject('Invalid credentials'); return; }
        const user: User = {
          id: crypto.randomUUID(),
          name: email.split('@')[0],
          email,
          createdAt: new Date().toISOString(),
        };
        this._user.set(user);
        resolve(user);
      }, 1200);
    });
  }

  register(name: string, email: string, _password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !name) { reject('Invalid data'); return; }
        const user: User = {
          id: crypto.randomUUID(),
          name, email,
          createdAt: new Date().toISOString(),
        };
        this._user.set(user);
        resolve(user);
      }, 1200);
    });
  }

  updateProfile(data: Partial<Pick<User, 'name' | 'email'>>) {
    const u = this._user();
    if (!u) return;
    this._user.set({ ...u, ...data });
  }

  logout() {
    this._user.set(null);
    this.router.navigate(['/home']);
  }

  /** For password reset (simulated) */
  sendResetEmail(_email: string): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}
