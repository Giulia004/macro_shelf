import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar, ToastController, IonButton, IonButtons, IonBackButton, ModalController } from '@ionic/angular';
import { Product, ProductService } from '../../../services/product.service';
import { addIcons } from 'ionicons';
import { addOutline, alertCircleOutline, analyticsOutline, barcodeOutline, businessOutline, flameOutline, nutritionOutline, searchOutline } from 'ionicons/icons';
import { SearchbarComponent } from '../../components/searchbar/searchbar.component';
import { PantryService } from '../../../services/pantry.service';
import { FilterComponent, PantryFilter } from '../../components/filter/filter.component';
import { AddPantryProductComponent } from '../../components/add-pantry-product/add-pantry-product.component';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonHeader,
    IonIcon,
    IonSpinner,
    IonTitle,
    IonToolbar,
    SearchbarComponent,
    FilterComponent
  ]
})
export class ProductPage implements OnInit {
  private productService = inject(ProductService);
  private pantryService = inject(PantryService);
  private toastController = inject(ToastController);
  private modalCtrl = inject(ModalController);

  products = signal<Product[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  activeFilter = signal<PantryFilter>('all');

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const filter = this.activeFilter();

    return this.products().filter(product => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.brand?.toLowerCase().includes(term) ?? false) ||
        (product.barcode?.toLowerCase().includes(term) ?? false);
      const matchesCategory =
        filter === 'all' ||
        product.category === filter;

      return matchesSearch && matchesCategory;
    });
  });

  constructor() {
    addIcons({
      searchOutline, nutritionOutline, alertCircleOutline, barcodeOutline, businessOutline, addOutline, flameOutline,analyticsOutline
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
        console.log("Prodotti catalogo:", data);
      },
      error: async (err) => {
        console.error("Errore durante il caricamento dei prodotti", err);
        this.isLoading.set(false);
        const toast = await this.toastController.create({
          message: "Impossibile caricare il catalogo prodotti.",
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        });
        await toast.present();
      }
    });
  }

  onFilterChange(filter: PantryFilter): void {
    this.activeFilter.set(filter);
  }
  onSearchInput(term: string) {
    this.searchTerm.set(term);
  }

  getCategoryLabel(category: string | null): string {
    const labels: Record<string, string> = {
      'frutta-verdura': 'Frutta e verdura',
      'carne-pesce': 'Carne e pesce',
      latticini: 'Latticini',
      dispensa: 'Dispensa',
      bevande: 'Bevande',
      altro: 'Altro',
    };

    return category ? labels[category] ?? category : 'Non categorizzato';
  }

  async addToPantry(product: Product): Promise<void> {
    try {
      const modal = await this.modalCtrl.create({
        component: AddPantryProductComponent,
        componentProps: {
          initialProduct: product
        },
        backdropDismiss: false
      });

      await modal.present();
      const { role } = await modal.onDidDismiss();

      if (role === 'saved') {
        const toast = await this.toastController.create({
          message: `"${product.name}" aggiunto alla dispensa!`,
          duration: 2000,
          color: 'success',
          position: 'bottom',
          icon: 'add-outline'
        });
        await toast.present();
      }
    } catch (error: any) {
      console.error("Errore aggiunta in dispensa:", error);
      const toast = await this.toastController.create({
        message: "Errore: " + (error?.message || JSON.stringify(error)),
        duration: 4000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
      await toast.present();
    }
  }

  async scanBarcode(): Promise<void> {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: 17,
        scanText: 'Inquadra il codice a barre',
        scanInstructions: 'Mantieni il codice dentro l’area di scansione',
        cameraDirection: 1
      });

      const barcode = result.ScanResult?.trim();
      if (barcode) {
        this.searchTerm.set(barcode);

        // Se troviamo esattamente 1 prodotto corrispondente, apriamo direttamente la modale
        const matched = this.products().find(p => p.barcode === barcode);
        if (matched) {
          await this.addToPantry(matched);
        }
      }
    } catch (error) {
      console.error('Errore scanner barcode:', error);
      const toast = await this.toastController.create({
        message: 'Scanner non disponibile o permesso negato.',
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
    }
  }
}
