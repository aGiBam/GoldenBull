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

export interface OrderUserDto {
  id: string;
  name: string;
  email: string;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentProof?: string | null;
  subtotal: number;
  deposit: number;
  discountCode?: string | null;
  discountAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingGovernorate: string;
  shippingCity: string;
  shippingStreet: string;
  shippingBuilding: string;
  shippingFloor: string;
  shippingApartment: string;
  shippingLandmark?: string | null;
  createdAt: string;
  items: OrderItemDto[];
  user?: OrderUserDto;
}

export interface CreateOrderPayload {
  paymentMethod: string;
  paymentProof?: string;
  discountCode?: string;
  shippingName: string;
  shippingPhone: string;
  shippingGovernorate: string;
  shippingCity: string;
  shippingStreet: string;
  shippingBuilding: string;
  shippingFloor: string;
  shippingApartment: string;
  shippingLandmark?: string;
  items: Omit<OrderItemDto, 'id'>[];
}

export interface DiscountPreview {
  code: string;
  percent: number;
  amount: number;
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

  /** Admin only. */
  getAll(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(this.base);
  }

  /** Admin only. */
  updateStatus(id: string, status: OrderStatus): Observable<OrderDto> {
    return this.http.patch<OrderDto>(`${this.base}/${id}/status`, { status });
  }

  validateDiscount(code: string, subtotal: number): Observable<DiscountPreview> {
    return this.http.post<DiscountPreview>(`${environment.apiUrl}/discounts/validate`, { code, subtotal });
  }
}
