import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPantryProductComponent } from './add-pantry-product.component';

describe('AddPantryProductComponent', () => {
  let component: AddPantryProductComponent;
  let fixture: ComponentFixture<AddPantryProductComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPantryProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
