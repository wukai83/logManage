import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { HeaderComponent } from '../shared/component/header/header.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    MainComponent,
    HeaderComponent
  ]
})
export class MainModule { }
