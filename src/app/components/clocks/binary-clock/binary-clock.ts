import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-binary-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './binary-clock.html',
  styleUrls: ['./binary-clock.css'],
})
export class BinaryClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayHours: string = '00';
  displayMinutes: string = '00';
  displaySeconds: string = '00';
  displayPeriod: string = 'AM';
  displayTime: string = '00:00:00';

  hourBits: number[] = [0, 0, 0, 0];
  minuteBits: number[] = [0, 0, 0, 0, 0, 0];
  secondBits: number[] = [0, 0, 0, 0, 0, 0];

  binaryString: string = '000000 000000 000000';

  currentDate: string = '';
  is24HourFormat: boolean = false;

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
        this.updateBinaryTime(time);
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

      this.updateBinaryTime({
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
      console.error(error);
    }
  }

  private updateBinaryTime(time: { hours: number; minutes: number; seconds: number }) {
    const displayHours = time.hours % 12 || 12;
    this.displayHours = displayHours.toString().padStart(2, '0');
    this.displayMinutes = time.minutes.toString().padStart(2, '0');
    this.displaySeconds = time.seconds.toString().padStart(2, '0');
    this.displayPeriod = time.hours >= 12 ? 'PM' : 'AM';
    this.displayTime = `${this.displayHours}:${this.displayMinutes}:${this.displaySeconds}`;

    this.hourBits = this.decimalToBinary(displayHours, 4);
    this.minuteBits = this.decimalToBinary(time.minutes, 6);
    this.secondBits = this.decimalToBinary(time.seconds, 6);

    this.binaryString = `${this.hourBits.join('')} ${this.minuteBits.join(
      ''
    )} ${this.secondBits.join('')}`;
  }

  private decimalToBinary(decimal: number, bits: number): number[] {
    const binary = decimal.toString(2).padStart(bits, '0');
    return binary.split('').map((bit) => parseInt(bit, 10));
  }

  getBitWeight(position: number): number {
    return Math.pow(2, position);
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
