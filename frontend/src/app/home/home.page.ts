import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { basketOutline, logInOutline, nutritionOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.css'],
  standalone:true,
  imports: [IonContent,CommonModule,RouterModule,IonIcon],
})
export class HomePage {
  constructor() {
    addIcons({
      logInOutline, personAddOutline,
      basketOutline,nutritionOutline
    });
  }
}
