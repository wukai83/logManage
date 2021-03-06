import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { HeaderComponent } from '../shared/component/header/header.component';
import { MainRoutingModule } from './main-routing.module';
import { HeaderModule } from '../shared/component/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    HeaderModule,
    MainRoutingModule
  ],
  declarations: [
    MainComponent
  ]
})
export class MainModule { }
