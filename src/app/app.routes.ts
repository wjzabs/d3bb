import { Routes } from '@angular/router';
import { BaseballComponent } from './baseball/baseball.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';
// import { BubbleChart2Component } from './bubble-chart2/bubble-chart2.component';

export const routes: Routes = [
    {path: '', component: BaseballComponent},
    {path: 'baseball', component: BaseballComponent},
    {path: 'bubblechart', component: BubbleChartComponent},
    // {path: '/bubblechart2', component: BubbleChart2Component},
];
