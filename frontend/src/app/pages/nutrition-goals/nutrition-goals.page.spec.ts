import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutritionGoalsPage } from './nutrition-goals.page';

describe('NutritionGoalsPage', () => {
  let component: NutritionGoalsPage;
  let fixture: ComponentFixture<NutritionGoalsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NutritionGoalsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
