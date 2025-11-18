import { Injectable } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: AppConfig = {
    apiBaseUrl: '/api'
  };

  async load(): Promise<void> {
    try {
      const response = await fetch('/app-config.json', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (typeof data?.apiBaseUrl === 'string' && data.apiBaseUrl.length > 0) {
        // remove trailing slashes to avoid `//` when composing URLs
        this.config.apiBaseUrl = data.apiBaseUrl.replace(/\/+$/, '');
      }
    } catch {
      // fall back to defaults when config is missing
    }
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }
}


