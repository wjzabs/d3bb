import { Routes } from '@angular/router';
import { BaseballComponent } from './baseball/baseball.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';
import { NodeGraphComponent } from './visuals/node-graph/node-graph.component';
import { ChoroplethComponent } from './choropleth/choropleth.component';
import { BubbleChart2Component } from './bubble-chart2/bubble-chart2.component';
import { JefferyComponent } from './jeffery/jeffery.component';
import { Choropleth2Component } from './choropleth2/choropleth2.component';
import { WalterComponent } from './walter/walter.component';
import { MaptestComponent } from './maptest/maptest.component';
import { GeocodingComponent } from './geocoding/geocoding.component';
import { MapsalesComponent } from './mapsales/mapsales.component';
import { D3brushComponent } from './d3brush/d3brush.component';
import { WeatherComponent } from './weather/weather.component';
import { Mapsales2Component } from './mapsales2/mapsales2.component';

export const routes: Routes = [
    {path: '', component: BaseballComponent},
    {path: 'baseball', component: BaseballComponent},
    {path: 'bubblechart', component: BubbleChartComponent},
    {path: 'bubblechart2', component: BubbleChart2Component},
    {path: 'nodes', component: NodeGraphComponent},
    {path: 'map', component: ChoroplethComponent},
    {path: 'map2', component: Choropleth2Component},
    {path: 'mapsales', component: MapsalesComponent},
    {path: 'mapsales2', component: Mapsales2Component},
    {path: 'brush', component: D3brushComponent},
    {path: 'weather', component: WeatherComponent},
    {path: 'jeffery', component: JefferyComponent},
    {path: 'walter', component: WalterComponent},
    {path: 'maptest', component: MaptestComponent},
    {path: 'geocoding', component: GeocodingComponent},
    
];
