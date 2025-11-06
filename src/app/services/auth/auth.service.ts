import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';
  private currentUser: User | null = null;
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  initialize(): void {
    if (this.isBrowser() && !this.initialized) {
      this.loadCurrentUserFromStorage();
      this.initialized = true;
    }
  }

  private loadCurrentUserFromStorage(): void {
    const storage = this.getLocalStorage();
    if (storage) {
      const storedUser = storage.getItem(this.CURRENT_USER_KEY);
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (e) {
          this.logout();
        }
      }
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getLocalStorage(): Storage | null {
    return this.isBrowser() ? localStorage : null;
  }

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
      const storage = this.getLocalStorage();
      if (storage) {
        storage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    if (!this.initialized) {
      this.initialize();
    }

    const isLoggedIn = !!this.currentUser;
    return isLoggedIn;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private getUsers(): User[] {
    const storage = this.getLocalStorage();
    if (!storage) return [];

    const usersJson = storage.getItem(this.STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }
  }
}
