import { Component, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'form-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
})
export class LoginForm {
  @ViewChild('loginForm') loginForm!: NgForm;

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

    this.loginForm.control.markAllAsTouched();

    if (!this.userData.email || !this.userData.password) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    if (!this.isValidEmail(this.userData.email)) {
      this.errorMessage = 'Por favor, ingresa un email válido.';
      return;
    }

    const success = this.authService.login(this.userData.email, this.userData.password);

    if (success) {
      this.successMessage = 'Redirigiendo...';
      setTimeout(() => {
        this.router.navigate(['/home']);
        this.clearControls();
      }, 1000);
    } else {
      this.errorMessage = 'Datos inválidos.';
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
  }

  clearControls(): void {
    this.userData.email = '';
    this.userData.password = '';
    if (this.loginForm) {
      this.loginForm.resetForm();
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
