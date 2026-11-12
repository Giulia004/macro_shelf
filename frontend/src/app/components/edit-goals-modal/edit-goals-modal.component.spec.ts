import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGoalsModalComponent } from './edit-goals-modal.component';

describe('EditGoalsModalComponent', () => {
  let component: EditGoalsModalComponent;
  let fixture: ComponentFixture<EditGoalsModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGoalsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
