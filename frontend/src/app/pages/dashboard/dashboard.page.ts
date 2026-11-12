import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { User, UserService } from '../../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BottomNavbarComponent } from '../../components/bottom-navbar/bottom-navbar.component';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, basketOutline, createOutline, eyeOutline, flameOutline, informationCircleOutline, leafOutline, nutritionOutline, restaurantOutline, sparklesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  standalone: true,
  styleUrls: ['./dashboard.page.css'],
  imports: [CommonModule, FormsModule, IonContent, IonIcon, RouterLink, BottomNavbarComponent]
})
export class DashboardPage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  //Statistiche con valori di fallback nel caso in cui il DB non abbia ancora i dati
  stats = {
    caloriesConsumed: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  };

  readonly Math = Math;
  constructor() {
    addIcons({
      arrowForwardOutline,basketOutline,flameOutline,informationCircleOutline,leafOutline,nutritionOutline,restaurantOutline,sparklesOutline,eyeOutline
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  get displayName(): string {
    const user = this.currentUser();

    if (!user) return 'MacroShelf User';

    const name = user.name?.trim() || '';
    const surname = user.surname?.trim() || '';
    const fullName = `${name} ${surname}`.trim();

    return fullName || user.email || 'MacroShelf User';
  }

  loadUserProfile() {
    this.userService.getProfile().subscribe({
      next: (userData: User) => {
        this.authService.setUserProfile(userData);
      },
      error: (err) => {
        console.error('Errore nel recupero del profilo utente', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

}
