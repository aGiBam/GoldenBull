import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AnnouncementService } from '../../core/services/announcement.service';

@Component({
  selector: 'app-announcement-bar',
  imports: [TranslocoModule],
  templateUrl: './announcement-bar.html',
  styleUrl: './announcement-bar.scss',
})
export class AnnouncementBar {
  announcement = inject(AnnouncementService);
}
