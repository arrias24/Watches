// src/app/services/clock.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ClockService implements OnDestroy {
  private currentTimeSubject = new BehaviorSubject<Date>(new Date());
  private isRunning = true;

  // Observable público para el tiempo actual
  public currentTime$: Observable<Date> = this.currentTimeSubject.asObservable();

  constructor() {
    // Actualizar cada segundo
    interval(1000)
      .pipe(takeWhile(() => this.isRunning))
      .subscribe(() => {
        this.currentTimeSubject.next(new Date());
      });
  }

  // Método para formatear tiempo (opcional)
  getFormattedTime(format: 'digital' | 'analog' = 'digital'): Observable<string> {
    return this.currentTime$.pipe(
      map((date) => {
        if (format === 'digital') {
          return date.toLocaleTimeString('es-ES', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        }
        return date.toISOString(); // o formato para analógico
      })
    );
  }

  getCurrentTime(): Observable<{ hours: number; minutes: number; seconds: number }> {
    return this.currentTime$.pipe(
      map((date) => ({
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      }))
    );
  }

  ngOnDestroy() {
    this.isRunning = false;
  }
}
