import { Injectable } from '@angular/core';
import { User } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'users';
  private currentUser: User | null = null;

  constructor() {}

  register(userData: Omit<User, 'id' | 'createdAt'>): boolean {
    const users = this.getUsers();

    if (users.find((user) => user.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Date.now(),
    };

    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    if (this.currentUser) return true;

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return true;
    }
    return false;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }
}
