import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  auth = inject(AuthService);
  cart = inject(CartService);
  private fb = inject(FormBuilder);

  saving = signal(false);
  saved = signal(false);
  activeTab = signal<'profile' | 'orders' | 'settings'>('profile');

  form = this.fb.group({
    name:  [this.auth.user()?.name  ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
  });

  async saveProfile() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    await new Promise(r => setTimeout(r, 800));
    this.auth.updateProfile({ name: this.form.value.name!, email: this.form.value.email! });
    this.saving.set(false);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  logout() { this.auth.logout(); }
}
