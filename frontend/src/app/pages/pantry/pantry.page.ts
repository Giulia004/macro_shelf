import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonContent, IonHeader, IonIcon, IonSearchbar, IonTitle, IonToolbar, ToastController,IonSpinner } from '@ionic/angular';
import { DatabaseService } from '../../../services/database.service';
import { addIcons } from 'ionicons';
import { addOutline, alertCircleOutline, barcodeOutline, businessOutline, nutritionOutline, removeOutline, searchOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-pantry',
  templateUrl: './pantry.page.html',
  styleUrls: ['./pantry.page.css'],
  standalone: true,
  imports: [IonSpinner,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonSearchbar, IonToolbar, IonTitle, IonIcon, IonCard, IonButton]
})
export class PantryPage implements OnInit {
  private databaseService = inject(DatabaseService);
  private toastController = inject(ToastController);

  pantryItems = signal<any[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);

  //Filtro reattivo
  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const items = this.pantryItems();

    if (!term) return items;

    return items.filter(i =>
      i.name.toLowerCase().includes(term) ||
      (i.brand && i.brand.toLowerCase().includes(term))
    );
  });

  constructor() {
    addIcons({
      searchOutline, nutritionOutline, alertCircleOutline, barcodeOutline, businessOutline, trashOutline, addOutline, removeOutline
    });
  }

  ngOnInit() {
    this.loadPantry();
  }

  async loadPantry() {
    this.isLoading.set(true);
    try {
      const data = await this.databaseService.getPantryItems();
      this.pantryItems.set(data);
    } catch (err) {
      console.error("Errore durante il caricamento della dispensa", err);
      const toast = await this.toastController.create({
        message: "Impossibile caricare la dispensa",
        duration: 2500,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
      await toast.present();
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeItem(item: any) {
    try {
      await this.databaseService.removeItem(item);
      this.loadPantry();

      const toast = await this.toastController.create({
        message: `"${item.name}" rimosso dalla dispensa.`,
        duration: 2000,
        color: 'medium',
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error("Errore rimozione elemento:", error);
      const toast = await this.toastController.create({
        message: "Errore durante la rimozione.",
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }
}
