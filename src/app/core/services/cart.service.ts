import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem {
  id: number;
  variantKey: string; // unique per product+color+size combo, e.g. "12-Black-42"
  name: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
  color?: string;
  colorAr?: string;
  colorHex?: string;
  size?: string;
  quantity: number;
}

export type CartInput = Omit<CartItem, 'variantKey' | 'quantity'> & { size?: string; color?: string };

const STORAGE_KEY = 'gb_cart';

function makeVariantKey(id: number, color?: string, size?: string): string {
  return `${id}-${color ?? 'default'}-${size ?? 'onesize'}`;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  /** Cart contents, read-only outside this service. */
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  /** Slide-out cart drawer visibility, shared across the whole app. */
  readonly isDrawerOpen = signal(false);

  constructor() {
    // Persist to localStorage whenever the cart changes, and survive refreshes.
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
    });
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  addItem(product: CartInput, quantity = 1): void {
    const variantKey = makeVariantKey(product.id, product.color, product.size);
    this._items.update((current) => {
      const existing = current.find((i) => i.variantKey === variantKey);
      if (existing) {
        return current.map((i) =>
          i.variantKey === variantKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...current, { ...product, variantKey, quantity }];
    });
    this.isDrawerOpen.set(true);
  }

  removeItem(variantKey: string): void {
    this._items.update((current) => current.filter((i) => i.variantKey !== variantKey));
  }

  updateQuantity(variantKey: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(variantKey);
      return;
    }
    this._items.update((current) =>
      current.map((i) => (i.variantKey === variantKey ? { ...i, quantity } : i))
    );
  }

  clear(): void {
    this._items.set([]);
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update((v) => !v);
  }
}
