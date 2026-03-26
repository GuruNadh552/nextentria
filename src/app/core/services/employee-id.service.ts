import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class EmployeeIdService {

  private key = 'employee_map';

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private load(): Record<string, string> {
    if (!this.isBrowser) return {};
    return JSON.parse(localStorage.getItem(this.key) ?? '{}');
  }

  private save(data: Record<string, string>) {
    if (this.isBrowser) {
      localStorage.setItem(this.key, JSON.stringify(data));
    }
  }

  getOrCreateId(apiId: string): string {
    const map = this.load();

    if (map[apiId]) return map[apiId];

    const id = `EMP${Object.keys(map).length + 1}`;
    map[apiId] = id;

    this.save(map);
    return id;
  }
}