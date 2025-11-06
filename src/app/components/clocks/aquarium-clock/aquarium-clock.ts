import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-aquarium-clock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="aquarium-clock" [class.custom-time]="isCustomTime">
      <div class="aquarium-container">
        <div class="aquarium hour-aquarium">
          <div class="aquarium-label">HORAS</div>
          <div class="aquarium-tank">
            <div class="water-fill" [style.height.%]="hoursWaterLevel"></div>
            <div class="water-level">{{ displayHours }}</div>
            <div class="drops-container">
              <div
                *ngFor="let drop of hourDrops"
                class="drop"
                [style.left.px]="drop.left"
                [style.animation-delay.ms]="drop.delay"
              ></div>
            </div>
          </div>
        </div>

        <div class="aquarium minute-aquarium">
          <div class="aquarium-label">MINUTOS</div>
          <div class="aquarium-tank">
            <div class="water-fill" [style.height.%]="minutesWaterLevel"></div>
            <div class="water-level">{{ displayMinutes }}</div>
            <div class="drops-container">
              <div
                *ngFor="let drop of minuteDrops"
                class="drop"
                [style.left.px]="drop.left"
                [style.animation-delay.ms]="drop.delay"
              ></div>
            </div>
          </div>
        </div>

        <div class="aquarium second-aquarium">
          <div class="aquarium-label">SEGUNDOS</div>
          <div class="aquarium-tank">
            <div class="water-fill" [style.height.%]="secondsWaterLevel"></div>
            <div class="water-level">{{ displaySeconds }}</div>
            <div class="drops-container">
              <div
                *ngFor="let drop of secondDrops"
                class="drop"
                [style.left.px]="drop.left"
                [style.animation-delay.ms]="drop.delay"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showDate" class="date-display">{{ currentDate }}</div>
      <div *ngIf="isCustomTime" class="custom-time-indicator">Hora Personalizada</div>

      <div class="period-indicator" *ngIf="!is24HourFormat">{{ displayPeriod }}</div>
    </div>
  `,
  styleUrls: ['./aquarium-clock.css'],
})
export class AquariumClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayHours: string = '00';
  displayMinutes: string = '00';
  displaySeconds: string = '00';
  displayPeriod: string = 'AM';

  hoursWaterLevel: number = 0;
  minutesWaterLevel: number = 0;
  secondsWaterLevel: number = 0;

  currentDate: string = '';
  is24HourFormat: boolean = false;

  hourDrops: any[] = [];
  minuteDrops: any[] = [];
  secondDrops: any[] = [];

  private timeSubscription!: Subscription;
  private customTimeSubscription!: Subscription;
  private dropSubscription!: Subscription;

  constructor(private clockService: ClockService) {}

  ngOnInit() {
    this.generateDrops();
    this.updateClock();
  }

  ngOnChanges() {
    this.updateClock();
  }

  private generateDrops() {
    this.hourDrops = Array.from({ length: 3 }, (_, i) => ({
      left: 15 + i * 20,
      delay: i * 2000,
    }));

    this.minuteDrops = Array.from({ length: 5 }, (_, i) => ({
      left: 10 + i * 15,
      delay: i * 800,
    }));

    this.secondDrops = Array.from({ length: 8 }, (_, i) => ({
      left: 5 + i * 10,
      delay: i * 300,
    }));
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
        this.updateWaterLevels(time);
        this.updateCurrentDate();
      });
    }

    this.dropSubscription = interval(100).subscribe(() => {
      this.animateDrops();
    });
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

      this.updateWaterLevels({
        hours: hours24,
        minutes,
        seconds,
      });

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
      console.error('Error advancing custom time:', error);
    }
  }

  private updateWaterLevels(time: { hours: number; minutes: number; seconds: number }) {
    this.displayHours = (time.hours % 12 || 12).toString().padStart(2, '0');
    this.displayMinutes = time.minutes.toString().padStart(2, '0');
    this.displaySeconds = time.seconds.toString().padStart(2, '0');
    this.displayPeriod = time.hours >= 12 ? 'PM' : 'AM';

    this.hoursWaterLevel = ((time.hours % 12) / 12) * 100;
    this.minutesWaterLevel = (time.minutes / 60) * 100;
    this.secondsWaterLevel = (time.seconds / 60) * 100;
  }
  private animateDrops() {}

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
    if (this.dropSubscription) {
      this.dropSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
  }
}
