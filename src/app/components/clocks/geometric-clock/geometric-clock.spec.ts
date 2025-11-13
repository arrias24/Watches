import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeometricClock } from './geometric-clock';

describe('GeometricClock', () => {
  let component: GeometricClock;
  let fixture: ComponentFixture<GeometricClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeometricClock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeometricClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
