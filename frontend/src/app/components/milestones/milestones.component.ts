import { Component, Input } from '@angular/core';
import { IonCard, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle, flameOutline, lockClosedOutline, ribbonOutline, trophyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.css'],
  imports: [IonCard,IonIcon],
})
export class MilestonesComponent {
  @Input() streakDays: number = 5;

  milestones = [
    { title: 'Primo Log', desc: 'Registra la prima giornata', unlocked: true, icon: 'ribbon-outline' },
    { title: 'Costanza 7D', desc: 'Segui i macro per 7 giorni', unlocked: false, icon: 'flame-outline' },
    { title: 'Master Macro', desc: 'Raggiungi il target per 30 volte', unlocked: false, icon: 'trophy-outline' }
  ];

  constructor() { 
    addIcons({
      trophyOutline, lockClosedOutline, checkmarkCircle, flameOutline, ribbonOutline
    });
  }

}
