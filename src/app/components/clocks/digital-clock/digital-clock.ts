import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-digital-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './digital-clock.html',
  styleUrls: ['./digital-clock.css'],
})
export class DigitalClockComponent implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayTime: string = '';
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
      this.displayTime = this.customTime;
      this.updateCurrentDate();

      this.customTimeSubscription = interval(1000).subscribe(() => {
        this.advanceCustomTime();
      });
    } else {
      this.timeSubscription = this.clockService.getFormattedTime('digital').subscribe((time) => {
        this.displayTime = time;
        this.updateCurrentDate();
      });
    }
  }

  private advanceCustomTime() {
    if (!this.displayTime) return;

    try {
      const timeParts = this.displayTime.split(' ');
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

      this.displayTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${newPeriod}`;

      if (seconds === 0) {
        this.updateCurrentDate();
      }
    } catch (error) {
      console.error('Error advancing custom time:', error);
    }
  }

  private updateCurrentDate() {
    this.currentDate = new Date().toLocaleDateString('es-ES', {
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
