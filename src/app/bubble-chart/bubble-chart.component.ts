import { Component, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

interface DataPoint {
  x: number;
  y: number;
  radius: number;
}

@Component({
  selector: 'app-bubble-chart',
  standalone: true,
  imports: [],
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent implements AfterViewInit {
  private data: DataPoint[] = [];
  private svg: any;
  private width: number = 800;
  private height: number = 400;
  private brush: any;

  constructor() {
    this.generateData();
  }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawChart();
    this.addBrush();
  }

  private generateData() {
    // Generate sample data
    for (let i = 0; i < 20; i++) {
      this.data.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        radius: Math.random() * 20 + 5,
      });
    }
  }

  private createSvg() {
    this.svg = d3.select('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private drawChart() {
    this.svg.selectAll('circle')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('cx', (d:any) => d.x)
      .attr('cy', (d:any) => d.y)
      .attr('r', (d:any) => d.radius)
      .attr('fill', 'blue')
      .attr('opacity', 0.7);
  }

  private addBrush() {
    this.brush = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on('brush end', this.brushed.bind(this));

    this.svg.append('g')
      .attr('class', 'brush')
      .call(this.brush);
  }

  private brushed(event: any) {
    const selection = event.selection;
    if (selection) {
      const [[x0, y0], [x1, y1]] = selection;
      this.svg.selectAll('circle')
        .classed('selected', (d: DataPoint) => {
          return d.x >= x0 && d.x <= x1 && d.y >= y0 && d.y <= y1;
        });
    }
  }
}
