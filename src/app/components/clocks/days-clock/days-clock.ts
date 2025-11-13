import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-days-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './days-clock.html',
  styleUrls: ['./days-clock.css'],
})
export class DaysClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayTime: string = '00:00:00';
  currentDate: string = '';

  isNight: boolean = false;
  skyGradient: string = '';
  sunPosition: { x: number; y: number } = { x: -20, y: 80 };
  moonPosition: { x: number; y: number } = { x: -20, y: 80 };
  starOpacity: number = 0;

  clouds = [
    { left: 10, delay: 0, speed: 60, top: 15 },
    { left: 40, delay: 2, speed: 45, top: 30 },
    { left: 70, delay: 4, speed: 70, top: 20 },
  ];

  stars = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 50,
    delay: Math.random() * 5,
    size: Math.random() * 2 + 1,
  }));

  mountains = [
    { x: 0, height: 120, color: '#2d5016' },
    { x: 20, height: 120, color: '#1e3a0f' },
    { x: 45, height: 120, color: '#2d5016' },
    { x: 70, height: 120, color: '#1e3a0f' },
    { x: 90, height: 120, color: '#2d5016' },
  ];

  sunRays = Array.from({ length: 12 }, (_, i) => ({
    transform: `rotate(${i * 30}deg)`,
  }));

  moonCraters = [
    { x: 30, y: 20, size: 8 },
    { x: 60, y: 40, size: 12 },
    { x: 40, y: 60, size: 6 },
    { x: 70, y: 30, size: 10 },
  ];

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
        this.updateDayNightCycle(time);
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

      this.updateDayNightCycle({ hours: hours24, minutes, seconds });
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

  private updateDayNightCycle(time: { hours: number; minutes: number; seconds: number }) {
    const totalMinutes = time.hours * 60 + time.minutes;
    this.displayTime = `${time.hours.toString().padStart(2, '0')}:${time.minutes
      .toString()
      .padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;

    const cycleProgress = totalMinutes / (24 * 60);

    this.isNight = time.hours >= 19 || time.hours < 6;

    if (!this.isNight) {
      const dayStart = 6 * 60;
      const dayEnd = 19 * 60;
      const dayDuration = dayEnd - dayStart;

      const currentDayMinutes = totalMinutes - dayStart;
      const sunProgress = Math.max(0, Math.min(1, currentDayMinutes / dayDuration));

      this.sunPosition.x = -20 + sunProgress * 140;
      this.sunPosition.y = 80 - Math.sin(sunProgress * Math.PI) * 60;

      this.moonPosition.x = -50;
      this.moonPosition.y = 120;
    } else {
      const nightStart = 19 * 60;
      const nightEnd = 24 * 60 + 6 * 60;
      const nightDuration = nightEnd - nightStart;

      let currentNightMinutes;
      if (time.hours >= 19) {
        currentNightMinutes = totalMinutes - nightStart;
      } else {
        currentNightMinutes = totalMinutes + (24 * 60 - nightStart);
      }

      const moonProgress = Math.max(0, Math.min(1, currentNightMinutes / nightDuration));

      this.moonPosition.x = -20 + moonProgress * 140;
      this.moonPosition.y = 80 - Math.sin(moonProgress * Math.PI) * 60;

      this.sunPosition.x = -50;
      this.sunPosition.y = 120;
    }

    this.updateSkyGradient(time.hours, time.minutes);

    this.updateStarOpacity(time.hours, time.minutes);
  }

  private updateSkyGradient(hours: number, minutes: number) {
    const totalHours = hours + minutes / 60;

    if (totalHours >= 5 && totalHours < 6) {
      const preDawnProgress = (totalHours - 5) / 1;
      this.skyGradient = `linear-gradient(to bottom, 
        rgba(15, 32, 39, ${1 - preDawnProgress * 0.7}),
        rgba(44, 83, 100, ${0.8 - preDawnProgress * 0.6}),
        rgba(255, 126, 95, ${0.3 * preDawnProgress}))`;
    } else if (totalHours >= 6 && totalHours < 7) {
      const dawnProgress = (totalHours - 6) / 1;
      this.skyGradient = `linear-gradient(to bottom, 
        rgba(255, 126, 95, ${0.3 + dawnProgress * 0.7}), 
        rgba(254, 180, 123, ${0.4 + dawnProgress * 0.6}),
        rgba(135, 206, 235, ${0.2 + dawnProgress * 0.8}))`;
    } else if (totalHours >= 7 && totalHours < 17) {
      this.skyGradient = 'linear-gradient(to bottom, #64b3f4, #87CEEB, #98FB98)';
    } else if (totalHours >= 17 && totalHours < 19) {
      const duskProgress = (totalHours - 17) / 2;
      this.skyGradient = `linear-gradient(to bottom, 
        rgba(255, 107, 107, ${1 - duskProgress * 0.5}),
        rgba(255, 167, 38, ${1 - duskProgress * 0.7}),
        rgba(44, 83, 100, ${0.3 + duskProgress * 0.7}))`;
    } else if (totalHours >= 19 && totalHours < 21) {
      const eveningProgress = (totalHours - 19) / 2;
      this.skyGradient = `linear-gradient(to bottom, 
        rgba(44, 83, 100, ${1 - eveningProgress * 0.3}),
        rgba(32, 58, 67, ${0.8 + eveningProgress * 0.2}),
        rgba(15, 32, 39, ${0.6 + eveningProgress * 0.4}))`;
    } else {
      this.skyGradient = 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)';
    }
  }

  private updateStarOpacity(hours: number, minutes: number) {
    const totalHours = hours + minutes / 60;

    if (totalHours >= 19 || totalHours < 5) {
      this.starOpacity = 1;
    } else if (totalHours >= 17 && totalHours < 19) {
      const sunsetProgress = (totalHours - 17) / 2;
      this.starOpacity = sunsetProgress;
    } else if (totalHours >= 5 && totalHours < 7) {
      const sunriseProgress = 1 - (totalHours - 5) / 2;
      this.starOpacity = sunriseProgress;
    } else {
      this.starOpacity = 0;
    }
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
