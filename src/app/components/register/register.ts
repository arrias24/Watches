import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
})
export class RegisterForm {
  @ViewChild('registerForm') registerForm!: NgForm;

  userData = {
    email: '',
    password: '',
  };

  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.registerForm.control.markAllAsTouched();

    if (!this.userData.email || !this.userData.password) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    if (!this.isValidEmail(this.userData.email)) {
      this.errorMessage = 'Por favor, ingresa un email válido.';
      return;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    const success = this.authService.register({
      email: this.userData.email,
      password: this.userData.password,
    });

    if (success) {
      this.successMessage = 'Registro exitoso';
      setTimeout(() => {
        this.router.navigate(['/home']);
        this.clearControls();
      }, 1500);
    } else {
      this.errorMessage = 'El email ya está registrado.';
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
  }

  clearControls(): void {
    this.userData.email = '';
    this.userData.password = '';
    if (this.registerForm) {
      this.registerForm.resetForm();
    }
  }

  focusLabel(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    const label = target.previousElementSibling as HTMLLabelElement;
    if (label) {
      label.classList.add('active');
    }
  }

  blurLabel(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    const label = target.previousElementSibling as HTMLLabelElement;
    if (label && !target.value) {
      label.classList.remove('active');
    }
  }
}
