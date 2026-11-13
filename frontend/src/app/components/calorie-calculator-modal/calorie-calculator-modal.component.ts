import { Component, inject } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular';
import { ActivityLevel, Gender, Goal, NutritionGoalDto } from '../../../services/user.service';
import { addIcons } from 'ionicons';
import { calculatorOutline, closeOutline, fitnessOutline, flameOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calorie-calculator-modal',
  templateUrl: './calorie-calculator-modal.component.html',
  styleUrls: ['./calorie-calculator-modal.component.css'],
  imports: [IonHeader,IonToolbar,IonButton,IonButtons,IonIcon,IonTitle,IonContent,IonSelect,IonSelectOption,CommonModule,FormsModule,IonInput],
})
export class CalorieCalculatorModalComponent {
  private toastController = inject(ToastController);
  private modalController = inject(ModalController);

  //Form dati per il calcolo delle calorie
  formData = {
    gender: 'FEMALE' as Gender,
    age: 25,
    height: 165,
    weight: 60,
    activityLevel: 'MODERATELY_ACTIVE' as ActivityLevel,
    goal: 'MAINTAIN_WEIGHT' as Goal
  };

  calculatedResult: NutritionGoalDto | null = null;

  constructor() {
    addIcons({
      closeOutline, calculatorOutline, flameOutline, fitnessOutline
    });
  }

  dismiss(data:any=null) {
    this.modalController.dismiss(data);
  }

  calculateMacros() {
    if (!this.formData.age || !this.formData.height || !this.formData.weight) {
      this.showToast('Compila tutti i campi con valori validi.', 'warning');
      return;
    }

    if (this.formData.age <= 0 || this.formData.height <= 0 || this.formData.weight <= 0) {
      this.showToast('Inserisci valori validi per tutti i campi.', 'warning');
      return;
    }

    // 1. Calcolo BMR (Formula di Mifflin-St Jeor)
    let bmr = (10 * this.formData.weight) + (6.25 * this.formData.height) - (5 * this.formData.age);
    if (this.formData.gender === 'FEMALE') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    // 2. Moltiplicatore per livello di attività (TDEE)
    const activityMultipliers: Record<ActivityLevel, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725
    };
    let tdee = bmr * (activityMultipliers[this.formData.activityLevel] || 1.2);

    // 3. Adeguamento in base all'obiettivo
    if (this.formData.goal === 'LOSE_WEIGHT') {
      tdee -= 400; // Deficit calorico
    } else if (this.formData.goal === 'GAIN_WEIGHT') {
      tdee += 300; // Surplus calorico
    }

    const targetCalories = Math.round(tdee);

    // 4. Stima dei Macronutrienti (Proteine 2g/kg, Grassi 25% kcal, il resto Carboidrati)
    const targetProtein = Math.round(this.formData.weight * 2);
    const fatCalories = targetCalories * 0.25;
    const targetFats = Math.round(fatCalories / 9);
    
    const proteinCalories = targetProtein * 4;
    const remainingCalories = targetCalories - (proteinCalories + fatCalories);
    const targetCarbs = Math.max(50, Math.round(remainingCalories / 4));

    this.calculatedResult = {
      calories: targetCalories,
      proteins: targetProtein,
      carbs: targetCarbs,
      fats: targetFats
    };

    this.showToast('Calcolo completato con successo!', 'success');
  }

  //Restituisce i valori calcolati dalla pagina
  applyCalculatedGoals() {
    if (this.calculatedResult) this.dismiss(this.calculatedResult);
  }

  private async showToast(message: string, color: 'warning' | 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
