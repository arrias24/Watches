import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PomodoroClock } from './pomodoro-clock';

describe('PomodoroClock', () => {
  let component: PomodoroClock;
  let fixture: ComponentFixture<PomodoroClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PomodoroClock],
    }).compileComponents();

    fixture = TestBed.createComponent(PomodoroClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
