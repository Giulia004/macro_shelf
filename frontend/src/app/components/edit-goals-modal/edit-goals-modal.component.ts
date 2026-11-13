import { Component, inject, Input, OnInit } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular';
import { NutritionGoalDto, UserService } from '../../../services/user.service';
import { addIcons } from 'ionicons';
import { calculatorOutline, chevronForwardOutline, closeOutline, fitnessOutline, flameOutline, nutritionOutline, saveOutline, waterOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalorieCalculatorModalComponent } from '../calorie-calculator-modal/calorie-calculator-modal.component';

@Component({
  selector: 'app-edit-goals-modal',
  templateUrl: './edit-goals-modal.component.html',
  styleUrls: ['./edit-goals-modal.component.css'],
  imports: [CommonModule, IonContent, IonIcon, IonInput, FormsModule, IonButton, IonHeader, IonToolbar, IonButtons, IonTitle],
  standalone: true
})
export class EditGoalsModalComponent implements OnInit {
  private modalController = inject(ModalController);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  //Riceve i dati attuali passati dal componentProps
  @Input() currentGoals!: NutritionGoalDto;

  //Oggtto locale modificabile nel form di inserimento dati
  editableGoals: NutritionGoalDto = {
    calories: 2000,
    proteins: 150,
    carbs: 200,
    fats: 65
  };

  isSaving = false;

  constructor() {
    addIcons({
      closeOutline, saveOutline, flameOutline, fitnessOutline, nutritionOutline, waterOutline, chevronForwardOutline, calculatorOutline
    });
  }

  ngOnInit() {
    if (this.currentGoals)
      this.editableGoals = this.currentGoals;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async openCalculatorModal() {
    const modal = await this.modalController.create({
      component: CalorieCalculatorModalComponent
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.editableGoals = { ...data };
      this.showToast('Obiettivi calcolati applicati con successo!', 'success');
    }
  }

  save() {
    if (this.editableGoals.calories <= 0) {
      this.showToast('Inserisci un valore di calorie valido.', 'warning');
      return;
    }

    this.isSaving = true;
    
    //Chiamata al backend
    this.userService.updateNutritionGoals(this.editableGoals).subscribe({
      next: () => {
        this.isSaving = false;
        this.showToast('Obiettivi aggiornati con successo!', 'success');
        // Chiude il modale restituendo i nuovi dati alla pagina chiamante
        this.dismiss();
      },
      error: (err) => {
        console.error('Errore durante il salvataggio degli obiettivi', err);
        this.isSaving = false;
        this.showToast('Errore durante il salvataggio.', 'danger');
      }
    });
  }

  private async showToast(message: string, color: 'warning' | 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
