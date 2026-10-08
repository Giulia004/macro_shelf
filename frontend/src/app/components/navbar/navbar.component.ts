import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuButton, IonToolbar, MenuController, IonRouterOutlet, IonSplitPane, IonApp } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, logOutOutline, menuOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [IonRouterOutlet, IonApp, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonIcon, IonButton, IonItem, IonLabel, IonList, IonMenu, IonContent, RouterLink, IonSplitPane, IonApp],
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuController = inject(MenuController);

  currentUser = this.authService.currentUser;

  constructor() {
    addIcons({
      logOutOutline, personCircleOutline, menuOutline, homeOutline
    });
  }

  async logout() {
    await this.menuController.close();
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
