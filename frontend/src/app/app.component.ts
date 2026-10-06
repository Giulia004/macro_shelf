import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private dbService: DatabaseService) { }
  
  async ngOnInit() {
    await this.dbService.initDatabase();
  }
}
