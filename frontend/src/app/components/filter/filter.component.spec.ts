import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterComponent } from './filter.component';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides the expiry filter when used for the catalog', () => {
    fixture.componentRef.setInput('showExpiring', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('In scadenza');
    expect(fixture.nativeElement.textContent).toContain('Frutta e verdura');
  });

  it('emits the selected product category', () => {
    const filterChange = vi.fn();
    component.filterChange.subscribe(filterChange);

    component.selectFilter('latticini');

    expect(filterChange).toHaveBeenCalledWith('latticini');
  });
});
