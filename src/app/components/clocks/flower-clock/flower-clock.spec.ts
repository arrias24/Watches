import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowerClock } from './flower-clock';

describe('FlowerClock', () => {
  let component: FlowerClock;
  let fixture: ComponentFixture<FlowerClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowerClock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowerClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
