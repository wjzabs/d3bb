// import 'zone.js'
import { Component } from '@angular/core'
import * as d3 from "d3"
import { getTimelineData, getScatterData } from "./utils/dummyData"
import { AccessorType } from './utils/types';
import { TimelineComponent } from './timeline/timeline.component';
import { ChartComponent } from './chart/chart.component';
import { ScatterComponent } from './scatter/scatter.component';
import { HistogramComponent } from './histogram/histogram.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChartComponent, TimelineComponent, ScatterComponent, HistogramComponent],
  templateUrl: './amelia.component.html',
  styleUrls: ['./amelia.component.css'],
})
export class AmeliaComponent {
  timelineData: Array<timelineDataPoint>
  scatterData: Array<scatterDataPoint>

  parseDate!: (value: string) => Date | null // object
  dateAccessor!: AccessorType
  temperatureAccessor!: AccessorType
  humidityAccessor!: AccessorType

  constructor() {
    this.timelineData = []
    this.scatterData = []
  }

  ngOnInit() {
    this.parseDate = d3.timeParse("%m/%d/%Y")
    this.dateAccessor = d => this.parseDate(d.date)
    this.temperatureAccessor = d => d.temperature
    this.humidityAccessor = d => d.humidity
    this.getData()
    // setInterval(() => this.getData(), 4000)
  }


  getData(): void {
    this.timelineData = getTimelineData()
    this.scatterData = getScatterData()

    // console.log('timelineData', this.timelineData)
    // console.log('scatterData', this.scatterData)
  }
}

interface timelineDataPoint {
  date: string
  temperature: number
  key?: any
}

interface scatterDataPoint {
  temperature: number
  humidity: number
  key?: any
}