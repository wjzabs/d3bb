import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherComponent implements OnInit {
  async ngOnInit() {
    drawLineChart() // drawLineChart<weather>()
  }
}
// export interface weather {
//   temperatureMax: number,
//   date: string
// }

async function drawLineChart() { // drawLineChart<T>() {

  // const dataset = await <Promise<T[]>>d3.json("assets/weather.json")
  // const dataset = await <Promise<weather[]>>d3.json("assets/weather.json")
  const dataset = await <Promise<any[]>>d3.json("assets/weather.json")
  // let dataset: weather[] = []
  // await d3.json("assets/weather.json").then (
  //   (data:any) => {
  //     dataset = data;
  //   }
  // )

  console.table((dataset as any[])[0])
  
  console.log('check out date - now', dataset[0].date, dataset[0])
  dataset[0].date="2019-01-01"

  const yAccessor = (d:any) => (d['temperatureMax'] as number) || 0
  const dateParser = d3.timeParse("%Y-%m-%d")
  const xAccessor = (d:any) => (dateParser(d.date) as Date)
  
  const dateParserYYYYPP = d3.timeParse("%Y%m")
  console.log(dateParserYYYYPP("202409"))

  // 2. Create chart dimensions

  let dims = {
    width: window.innerWidth * 0.9,
    height: 400,
    innerWidth: 0,
    innerHeight: 0,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }

  dims.innerWidth = dims.width
    - dims.margin.left
    - dims.margin.right
  dims.innerHeight = dims.height
    - dims.margin.top
    - dims.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dims.width)
      .attr("height", dims.height)
      .style("outline", "1px solid red")
      
  const chart = wrapper.append("g")
  .style("transform", `translate(
    ${dims.margin.left}px, 
    ${dims.margin.top}px)`)
  .style("outline", "1px solid blue")
    
  // 4. Create scales

  const yScale = d3.scaleLinear()
    // .domain(d3.extent(dataset, yAccessor))
    // https://stackoverflow.com/questions/52124689/argument-of-type-string-string-error-in-angular-and-d3
    .domain(<[number, number]>d3.extent(dataset, yAccessor))
    // .domain([31,70]) // with this domain you can see what happens to points that plot off the svg
    .range([dims.innerHeight, 0])

const freezingTemperaturePlacement = yScale(32)
const freezingTemperatures = chart.append("rect")
    .attr("x", 0)
    .attr("width", dims.innerWidth)
    .attr("y", freezingTemperaturePlacement)
    .attr("height", dims.innerHeight
      - freezingTemperaturePlacement)
    .attr("fill", "#e0f3f3")

  const chartTitle = chart.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text", "NYC High Temperatures by Day")
    .attr("fill", "#e0f3f3")

const xScale = d3.scaleTime()
  // .domain(d3.extent(dataset, xAccessor))
  // https://stackoverflow.com/questions/52124689/argument-of-type-string-string-error-in-angular-and-d3
  .domain(<[Date, Date]>d3.extent(dataset, xAccessor))
  .range([0, dims.innerWidth])

  // 5. Draw data

  const lineGenerator = d3.line()
    .x((d:any) => xScale(xAccessor(d)))
    .y((d:any) => yScale(yAccessor(d)))

  const line = chart.append("path")
      .attr("d", lineGenerator(dataset))
      .attr("fill", "none")
      .attr("stroke", "#af9358")
      .attr("stroke-width", 2)
      .style("outline", "1px solid orange")

  // 6. Draw peripherals

  const yAxisGenerator = d3.axisLeft(yScale) // or .scale(yScale)
  const yAxis = chart.append("g")
    // .call(yAxisGenerator)
  yAxisGenerator(yAxis)

  const yAxisGenerator2 = d3.axisRight(yScale) // or .scale(yScale)
  const yAxis2 = chart.append("g")
      .style("color", "orange")
    .call(yAxisGenerator2)
  

  const xAxisGenerator = d3.axisBottom(xScale) // .scale(xScale)
  const xAxis = chart.append("g")
    .call(xAxisGenerator)
      .style("transform", `translateY(${dims.innerHeight}px)`)      
}
