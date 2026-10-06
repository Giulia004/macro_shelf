import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuButton, IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { basketOutline, homeOutline, logOutOutline, menuOutline, nutritionOutline, personCircleOutline } from 'ionicons/icons';
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  imports: [CommonModule,IonSplitPane,IonMenu,IonContent,IonList,IonItem,IonLabel,IonIcon,IonRouterOutlet,IonHeader,IonToolbar,IonTitle,IonButtons,IonMenuButton,RouterModule],
})
export class MainLayoutComponent implements OnInit {
  user: User | null = null;

  constructor(private router:Router, private userService: UserService) {
    addIcons({
      homeOutline,
      basketOutline,personCircleOutline,nutritionOutline,logOutOutline,menuOutline
    })
  }

  ngOnInit() {
    this.userService.profile$.subscribe(user => this.user = user);
    this.userService.getProfile().subscribe({
      error: error => console.error('Errore nel caricamento del profilo utente', error)
    });
  }

  get displayName(): string {
    const fullName = [this.user?.name, this.user?.surname]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' ');
    return fullName || 'Completa il profilo';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
