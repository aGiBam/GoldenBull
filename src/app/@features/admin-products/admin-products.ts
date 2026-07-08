import { Component, inject, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductsService, Product, ColorOption } from '../../core/services/products.service';
import { getErrorMessage } from '../../core/utils/http-error';

const CATEGORIES = ['belts', 'wallets', 'cardHolders', 'slippers', 'portefeuille', 'longWallets'] as const;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB per image, kept in the DB as a data URL

@Component({
  selector: 'app-admin-products',
  imports: [TranslocoModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
})
export class AdminProducts {
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);

  categories = CATEGORIES;

  products = signal<Product[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  saving = signal(false);
  deletingId = signal<number | null>(null);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  mainImage = signal<string | null>(null);
  colors = signal<ColorOption[]>([]);
  imageError = signal('');

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: ['', Validators.required],
    descEn: ['', Validators.required],
    descAr: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    category: [CATEGORIES[0] as string, Validators.required],
    inStock: [true],
  });

  constructor() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (e) => {
        this.errorMsg.set(getErrorMessage(e, 'Could not load products.'));
        this.loading.set(false);
      },
    });
  }

  openAddForm() {
    this.editingId.set(null);
    this.form.reset({ nameEn: '', nameAr: '', descEn: '', descAr: '', price: 0, category: CATEGORIES[0], inStock: true });
    this.mainImage.set(null);
    this.colors.set([]);
    this.imageError.set('');
    this.showForm.set(true);
  }

  openEditForm(product: Product) {
    this.editingId.set(product.id);
    this.form.reset({
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      descEn: product.descEn,
      descAr: product.descAr,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
    });
    this.mainImage.set(product.image);
    this.colors.set(product.colors.map((c) => ({ ...c })));
    this.imageError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  private readFileAsDataUrl(file: File, onDone: (dataUrl: string) => void) {
    if (!file.type.startsWith('image/')) {
      this.imageError.set('Please choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError.set('Image is too large — please use one under 2MB.');
      return;
    }
    this.imageError.set('');
    const reader = new FileReader();
    reader.onload = () => onDone(reader.result as string);
    reader.onerror = () => this.imageError.set('Could not read that file — please try again.');
    reader.readAsDataURL(file);
  }

  onMainImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.readFileAsDataUrl(file, (dataUrl) => this.mainImage.set(dataUrl));
  }

  addColorRow() {
    this.colors.update((list) => [...list, { name: '', nameAr: '', hex: '#c8920a', image: '' }]);
  }

  removeColorRow(index: number) {
    this.colors.update((list) => list.filter((_, i) => i !== index));
  }

  updateColorField(index: number, field: 'name' | 'nameAr' | 'hex', value: string) {
    this.colors.update((list) => list.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  onColorImageSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.readFileAsDataUrl(file, (dataUrl) => {
      this.colors.update((list) => list.map((c, i) => (i === index ? { ...c, image: dataUrl } : c)));
    });
  }

  save() {
    if (this.form.invalid || !this.mainImage()) {
      this.form.markAllAsTouched();
      if (!this.mainImage()) this.imageError.set('Please choose a main product image.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const payload = {
      nameEn: this.form.value.nameEn!,
      nameAr: this.form.value.nameAr!,
      descEn: this.form.value.descEn!,
      descAr: this.form.value.descAr!,
      price: Number(this.form.value.price),
      category: this.form.value.category as Product['category'],
      inStock: !!this.form.value.inStock,
      image: this.mainImage()!,
      colors: this.colors(),
    };

    const id = this.editingId();
    const req = id ? this.productsService.update(id, payload) : this.productsService.create(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.errorMsg.set(getErrorMessage(e, 'Could not save product.'));
      },
    });
  }

  deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.nameEn}"? This cannot be undone.`)) return;
    this.deletingId.set(product.id);
    this.productsService.delete(product.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.products.update((list) => list.filter((p) => p.id !== product.id));
      },
      error: (e) => {
        this.deletingId.set(null);
        this.errorMsg.set(getErrorMessage(e, 'Could not delete product.'));
      },
    });
  }
}
