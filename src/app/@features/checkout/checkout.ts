import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { getErrorMessage } from '../../core/utils/http-error';
import { GOVERNORATES } from '../../core/constants/governorates';

type PaymentMethod = 'cod' | 'vodafone' | 'instapay';

const MAX_PROOF_BYTES = 4 * 1024 * 1024; // 4MB, well under the backend's 5MB cap

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, TranslocoModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private orders = inject(OrdersService);
  private transloco = inject(TranslocoService);
  cart = inject(CartService);
  items = this.cart.items;
  governorates = GOVERNORATES;

  get currentLang(): string {
    return this.transloco.getActiveLang();
  }

  selectedPayment = signal<PaymentMethod>('cod');
  orderPlaced = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  proofDataUrl = signal<string | null>(null);
  proofFileName = signal<string | null>(null);
  proofError = signal('');

  // Discount code
  promoInput = signal('');
  promoApplied = signal<{ code: string; percent: number; amount: number } | null>(null);
  promoChecking = signal(false);
  promoError = signal('');

  form = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],
    governorate: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    building: ['', Validators.required],
    floor: ['', Validators.required],
    apartment: ['', Validators.required],
    landmark: [''],
  });

  subtotal = this.cart.subtotal;
  discountAmount = computed(() => this.promoApplied()?.amount ?? 0);
  totalAfterDiscount = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));
  deposit = computed(() => Math.ceil(this.totalAfterDiscount() * 0.2));

  /** Every payment method requires a deposit to confirm the order, so the proof
   * screenshot upload is offered regardless of which method is selected. */
  get showsProofUpload(): boolean {
    return true;
  }

  get needsDeposit(): boolean {
    // All remaining payment methods (COD / Vodafone Cash / InstaPay) are pay-on-delivery
    // or manual-transfer, so a deposit is always required to confirm the order.
    return true;
  }

  selectPayment(method: PaymentMethod) {
    this.selectedPayment.set(method);
  }

  applyPromo() {
    const code = this.promoInput().trim();
    if (!code) return;
    this.promoChecking.set(true);
    this.promoError.set('');
    this.orders.validateDiscount(code, this.subtotal()).subscribe({
      next: (res) => {
        this.promoApplied.set(res);
        this.promoChecking.set(false);
      },
      error: (e) => {
        this.promoApplied.set(null);
        this.promoError.set(getErrorMessage(e, 'Invalid discount code.'));
        this.promoChecking.set(false);
      },
    });
  }

  removePromo() {
    this.promoApplied.set(null);
    this.promoInput.set('');
    this.promoError.set('');
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
      ...(this.promoApplied() ? { discountCode: this.promoApplied()!.code } : {}),
      shippingName: this.form.value.fullName!,
      shippingPhone: this.form.value.phone!,
      shippingGovernorate: this.form.value.governorate!,
      shippingCity: this.form.value.city!,
      shippingStreet: this.form.value.street!,
      shippingBuilding: this.form.value.building!,
      shippingFloor: this.form.value.floor!,
      shippingApartment: this.form.value.apartment!,
      ...(this.form.value.landmark ? { shippingLandmark: this.form.value.landmark } : {}),
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
