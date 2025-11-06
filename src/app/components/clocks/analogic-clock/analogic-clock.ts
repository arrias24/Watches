import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-analog-clock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analog-clock" [class.custom-time]="isCustomTime">
      <div class="clock-face">
        <div
          *ngFor="let mark of hourMarks"
          class="hour-mark"
          [style.transform]="'rotate(' + mark.degrees + 'deg)'"
        >
          <span class="hour-number" [style.transform]="'rotate(' + -mark.degrees + 'deg)'">
            {{ mark.number }}
          </span>
        </div>

        <div class="hand hour-hand" [style.transform]="'rotate(' + hourAngle + 'deg)'"></div>
        <div class="hand minute-hand" [style.transform]="'rotate(' + minuteAngle + 'deg)'"></div>
        <div class="hand second-hand" [style.transform]="'rotate(' + secondAngle + 'deg)'"></div>

        <div class="center-circle"></div>
      </div>

      <div *ngIf="showDate" class="date-display">{{ currentDate }}</div>
      <div *ngIf="isCustomTime" class="custom-time-indicator">Hora Personalizada</div>
    </div>
  `,
  styleUrls: ['./analogic-clock.css'],
})
export class AnalogicClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  hourAngle: number = 0;
  minuteAngle: number = 0;
  secondAngle: number = 0;
  currentDate: string = '';

  private timeSubscription!: Subscription;
  private customTimeSubscription!: Subscription;

  hourMarks = Array.from({ length: 12 }, (_, i) => ({
    number: i === 0 ? 12 : i,
    degrees: i * 30,
  }));

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
        this.updateHands(time);
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

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      this.updateHands({ hours, minutes, seconds });
      this.updateCurrentDate();
    } catch (error) {
      console.error(error);
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

  private updateHands(time: { hours: number; minutes: number; seconds: number }) {
    this.hourAngle = (time.hours % 12) * 30 + time.minutes * 0.5;
    this.minuteAngle = time.minutes * 6 + time.seconds * 0.1;
    this.secondAngle = time.seconds * 6;
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
