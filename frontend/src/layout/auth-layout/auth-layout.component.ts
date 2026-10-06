import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css'],
  standalone:true,
  imports: [IonApp,RouterModule,CommonModule,IonRouterOutlet],
})
export class AuthLayoutComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
