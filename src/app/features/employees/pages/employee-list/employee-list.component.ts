import { Employee } from './../../models/employee.model';
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeDialogComponent } from '../../components/employee-dialog/employee-dialog.component';
import { EmployeeService } from '../../../../core/services/employee.service';
import { EmployeeIdService } from '../../../../core/services/employee-id.service';

@Component({
  standalone: true,
  imports: [CommonModule, MatCardModule, MatInputModule, MatButtonModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent {

  private api = inject(EmployeeService);
  private router = inject(Router);
  private idService = inject(EmployeeIdService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);


  employees = signal<Employee[]>([]);
  search = signal('');

  filtered = computed(() =>
    this.employees().filter(e =>
      e.info.name.toLowerCase().includes(this.search().toLowerCase())
    )
  );

  ngOnInit() {
      this.load();
  }

  open(e: Employee) {
    this.router.navigate(['/employees', e.id]);
  }


  updateInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
  }

  openAdd(): void {
    this.dialog.open(EmployeeDialogComponent, {
      width: '460px'
    }).afterClosed().subscribe(result => {

      if (!result) return;

      this.api.createEmployee(result).subscribe({
        next: () => {
          this.snack.open('Employee added successfully ✅', 'Close', {
            duration: 2000
          });
          this.load(); // refresh list
        },
        error: () => {
          this.snack.open('Failed to add employee ❌', 'Close', {
            duration: 2000
          });
        }
      });

    });
  }

  load(): void {
    this.api.getEmployees().subscribe(data => {
      this.employees.set(
        data.map(( e : Employee) => ({
          ...e,
          employeeId: this.idService.getOrCreateId(e.id)
        }))
      );
    });
  }
}