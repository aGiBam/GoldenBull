import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const USER_KEY = 'gb_user';
const TOKEN_KEY = 'gb_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  private _user = signal<User | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persist(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
  }

  async login(email: string, password: string): Promise<User> {
    const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.base}/login`, { email, password }));
    this.persist(res);
    return res.user;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.base}/register`, { name, email, password })
    );
    this.persist(res);
    return res.user;
  }

  async updateProfile(data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const updated = await firstValueFrom(this.http.patch<User>(`${this.base}/me`, data));
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this._user.set(updated);
    return updated;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.base}/me/password`, { currentPassword, newPassword })
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/home']);
  }

  /**
   * TODO: not wired to a real email provider yet — the backend has no mail
   * service. Keep this as a UI-only placeholder until that's decided.
   */
  sendResetEmail(_email: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
