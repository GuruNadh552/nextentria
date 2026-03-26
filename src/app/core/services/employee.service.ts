import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private base = '/api';

  getEmployees() {
    return this.http.get<any>(`${this.base}/list`)
      .pipe(map(r => r.data));
  }

  getEmployee(id: string) {
    return this.http.get<any>(`${this.base}/list?id=${id}`)
      .pipe(map(r => r.data));
  }

  createEmployee(data: any) {
    return this.http.post(`${this.base}/create`, data);
  }

  updateEmployee(id: string, data: any) {
    return this.http.put(`${this.base}/update?id=${id}`, data);
  }

  deleteEmployee(id: string) {
    return this.http.delete(`${this.base}/delete?id=${id}`);
  }
}