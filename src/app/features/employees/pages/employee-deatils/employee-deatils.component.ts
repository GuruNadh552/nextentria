import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { EmployeeService } from '../../../../core/services/employee.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { EmployeeIdService } from '../../../../core/services/employee-id.service';
import { Employee } from '../../models/employee.model';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeDialogComponent } from '../../components/employee-dialog/employee-dialog.component';
import { MatButtonModule } from '@angular/material/button';

type AttendanceRecord = {
  id: string;
  checkInTime: string;
  checkOutTime?: string;
};

type LogGroup = {
  date: string;
  logs: {
    checkInTime: string;
    checkOutTime?: string;
  }[];
};

@Component({
  selector: 'app-employee-deatils',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './employee-deatils.component.html',
  styleUrl: './employee-deatils.component.scss',
})
export class EmployeeDeatilsComponent {
  private route = inject(ActivatedRoute);
  private api = inject(EmployeeService);
  private attendance = inject(AttendanceService);
  private idService = inject(EmployeeIdService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  employee = signal<Employee | null>(null);
  loading = signal<boolean>(true);

  logs = computed<AttendanceRecord[]>(() => {
    const emp = this.employee();
    if (!emp) return [];

    return this.attendance.getLogs(
      emp.employeeId || this.idService.getOrCreateId(emp.id)
    );
  });

  groupedLogs = computed<LogGroup[]>(() => {
    const emp = this.employee();
    if (!emp) return [];

    const logs = this.attendance.getLogs(emp.employeeId);

    const map = new Map<string, LogGroup>();

    logs.forEach((log) => {
      const date = new Date().toDateString();

      if (!map.has(date)) {
        map.set(date, { date, logs: [] });
      }

      map.get(date)!.logs.push(log);
    });

    return Array.from(map.values());
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      return;
    }

    this.api.getEmployee(id).subscribe({
      next: (emp) => {
        if (emp && emp[0]) {
          const enriched: Employee = {
            ...emp[0],
            employeeId: this.idService.getOrCreateId(emp[0].id),
          };

          this.employee.set(enriched);
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  isCheckedIn(): boolean {
    const emp = this.employee();
    if (!emp) return false;

    return this.attendance.isCheckedIn(emp.employeeId);
  }

  latestLog(): AttendanceRecord | null {
    const logs = this.logs();
    return logs.length ? logs[logs.length - 1] : null;
  }

  editEmployee(e: Employee) {
    this.dialog
      .open(EmployeeDialogComponent, {
        data: { employee: e },
        width: '460px',
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        this.api.updateEmployee(e.id, result).subscribe(() => {
          this.ngOnInit();
        });
      });
  }

  deleteEmployee(e: Employee): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px'
    }).afterClosed().subscribe(confirm => {
      if (!confirm) return;
      this.api.deleteEmployee(e.id).subscribe({
        next: () => {
          this.snack.open('Employee deleted 🗑️', 'Close', {
            duration: 2000
          });

          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.snack.open('Delete failed ❌', 'Close', {
            duration: 2000
          });
        }
      });
    });
  }
}
