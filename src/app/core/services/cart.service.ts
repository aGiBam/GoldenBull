import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  get items(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  get count(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  addItem(product: Omit<CartItem, 'quantity'>): void {
    const current = this.items;
    const existing = current.find((i) => i.id === product.id);
    if (existing) {
      this.updateQuantity(product.id, existing.quantity + 1);
    } else {
      this.itemsSubject.next([...current, { ...product, quantity: 1 }]);
    }
  }

  removeItem(id: number): void {
    this.itemsSubject.next(this.items.filter((i) => i.id !== id));
  }

  updateQuantity(id: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    this.itemsSubject.next(
      this.items.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }

  clear(): void {
    this.itemsSubject.next([]);
  }
}
