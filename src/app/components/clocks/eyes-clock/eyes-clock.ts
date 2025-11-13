import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-eyes-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eyes-clock.html',
  styleUrls: ['./eyes-clock.css'],
})
export class EyesClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayHours: string = '00';
  displayMinutes: string = '00';
  displaySeconds: string = '00';
  displayTime: string = '00:00:00';
  displayPeriod: string = 'AM';

  hourBlinking: boolean = false;
  minuteBlinking: boolean = false;
  secondBlinking: boolean = false;

  private lastBlinkedHour: number = -1;
  private lastBlinkedMinute: number = -1;
  private lastBlinkedSecond: number = -1;

  hourPupilPosition: string = 'translate(0px, 0px)';
  minutePupilPosition: string = 'translate(0px, 0px)';
  secondPupilPosition: string = 'translate(0px, 0px)';

  private cursorX: number = 0;
  private cursorY: number = 0;

  private eyePositions: { [key: string]: DOMRect } = {};

  currentDate: string = '';

  private timeSubscription!: Subscription;
  private customTimeSubscription!: Subscription;
  private pupilSubscription!: Subscription;

  constructor(private clockService: ClockService) {}

  ngOnInit() {
    this.updateClock();
    this.startPupilTracking();
  }

  ngOnChanges() {
    this.updateClock();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
    this.updatePupilPositions();
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.cursorX = event.touches[0].clientX;
      this.cursorY = event.touches[0].clientY;
      this.updatePupilPositions();
    }
  }

  private updatePupilPositions() {
    this.updateEyePositions();

    this.hourPupilPosition = this.calculatePupilPosition('hour');
    this.minutePupilPosition = this.calculatePupilPosition('minute');
    this.secondPupilPosition = this.calculatePupilPosition('second');
  }

  private updateEyePositions() {
    const hourEyes = document.querySelectorAll('.hour-eyes .eye');
    const minuteEyes = document.querySelectorAll('.minute-eyes .eye');
    const secondEyes = document.querySelectorAll('.second-eyes .eye');

    if (hourEyes.length > 0) {
      this.eyePositions['hour'] = hourEyes[0].getBoundingClientRect();
    }
    if (minuteEyes.length > 0) {
      this.eyePositions['minute'] = minuteEyes[0].getBoundingClientRect();
    }
    if (secondEyes.length > 0) {
      this.eyePositions['second'] = secondEyes[0].getBoundingClientRect();
    }
  }

  private calculatePupilPosition(eyeType: string): string {
    if (!this.eyePositions[eyeType]) {
      return 'translate(0px, 0px)';
    }

    const eyeRect = this.eyePositions[eyeType];

    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const deltaX = this.cursorX - eyeCenterX;
    const deltaY = this.cursorY - eyeCenterY;

    const maxMovement = 8;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 200;

    const movementFactor = Math.min(distance / maxDistance, 1);

    const moveX = (deltaX / distance) * maxMovement * movementFactor || 0;
    const moveY = (deltaY / distance) * maxMovement * movementFactor || 0;

    return `translate(${moveX}px, ${moveY}px)`;
  }

  private startPupilTracking() {
    this.pupilSubscription = interval(100).subscribe(() => {
      this.updatePupilPositions();
    });
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
        this.updateEyes(time);
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

      this.updateEyes({ hours: hours24, minutes, seconds });
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

  private updateEyes(time: { hours: number; minutes: number; seconds: number }) {
    const displayHours = time.hours % 12 || 12;
    this.displayHours = displayHours.toString().padStart(2, '0');
    this.displayMinutes = time.minutes.toString().padStart(2, '0');
    this.displaySeconds = time.seconds.toString().padStart(2, '0');
    this.displayTime = `${this.displayHours}:${this.displayMinutes}:${this.displaySeconds}`;
    this.displayPeriod = time.hours >= 12 ? 'PM' : 'AM';

    this.controlBlinking(time);
  }

  private controlBlinking(time: { hours: number; minutes: number; seconds: number }) {
    const displayHours = time.hours % 12 || 12;

    if (time.minutes === 0 && time.seconds === 0) {
      if (this.lastBlinkedHour !== displayHours) {
        this.hourBlinking = true;
        this.lastBlinkedHour = displayHours;
      }
    }

    if (time.seconds === 0) {
      if (this.lastBlinkedMinute !== time.minutes) {
        this.minuteBlinking = true;
        this.lastBlinkedMinute = time.minutes;
      }
    }

    if (this.lastBlinkedSecond !== time.seconds) {
      this.secondBlinking = true;
      this.lastBlinkedSecond = time.seconds;
    }
  }

  onBlinkEnd(type: string) {
    switch (type) {
      case 'hours':
        this.hourBlinking = false;
        break;
      case 'minutes':
        this.minuteBlinking = false;
        break;
      case 'seconds':
        this.secondBlinking = false;
        break;
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
    if (this.pupilSubscription) {
      this.pupilSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
  }
}
