import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

@Component({
  selector: 'app-mapsales',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mapsales.component.html',
  styleUrl: './mapsales.component.scss'
})
export class MapsalesComponent implements OnInit, OnChanges {

  private svg: any;
  private tooltip: any;
  public YP_selected: string = '202409'
  public zip2FIPS_All: any[] = [];

  ngOnInit(): void {
    this.createSvg();
    this.drawMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes['isPrimaryMember']) {
      if (this.YP_selected ===  this.YP_selected)
        console.log(this.YP_selected, changes)
    }
  }

  YP_changed() {
    console.log(this.YP_selected)
    this.drawMap();
  }

  private createSvg(): void {
    // use this if you have an svg element already in the html
    // this.svg = d3.select('#map')
    //   .append('g')
    //   .attr('transform', 'translate(0,0)'); 

    // use this if you have a div element in the html at the place where you want the svg
    this.svg = d3.select('#wrapper')
      .append('svg')
        .attr("width", 960)
        .attr("height", 600)
      // .append('g')
      //   .attr('transform', 'translate(0,0)');

    this.tooltip = d3.select('#tooltip');
  }

  async drawMap() {
    const width = 960;
    const height = 600;

    const projection = d3.geoConicEqualArea() // d3.geoAlbersUsa()
    // const projection = d3.geoPath()
      .center([-73, 41]) // .translate([width / 2, height / 2])
      .scale(30000); //       .scale(1280);
      
    // https://d3js.org/d3-geo/projection

    const projection2 = d3.geoPath()
      // .translate([width / 2, height / 2])
      // .scale(1280);

    const path = d3.geoPath().projection(projection);
    const path2 = d3.geoPath().projection();

    let features: any[] = [];
    let FIPS: any = {};
    let zip2FIPS: any[] = [];
    // let zip2FIPS_All: any[] = [];
    let ZIPs: any = {}

    let us10m:any = await d3.json('assets/us-10m.v1.json')
    console.log({us10m})


    let us: any;

    us = await d3.json('assets/us-states.json')
    // await d3.json('assets/us-states.json').then(readyStates.bind(this))
    // await d3.json('assets/us-states.json').then((data: any) => {
    //   us = data;
    //   console.log({us})
    // })
    console.log({usfeatures: us.features})

    await d3.json('assets/cb_2017_us_county_20m.json').then((data: any) => {
      features = data.features;
      console.log({features})
    })
    await d3.json('assets/state-fips-xref.json').then((data: any) => {
      FIPS = data;
    })
    await d3.json('assets/dataLabSales.json').then((data: any) => {
      this.zip2FIPS_All = data;
      zip2FIPS = this.zip2FIPS_All.filter(x => x.OPS_YYYYPP === this.YP_selected)
    })

    // features = us10m.objects.counties.geometries
    // us = us10m.objects.states.geometries

    features = features.map((feature: any) => {
      let STATEFP = feature.properties.STATEFP;
      let state = FIPS[STATEFP] || {abbreviation: '??', name: '?'}
      let STATEFP_code: string = feature.properties.STATEFP;
      if (STATEFP_code.length === 4) {STATEFP_code = "0" + STATEFP_code}
      let FIPS_code = feature.properties.STATEFP + feature.properties.COUNTYFP;
      let zip2FIPS_record = zip2FIPS.find (x => { return x.FIPS === FIPS_code})
      
      let AMT_SOLD = 0;
      if (zip2FIPS_record) {
        AMT_SOLD = zip2FIPS_record.AMT_SOLD
      }
      return {...feature, state, data: AMT_SOLD}
    })

    const NYFeatures = features.filter(x => x.state.abbreviation == 'NY')
    console.log({NYFeatures, coords: path.centroid(NYFeatures[0])});

    console.log({features});
    console.log({FIPS});
    console.log({zip2FIPS});

    // https://stackoverflow.com/questions/41848677/how-to-make-a-color-scale-in-d3-js-to-use-in-fill-attribute

    let maxData = d3.max(features, function(d) {return d.data;});
    let minData = d3.min(features, function(d) {return d.data;});

    console.log({minData, maxData})

    let colorCodes = ['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b']

    const xScale = d3.scaleLog([1, d3.interpolateBlues.length], [minData, maxData]);
    const xx = d3.scaleLog([1, 10], [0, 960]);

    // let magnitude = d3.scaleSequentialLog(d3.interpolateBlues).domain([minData, maxData])
    let magnitude = d3.scaleSequentialLog(d3.interpolatePuBuGn).domain([minData, maxData])

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

    
    // let colour_range = ["#6AE817","#FFA200", "#B30409"]
    //      //Map colours across the range in equal intervals
    //      let num_colours = colour_range.length
    //      let diff = maxData - minData // range[1] - range[0]
    //      let logScale =  d3.scaleLog().domain([minData, maxData]).range([0,500])
    //      let step = diff / (colour_range.length - 1)
    //      let for_inversion = d3.range(num_colours).map(function(d) {return 0 + d*step})
    //      let log_colour_values = for_inversion.map(logScale.invert)
    // let logColour_scale = d3.scaleLog().domain(log_colour_values).range(colour_range)

    // Legend
    
    const legendWidth = 260;

    const preScale = d3.scaleLog()
      .domain([1, maxData])
      .range([0,1])

      // console.log('preScale.range', preScale.range())

    let x = d3.scaleLog() //  d3.scaleLinear()
    .domain([1, maxData])
    .rangeRound([0, legendWidth]);

    let colorLegend = d3.scaleQuantile() // d3.scaleThreshold()
    .domain(preScale.range())
    // .domain([minData, maxData])
    // .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9] as Iterable<number>);
console.log(d3.schemeBlues[9], d3.schemeBlues[9].length)
    let g = this.svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(600,40)");
    
    console.log("quantiles", colorLegend.quantiles())

    const rectWidth = legendWidth / colorLegend.range().length;

    g.selectAll("rect")
    .data(colorLegend.range().map((color:any, i:number) => ({color, i})))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d:any, i:number) { return i * rectWidth })
    .attr("y", -6)
    .attr("width", function(d:any) { return rectWidth })
    .attr("fill", function(d:any, i:number) { return colorLegend.range()[i] })
    .on("mouseover", (event: any, d:any) => {console.log({event, d})})

    g.append("rect")
      .attr("y", -6)
      .attr("height",8)
      .attr("width", legendWidth)
      .style("fill", "none")
      .style("stroke", "black")

    g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -12)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Monthly Sales");

    g.call(
    d3
    .axisBottom(x)
    .ticks(4)
    .tickSizeInner(13)
    .tickSizeOuter(0)
    .tickFormat(function(x:any, i:any) { return `$${x/1000}K` })
    // .tickValues(color.domain())
    )
    .select(".domain")
    .remove();

    let gCounties = this.svg.append('g')
    .attr("class", "counties")

    gCounties
    .selectAll('path')
    .remove()

    gCounties.selectAll('path') // this.svg.selectAll('path')
        .data(NYFeatures) // .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', function (d:any, i:number) {
          // return myColor(d.data)
          // console.log(d.data, preScale(d.data))
          return (d.data == 0) ? 'white' : colorLegend(preScale(d.data))
        })
        .attr('stroke', "gray") // '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event: any, d: any) => {

          this.tooltip.transition().duration(100).style('opacity', 0.9);
          this.tooltip.html(`County: ${d.properties.STATEFP}${d.properties.COUNTYFP} - ${d.properties.NAME}<br>State: ${d.properties.STATEFP} ${d.state.name}<br>ALAND: ${round(d.properties.ALAND,0)}<br>Sales: ${d3.format("$,.0f")(d.data)}`)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
            // console.log('mouseover', d)
        })
        .on('mouseout', () => {
          this.tooltip.transition().duration(1500).style('opacity', 0);
        });

        // const path2 = d3.geoPath();

    this.svg
    .append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(us.features)
    .enter()
    .append("path")
    .attr("d", path2)
    .attr("fill", "none")
    .attr("stroke", "black")

    // .attr("d", path as d3.ValueFn<SVGPathElement, unknown, string | number | boolean | readonly (string | number)[] | null>)



    console.log(this.svg)
  }

  // readyStates(svg:any, us: any) {
  //   // console.log(us.features)
  //   svg
  //   .append("g")
  //   .attr("class", "states")
  //   .selectAll("path")
  //   .data(us.features)
  //   .enter()
  //   .append("path")
  //   .attr("fill", "none")
  //   .attr("stroke", "white")
  //   .attr("d", path as d3.ValueFn<SVGPathElement, unknown, string | number | boolean | readonly (string | number)[] | null>)
  // }


  
  playClick() {
    // if (this.caption === "Play") {
      this.startInterval()
    // } else {
    //   this.stopInterval()
    // }
  }

  public intervalId: any;

  async startInterval() {
    let YPi = -1
    let YPs = ["202401","202402","202403","202404","202405","202406","202407","202408","202409"]
    // this.caption = "Pause"
    // console.log(this.caption)
    // if (this.sliderValue === +this.slider.nativeElement.max) {
    //   console.log(this.sliderValue, this.slider.nativeElement.max)
    //   this.sliderValue = 0
    // }
    this.intervalId = setInterval(() => {
      if (YPi === YPs.length -1 ) {
        console.log('stopping interval')
        this.stopInterval();
      } else {
  
        YPi +=1
        this.YP_selected = YPs[YPi]
        // this.drawMap()


        let zip2FIPS = this.zip2FIPS_All.filter(x => x.OPS_YYYYPP === this.YP_selected)

        // d3.selectAll(".data")
        // .transition()
        // .duration(500)
        // .attr("cx", (d: any) => this.scaleX(d.x) || 0)
        // .attr("cy", (d: any) => this.scaleY(d.y))
        // .attr("r", (d: any) => this.scaleR(d.r))
   
        // console.log(this.data[255])
  

      }
    }, 1500)
  }
  
  stopInterval() {
    // this.caption = "Play"
    clearInterval(this.intervalId);
    console.log('interval stopped')
  }
  
}
