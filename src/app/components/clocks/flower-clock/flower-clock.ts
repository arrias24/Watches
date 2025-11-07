import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService } from '../../../services/clock/clock.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-flower-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flower-clock.html',
  styleUrls: ['./flower-clock.css'],
})
export class FlowerClock implements OnInit, OnDestroy {
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
  @Input() customTime: string = '';

  displayHours: string = '00';
  displayMinutes: string = '00';
  displaySeconds: string = '00';
  displayTime: string = '00:00:00';
  displayPeriod: string = 'AM';

  hourPetals: any[] = [];
  minutePetals: any[] = [];
  secondPetals: any[] = [];

  fallenHourPetals: any[] = [];
  fallenMinutePetals: any[] = [];
  fallenSecondPetals: any[] = [];

  currentDate: string = '';

  private timeSubscription!: Subscription;
  private customTimeSubscription!: Subscription;

  constructor(private clockService: ClockService) {}

  ngOnInit() {
    this.initializePetals();
    this.updateClock();
  }

  ngOnChanges() {
    this.updateClock();
  }

  private initializePetals() {
    this.hourPetals = Array.from({ length: 12 }, (_, i) => ({
      fallen: false,
      falling: false,
    }));

    this.minutePetals = Array.from({ length: 60 }, (_, i) => ({
      fallen: false,
      falling: false,
    }));

    this.secondPetals = Array.from({ length: 60 }, (_, i) => ({
      fallen: false,
      falling: false,
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
        this.updateFlowers(time);
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

      this.updateFlowers({ hours: hours24, minutes, seconds });
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

  private updateFlowers(time: { hours: number; minutes: number; seconds: number }) {
    const displayHours = time.hours % 12 || 12;
    this.displayHours = displayHours.toString().padStart(2, '0');
    this.displayMinutes = time.minutes.toString().padStart(2, '0');
    this.displaySeconds = time.seconds.toString().padStart(2, '0');
    this.displayTime = `${this.displayHours}:${this.displayMinutes}:${this.displaySeconds}`;
    this.displayPeriod = time.hours >= 12 ? 'PM' : 'AM';

    this.updatePetalState(this.hourPetals, displayHours, 12, 'hours');
    this.updatePetalState(this.minutePetals, time.minutes, 60, 'minutes');
    this.updatePetalState(this.secondPetals, time.seconds, 60, 'seconds');
  }

  private updatePetalState(petals: any[], currentValue: number, maxValue: number, type: string) {
    const petalsToFall = maxValue - currentValue;

    petals.forEach((petal, index) => {
      const shouldFall = index < petalsToFall;

      if (shouldFall && !petal.fallen && !petal.falling) {
        petal.falling = true;
      } else if (!shouldFall && petal.fallen) {
        petal.fallen = false;
        petal.falling = false;
      }
    });
  }

  onPetalAnimationEnd(type: string, index: number) {
    const petalArray = this.getPetalArray(type);
    const fallenArray = this.getFallenArray(type);

    if (petalArray[index] && petalArray[index].falling) {
      petalArray[index].falling = false;
      petalArray[index].fallen = true;

      const fallenPetal = {
        x: Math.random() * 80 + 10,
        delay: Math.random() * 1000,
      };

      fallenArray.push(fallenPetal);

      if (fallenArray.length > 8) {
        fallenArray.shift();
      }
    }
  }

  private getPetalArray(type: string): any[] {
    switch (type) {
      case 'hours':
        return this.hourPetals;
      case 'minutes':
        return this.minutePetals;
      case 'seconds':
        return this.secondPetals;
      default:
        return [];
    }
  }

  private getFallenArray(type: string): any[] {
    switch (type) {
      case 'hours':
        return this.fallenHourPetals;
      case 'minutes':
        return this.fallenMinutePetals;
      case 'seconds':
        return this.fallenSecondPetals;
      default:
        return [];
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
