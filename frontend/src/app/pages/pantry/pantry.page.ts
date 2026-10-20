import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, ToastController, IonSpinner, IonChip, IonLabel, IonModal } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addCircleOutline, addOutline, alertCircleOutline, barcodeOutline, businessOutline, calendarOutline, nutritionOutline, removeOutline, searchOutline, trashOutline } from 'ionicons/icons';
import { PantryItem, PantryService } from '../../../services/pantry.service';
import { FilterComponent, PantryFilter } from '../../components/filter/filter.component';
import { SearchbarComponent } from '../../components/searchbar/searchbar.component';
import { AddPantryProductComponent } from '../../components/add-pantry-product/add-pantry-product.component';

@Component({
  selector: 'app-pantry',
  templateUrl: './pantry.page.html',
  styleUrls: ['./pantry.page.css'],
  standalone: true,
  imports: [IonSpinner, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonToolbar, IonTitle, IonIcon, IonCard, IonButton, IonModal, FilterComponent, SearchbarComponent,AddPantryProductComponent]
})
export class PantryPage implements OnInit {
  private pantryService = inject(PantryService);
  private toastController = inject(ToastController);

  pantryItems = signal<PantryItem[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  isAddModalOpen = signal<boolean>(false);
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

  constructor() {
    addIcons({
      searchOutline, nutritionOutline, alertCircleOutline, barcodeOutline, businessOutline, trashOutline, addOutline, removeOutline, calendarOutline, addCircleOutline
    });
  }

  ngOnInit() {
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

  openAddModal() {
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  async onAddModalDismiss(event: CustomEvent<{ role?: string }>) {
    this.closeAddModal();
    if (event.detail.role === 'saved') {
      await this.loadPantry();

      const toast = await this.toastController.create({
        message: 'Prodotto aggiunto alla dispensa.',
        duration: 2000,
        color: 'success',
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
}
