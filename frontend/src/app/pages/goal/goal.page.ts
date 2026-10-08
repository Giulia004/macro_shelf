import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButtons, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonIcon, ModalController, ToastController } from '@ionic/angular';
import { User, UserService } from '../../../services/user.service';
import { addIcons } from 'ionicons';
import { addCircleOutline, checkmarkCircleOutline, fastFoodOutline, flagOutline, optionsOutline, saveOutline } from 'ionicons/icons';
import { EditGoalModalComponent } from '../../components/edit-goal-modal/edit-goal-modal.component';
import { MilestonesComponent } from '../../components/milestones/milestones.component';
import { GoalStatsTrendComponent } from '../../components/goal-stats-trend/goal-stats-trend.component';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  styleUrls: ['./goal.page.css'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonButtons, IonBackButton, IonIcon,MilestonesComponent,GoalStatsTrendComponent]
})
export class GoalPage implements OnInit {
  private userService = inject(UserService);
  private modalCtrl = inject(ModalController);
  private toastController = inject(ToastController);

  user = signal<User | null>(null);

  constructor() {
    addIcons({
      flagOutline, saveOutline, fastFoodOutline, addCircleOutline, optionsOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.userService.profile$.subscribe({
      next: (userProfile) => {
        if (userProfile) this.user.set(userProfile);
      }, error: async (err) => {
        console.error("Errore nel caricamento dei dati del profilo", err);
        const toast = await this.toastController.create({
          message: "Impossibile caricare i dati dell'obiettivo.",
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        });

        await toast.present();
      }
    });
  }

  async openEditModal() {
    const currentUser = this.user();
    const modal = await this.modalCtrl.create({
      component: EditGoalModalComponent,
      componentProps: {
        currentGoal: currentUser?.goal || 'MAINTENANCE',
        currentCalories: currentUser?.targetCalories || 2000,
        currentProtein: currentUser?.targetProtein || 120,
        currentCarbs: currentUser?.targetCarbs || 200,
        currentFats: currentUser?.targetFats || 60
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data)
      this.loadUserData();
  }

}
