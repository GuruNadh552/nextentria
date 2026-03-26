import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EmployeeService } from '../../../../core/services/employee.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { EmployeeIdService } from '../../../../core/services/employee-id.service';
import { Employee } from '../../models/employee.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  private api = inject(EmployeeService);
  private idService = inject(EmployeeIdService);
  private snack = inject(MatSnackBar);

  attendance = inject(AttendanceService);

  employees = signal<Employee[]>([]);
  empIdInput = signal<string>('');

  ngOnInit() {
    this.api.getEmployees().subscribe(data => {
      this.employees.set(
        data.map((e : Employee) => ({
          ...e,
          employeeId: this.idService.getOrCreateId(e.id)
        }))
      );
    });
  }

  private findEmployee(empId: string): Employee | undefined {
    return this.employees().find(e => e.employeeId === empId);
  }

  checkIn(): void {
    const id = this.empIdInput().trim();

    const emp = this.findEmployee(id);

    if (!emp) {
      this.snack.open('❌ Employee not found', 'Close', { duration: 2000 });
      return;
    }

    if (this.attendance.isCheckedIn(id)) {
      this.snack.open('⚠️ Already checked in', 'Close', { duration: 2000 });
      return;
    }

    this.attendance.checkIn(id);
    this.snack.open('✅ Check-in successful', 'Close', { duration: 2000 });

    this.empIdInput.set('');
  }

  checkOut(): void {
    const id = this.empIdInput().trim();

    const emp = this.findEmployee(id);

    if (!emp) {
      this.snack.open('❌ Employee not found', 'Close', { duration: 2000 });
      return;
    }

    if (!this.attendance.isCheckedIn(id)) {
      this.snack.open('⚠️ Not checked in yet', 'Close', { duration: 2000 });
      return;
    }

    this.attendance.checkOut(id);
    this.snack.open('🚪 Check-out successful', 'Close', { duration: 2000 });

    this.empIdInput.set('');
  }

  checkedInEmployees = computed(() =>
    this.employees().filter(e =>
      this.attendance.isCheckedIn(e.employeeId)
    )
  );

  updateInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.empIdInput.set(value);
  }

  getCheckInTime(empId: string): string | null {
    const logs = this.attendance.getLogs(empId);
    const active = logs.find(l => !l.checkOutTime);
    return active?.checkInTime ?? null;
  }
}