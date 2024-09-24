import { Routes } from '@angular/router';
import { BaseballComponent } from './baseball/baseball.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';
import { NodeGraphComponent } from './visuals/node-graph/node-graph.component';
import { ChoroplethComponent } from './choropleth/choropleth.component';
import { BubbleChart2Component } from './bubble-chart2/bubble-chart2.component';
import { JefferyComponent } from './jeffery/jeffery.component';
import { Choropleth2Component } from './choropleth2/choropleth2.component';
import { WalterComponent } from './walter/walter.component';

export const routes: Routes = [
    {path: '', component: BaseballComponent},
    {path: 'baseball', component: BaseballComponent},
    {path: 'bubblechart', component: BubbleChartComponent},
    {path: 'bubblechart2', component: BubbleChart2Component},
    {path: 'nodes', component: NodeGraphComponent},
    {path: 'map', component: ChoroplethComponent},
    {path: 'map2', component: Choropleth2Component},
    {path: 'jeffery', component: JefferyComponent},
    {path: 'walter', component: WalterComponent},
];
