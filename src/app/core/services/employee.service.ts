import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Employee } from '../../features/employees/models/employee.model';
import { ApiResponse } from '../../features/employees/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private base = 'https://gps6cdg7h9.execute-api.eu-central-1.amazonaws.com/prod';

  private headers = new HttpHeaders({ 'content-type': 'application/json' });

  getEmployees(): Observable<Employee[]> {
    return this.http
      .get<ApiResponse<Employee[]>>(`${this.base}/list`)
      .pipe(map(res => res.data));
  }

  createEmployee(emp: Employee): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${this.base}/create`, emp.info, { headers: this.headers })
      .pipe(map(() => void 0));
  }

  updateEmployee(id: string, emp: Employee): Observable<void> {
    return this.http
      .put<ApiResponse<null>>(`${this.base}/update?id=${id}`, emp.info, { headers: this.headers })
      .pipe(map(() => void 0));
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.base}/delete?id=${id}`, { headers: this.headers })
      .pipe(map(() => void 0));
  }
}