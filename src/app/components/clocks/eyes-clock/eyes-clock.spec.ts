import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EyesClock } from './eyes-clock';

describe('EyesClock', () => {
  let component: EyesClock;
  let fixture: ComponentFixture<EyesClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EyesClock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EyesClock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
