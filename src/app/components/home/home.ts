import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DigitalClockComponent } from '../clocks/digital-clock/digital-clock';
import { AnalogicClock } from '../clocks/analogic-clock/analogic-clock';
import { PomodoroClock } from '../clocks/pomodoro-clock/pomodoro-clock';
import { AquariumClock } from '../clocks/aquarium-clock/aquarium-clock';
import { BinaryClock } from '../clocks/binary-clock/binary-clock';
import { FlowerClock } from '../clocks/flower-clock/flower-clock';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DigitalClockComponent,
    AnalogicClock,
    PomodoroClock,
    AquariumClock,
    BinaryClock,
    FlowerClock,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  clockTypes = [
    { id: 1, name: 'Reloj Digital', type: 'digital' },
    { id: 2, name: 'Reloj Analógico', type: 'analog' },
    { id: 3, name: 'Reloj Pomodoro', type: 'pomodoro' },
    { id: 4, name: 'Reloj Acuario', type: 'aquarium' },
    { id: 5, name: 'Reloj Binario', type: 'binary' },
    { id: 6, name: 'Reloj de Flores', type: 'flower' },
  ];

  selectedClock: any = this.clockTypes[0];
  selectedTime: any = { hours: 12, minutes: 0, seconds: 0, period: 'AM' };

  showDate: boolean = false;
  isCustomTimeActive: boolean = false;
  customTime: string = '';

  ngOnInit() {}

  setCurrentDate() {
    this.showDate = true;
    this.isCustomTimeActive = false;
    this.customTime = '';
  }

  setCurrentTime() {
    this.showDate = false;
    this.isCustomTimeActive = false;
    this.customTime = '';
  }

  addCustomTime() {
    const { hours, minutes, seconds, period } = this.selectedTime;

    if (!this.isValidTime(hours, minutes, seconds)) {
      alert('Hora inválida');
      return;
    }

    this.showDate = false;
    this.isCustomTimeActive = true;
    this.customTime = this.formatCustomTime(hours, minutes, seconds, period);
  }

  isValidTime(hours: number, minutes: number, seconds: number): boolean {
    return (
      hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59
    );
  }

  formatCustomTime(hours: number, minutes: number, seconds: number, period: string): string {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
  }

  onTimeChange(field: string, value: string) {
    const numValue = parseInt(value, 10);

    if (field === 'hours') {
      if (numValue >= 1 && numValue <= 12) {
        this.selectedTime[field] = numValue;
      }
    } else if (field === 'minutes' || field === 'seconds') {
      if (numValue >= 0 && numValue <= 59) {
        this.selectedTime[field] = numValue;
      }
    }

    if (this.isCustomTimeActive) {
      this.addCustomTime();
    }
  }

  onPeriodChange(period: string) {
    this.selectedTime.period = period;
    if (this.isCustomTimeActive) {
      this.addCustomTime();
    }
  }

  selectClock(clock: any) {
    this.selectedClock = clock;
  }
}
