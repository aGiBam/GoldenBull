import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { getErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './auth.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMsg = signal('');
  showPass = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.login(this.form.value.email!, this.form.value.password!);
      const ret = this.route.snapshot.queryParams['returnUrl'] || '/profile';
      this.router.navigateByUrl(ret);
    } catch (e: unknown) {
      this.errorMsg.set(getErrorMessage(e, 'Login failed'));
    } finally {
      this.loading.set(false);
    }
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}
