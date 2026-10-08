import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonContent, IonHeader, IonIcon, IonSearchbar, IonSpinner, IonTitle, IonToolbar, ToastController, IonButton } from '@ionic/angular';
import { Product, ProductService } from '../../../services/product.service';
import { addIcons } from 'ionicons';
import { addCircleOutline, alertCircleOutline, barcodeOutline, businessOutline, nutritionOutline, searchOutline } from 'ionicons/icons';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.css'],
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonToolbar, IonHeader, IonTitle, IonSearchbar, IonContent, IonCard, IonIcon, IonSpinner]
})
export class ProductPage implements OnInit {
  private productService = inject(ProductService);
  private databaseService = inject(DatabaseService);
  private toastController = inject(ToastController);

  products = signal<Product[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allProducts = this.products();

    if (!term) return allProducts;

    return allProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.brand && p.brand.toLowerCase().includes(term)) ||
      (p.barcode && p.barcode.toLowerCase().includes(term))
    );
  });

  constructor() {
    addIcons({
      searchOutline, nutritionOutline, alertCircleOutline, barcodeOutline, businessOutline, addCircleOutline
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
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

  onSearchInput(event: any) {
    const value = event.detail.value || '';
    this.searchTerm.set(value);
  }

  async addToPantry(product: Product) {
    try {
      //Creiamo un id unico
      const pantryItem = {
        id: 'pantry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        productId: product.id,
        name: product.name,
        brand: product.brand || undefined,
        quantity: 100, //(100g oppure 1 unità)
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minThreshold: 50,
        calories: product.calories,
        proteins: product.proteins,
        carbs: product.carbs,
        fats: product.fats,
        unit: product.unit || 'g'
      };

      await this.databaseService.addPantryItem(pantryItem);

      const toast = await this.toastController.create({
        message: `"${product.name}" aggiunto alla dispensa!`,
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'add-circle-outline'
      });
      await toast.present();
    } catch (error) {
      console.error("Errore salvataggio dispensa:", error);
      const toast = await this.toastController.create({
        message: "Errore durante l'aggiunta alla dispensa.",
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
      await toast.present();
    }
  }
}
