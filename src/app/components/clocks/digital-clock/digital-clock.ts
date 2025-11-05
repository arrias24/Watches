import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-digital-clock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './digital-clock.html',
  styleUrls: ['./digital-clock.css'],
})
export class DigitalClockComponent {
  @Input() time: string = '00:00:00';
  @Input() date: string = '';
  @Input() showDate: boolean = false;
  @Input() isCustomTime: boolean = false;
}
