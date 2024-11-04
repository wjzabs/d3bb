import { Component, Input, ViewChild, ElementRef, AfterContentInit, OnChanges, SimpleChanges, HostListener, OnInit } from '@angular/core'
import * as d3 from "d3"
import { getUniqueId } from '../chart/utils'
import { DimensionsType, ScaleType, AccessorType } from '../utils/types'
import { ChartComponent } from '../chart/chart.component'
import { NgFor } from '@angular/common'
import { LineComponent } from '../chart/line/line.component'
import { AxisComponent } from '../chart/axis/axis.component'
import { GradientComponent } from '../chart/gradient/gradient.component'

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [ChartComponent, NgFor, LineComponent, AxisComponent, GradientComponent],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit, AfterContentInit, OnChanges {
  @Input() data: any[] = [] // Array<object>
  @Input() label: string = '';
  @Input() xAccessor!: AccessorType
  @Input() yAccessor!: AccessorType
  public dimensions: DimensionsType
  public xScale!: ScaleType
  public yScale!: ScaleType
  public xAccessorScaled!: AccessorType
  public yAccessorScaled!: AccessorType
  public y0AccessorScaled!: AccessorType
  public formatDate: (date: Date) => string = d3.timeFormat("%-b %-d")
  public gradientId: string = getUniqueId("Timeline-gradient")
  public gradientColors: string[] = ["rgb(226, 222, 243)", "#f8f9fa"]
  @ViewChild('container', {static: true}) container!: ElementRef

  public zero: string[] = ["0"]
  public hundredPct: string[] = ["100%"]

  constructor() {
    this.dimensions = {
      marginTop: 40,
      marginRight: 30,
      marginBottom: 75,
      marginLeft: 75,
      height: 300,
      width: 600,
    }
    this.dimensions = {
      ...this.dimensions,
      boundedHeight: Math.max(this.dimensions.height
        - this.dimensions.marginTop
        - this.dimensions.marginBottom, 0),
      boundedWidth: Math.max(this.dimensions.width
        - this.dimensions.marginLeft
        - this.dimensions.marginRight, 0),
    }
  }

  ngOnInit(): void {
    // console.log(this.data)
  }
  
  @HostListener('window:resize') windowResize() {
    this.updateDimensions()
  }

  updateDimensions() {
    const width = this.container.nativeElement.offsetWidth
    this.dimensions.width = width
    this.dimensions.boundedWidth = Math.max(
      this.dimensions.width
        - this.dimensions.marginLeft
        - this.dimensions.marginRight,
      0
    )
    this.updateScales()
  }

  ngAfterContentInit() {
    this.updateDimensions()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateScales()

    // console.log('this.data[10]', this.data[10])
    // console.log('this.xAccessorScaled', this.xAccessorScaled(this.data[10]))
    // console.log('this.yAccessorScaled', this.yAccessorScaled(this.data[10]))
  }

  updateScales() {
    this.xScale = d3.scaleTime()
      .domain(d3.extent(this.data, this.xAccessor) as Iterable<Date | number>)
      .range([0, this.dimensions.boundedWidth] as Iterable<number>)

    this.yScale = d3.scaleLinear()
      .domain(d3.extent(this.data, this.yAccessor) as Iterable<number>)
      .range([this.dimensions.boundedHeight, 0] as Iterable<number>)
      .nice()

    this.xAccessorScaled = (d:any) => this.xScale(this.xAccessor(d))
    this.yAccessorScaled = (d:any) => this.yScale(this.yAccessor(d))
    this.y0AccessorScaled = this.yScale(this.yScale.domain()[0])
  }

}
