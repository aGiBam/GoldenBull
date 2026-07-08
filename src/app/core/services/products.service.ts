import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ColorOption {
  name: string;
  nameAr: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  category: 'belts' | 'wallets' | 'cardHolders' | 'slippers' | 'portefeuille' | 'longWallets';
  inStock: boolean;
  descEn: string;
  descAr: string;
  colors: ColorOption[];
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }

  getByCategory(category: string): Observable<Product[]> {
    const params = category && category !== 'all' ? new HttpParams().set('category', category) : undefined;
    return this.http.get<Product[]>(this.base, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }
}
