import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bubble-chart2',
  standalone: true,
  imports: [],
  templateUrl: './bubble-chart2.component.html',
  styleUrl: './bubble-chart2.component.scss'
})
export class BubbleChart2Component implements OnInit {
  @ViewChild('svgElement', { static: true }) svgElement!: ElementRef;
  private svg: any;
  private width: number = 800;
  private height: number = 600;
  private margin = { top: 20, right: 20, bottom: 50, left: 50 };

  private data = [
    { x: 30, y: 40, r: 15, value: 100 },
    { x: 70, y: 80, r: 25, value: 300 },
    // Add more data points as needed
  ];

  private xScale: any;
  private yScale: any;
  private colorScale: any;
  private zoom: any;

  ngOnInit(): void {
    this.createChart();
  }

  private createChart() {
    // Set up the SVG element
    this.svg = d3
      .select(this.svgElement.nativeElement)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Scales for x and y axes
    this.xScale = d3.scaleLinear().domain([0, 100]).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain([0, 100]).range([this.height, 0]);

    // Axes
    const xAxis = d3.axisBottom(this.xScale);
    const yAxis = d3.axisLeft(this.yScale);

    this.svg.append('g').attr('transform', `translate(0,${this.height})`).call(xAxis);
    this.svg.append('g').call(yAxis);

    // Color scale for bubbles
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create bubbles
    const bubbles = this.svg
      .selectAll('circle')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => this.xScale(d.x))
      .attr('cy', (d: any) => this.yScale(d.y))
      .attr('r', (d: any) => d.r)
      .attr('fill', (d: any) => this.colorScale(d.value))
      .attr('stroke', 'black')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.target).attr('stroke', 'orange');
        this.showTooltip(event, d);
      })
      .on('mouseout', (event: any) => {
        d3.select(event.target).attr('stroke', 'black');
        this.hideTooltip();
      });

    // Add zoom functionality
    this.zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event: any) => {
        this.svg.attr('transform', event.transform);
      });

    d3.select(this.svgElement.nativeElement).call(this.zoom);

    // Add brush functionality
    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('brush', (event: any) => {
        const selection = event.selection;
        const [[x0, y0], [x1, y1]] = selection;

        bubbles.attr('fill', (d: any) => {
          return this.xScale(d.x) >= x0 &&
            this.xScale(d.x) <= x1 &&
            this.yScale(d.y) >= y0 &&
            this.yScale(d.y) <= y1
            ? 'green'
            : this.colorScale(d.value);
        });
      })
      .on('end', () => {
        // WJZ note - this was the only error that I needed to rem out until i address it
        // d3.select('.brush').call(brush.move, null); // Remove brush after selection
      });

    this.svg.append('g').attr('class', 'brush').call(brush);

    // Drag and Drop functionality
    bubbles.call(
      d3
        .drag()
        .on('drag', (event: any, d: any) => {
          d.x = this.xScale.invert(event.x);
          d.y = this.yScale.invert(event.y);
          d3.select(event.sourceEvent.target)
            .attr('cx', event.x)
            .attr('cy', event.y);
        })
    );
  }

  private showTooltip(event: any, d: any) {
    // Display tooltip with the data values
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('padding', '5px')
      .style('border', '1px solid black')
      .html(`Value: ${d.value}`);
    tooltip
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 20}px`);
  }

  private hideTooltip() {
    d3.select('.tooltip').remove();
  }

  // Handle resizing
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.width = event.target.innerWidth * 0.8;
    this.height = event.target.innerHeight * 0.8;
    d3.select(this.svgElement.nativeElement).attr(
      'width',
      this.width + this.margin.left + this.margin.right
    );
    this.createChart();
  }
}
