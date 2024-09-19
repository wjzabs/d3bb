import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BaseballComponent } from './baseball/baseball.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';
import { NodeGraphComponent } from './visuals/node-graph/node-graph.component';
import { GraphComponent } from './visuals/graph/graph.component';
import { FormsModule } from '@angular/forms';

import { D3Service, D3_DIRECTIVES } from './d3';
import { SHARED_VISUALS } from './visuals/shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterOutlet, BaseballComponent, BubbleChartComponent, NodeGraphComponent, GraphComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [D3Service]
})
export class AppComponent {
  title = 'd3bb';
}

