import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { fastFoodOutline, flagOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  styleUrls: ['./goal.page.css'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonButtons, IonBackButton]
})
export class GoalPage implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  // Campi del form associati all'obiettivo e ai macro
  goal: string = 'MAINTENANCE';
  targetCalories: number = 2000;
  targetProtein: number = 120;
  targetCarbs: number = 200;
  targetFats: number = 60;

  constructor() {
    addIcons({
      flagOutline, saveOutline, fastFoodOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.goal) this.goal = user.goal;
        if (user.targetCalories) this.targetCalories = user.targetCalories;
        if (user.targetProtein) this.targetProtein = user.targetProtein;
        if (user.targetCarbs) this.targetCarbs = user.targetCarbs;
        if (user.targetFats) this.targetFats = user.targetFats;
      }
    });
  }

  saveGoal() {
    const payload = {
      goal: this.goal,
      targetCalories: Number(this.targetCalories),
      targetProtein: Number(this.targetProtein),
      targetCarbs: Number(this.targetCarbs),
      targetFats: Number(this.targetFats),
    }

    this.userService.updateGoalAndMacros(payload).subscribe({
      next: (updatedUser) => this.loadUserData(),
      error: (err) => console.error("Qualcosa e' andato storto")
    });
  }

}
