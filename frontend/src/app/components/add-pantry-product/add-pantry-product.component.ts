import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { PantryService } from '../../../services/pantry.service';
import { CreateProductPayload, PantryCategory, Product, ProductService } from '../../../services/product.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, ModalController } from '@ionic/angular';
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircleOutline, closeOutline, scanOutline, searchOutline } from 'ionicons/icons';

type ProductSource = 'catalog' | 'cache' | 'openfoodfacts' | 'manual';
type MessageType = 'warning' | 'success';

@Component({
  selector: 'app-add-pantry-product',
  templateUrl: './add-pantry-product.component.html',
  styleUrls: ['./add-pantry-product.component.css'],
  standalone: true,
  imports: [IonContent,IonFooter,IonHeader,IonToolbar,IonTitle,IonButtons,IonButton,IonSelectOption,IonSelect,IonIcon,IonInput,CommonModule,FormsModule,ReactiveFormsModule,IonSpinner],
})
export class AddPantryProductComponent {

  @Output() onProductAdded = new EventEmitter();

  constructor() {
    addIcons({
      searchOutline, scanOutline,checkmarkCircleOutline,closeOutline,alertCircleOutline
    });
  }
  private readonly fb = inject(FormBuilder);
  private readonly products = inject(ProductService);
  private readonly pantry = inject(PantryService);
  private readonly modal = inject(ModalController);

  readonly loading = signal(false);
  readonly scanning = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  readonly messageType = signal<MessageType>('warning');
  readonly source = signal<ProductSource>('manual');
  readonly foundProduct = signal(false);

  readonly form = this.fb.group({
    barcode: [''],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    brand: [''],
    imageUrl: [''],
    category: ['altro' as PantryCategory, Validators.required],

    calories: [0, [Validators.min(0)]],
    proteins: [0, [Validators.min(0)]],
    carbs: [0, [Validators.min(0)]],
    fats: [0, [Validators.min(0)]],
    fiber: [null as number | null, [Validators.min(0)]],
    sugar: [null as number | null, [Validators.min(0)]],
    saturatedFat: [null as number | null, [Validators.min(0)]],
    salt: [null as number | null, [Validators.min(0)]],

    nutritionBaseValue: [100, [Validators.required, Validators.min(1)]],
    nutritionBaseUnit: ['g', Validators.required],

    quantity: [1, [Validators.required, Validators.min(0.01)]],
    unit: ['pz', Validators.required],
    expiryDate: [
      new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      Validators.required
    ],
    minThreshold: [1, [Validators.required, Validators.min(0)]]
  });

  private existingProduct: Product | null = null;

  async scanBarcode(): Promise<void> {
    this.error.set('');
    this.message.set('');
    this.messageType.set('warning');
    this.scanning.set(true);

    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: 17,
        scanText: 'Inquadra il codice a barre',
        scanInstructions: 'Mantieni il codice dentro l’area di scansione',
        cameraDirection: 1
      });

      const barcode = result.ScanResult?.trim();
      if (barcode) {
        this.form.controls.barcode.setValue(barcode);
        await this.searchBarcode();
      }
    } catch (error) {
      console.error('Errore scanner:', error);
      this.error.set(
        'Scanner non disponibile. Puoi inserire il barcode manualmente.'
      );
    } finally {
      this.scanning.set(false);
    }
  }

  async searchBarcode(): Promise<void> {
    const barcode = this.form.controls.barcode.value?.trim() ?? '';

    if (!/^\d{8,14}$/.test(barcode)) {
      this.error.set('Inserisci un barcode valido di 8–14 cifre.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');
    this.messageType.set('warning');
    this.existingProduct = null;
    this.foundProduct.set(false);

    try {
      const result = await firstValueFrom(this.products.findByBarcode(barcode));

      if (!result.product) {
        this.form.patchValue({
          barcode,
          name: '',
          brand: '',
          imageUrl: '',
          category: 'altro',
          calories: 0,
          proteins: 0,
          carbs: 0,
          fats: 0,
          fiber: null,
          sugar: null,
          saturatedFat: null,
          salt: null
        });

        this.source.set('manual');
        this.messageType.set('warning');
        this.message.set(
          'Prodotto non trovato. Puoi inserire i dati manualmente.'
        );
        return;
      }

      const product = result.product;
      // The backend also saves Open Food Facts results in the local catalog.
      this.existingProduct = product;
      this.source.set(result.source);
      this.foundProduct.set(true);

      this.form.patchValue({
        barcode: product.barcode ?? barcode,
        name: product.name,
        brand: product.brand ?? '',
        imageUrl: product.imageUrl ?? '',
        category: this.normalizeCategory(product.category),
        calories: product.calories ?? 0,
        proteins: product.proteins ?? 0,
        carbs: product.carbs ?? 0,
        fats: product.fats ?? 0,
        fiber: product.fiber ?? null,
        sugar: product.sugar ?? null,
        saturatedFat: product.saturatedFat ?? null,
        salt: product.salt ?? null,
        nutritionBaseValue: product.nutritionBaseValue ?? 100,
        nutritionBaseUnit: product.nutritionBaseUnit ?? 'g'
      });

      this.message.set(
        result.source === 'catalog'
          ? 'Prodotto trovato nel catalogo globale.'
          : 'Prodotto trovato online. Controlla i dati prima di confermare.'
      );
      this.messageType.set('success');
    } catch (error) {
      console.error('Ricerca barcode:', error);
      this.error.set('Ricerca non riuscita. Puoi compilare i dati manualmente.');
    } finally {
      this.loading.set(false);
    }
  }

  private normalizeCategory(value: string | null): PantryCategory {
    const category = (value ?? '').toLowerCase();

    if (category.includes('frutta') || category.includes('verdura')) {
      return 'frutta-verdura';
    }
    if (category.includes('carne') || category.includes('pesce')) {
      return 'carne-pesce';
    }
    if (category.includes('latticini') || category.includes('latte')) {
      return 'latticini';
    }
    if (category.includes('bevande') || category.includes('drink')) {
      return 'bevande';
    }
    if (
      category.includes('pasta') ||
      category.includes('riso') ||
      category.includes('dispensa') ||
      category.includes('cereali') ||
      category.includes('conserve')
    ) {
      return 'dispensa';
    }

    return 'altro';
  }

  async save(): Promise<void> {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Controlla i campi obbligatori.');
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);

    try {
      let product: Product;

      if (this.existingProduct) {
        // Il prodotto esiste già nel catalogo: non lo ricreiamo.
        product = this.existingProduct;
      } else {
        // Prodotto importato o inserito manualmente:
        // chiediamo al backend di aggiungerlo al catalogo.
        const payload: CreateProductPayload = {
          name: v.name!.trim(),
          barcode: v.barcode?.trim() || undefined,
          brand: v.brand?.trim() || undefined,
          imageUrl: v.imageUrl?.trim() || undefined,
          calories: Number(v.calories ?? 0),
          proteins: Number(v.proteins ?? 0),
          carbs: Number(v.carbs ?? 0),
          fats: Number(v.fats ?? 0),
          fiber: v.fiber||undefined,
          sugar: v.sugar ||undefined,
          saturatedFat: v.saturatedFat ||undefined,
          salt: v.salt ||undefined,
          nutritionBaseValue: Number(v.nutritionBaseValue ?? 100),
          nutritionBaseUnit: v.nutritionBaseUnit ?? 'g',
          dataSource:
            this.source() === 'openfoodfacts'
              ? 'openfoodfacts'
              : 'manual',
          category: v.category!
        };

        product = await firstValueFrom(this.products.addProduct(payload));
      }

      await this.pantry.addItem(
        product,
        Number(v.quantity),
        v.expiryDate!,
        Number(v.minThreshold),
        v.unit!
      );

      await this.modal.dismiss({ saved: true }, 'saved');
    } catch (error) {
      console.error('Salvataggio prodotto:', error);
      this.error.set(
        'Non è stato possibile salvare il prodotto. Controlla la connessione e riprova.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.modal.dismiss(null, 'cancel');
  }
}
