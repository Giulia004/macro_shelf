import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonContent, IonIcon, IonRouterLink } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { addIcons } from 'ionicons';
import { basketOutline, chevronForwardOutline, flagOutline, flameOutline, logOutOutline, nutritionOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  standalone: true,
  styleUrls: ['./dashboard.page.css'],
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonCard, IonRouterLink,RouterLink]
})
export class DashboardPage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  //Statistiche con valori di fallback nel caso in cui il DB non abbia ancora i dati
  stats = {
    caloriesConsumed: 0,
    caloriesTarget: 2000,
    protein: 120,
    carbs: 200,
    fats: 60
  };

  constructor() {
    addIcons({
      logOutOutline, nutritionOutline, basketOutline, flameOutline, chevronForwardOutline,flagOutline
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
      next: (userData:any) => {
        this.authService.setUserProfile(userData);

        if (userData.targetCalories) this.stats.caloriesTarget = userData.targetCalories;
        if (userData.targetProtein) this.stats.protein = userData.targetProtein;
        if (userData.targetCarbs) this.stats.carbs = userData.targetCarbs;
        if (userData.targetFats) this.stats.fats = userData.targetFats;
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
