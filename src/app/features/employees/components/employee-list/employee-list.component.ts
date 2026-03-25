import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';

@Component({
  standalone: true,
  selector: 'app-employee-list',
  imports: [NgFor, NgIf, MatButtonModule, MatCardModule, MatDialogModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent {
  private api = inject(EmployeeService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  employees = signal<Employee[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.api.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  open(emp?: Employee): void {
    this.dialog.open(EmployeeDialogComponent, {
      data: emp,
      width: '420px',
      maxWidth: '95vw',
    }).afterClosed().subscribe((resp) => {
      if(resp)
          this.load();
    });
  }

  remove(id: string): void {
    this.api.deleteEmployee(id).subscribe(() => {
      this.snack.open('Deleted 🗑️', 'Close', { duration: 2000 });
      this.load();
    });
  }
}
