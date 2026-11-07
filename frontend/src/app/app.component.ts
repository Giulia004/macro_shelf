import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AuthService } from '../services/auth.service';
import { isActive, Router } from '@angular/router';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private dbService: DatabaseService, private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    //Inizializzazione del database SQLite
    await this.dbService.initDatabase();

    //Controllo iniziale della sessione e reindirizzamento
    await this.checkInitialSession();

    //Gestione delle notifiche locali all'avvio (se loggato)
    if (this.authService.isAuthenticated()) {
      await this.initAndCheckNotifications();
    }

    //Gestione del ritorno dell'app dal background su Android
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) this.verifyActiveSession();
    })
  }

  private async checkInitialSession() {
    if (this.authService.isAuthenticated()) this.router.navigate(['/dashboard']);
    else this.router.navigate(['/login']);
  }

  private verifyActiveSession() {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  private async initAndCheckNotifications() {
    try {
      //Verifica e richiedi i permessi per le notifiche
      let permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        permStatus = await LocalNotifications.requestPermissions();
      }

      if (permStatus.display === 'granted') {
        //Controlla articoli nella lista della spesa
        const shoppingItems = await this.dbService.getShopList();
        const unCheckedShopping = shoppingItems.filter(item => !item.isChecked);

        //Controlla prodotti in scadenza
        const pantryItems = await this.dbService.getPantryItems();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiringSoon = pantryItems.filter(item => {
          if (!item.expiryDate) return false;
          const expiry = new Date(item.expiryDate);
          expiry.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((expiry.getTime() - today.getDate()) / (1000 * 60 * 60 * 2));
          return diffDays <= 3; //Scaduti o in scadenza entro 3 giorni
        });
        if (expiringSoon.length > 0) {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: '🍎 Attenzione agli sprechi!',
                body: `Hai ${expiringSoon.length} prodotti in scadenza nella dispensa. Controllali subito!`,
                id: 1001,
                schedule: { at: new Date(Date.now() + 3000) },
                sound: 'default'
              }
            ]
          });
        }
        else if (unCheckedShopping.length > 0) {
          // Invia una notifica locale amichevole se ci sono articoli da comprare
          await LocalNotifications.schedule({
            notifications: [
              {
                title: '🛒 Lista della spesa',
                body: `La tua spesa ti aspetta! Ci sono ${unCheckedShopping.length} articoli da acquistare.`,
                id: 1001,
                schedule: { at: new Date(Date.now() + 300000) }, // Mostra dopo 3 secondi dall'avvio
                sound: 'default'
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error("Errore durante la gestione delle notifiche locali all'avvio:", error);
    }
  }
}
