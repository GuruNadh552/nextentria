import { isPlatformBrowser } from "@angular/common";
import { Injectable, inject, PLATFORM_ID, signal, computed } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  private key = 'attendance';

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private load() {
    if (!this.isBrowser) return [];
    return JSON.parse(localStorage.getItem(this.key) ?? '[]');
  }

  private save(data: any[]) {
    if (this.isBrowser) {
      localStorage.setItem(this.key, JSON.stringify(data));
    }
    this.records.set(data);
  }

  records = signal<any[]>(this.load());

  checkIn(id: string) {
    if (this.isCheckedIn(id)) return;

    this.save([
      ...this.records(),
      {
        id,
        checkInTime: new Date().toLocaleTimeString()
      }
    ]);
  }

  checkOut(id: string) {
    this.save(
      this.records().map(r =>
        r.id === id && !r.checkOutTime
          ? { ...r, checkOutTime: new Date().toLocaleTimeString() }
          : r
      )
    );
  }

  isCheckedIn(id: string) {
    return this.records().some(r => r.id === id && !r.checkOutTime);
  }

  getLogs(id: string) {
    return this.records().filter(r => r.id === id);
  }

  checkedInCount = computed(() =>
    this.records().filter(r => !r.checkOutTime).length
  );
}