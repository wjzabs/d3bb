import { Component, ElementRef, Inject, Injectable, InjectionToken, OnInit } from '@angular/core';
import * as d3 from 'd3';

export const CONFIG_TOKEN = new InjectionToken<TokenConfig>('config_token');
export interface TokenConfig {
  color: string;
  msg: string;
}

// https://medium.com/ngconf/configure-your-angular-apps-with-an-injection-token-be16eee59c40

@Injectable()
export class test {
  constructor(
    @Inject(CONFIG_TOKEN) private config: TokenConfig,
    // private config: TokenConfig,
  ) {

  console.log('inside test: ', {config})

  }
}

export const APP_CONFIG_red: TokenConfig = {
  color: 'red',
  msg: 'www.red-product.com'
};
export const APP_CONFIG_blue: TokenConfig = {
  color: 'blue',
  msg: 'www.blue-product.com'
};

@Component({
  selector: 'app-mapsales2',
  standalone: true,
  imports: [],
  templateUrl: './mapsales2.component.html',
  styleUrl: './mapsales2.component.scss',
  providers: [
    { provide: CONFIG_TOKEN, useValue: APP_CONFIG_red },
    test
  ]
})
export class Mapsales2Component {

  private tooltip: any;

  constructor (
    @Inject(CONFIG_TOKEN) private config: TokenConfig,
    private element: ElementRef,
    private tester: test
  ) {
    let tester2 = new test(APP_CONFIG_blue)
    console.log('inside component: ', {config, tester, tester2})
  }
  ngOnInit() {
    this.tooltip = d3.select('#tooltip');
    this.chart(this.element.nativeElement);
  }

  async chart(parentNode: any)
  {
    let width = 960;
    let height = 600;

    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);
  
        console.log({width, height})
  
  
    let features: any[] = [];

    await d3.json('assets/cb_2017_us_county_20m.json').then((data: any) => {
      features = data.features;
      console.log({features})
    })
    // await d3.json('assets/state-fips-xref.json').then((data: any) => {
    //   FIPS = data;
    // })
    // await d3.json('assets/dataLabSales.json').then((data: any) => {
    //   this.zip2FIPS_All = data;
    //   zip2FIPS = this.zip2FIPS_All.filter(x => x.OPS_YYYYPP === this.YP_selected)
    // })

    // features = us10m.objects.counties.geometries
    // us = us10m.objects.states.geometries

    const projection = d3.geoAlbersUsa()
    // const projection = d3.geoPath()
      .translate([width / 2, height / 2])
      .scale(1280);
    const path = d3.geoPath().projection(projection);

    let maxData = d3.max(features, function(d) {return d.data;});
    let minData = d3.min(features, function(d) {return d.data;});


    let color = d3.scaleSequential() // magnitude // d3.scaleSequentialLog(d3.interpolateBlues) // d3.scaleSequential() // xScale // d3.scaleSequential()
      .domain([minData, maxData])
      // .interpolate(colorCodes)
      .interpolator(d3.interpolateBlues);

console.log('interpolateBlues', d3.interpolateBlues)
console.log('schemeSet3', d3.schemeSet3)

      let myColor = d3.scaleOrdinal().domain([minData, maxData])
  .range(d3.schemeBlues[9]) // (colorCodes) // (d3.schemeSet3);
console.log('d3.schemeBlues', d3.schemeBlues)
      const round = (num:number, digits: number) => {
      const multiplier = Math.pow(10, digits) * 2;
      const value = Math.round(num * multiplier) / multiplier;
      return value.toFixed(digits);
    }

    let gCounties = svg.append('g')
    .attr("class", "counties")

    gCounties
    .selectAll('path')
    .remove()

    // .attr('fill', (d:any, i:number) => {color(d.data)})

    gCounties.selectAll('path') // this.svg.selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', (d:any, i:number) => { return "red"})
        .attr('stroke', '#fff')
        .on('mouseover', (event: any, d: any) => {
          // console.log(d)
          // d.properties
          // AFFGEOID: "0500000US01013"
          // ALAND: 2011985458
          // AWATER: 2718248
          // COUNTYFP: "013"
          // COUNTYNS: "00161532"
          // GEOID: "01013"
          // LSAD: "06"
          // NAME: "Butler"
          // STATEFP: "01"

          this.tooltip.transition().duration(200).style('opacity', 0.9);
          this.tooltip.html(`County: ${d.properties.STATEFP}${d.properties.COUNTYFP} - ${d.properties.NAME}<br>State: ${d.properties.STATEFP}<br>ALAND: ${round(d.properties.ALAND,0)}<br>Sales: ${d3.format("$,.0f")(100)}`)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
          this.tooltip.transition().duration(500).style('opacity', 0);
        });


        // this.tooltip.html(`County: ${d.properties.STATEFP}${d.properties.COUNTYFP} - ${d.properties.NAME}<br>State: ${d.properties.STATEFP} ${d.state.name}<br>ALAND: ${round(d.properties.ALAND,0)}<br>Sales: ${d3.format("$,.0f")(d.data)}`)
        // .style('left', (event.pageX + 5) + 'px')
        // .style('top', (event.pageY - 28) + 'px');

        // const path2 = d3.geoPath();



    parentNode.appendChild(svg.node())
  }

  map(parentNode: any) {

  }
}

function _1(md:any){return(
  md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Plot: Choropleth</h1><a href="/plot">Observable Plot</a> › <a href="/@observablehq/plot-gallery">Gallery</a></div>
  
  # Choropleth
  
  Unemployment rate by U.S. county, August 2016. Data: [Bureau of Labor Statistics](http://www.bls.gov/lau/#tables). We use the [geo mark](https://observablehq.com/plot/marks/geo) to paint each county with a color representing the unemployment rate, and render a white mesh of the states boundaries on top. A [centroid transform](https://observablehq.com/plot/transforms/centroid) and extra channels support [interactive tips](https://observablehq.com/plot/features/interactions). See the [D3 version](/@d3/choropleth/2).`
  )}

  
function _2(Plot: any,counties: any,unemployment: any,statemap: any,states: any){return(
  Plot.plot({
    width: 975,
    height: 610,
    projection: "identity",
    color: {
      type: "quantize",
      n: 9,
      domain: [1, 10],
      scheme: "blues",
      label: "Unemployment rate (%)",
      legend: true
    },
    marks: [
      Plot.geo(counties, Plot.centroid({
        fill: (d:any) => unemployment.get(d.id),
        tip: true,
        channels: {
          County: (d:any) => d.properties.name,
          State: (d:any) => statemap.get(d.id.slice(0,2)).properties.name
        }
      })),
      Plot.geo(states, {stroke: "white"})
    ]
  })
  )}
  
  function _3(md:any){return(
  md`In the *unemployment* dataset, we don’t use automatic type inference for CSV (*a.k.a.*, typed: true) as that would coerce the FIPS identifiers to numbers, which then wouldn’t match the identifiers in our GeoJSON. However, we still want to coerce the *rate* values to numbers, so we do that explicitly. While we’re at it, we store the values in a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object for fast lookups.`
  )}
  
  async function _unemployment(FileAttachment:any){return(
  new Map((await FileAttachment("unemployment-x.csv").csv()).map((d:any) => [d.id, +d.rate]))
  )}
  
  function _5(md:any){return(
  md`The geometries used in this example are from the [TopoJSON U.S. Atlas](https://github.com/topojson/us-atlas), which are derived from the U.S. Census Bureau shapefiles, 2017 edition. (There’s also the [TopoJSON World Atlas](https://github.com/topojson/world-atlas), which is derived from [Natural Earth](https://www.naturalearthdata.com).) The *counties* feature collection is all U.S. counties, using the five-digit FIPS identifier. The *statemap* lets us lookup the name of the state that contains a given county; a state’s two-digit identifier corresponds to the first two digits of its counties’ identifiers.`
  )}
  
  function _us(FileAttachment:any){return(
  FileAttachment("counties-albers-10m.json").json()
  )}
  
  function _counties(topojson:any,us:any){return(
  topojson.feature(us, us.objects.counties)
  )}
  
  function _states(topojson:any,us:any){return(
  topojson.feature(us, us.objects.states)
  )}
  
  function _statemap(states:any){return(
  new Map(states.features.map((d:any) => [d.id, d]))
  )}
  
  function _10(md:any){return(
  md`The *statemesh* is just the internal borders between states, *i.e.*, everything but the coastlines and country borders. This avoids an additional stroke on the perimeter of the map, which would otherwise mask intricate features such as islands and inlets. (Try removing the last argument to topojson.mesh below to see the effect.)`
  )}
  
  function _statemesh(topojson:any,us:any){return(
  topojson.mesh(us, us.objects.states, (a:any, b:any) => a !== b)
  )}

