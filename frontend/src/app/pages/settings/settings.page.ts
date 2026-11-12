import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonTitle, IonToggle, IonToolbar } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, colorPaletteOutline, fitnessOutline, informationCircleOutline, logOutOutline, notificationsOutline, personOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.css'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonHeader, IonToolbar, IonButtons, IonTitle, IonIcon, IonToggle]
})
export class SettingsPage implements OnInit {
  constructor(private authService: AuthService, private router: Router) {
    addIcons({
      arrowBackOutline, personOutline, notificationsOutline, shieldCheckmarkOutline, logOutOutline, informationCircleOutline, fitnessOutline,colorPaletteOutline
    });
  }

  public currentUser = this.authService.currentUser();
  notificationsEnabled = signal<boolean>(true);
  darkModeEnabled = signal<boolean>(false);


  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  onNotificationToggle(event: any) {
    this.notificationsEnabled.set(event.detail.checked);
  }

  openNutritionalSettings() {

  }

  openAccountSettings() {

  }

  openFoodPreferences() {
  }

  openAppearanceSettings() {
    
  }

  openAboutSettings() {
    
  }

  logout() {
    this.router.navigate(['/home']);
    this.authService.logout();
  }
}
