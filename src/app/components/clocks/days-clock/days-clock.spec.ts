import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysClock } from './days-clock';

describe('DaysClock', () => {
  let component: DaysClock;
  let fixture: ComponentFixture<DaysClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaysClock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaysClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
