import { RouterModule, Routes } from '@angular/router';
import { LoginForm, RegisterForm, Home } from './components';
import { NgModule } from '@angular/core';
import { LoginGuard } from './guard/login-guard';
import { AuthGuard } from './guard/auth-guard';

export const routes: Routes = [
  {
    path: 'register',
    component: RegisterForm,
  },
  {
    path: 'login',
    component: LoginForm,
  },
  {
    path: 'home',
    component: Home,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
