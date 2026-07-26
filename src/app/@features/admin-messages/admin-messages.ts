import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ContactService, ContactMessageDto } from '../../core/services/contact.service';
import { getErrorMessage } from '../../core/utils/http-error';

@Component({
  selector: 'app-admin-messages',
  imports: [TranslocoModule, DatePipe],
  templateUrl: './admin-messages.html',
  styleUrl: './admin-messages.scss',
})
export class AdminMessages {
  private contactService = inject(ContactService);

  messages = signal<ContactMessageDto[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  deletingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.contactService.getAll().subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.loading.set(false);
      },
      error: (e) => {
        this.errorMsg.set(getErrorMessage(e, 'Could not load messages.'));
        this.loading.set(false);
      },
    });
  }

  markRead(message: ContactMessageDto) {
    if (message.read) return;
    this.contactService.markRead(message.id).subscribe({
      next: (updated) => {
        this.messages.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
      },
    });
  }

  deleteMessage(message: ContactMessageDto) {
    if (!confirm(`Delete message from ${message.firstName} ${message.lastName}?`)) return;
    this.deletingId.set(message.id);
    this.contactService.delete(message.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.messages.update((list) => list.filter((m) => m.id !== message.id));
      },
      error: (e) => {
        this.deletingId.set(null);
        this.errorMsg.set(getErrorMessage(e, 'Could not delete message.'));
      },
    });
  }
}
