import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactMessagePayload {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  message: string;
}

export interface ContactMessageDto extends ContactMessagePayload {
  id: number;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contact`;

  send(payload: ContactMessagePayload): Observable<ContactMessageDto> {
    return this.http.post<ContactMessageDto>(this.base, payload);
  }

  /** Admin only. */
  getAll(): Observable<ContactMessageDto[]> {
    return this.http.get<ContactMessageDto[]>(this.base);
  }

  /** Admin only. */
  markRead(id: number): Observable<ContactMessageDto> {
    return this.http.patch<ContactMessageDto>(`${this.base}/${id}/read`, {});
  }

  /** Admin only. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
