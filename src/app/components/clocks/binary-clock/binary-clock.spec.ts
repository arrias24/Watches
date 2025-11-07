import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryClock } from './binary-clock';

describe('BinaryClock', () => {
  let component: BinaryClock;
  let fixture: ComponentFixture<BinaryClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinaryClock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinaryClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
