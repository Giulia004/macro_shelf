import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonContent, IonIcon, ToastController, IonSpinner, ModalController, ViewWillEnter } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, analyticsOutline, arrowDownCircle, arrowDownOutline, businessOutline, calendarOutline, cartOutline, cubeOutline, fitnessOutline, flameOutline, leafOutline, nutritionOutline, searchOutline, trashOutline, waterOutline } from 'ionicons/icons';
import { PantryItem, PantryService } from '../../../services/pantry.service';
import { FilterComponent, PantryFilter } from '../../components/filter/filter.component';
import { SearchbarComponent } from '../../components/searchbar/searchbar.component';
import { AddPantryProductComponent } from '../../components/add-pantry-product/add-pantry-product.component';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-pantry',
  templateUrl: './pantry.page.html',
  styleUrls: ['./pantry.page.css'],
  standalone: true,
  imports: [IonSpinner, IonContent, CommonModule, FormsModule, IonButton, IonIcon, IonCard, FilterComponent, SearchbarComponent]
})
export class PantryPage implements OnInit, ViewWillEnter {
  private pantryService = inject(PantryService);
  private toastController = inject(ToastController);
  private readonly modalCtrl = inject(ModalController);

  pantryItems = signal<PantryItem[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  activeFilter = signal<PantryFilter>('all');

  //Filtro reattivo
  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filter = this.activeFilter();
    const items = this.pantryItems();

    return items.filter(item => {
      const matchesSearch = !term ||
        item.name.toLowerCase().includes(term) ||
        (item.brand?.toLowerCase().includes(term) ?? false) ||
        (item.barcode?.toLowerCase().includes(term) ?? false);

      const matchesCategory = filter == 'all' || filter === 'expiring' || item.category === filter

      return matchesSearch && matchesCategory;
    });
  });

  constructor(private router: Router, private databaseService: DatabaseService) {
    addIcons({
      addOutline, leafOutline, searchOutline, nutritionOutline, businessOutline, calendarOutline, analyticsOutline, arrowDownOutline, flameOutline, fitnessOutline, waterOutline, cubeOutline, cartOutline
    });
  }

  ngOnInit() {
    this.loadPantry();
  }

  ionViewWillEnter(): void {
    this.loadPantry();
  }

  async loadPantry() {
    this.isLoading.set(true);
    try {
      const data = await this.pantryService.getItems();
      this.pantryItems.set(data);
    } catch (err) {
      console.error("Errore durante il caricamento della dispensa", err);
      this.pantryItems.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeItem(item: PantryItem) {
    try {
      await this.pantryService.removeItem(item.id);
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

  async consumeItem(item: PantryItem) {
    try {
      if (item.quantity === 0) {
        this.removeItem(item);
      }
      else {
        const newQuantity = Math.max(0, item.quantity - 1);
        await this.pantryService.updateQuantity(item.id, newQuantity);

        let messageText = `Quantità di "${item.name}" aggiornata (${newQuantity} ${item.unit}).`;
        let toastColor = 'medium';

        if (newQuantity < 2) {
          try {
            await this.databaseService.addShoppingItem({
              productId: item.productId,
              name: item.name,
              brand: item.brand || undefined,
              unit: item.unit || 'pz',
              category: item.category || 'dispensa',
              notes: "Aggiunto in automatico: scorte in esaurimento"
            });
          } catch (dbError) {
            console.error("Errore nell'aggiunta automatica alla spesa:", dbError);
          }
        }

        await this.loadPantry();
        const toast = await this.toastController.create({
          message: `"Quantità di ${item.name}" diminuita.`,
          duration: 2000,
          color: 'medium',
          position: 'bottom',
          buttons: newQuantity < 2 ? [
            {
              text: "Vedi lista",
              handler: () => {
                this.router.navigate(['/shopping-list']);
              }
            }
          ] : []
        });
        
        await toast.present();
      }
    } catch (error) {
      console.error("Errore la modifica della quantità:", error);
      const toast = await this.toastController.create({
        message: "Errore durante la modifica della quantità.",
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }
  async openAddModal(): Promise<void> {
    try {
      const modal = await this.modalCtrl.create({
        component: AddPantryProductComponent,
        backdropDismiss: false
      });

      await modal.present();
      const { role } = await modal.onDidDismiss();

      if (role === 'saved') {
        await this.loadPantry();

        const toast = await this.toastController.create({
          message: 'Prodotto aggiunto alla dispensa.',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Errore durante l’apertura della modale per la dispensa:', error);
      const toast = await this.toastController.create({
        message: 'Impossibile aprire la finestra per aggiungere un prodotto.',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  onFilterChange(filter: PantryFilter): void {
    this.activeFilter.set(filter);
  }

  onSearchInput(term: string) {
    this.searchTerm.set(term);
  }

  openShoppingList() {
    this.router.navigate(['/shopping-list']);
  }
}
