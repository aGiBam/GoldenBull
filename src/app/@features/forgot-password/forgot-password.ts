import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: '../auth/auth.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  sent = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    await this.auth.sendResetEmail(this.form.value.email!);
    this.loading.set(false);
    this.sent.set(true);
  }

  get email() { return this.form.get('email')!; }
}
