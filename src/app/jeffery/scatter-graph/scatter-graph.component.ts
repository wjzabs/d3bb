import { 
  Component, ElementRef, EventEmitter, Input, OnChanges, 
  OnDestroy, OnInit, Output, SimpleChanges 
} from '@angular/core';
import * as d3 from 'd3';
import { tooltip } from './tooltip';
import { html } from 'd3';

interface ScatterDatum {
  x: number;
  y: number;
  r: number;
}

@Component({
  selector: 'cmp-scatter-graph',
  standalone: true,
  imports: [],
  templateUrl: './scatter-graph.component.html',
  styleUrl: './scatter-graph.component.scss'
})
export class ScatterGraphComponent implements OnInit, OnChanges, OnDestroy {
  private svg: any;
  private mainGroup: any;
  private xAxisGroup: any;
  private yAxisGroup: any;
  private scaleX: any;
  private scaleY: any;
  private scaleR: any;

  private xMin = 0;
  private xMax = 10;
  private yMin = 0;
  private yMax = 10;

  private minRadius = 2;
  private maxRadius = 25;
  private rMin = 0;
  private rMax = 100;

  @Input()
  data: Array<ScatterDatum> = [];

  @Output('change')
  private changeEvent = new EventEmitter();

  private svgWidth = 0;
  private svgHeight = 0;
  private width = 900;
  private height = 500;
  private top = 30;
  private bottom = 30;
  private left = 30;
  private right = 30;
  tooltip?: unknown;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    console.log('element', this.el)
    this.createSvg(this.el.nativeElement);
    this.setScales();
    this.drawAxes();
    this.setupTooltip();
    this.drawScatter();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
  }

  private createSvg(nativeElement: any) {
    this.svgWidth = this.width + this.left + this.right;
    this.svgHeight = this.height + this.top + this.bottom;

    this.svg = d3.select(nativeElement)
      .append('div')
        .attr('id', 'tooltip')
        .classed('tooltip', true)
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("position", "absolute");

    this.svg = d3.select(nativeElement)
      .insert('svg', 'h1')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)

    this.mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.left}, ${this.top})`);

    this.xAxisGroup = this.mainGroup.append('g')
      .classed('x-axis', true);

    this.yAxisGroup = this.mainGroup.append('g')
      .classed('y-axis', true);
  }

  private setScales() {
    this.scaleX = d3.scaleLinear()
      .range([0, this.width])
      .domain([this.xMin, this.xMax]);
      
    this.scaleY = d3.scaleLinear()
      .range([this.height, 0])
      .domain([this.yMin, this.yMax]);
      
      this.scaleR = d3.scaleLinear()
        .range([this.minRadius, this.maxRadius])
        .domain([this.rMin, this.rMax]);
  }

  private drawAxes() {
    this.xAxisGroup.empty();
    this.xAxisGroup.attr('transform', `translate(0, ${this.height})`)
    this.xAxisGroup.call(
      d3.axisBottom(this.scaleX)
    );

    this.yAxisGroup.empty()
    //this.yAxisGroup.attr('transform', `translate(${this.width}, 0)`)
    this.yAxisGroup.call(
      d3.axisLeft(this.scaleY)
    );
  }

  private setupTooltip()  { 
  }

  private drawScatter() {
    const move = (selection: any, event: any, d: any) => {

      const x = this.clamped(this.scaleX(d.x) + event.dx, 0, this.width)
      const y = this.clamped(this.scaleY(d.y) + event.dy, 0, this.height)

      d.x = this.scaleX.invert(x);
      d.y = this.scaleY.invert(y);

      selection
        .attr("cx", x)
        .attr("cy", y);

      d3.select('#tooltip')
        .style("left", x + 'px')
        .style("top", (y + 30) + 'px')

      this.changeEvent.emit();
    };

    this.mainGroup
       .selectAll('circle')
       .data(this.data)
       .enter()
       .append('circle')
          .attr("cx", (d: any) => this.scaleX(d.x))
          .attr("cy", (d: any) => this.scaleY(d.y))
          .attr("r", (d: any) => this.scaleR(d.r))
          .attr("fill", 'red')
          .style("stroke", 'black')
          .on("mouseover", (event: any, d: any) => {

            const [rawX, rawY] = d3.pointer(event);

            const posX = rawX;
            const posY = rawY + 30;

            d3.select('#tooltip')
              .html(`label`)
              .style("left", rawX + 'px')
              .style("top", rawY + 'px')
              .style('opacity', 1)
          })
          .on("mousemove", (event: any, d: any) => {
          })
          .on("mouseout", (event: any, d: any) => {
            // hide tooltip
            d3.select('#tooltip')
              .transition()
              .duration(200)
              .style("opacity", 0)
          })
          .on("click", (d: any) => {
            // console.log('click', {d});
          })
          .call(d3.drag()
            .on("start", null)
            .on("drag", function(event: any, d: any) {
              move(d3.select(this), event, d);
            })
            .on("end", d => {
              console.log('end', {d});
            })
          )
  }

  private clamped(value: number, min: number, max: number): number {
    if(value < min) {
      return min;
    } else if (value > max) {
      return max;
    }
    return value;
  }
}
