import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { barcodeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
  standalone: true,
  imports: [IonSearchbar, IonButton, IonIcon],
})
export class SearchbarComponent {
  @Input() placeholder: string = "Cerca...";
  @Input() showBarcodeScan: boolean = false;
  @Input() value: string = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() barcodeClick = new EventEmitter<void>();

  constructor() {
    addIcons({ barcodeOutline });
  }

  onInput(event: any) {
    const value = event.detail.value || '';
    this.searchChange.emit(value);
  }

  onBarcodeClick() {
    this.barcodeClick.emit();
  }
}
