import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-geometric-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geometric-clock.html',
  styleUrls: ['./geometric-clock.css'],
})
export class GeometricClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayHours: string = '00';
  displayMinutes: string = '00';
  displaySeconds: string = '00';
  displayTime: string = '00:00:00';
  displayPeriod: string = 'AM';

  triangleBase: number = 120;
  triangleHeight: number = 104;
  squareSize: number = 80;
  circleSize: number = 80;

  hoursProgress: number = 0;
  minutesProgress: number = 0;
  secondsProgress: number = 0;

  currentDate: string = '';

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
        this.updateShapes(time);
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

      this.updateShapes({ hours: hours24, minutes, seconds });
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
      console.error('Error advancing custom time:', error);
    }
  }

  private updateShapes(time: { hours: number; minutes: number; seconds: number }) {
    const displayHours = time.hours % 12 || 12;
    this.displayHours = displayHours.toString().padStart(2, '0');
    this.displayMinutes = time.minutes.toString().padStart(2, '0');
    this.displaySeconds = time.seconds.toString().padStart(2, '0');
    this.displayTime = `${this.displayHours}:${this.displayMinutes}:${this.displaySeconds}`;
    this.displayPeriod = time.hours >= 12 ? 'PM' : 'AM';

    this.updateShapeSizes(time);
  }

  private updateShapeSizes(time: { hours: number; minutes: number; seconds: number }) {
    const displayHours = time.hours % 12 || 12;

    this.triangleBase = 60 + displayHours * 10;
    this.triangleHeight = this.triangleBase * 0.866;
    this.hoursProgress = (displayHours / 12) * 100;

    this.squareSize = 40 + time.minutes * 1;
    this.minutesProgress = (time.minutes / 60) * 100;

    this.circleSize = 40 + time.seconds * 1;
    this.secondsProgress = (time.seconds / 60) * 100;
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
