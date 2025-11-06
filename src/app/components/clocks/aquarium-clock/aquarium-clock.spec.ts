import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AquariumClock } from './aquarium-clock';

describe('AquariumClock', () => {
  let component: AquariumClock;
  let fixture: ComponentFixture<AquariumClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AquariumClock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AquariumClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
