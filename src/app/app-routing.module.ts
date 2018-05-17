import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AppComponent } from './app.component';

// const childRoutes: Routes = [
//     { path: 'statistics', loadChildren: './statistics/statistics.module#StatisticsModule' },
//     // { path: 'statistics', component: StatisticsComponent },
//     { path: '**', redirectTo: 'statistics' }
// ];

const routes: Routes = [
    { path: '', loadChildren: './main/main.module#MainModule' },
    { path: 'main', loadChildren: './main/main.module#MainModule' },
    // { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
