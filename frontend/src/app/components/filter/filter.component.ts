import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonChip, IonLabel } from '@ionic/angular';

export type PantryFilter =
  | 'all'
  | 'expiring'
  | 'frutta-verdura'
  | 'carne-pesce'
  | 'latticini'
  | 'dispensa'
  | 'bevande'
  | 'altro';

@Component({
  selector: 'app-filter',
  standalone: true,
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  imports: [IonChip, IonLabel],
})
export class FilterComponent {
  @Input() item: any[] = [];
  @Input() showExpiring = true;

  @Output() filterChange = new EventEmitter<PantryFilter>();

  selectedFilter = 'all';

  selectFilter(filter: PantryFilter): void {
    this.selectedFilter = filter;
    this.filterChange.emit(filter);
  }

  constructor() {
  }

}
