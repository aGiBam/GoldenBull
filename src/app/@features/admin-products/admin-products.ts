import { Component, inject, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductsService, Product, ColorOption, ProductVariant } from '../../core/services/products.service';
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

  // Per-color(+size) stock count — replaces the old blanket "In Stock" flag
  // with a real number per piece/variant. Keyed by "color|size" (size is ''
  // for sizeless products), so it survives colors/sizes being edited freely
  // before save.
  variantStock = signal<Record<string, number>>({});

  form = this.fb.group({
    nameEn: ['', Validators.required],
    nameAr: ['', Validators.required],
    descEn: ['', Validators.required],
    descAr: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    category: [CATEGORIES[0] as string, Validators.required],
    inStock: [true],
    sizesCsv: [''], // comma-separated, e.g. "39,40,41,42" — leave blank for sizeless products
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
    this.form.reset({ nameEn: '', nameAr: '', descEn: '', descAr: '', price: 0, category: CATEGORIES[0], inStock: true, sizesCsv: '' });
    this.mainImage.set(null);
    this.colors.set([]);
    this.variantStock.set({});
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
      sizesCsv: (product.sizes ?? []).join(', '),
    });
    this.mainImage.set(product.image);
    this.colors.set(product.colors.map((c) => ({ ...c })));
    const stockMap: Record<string, number> = {};
    for (const v of product.variants ?? []) {
      stockMap[this.variantKey(v.color, v.size)] = v.stock;
    }
    this.variantStock.set(stockMap);
    this.imageError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  private variantKey(color: string, size: string | null): string {
    return `${color}|${size ?? ''}`;
  }

  /** The sizes currently typed into the sizesCsv box, parsed live (not just
   * at save time), so the stock grid rebuilds itself as you type. */
  sizesList(): string[] {
    return (this.form.value.sizesCsv ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /** One row per color if the product is sizeless, or one row per
   * color+size combo if sizes are set — this is what the stock grid renders. */
  variantRows(): { color: string; size: string | null }[] {
    const sizes = this.sizesList();
    const rows: { color: string; size: string | null }[] = [];
    for (const c of this.colors()) {
      if (c.name.trim() === '') continue;
      if (sizes.length === 0) {
        rows.push({ color: c.name, size: null });
      } else {
        for (const s of sizes) rows.push({ color: c.name, size: s });
      }
    }
    return rows;
  }

  getStock(color: string, size: string | null): number {
    return this.variantStock()[this.variantKey(color, size)] ?? 0;
  }

  setStock(color: string, size: string | null, value: string) {
    const n = Math.max(0, Number(value) || 0);
    this.variantStock.update((map) => ({ ...map, [this.variantKey(color, size)]: n }));
  }

  productTotalStock(product: Product): number {
    return (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0);
  }

  get totalStock(): number {
    return this.variantRows().reduce((sum, r) => sum + this.getStock(r.color, r.size), 0);
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
      // If colors are defined, "in stock" is derived from the per-variant
      // stock grid (any piece with stock > 0) rather than a manual flag —
      // that grid is now the source of truth. The checkbox is only used as
      // a manual override for sizeless/colorless products.
      inStock: this.variantRows().length > 0 ? this.totalStock > 0 : !!this.form.value.inStock,
      image: this.mainImage()!,
      colors: this.colors(),
      sizes: this.sizesList(),
      variants: this.variantRows().map((r) => ({
        color: r.color,
        size: r.size,
        stock: this.getStock(r.color, r.size),
      })) as ProductVariant[],
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
