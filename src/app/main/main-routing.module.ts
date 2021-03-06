import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
// import { StatisticsComponent } from '../statistics/statistics.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            // { path: 'top', component: MainComponent },
            { path: 'statistics', loadChildren: '../statistics/statistics.module#StatisticsModule' },
            { path: 'test', loadChildren: '../test/test.module#TestModule' },
            { path: '**', redirectTo: 'statistics' }
        ]
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class MainRoutingModule { }
