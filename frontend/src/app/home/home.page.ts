import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonRouterLink } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fileTrayStackedOutline, heartOutline, leafOutline, logInOutline, nutritionOutline, personAddOutline, restaurantOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.css'],
  standalone: true,
  imports: [IonContent, CommonModule, RouterModule, IonIcon, IonRouterLink, IonButton],
})
export class HomePage {
  constructor() {
    addIcons({
      leafOutline,
      fileTrayStackedOutline,
      logInOutline,
      nutritionOutline,
      personAddOutline,
      restaurantOutline,
      heartOutline
    });
  }
}
