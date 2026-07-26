import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-top-progress-bar',
  imports: [],
  templateUrl: './top-progress-bar.html',
  styleUrl: './top-progress-bar.scss',
})
export class TopProgressBar {
  loading = inject(LoadingService);
}
