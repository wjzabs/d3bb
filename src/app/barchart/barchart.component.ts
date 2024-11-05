import { Component } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'app-barchart',
  standalone: true,
  imports: [],
  templateUrl: './barchart.component.html',
  styleUrl: './barchart.component.scss'
})
export class BarchartComponent {

  constructor() {
  }

  async ngOnInit() {
    await drawBars()
  }
}

  async function drawBars() {

    // 1. Access data
    // const dataset = await d3.json("./data/my_weather_data.json")
    const dataset = await <Promise<any[]>>d3.json("assets/weather.json")
    console.table(dataset[0])

    // 2. Create chart dimensions

    const width = 500
    let dimensions = {
      width: width,
      height: width * 0.6,
      margin: {
        top: 80,
        right: 50,
        bottom: 50,
        left: 50,
      },
      boundedWidth: 0,
      boundedHeight: 0
    }
    dimensions.boundedWidth = dimensions.width
      - dimensions.margin.left
      - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height
      - dimensions.margin.top
      - dimensions.margin.bottom

    const drawHistogram = (metric: string) => {
      const metricAccessor = (d:any) => d[metric]
      const yAccessor = (d:any) => d.length

    // 3. Draw canvas

      const wrapper = d3.select("#wrapper")
        .append("svg")
          .attr("width", dimensions.width)
          .attr("height", dimensions.height)

      const bounds = wrapper.append("g")
          .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    // 4. Create scales

      const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, metricAccessor) as Iterable<number>)
        .range([0, dimensions.boundedWidth])
        .nice()

        console.log(xScale.domain())
      const xDomain = <[number,number]>xScale.domain()

      const binsGenerator = d3.bin()
        .domain(xScale.domain() as [number,number])
        // .domain(xDomain) // this works too
        .value(metricAccessor)
        .thresholds(8)

      const bins = binsGenerator(dataset)

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, yAccessor)])
        .range([dimensions.boundedHeight, 0])
        .nice()

      // 5. Draw data

      const binGroups = bounds.selectAll("g")
        .data(bins)
        .enter().append("g")

      const barPadding = 1
      const barRects = binGroups.append("rect")
          .attr("x", (d:any) => xScale(d.x0) + barPadding / 2)
          .attr("y", (d:any) => yScale(yAccessor(d))) 

          .attr("width", (d:any) => xScale(d.x1) - xScale(d.x0) - barPadding ) // ******************************************

          // .attr("width", (d:any) => d3.max([
          //   0,
          //   xScale(d.x1) - xScale(d.x0) - barPadding
          // ]))

          .attr("height", (d:any) => dimensions.boundedHeight - yScale(yAccessor(d)))
          .attr("fill", "cornflowerblue")

      const barText = binGroups.filter(yAccessor)
        .append("text")
          .attr("x", (d:any) => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
          .attr("y", (d:any) => yScale(yAccessor(d)) - 5)
          .text(yAccessor)
          .style("text-anchor", "middle")
          .attr("fill", "darkgrey")
          .style("font-size", "12px")
          .style("font-family", "sans-serif")

      const mean = d3.mean(dataset, metricAccessor)
      const meanLine = bounds.append("line")
          .attr("x1", xScale(mean as number))
          .attr("x2", xScale(mean as number))
          .attr("y1", -15)
          .attr("y2", dimensions.boundedHeight)
          .attr("stroke", "maroon")
          .attr("stroke-dasharray", "2px 4px")

      const meanLabel = bounds.append("text")
          .attr("x", xScale(mean as number))
          .attr("y", -20)
          .text("mean")
          .attr("fill", "maroon")
          .style("font-size", "12px")
          .style("text-anchor", "middle")

      // 6. Draw peripherals

      const xAxisGenerator = d3.axisBottom(xScale)
        // .scale(xScale)

      const xAxis = bounds.append("g")
        .call(xAxisGenerator)
          .style("transform", `translateY(${dimensions.boundedHeight}px)`)

      const xAxisLabel = xAxis.append("text")
          .attr("x", dimensions.boundedWidth / 2)
          .attr("y", dimensions.margin.bottom - 10)
          .attr("fill", "black")
          .style("font-size", "1.4em")
          .text(metric)
          .style("text-transform", "capitalize")
    }

    const metrics = [
      "windSpeed",
      "moonPhase",
      "dewPoint",
      "humidity",
      "uvIndex",
      "windBearing",
      "temperatureMin",
      "temperatureMax",
      "visibility",
      "cloudCover",
    ]

    metrics.forEach(drawHistogram)
  }

