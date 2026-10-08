import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonCard, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flameOutline, informationCircleOutline, statsChartOutline } from 'ionicons/icons';
import { User } from '../../../services/user.service';

@Component({
  selector: 'app-goal-stats-trend',
  templateUrl: './goal-stats-trend.component.html',
  styleUrls: ['./goal-stats-trend.component.css'],
  standalone: true,
  imports: [CommonModule, IonCard, IonIcon],
})
export class GoalStatsTrendComponent {
  //Input del target calorico di riferimento impostato dall'utente
  @Input() user: User | null = null;

  constructor() {
    addIcons({
      statsChartOutline, informationCircleOutline, flameOutline
    });
  }

  //Getter per calcolare o mostrare i dati reali attuali
  get currentGoalLabel(): string {
    switch (this.user?.goal) {
      case 'CUTTING': return 'Definizione (Perdita peso)';
      case 'BULKING': return 'Massa (Aumento muscolare)';
      default: return 'Mantenimento';
    }
  }
}
