import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { NutritionGoalDto, UserService } from '../../../services/user.service';
import { arrowBackOutline, checkmarkCircleOutline, createOutline, fitnessOutline, flameOutline, helpCircleOutline, nutritionOutline, saveOutline, waterOutline } from 'ionicons/icons';
import { EditGoalsModalComponent } from '../../components/edit-goals-modal/edit-goals-modal.component';

@Component({
  selector: 'app-nutrition-goals',
  templateUrl: './nutrition-goals.page.html',
  styleUrls: ['./nutrition-goals.page.css'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonIcon]
})
export class NutritionGoalsPage implements OnInit {

  constructor(private router: Router, private userService: UserService, private toastController: ToastController, private modalController: ModalController) {
    addIcons({
      arrowBackOutline, flameOutline, fitnessOutline, nutritionOutline, waterOutline, saveOutline, createOutline, helpCircleOutline,checkmarkCircleOutline
    });
  }

  //Obiettivi nutrizionali di default (macro in grammi)
  goals: NutritionGoalDto = {
    calories: 2000,
    proteins: 150,
    carbs: 200,
    fats: 65
  }

  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.userService.getNutritionGoals().subscribe({
      next: (data) => {
        this.goals = data;
        this.isLoading.set(false);
      }, error: (err) => {
        console.error('Errore nel caricamento degli obiettivi', err);
        this.isLoading.set(false);
        this.showToast('Impossibile caricare i dati.', 'danger');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  saveGoals() {
    const calories = this.toNumber(this.goals.calories);
    const proteins = this.toNumber(this.goals.proteins);
    const carbs = this.toNumber(this.goals.carbs);
    const fats = this.toNumber(this.goals.fats);

    if (calories === null || calories < 1 ||
      proteins === null || proteins < 0 ||
      carbs === null || carbs < 0 ||
      fats === null || fats < 0) {
      this.showToast('Inserisci valori numerici validi per tutti gli obiettivi.', 'warning');
      return;
    }

    this.isSaving.set(true);

    this.userService.updateNutritionGoals({ calories, proteins, carbs, fats }).subscribe({
      next: (goals) => {
        this.isSaving.set(false);
        this.goals = goals;
        this.showToast('Obiettivi salvati con successo!', 'success');
        this.loadGoals();
      }, error: (err) => {
        console.error('Errore nel salvataggio degli obiettivi', err);
        this.isSaving.set(false);
        this.showToast('Impossibile salvare gli obiettivi.', 'danger');
      }
    });
  }

  private toNumber(value: unknown): number | null {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return null;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
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

  async openEditModal() {
    const modal = await this.modalController.create({
      component: EditGoalsModalComponent,
      componentProps: { ...this.goals }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.goals = data;
    }
  }

  get macroCalories(): number {
    const proteins = Number(this.goals?.proteins) || 0;
    const carbs = Number(this.goals?.carbs) || 0;
    const fats = Number(this.goals?.fats) || 0;

    return proteins * 4 + carbs * 4 + fats * 9;
  }

  private getMacroPercentage(calories: number): number {
    if (this.macroCalories <= 0) return 0;

    return Math.round((calories / this.macroCalories) * 100);
  }

  get proteinPercent(): number {
    return this.getMacroPercentage(Number(this.goals?.proteins) || 0) * 4;
  }

  get carbsPercent(): number {
    return this.getMacroPercentage(
      (Number(this.goals?.carbs) || 0) * 4
    );
  }

  get fatsPercent(): number {
    return this.getMacroPercentage(
      (Number(this.goals?.fats) || 0) * 9
    );
  }
}