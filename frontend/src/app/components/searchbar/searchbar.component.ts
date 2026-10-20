import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
  standalone: true,
  imports: [IonSearchbar],
})
export class SearchbarComponent {
  @Input() placeholder: string = "Cerca...";
  @Output() searchChange = new EventEmitter<string>();

  onInput(event: any) {
    const value = event.detail.value || '';
    this.searchChange.emit(value);
  }

}
