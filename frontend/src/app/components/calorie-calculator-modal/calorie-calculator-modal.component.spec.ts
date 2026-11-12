import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalorieCalculatorModalComponent } from './calorie-calculator-modal.component';

describe('CalorieCalculatorModalComponent', () => {
  let component: CalorieCalculatorModalComponent;
  let fixture: ComponentFixture<CalorieCalculatorModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalorieCalculatorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
