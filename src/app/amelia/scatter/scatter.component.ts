import { Component, Input, ViewChild, ElementRef, AfterContentInit, OnChanges, SimpleChanges } from '@angular/core'
import * as d3 from "d3"
import { DimensionsType, ScaleType, AccessorType } from '../utils/types';
import { ChartComponent } from '../chart/chart.component';
import { AxisComponent } from '../chart/axis/axis.component';
import { CirclesComponent } from '../chart/circles/circles.component';

@Component({
  selector: 'app-scatter',
  standalone: true,
  imports: [ChartComponent, AxisComponent, CirclesComponent],
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css']
})
export class ScatterComponent implements AfterContentInit, OnChanges {
  @Input() data!: any[] // Array<object>
  @Input() xLabel: string = ''
  @Input() yLabel: string = ''
  @Input() xAccessor!: AccessorType
  @Input() yAccessor!: AccessorType
  public keyAccessor: AccessorType = (i:number) => i
  public dimensions: DimensionsType
  public xScale!: ScaleType
  public yScale!: ScaleType
  public xAccessorScaled!: AccessorType
  public yAccessorScaled!: AccessorType
  @ViewChild('container', {static: true}) container!: ElementRef

  public zero: string[] = ["0"]
  public hundredPct: string[] = ["100%"]
  
  constructor() {
    this.dimensions = {
      marginTop: 40,
      marginRight: 30,
      marginBottom: 75,
      marginLeft: 75,
      height: 500,
      width: 500,
    }
    this.dimensions = {
      ...this.dimensions,
      boundedHeight: Math.max(this.dimensions.height - this.dimensions.marginTop - this.dimensions.marginBottom, 0),
      boundedWidth: Math.max(this.dimensions.width - this.dimensions.marginLeft - this.dimensions.marginRight, 0),
    }
  }

  ngAfterContentInit() {
    this.dimensions.width = this.container.nativeElement.offsetWidth
    this.dimensions.boundedWidth = Math.max(
      this.dimensions.width
        - this.dimensions.marginLeft
        - this.dimensions.marginRight,
      0
    )
    this.updateScales()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateScales()
  }

  updateScales() {
    this.xScale = d3.scaleLinear()
      .domain(d3.extent(this.data, this.xAccessor) as Iterable<number>)
      .range([0, this.dimensions.boundedWidth] as Iterable<number>)
      .nice()

    this.yScale = d3.scaleLinear()
      .domain(d3.extent(this.data, this.yAccessor) as Iterable<number>)
      .range([this.dimensions.boundedHeight, 0] as Iterable<number>)
      .nice()

    this.xAccessorScaled = (d:any) => this.xScale(this.xAccessor(d))
    this.yAccessorScaled = (d:any) => this.yScale(this.yAccessor(d))
  }
}
