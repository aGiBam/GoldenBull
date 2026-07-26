import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SubscribeResponse {
  code: string;
  percent: number;
  alreadySubscribed: boolean;
}

@Injectable({ providedIn: 'root' })
export class DiscountsService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/discounts`;

  subscribe(email: string): Observable<SubscribeResponse> {
    return this.http.post<SubscribeResponse>(`${this.base}/subscribe`, { email });
  }
}
