import { Routes } from '@angular/router';
import { BaseballComponent } from './baseball/baseball.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';
import { NodeGraphComponent } from './visuals/node-graph/node-graph.component';
// import { BubbleChart2Component } from './bubble-chart2/bubble-chart2.component';

export const routes: Routes = [
    {path: '', component: BaseballComponent},
    {path: 'baseball', component: BaseballComponent},
    {path: 'bubblechart', component: BubbleChartComponent},
    {path: 'nodes', component: NodeGraphComponent},
    // {path: '/bubblechart2', component: BubbleChart2Component},
];
