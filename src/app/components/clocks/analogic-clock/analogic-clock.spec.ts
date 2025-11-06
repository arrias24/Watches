import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalogicClock } from './analogic-clock';

describe('AnalogicClock', () => {
  let component: AnalogicClock;
  let fixture: ComponentFixture<AnalogicClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalogicClock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalogicClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
