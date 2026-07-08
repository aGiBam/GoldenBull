import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { getErrorMessage } from '../../core/utils/http-error';

type PaymentMethod = 'cod' | 'vodafone' | 'instapay';

const MAX_PROOF_BYTES = 4 * 1024 * 1024; // 4MB, well under the backend's 5MB cap

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private orders = inject(OrdersService);
  cart = inject(CartService);
  items = this.cart.items;

  selectedPayment = signal<PaymentMethod>('cod');
  orderPlaced = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  proofDataUrl = signal<string | null>(null);
  proofFileName = signal<string | null>(null);
  proofError = signal('');

  form = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
  });

  subtotal = this.cart.subtotal;
  deposit = computed(() => Math.ceil(this.subtotal() * 0.2));

  /** Vodafone Cash / InstaPay are manual bank transfers — a proof screenshot helps confirm faster. */
  get showsProofUpload(): boolean {
    return this.selectedPayment() === 'vodafone' || this.selectedPayment() === 'instapay';
  }

  get needsDeposit(): boolean {
    // All remaining payment methods (COD / Vodafone Cash / InstaPay) are pay-on-delivery
    // or manual-transfer, so a deposit is always required to confirm the order.
    return true;
  }

  selectPayment(method: PaymentMethod) {
    this.selectedPayment.set(method);
  }

  onProofSelected(event: Event) {
    this.proofError.set('');
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.proofError.set('Please upload an image file (screenshot).');
      input.value = '';
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      this.proofError.set('Image is too large — please upload a screenshot under 4MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.proofDataUrl.set(reader.result as string);
      this.proofFileName.set(file.name);
    };
    reader.onerror = () => {
      this.proofError.set('Could not read that file — please try again.');
    };
    reader.readAsDataURL(file);
  }

  clearProof() {
    this.proofDataUrl.set(null);
    this.proofFileName.set(null);
    this.proofError.set('');
  }

  placeOrder() {
    if (this.form.invalid || this.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const payload = {
      paymentMethod: this.selectedPayment(),
      ...(this.showsProofUpload && this.proofDataUrl() ? { paymentProof: this.proofDataUrl()! } : {}),
      shippingName: this.form.value.fullName!,
      shippingPhone: this.form.value.phone!,
      shippingAddress: this.form.value.address!,
      shippingCity: this.form.value.city!,
      items: this.items().map((i) => ({
        productId: i.id,
        nameEn: i.name,
        nameAr: i.nameAr,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
    };

    this.orders.create(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.orderPlaced.set(true);
        this.cart.clear();
      },
      error: (e) => {
        this.loading.set(false);
        this.errorMsg.set(getErrorMessage(e, 'Could not place order — please try again.'));
      },
    });
  }
}
