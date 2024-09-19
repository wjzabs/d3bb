import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

interface DataPoint {
  id: string;
  value: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-bubble-chart2',
  templateUrl: './bubble-chart2.component.html',
  styleUrls: ['./bubble-chart2.component.scss'],
})
export class BubbleChart2Component implements OnInit {
  @ViewChild('chart') private chartContainer!: ElementRef;

  private data: DataPoint[] = [];
  private svg: any;
  private width: number = 800;
  private height: number = 400;
  private xScale: any;
  private yScale: any;

  private brush: any;
  private gBrush: any;

  constructor() {}

  ngOnInit(): void {
    this.generateData();
    this.createSvg();
    this.createScales();
    this.drawAxes();
    this.drawBubbles();
    this.addBrush();
    this.addZoom();
  }

  private generateData() {
    for (let i = 0; i < 50; i++) {
      this.data.push({
        id: `Bubble ${i}`,
        value: Math.random() * 100,
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }
  }

  private createSvg() {
    this.svg = d3
      .select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private createScales() {
    this.xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([this.height, 0]);
  }

  private drawAxes() {
    this.svg.append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(this.xScale).ticks(10));

    this.svg.append('g')
      .call(d3.axisLeft(this.yScale).ticks(10));

    this.svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.width - 10)
      .attr('y', this.height - 10)
      .text('X Axis');

    this.svg.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', 10)
      .attr('x', -10)
      .text('Y Axis');
  }

  private drawBubbles() {
    const bubbles = this.svg.selectAll('circle')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
      .attr('r', d => Math.sqrt(d.value))
      .style('fill', 'steelblue')
      .on('mouseover', (event, d) => {
        d3.select(event.target)
          .transition()
          .duration(200)
          .style('fill', 'orange');
        this.showTooltip(event, d);
      })
      .on('mouseout', (event) => {
        d3.select(event.target)
          .transition()
          .duration(200)
          .style('fill', 'steelblue');
        this.hideTooltip();
      });
  }

  private addBrush() {
    this.brush = d3.brush()
      .extent([[0, 0], [this.width, this.height]])
      .on('brush end', (event) => this.brushed(event));

    this.gBrush = this.svg.append('g')
      .call(this.brush);
  }

  private brushed(event: any)