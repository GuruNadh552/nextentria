import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Employee } from '../../models/employee.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  standalone: true,
  selector: 'app-employee-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.scss'],
})
export class EmployeeDialogComponent {
  private api = inject(EmployeeService);
  private snack = inject(MatSnackBar);

  model: Employee = {
    id: '',
    info: {
      name: '',
      age: '',
      description: '',
    },
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: Employee | null) {
    if (data) this.model = { ...data };
  }

  save(): void {
    if (this.data) {
      this.api
        .updateEmployee(this.data.id, this.model)
        .subscribe(() =>
          this.snack.open('Updated ✏️', 'Close', { duration: 2000 })
        );
    } else {
      this.api
        .createEmployee(this.model)
        .subscribe(() =>
          this.snack.open('Created ✅', 'Close', { duration: 2000 })
        );
    }
  }
}
