import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { getErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-register',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './auth.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPass = signal(false);

  form = this.fb.group({
    name:     ['', [Validators.required, Validators.minLength(2)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.register(this.form.value.name!, this.form.value.email!, this.form.value.password!);
      this.router.navigate(['/profile']);
    } catch (e: unknown) {
      this.errorMsg.set(getErrorMessage(e, 'Registration failed'));
    } finally {
      this.loading.set(false);
    }
  }

  get name()     { return this.form.get('name')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}
