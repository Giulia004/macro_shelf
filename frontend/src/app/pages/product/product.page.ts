import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar, ToastController, IonButton, IonButtons, IonBackButton } from '@ionic/angular';
import { Product, ProductService } from '../../../services/product.service';
import { addIcons } from 'ionicons';
import { addOutline, alertCircleOutline, barcodeOutline, businessOutline, flameOutline, nutritionOutline, searchOutline } from 'ionicons/icons';
import { SearchbarComponent } from '../../components/searchbar/searchbar.component';
import { PantryService } from '../../../services/pantry.service';
import { FilterComponent, PantryFilter } from '../../components/filter/filter.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.css'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonToolbar, IonHeader, IonTitle, IonContent, IonCard, IonIcon, IonSpinner, SearchbarComponent, IonButtons, IonBackButton, SearchbarComponent, FilterComponent]
})
export class ProductPage implements OnInit {
  private productService = inject(ProductService);
  private pantryService = inject(PantryService);
  private toastController = inject(ToastController);

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
      searchOutline, nutritionOutline, alertCircleOutline, barcodeOutline, businessOutline, addOutline, flameOutline
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
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await this.pantryService.addItem(product, 1, expiryDate, 50, product.unit || 'g');

      const toast = await this.toastController.create({
        message: `"${product.name}" aggiunto alla dispensa!`,
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'add--outline'
      });
      await toast.present();
      
    } catch (error: any) {
      console.error("Errore salvataggio in dispensa:", error);
      const toast = await this.toastController.create({
        // Mostra il messaggio reale dell'errore sullo schermo del telefono
        message: "Errore: " + (error?.message || JSON.stringify(error)),
        duration: 5000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
      await toast.present();
    }
  }
}
