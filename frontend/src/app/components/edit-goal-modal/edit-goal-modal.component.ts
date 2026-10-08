import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular';
import { UserService } from '../../../services/user.service';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircleOutline, closeCircleOutline, flagOutline, optionsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-edit-goal-modal',
  templateUrl: './edit-goal-modal.component.html',
  styleUrls: ['./edit-goal-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonCard, IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton,IonIcon],
})
export class EditGoalModalComponent {
  private modalCtrl = inject(ModalController);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  @Input() currentGoal: string = 'MAINTENANCE';
  @Input() currentCalories: number = 2000;
  @Input() currentProtein: number = 120;
  @Input() currentCarbs: number = 200;
  @Input() currentFats: number = 60;

  constructor() {
    addIcons({
      checkmarkCircleOutline, alertCircleOutline, flagOutline, optionsOutline,closeCircleOutline
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  private async showToast(message: string, color: 'success' | 'danger', icon: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      icon,
      cssClass: 'custom-toast rounded-4'
    });

    await toast.present();
  }

  save() {
    const payload = {
      goal: this.currentGoal,
      targetCalories: Number(this.currentCalories),
      targetProtein: Number(this.currentProtein),
      targetCarbs: Number(this.currentCarbs),
      targetFats: Number(this.currentFats)
    };

    this.userService.updateGoalAndMacros(payload).subscribe({
      next: async (res) => {
        await this.showToast('Obiettivo e target aggiornati con successo!', 'success', 'checkmark-circle-outline');
        this.modalCtrl.dismiss(res);
      },
      error: async (err) => {
        console.error("Errore durante l'aggiornamento", err)
        await this.showToast("Errore durante il salvataggio. Riprova più tardi.", 'danger', 'alert-circle-outline');
      }
    });
  }

}
