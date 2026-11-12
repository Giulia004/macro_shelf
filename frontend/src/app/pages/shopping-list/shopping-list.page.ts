import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonProgressBar, IonSpinner, IonTitle, IonToolbar} from '@ionic/angular';
import { DatabaseService, ShoppingItem } from '../../../services/database.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, arrowBackOutline, cartOutline, checkboxOutline, closeOutline, squareOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.page.html',
  styleUrls: ['./shopping-list.page.css'],
  imports: [IonContent, CommonModule, FormsModule,IonButton,IonIcon,IonInput,IonSpinner,IonProgressBar,IonTitle,IonButtons,IonHeader,IonToolbar]
})
export class ShoppingListPage implements OnInit {

  constructor(private databaseService: DatabaseService, private router: Router) { 
    addIcons({
      checkboxOutline,squareOutline,addOutline,cartOutline,arrowBackOutline,trashOutline,closeOutline
    })
  }

  shoppingItems = signal<ShoppingItem[]>([]);
  isLoading = signal<boolean>(false);
  newItemName = signal<string>('');

  ngOnInit() {
    this.loadShoppingList();
  }

  async loadShoppingList() {
    this.isLoading.set(true);
    try {
      const items = await this.databaseService.getShopList();
      this.shoppingItems.set(items);
    } catch (error) {
      console.error("Errore caricamento lista della spesa", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addItem() {
    const name = this.newItemName().trim();
    if (!name) return;

    try {
      await this.databaseService.addShoppingItem({
        name,
        quantity: 1,
        unit: 'pz',
        isChecked: 0
      });

      this.newItemName.set('');
      await this.loadShoppingList();
    } catch (error) {
      console.error("Errore aggiunga dell'elemento alla lista della spesa");
    }
  }

  async toggleItem(item: ShoppingItem) {
    if (!item.id) return;
    const newCheckedState = !item.isChecked;
    try {
      await this.databaseService.toggleShoppingItem(item.id, newCheckedState);
      await this.loadShoppingList();
    } catch (error) {
      console.error("Errore aggiornamento elemento",error);
    }
  }

  async removeItem(item: ShoppingItem) {
    if (!item.id) return;
    try {
      await this.databaseService.removeShoppingItem(item.id);
      await this.loadShoppingList();
    } catch (error) {
      console.error("Errore rimozione elemento:", error);
    }
  }

  async clearCompleted() {
    try {
      await this.databaseService.clearPurchasedShoppingItems();
      await this.loadShoppingList();
    } catch (error) {
      console.error("Errore pulizia elementi acquistati:", error);
    }
  }

  getCompletedCount(): number{
    return this.shoppingItems().filter(item => item.isChecked).length;
  }

  getProgressRatio(): number{
    const total = this.shoppingItems().length;
    if (total === 0) return 0;
    return this.getCompletedCount() / total;
  }

  goBack() {
    this.router.navigate(['/pantry']);
  }
}
