import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItemDto {
  id: number;
  productId: number;
  nameEn: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderDto {
  id: string;
  status: OrderStatus;
  paymentMethod: string;
  subtotal: number;
  deposit: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface CreateOrderPayload {
  paymentMethod: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  items: Omit<OrderItemDto, 'id'>[];
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  create(payload: CreateOrderPayload): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.base, payload);
  }

  getMine(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${this.base}/me`);
  }
}
