import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

const STORAGE_KEY = 'gb_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  /** Cart contents, read-only outside this service. */
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));

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

  addItem(product: Omit<CartItem, 'quantity'>): void {
    this._items.update((current) => {
      const existing = current.find((i) => i.id === product.id);
      if (existing) {
        return current.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  removeItem(id: number): void {
    this._items.update((current) => current.filter((i) => i.id !== id));
  }

  updateQuantity(id: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    this._items.update((current) => current.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  clear(): void {
    this._items.set([]);
  }
}
