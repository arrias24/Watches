import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DigitalClockComponent } from '../clocks/digital-clock/digital-clock';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DigitalClockComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  clockTypes = [
    { id: 1, name: 'Reloj Digital', type: 'digital', Component: DigitalClockComponent },
  ];

  selectedClock: any = this.clockTypes[0];
  currentTime: string = '';
  currentDate: string = '';
  selectedTime: any = { hours: 12, minutes: 0, seconds: 0, period: 'AM' };
  customTime: string = '';
  isCustomTimeActive: boolean = false;
  showDate: boolean = false;
  timeInterval: any;
  customTimeInterval: any;

  ngOnInit() {
    this.updateCurrentTime();
    this.updateCurrentDate();
    this.startRealTimeClock();
  }

  startRealTimeClock() {
    this.timeInterval = setInterval(() => {
      if (!this.isCustomTimeActive && !this.showDate) {
        this.updateCurrentTime();
      }
    }, 1000);
  }

  startCustomTimeClock() {
    this.stopCustomTimeClock();

    this.customTimeInterval = setInterval(() => {
      if (this.isCustomTimeActive && !this.showDate) {
        this.advanceCustomTime();
      }
    }, 1000);
  }

  advanceCustomTime() {
    let hours = this.selectedTime.hours;
    let minutes = this.selectedTime.minutes;
    let seconds = this.selectedTime.seconds;
    let period = this.selectedTime.period;

    seconds++;

    if (seconds > 59) {
      seconds = 0;
      minutes++;
    }

    if (minutes > 59) {
      minutes = 0;
      hours++;
    }

    if (hours > 12) {
      hours = 1;
    }

    if (hours === 12 && minutes === 0 && seconds === 0) {
      period = period === 'AM' ? 'PM' : 'AM';
    }

    this.selectedTime = {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      period: period,
    };

    this.customTime = this.formatCustomTime(hours, minutes, seconds, period);
    this.currentTime = this.customTime;
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-ES', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  updateCurrentDate() {
    const today = new Date();
    this.currentDate = today.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  setCurrentDate() {
    this.showDate = true;
    this.isCustomTimeActive = false;
    this.updateCurrentDate();
    this.stopCustomTimeClock();
  }

  setCurrentTime() {
    this.showDate = false;
    this.isCustomTimeActive = false;
    this.updateCurrentTime();
    this.customTime = '';
    this.stopCustomTimeClock();
  }

  addCustomTime() {
    const { hours, minutes, seconds, period } = this.selectedTime;

    if (!this.isValidTime(hours, minutes, seconds)) {
      alert('Hora inválida: ' + JSON.stringify({ hours, minutes, seconds }));
      return;
    }

    this.showDate = false;
    this.isCustomTimeActive = true;
    this.customTime = this.formatCustomTime(hours, minutes, seconds, period);
    this.currentTime = this.customTime;

    this.startCustomTimeClock();
  }

  isValidTime(hours: number, minutes: number, seconds: number): boolean {
    const isValid =
      hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59;
    return isValid;
  }

  formatCustomTime(hours: number, minutes: number, seconds: number, period: string): string {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
  }

  onTimeChange(field: string, value: string) {
    const numValue = parseInt(value);

    if (!isNaN(numValue)) {
      if (field === 'hours' && numValue >= 1 && numValue <= 12) {
        this.selectedTime[field] = numValue;
      } else if ((field === 'minutes' || field === 'seconds') && numValue >= 0 && numValue <= 59) {
        this.selectedTime[field] = numValue;
      }
    }
  }

  onPeriodChange(period: string) {
    this.selectedTime.period = period;
  }

  selectClock(clock: any) {
    this.selectedClock = clock;
  }

  getDisplayContent(): string {
    if (this.showDate) {
      return this.currentDate;
    } else if (this.isCustomTimeActive) {
      return this.customTime;
    } else {
      return this.currentTime;
    }
  }

  getTimeContent(): string {
    if (this.isCustomTimeActive) {
      return this.customTime;
    } else {
      return this.currentTime;
    }
  }

  getDisplayClass(): string {
    if (this.showDate) {
      return 'date-display';
    } else if (this.isCustomTimeActive) {
      return 'time-display custom-time';
    } else {
      return 'time-display';
    }
  }

  stopCustomTimeClock() {
    if (this.customTimeInterval) {
      clearInterval(this.customTimeInterval);
      this.customTimeInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopCustomTimeClock();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
