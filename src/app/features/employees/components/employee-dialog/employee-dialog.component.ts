import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Employee } from '../../models/employee.model';

type DialogData = {
  employee?: Employee;
};

@Component({
  standalone: true,
  selector: 'app-employee-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.scss']
})
export class EmployeeDialogComponent {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EmployeeDialogComponent>);
  private data = inject<DialogData>(MAT_DIALOG_DATA);

  isEdit = !!this.data?.employee;
  loading = false;

  form = this.fb.nonNullable.group({
    name: [
      this.data?.employee?.info.name ?? '',
      [Validators.required, Validators.minLength(2)]
    ],
    age: [
      this.data?.employee?.info.age ?? '',
      [Validators.required]
    ],
    description: [
      this.data?.employee?.info.description ?? ''
    ]
  });

  save(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const payload = this.form.getRawValue();
    this.dialogRef.close(payload);
  }

  close(): void {
    this.dialogRef.close();
  }
}