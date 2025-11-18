import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  showSuccess(message: string): void {
    // Minimalny toast - w przyszłości można zastąpić komponentem
    // eslint-disable-next-line no-alert
    alert(message);
  }

  showError(message: string): void {
    // eslint-disable-next-line no-alert
    alert(message);
  }
}


