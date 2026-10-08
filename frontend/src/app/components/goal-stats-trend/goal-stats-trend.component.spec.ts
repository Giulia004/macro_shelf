import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalStatsTrendComponent } from './goal-stats-trend.component';

describe('GoalStatsTrendComponent', () => {
  let component: GoalStatsTrendComponent;
  let fixture: ComponentFixture<GoalStatsTrendComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalStatsTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
