import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-pomodoro-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pomodoro-clock.html',
  styleUrls: ['./pomodoro-clock.css'],
})
export class PomodoroClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayHours: string = '00';
  displayMinutes: string = '00';
  displaySeconds: string = '00';
  displayPeriod: string = 'AM';

  hoursProgress: number = 0;
  minutesProgress: number = 0;
  secondsProgress: number = 0;

  currentDate: string = '';
  is24HourFormat: boolean = false;

  circumference: number = 2 * Math.PI * 54; // 2πr

  private timeSubscription!: Subscription;
  private customTimeSubscription!: Subscription;

  constructor(private clockService: ClockService) {}

  ngOnInit() {
    this.updateClock();
  }

  ngOnChanges() {
    this.updateClock();
  }

  private updateClock() {
    this.cleanupSubscriptions();

    if (this.isCustomTime && this.customTime) {
      this.setCustomTime(this.customTime);
      this.customTimeSubscription = interval(1000).subscribe(() => {
        this.advanceCustomTime();
      });
    } else {
      this.timeSubscription = this.clockService.getCurrentTime().subscribe((time) => {
        this.updateTime(time);
        this.updateCurrentDate();
      });
    }
  }

  private setCustomTime(customTime: string) {
    try {
      const timeParts = customTime.split(' ');
      const timeValue = timeParts[0];
      const period = timeParts[1];

      const [hoursStr, minutesStr, secondsStr] = timeValue.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr, 10);

      let hours24 = hours;
      if (period === 'PM' && hours !== 12) {
        hours24 += 12;
      } else if (period === 'AM' && hours === 12) {
        hours24 = 0;
      }

      this.updateTime({
        hours: hours24,
        minutes,
        seconds,
      });

      this.updateCurrentDate();
    } catch (error) {
      console.error('Error setting custom time:', error);
    }
  }

  private advanceCustomTime() {
    if (!this.customTime) return;

    try {
      const timeParts = this.customTime.split(' ');
      const timeValue = timeParts[0];
      const period = timeParts[1];

      const [hoursStr, minutesStr, secondsStr] = timeValue.split(':');
      let hours = parseInt(hoursStr, 10);
      let minutes = parseInt(minutesStr, 10);
      let seconds = parseInt(secondsStr, 10);
      let newPeriod = period;

      seconds += 1;

      if (seconds >= 60) {
        seconds = 0;
        minutes += 1;
      }

      if (minutes >= 60) {
        minutes = 0;
        hours += 1;
      }

      if (hours > 12) {
        hours = 1;
      } else if (hours === 12 && minutes === 0 && seconds === 0) {
        newPeriod = period === 'AM' ? 'PM' : 'AM';
      }

      this.customTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${newPeriod}`;

      this.setCustomTime(this.customTime);
    } catch (error) {
      console.error(error);
    }
  }

  private updateTime(time: { hours: number; minutes: number; seconds: number }) {
    this.displayHours = (time.hours % 12 || 12).toString().padStart(2, '0');
    this.displayMinutes = time.minutes.toString().padStart(2, '0');
    this.displaySeconds = time.seconds.toString().padStart(2, '0');
    this.displayPeriod = time.hours >= 12 ? 'PM' : 'AM';

    this.hoursProgress = (time.hours % 12) / 12;
    this.minutesProgress = time.minutes / 60;
    this.secondsProgress = time.seconds / 60;
  }

  getStrokeDashoffset(progress: number): number {
    return this.circumference * (1 - progress);
  }

  private updateCurrentDate() {
    this.currentDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private cleanupSubscriptions() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
    if (this.customTimeSubscription) {
      this.customTimeSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
  }
}
