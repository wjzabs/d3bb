import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss'],
})
export class ChoroplethComponent implements OnInit {
  private svg: any;
  private tooltip: any;

  ngOnInit(): void {
    this.createSvg();
    this.drawMap();
  }

  private createSvg(): void {
    this.svg = d3.select('#map')
      .append('g')
      .attr('transform', 'translate(0,0)');

    this.tooltip = d3.select('#tooltip');
  }

  async drawMap() {
    const width = 960;
    const height = 600;

// https://github.com/topojson/us-atlas/tree/master/img

    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1000);
      // .scale([1000]);
    const path = d3.geoPath().projection(projection);
    

    // this site gave us
    // https://github.com/plotly/datasets/blob/95672208c26b44a6e32363b17a35b8caa1b5d2ef/geojson-counties-fips.json

    // counties.json did NOT come from this resource - but this source looks like it might have worked
    // the file came down with the following name: gz_2010_us_050_00_500k.json
    // https://eric.clst.org/tech/usgeojson/  gold page

    // counties.json came from this resource
    // https://gist.githubusercontent.com/sdwfrost/d1c73f91dd9d175998ed166eb216994a/raw/e89c35f308cee7e2e5a784e1d3afc5d449e9e4bb/counties.geojson
    // filename cb_2017_us_county_20m
    // https://github.com/sdwfrost/us-maps
    // https://www.census.gov/geographies/mapping-files/2017/geo/carto-boundary-file.html

    // { "type": "Feature", "properties": { "STATEFP": "36", "COUNTYFP": "103", "COUNTYNS": "00974149", "AFFGEOID": "0500000US36103", "GEOID": "36103", "NAME": "Suffolk", "LSAD": "06", "ALAND": 2360846288, "AWATER": 3785546967 }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ -72.018926, 41.274113999064525 ], [ -71.926802, 41.290121999064453 ], [ -71.917281, 41.251332999064616 ], [ -72.034754, 41.234817999064688 ], [ -72.018926, 41.274113999064525 ] ] ], [ [ [ -73.485365, 40.946396999065968 ], [ -73.436664, 40.934896999066027 ], [ -73.392862, 40.955296999065929 ], [ -73.33136, 40.92959699906605 ], [ -73.235827406678496, 40.906689766598454 ], [ -73.229285, 40.905120999066156 ], [ -73.148994, 40.928897999066052 ], [ -73.144673, 40.955841999065925 ], [ -73.110368, 40.971937999065851 ], [ -73.040445, 40.964497999065891 ], [ -72.859831, 40.966087999065884 ], [ -72.708069, 40.977850999065836 ], [ -72.585327, 40.997586999065732 ], [ -72.504305, 41.04332899906553 ], [ -72.445242, 41.086115999065335 ], [ -72.389809, 41.108303999065235 ], [ -72.354123, 41.139951999065097 ], [ -72.291109, 41.15587399906503 ], [ -72.189163, 41.193548999064873 ], [ -72.182033, 41.178344999064933 ], [ -72.254704, 41.110851999065233 ], [ -72.283093, 41.067873999065426 ], [ -72.217476, 41.040610999065542 ], [ -72.162898, 41.053186999065488 ], [ -72.126704, 41.115138999065216 ], [ -72.084207, 41.101523999065272 ], [ -72.095711, 41.054019999065481 ], [ -72.051928, 41.020505999065627 ], [ -71.959595, 41.071236999065412 ], [ -71.919385, 41.080516999065367 ], [ -71.856214, 41.070597999065406 ], [ -71.936977, 41.006136999065696 ], [ -72.097369, 40.958879999065907 ], [ -72.298727, 40.90315099906617 ], [ -72.39585, 40.866659999066343 ], [ -72.757176, 40.764370999066827 ], [ -72.923214, 40.713281999067071 ], [ -73.012545, 40.679650999067221 ], [ -73.146080869210792, 40.646407967168692 ], [ -73.20844, 40.630883999067464 ], [ -73.306396, 40.620755999067526 ], [ -73.351465, 40.630499999067474 ], [ -73.423976617557202, 40.613244876627064 ], [ -73.423253, 40.670919999067273 ], [ -73.436006, 40.73945799906695 ], [ -73.4385, 40.751310999066881 ], [ -73.462259, 40.86670999906633 ], [ -73.497351038626277, 40.923182272360464 ], [ -73.485365, 40.946396999065968 ] ] ] ] } },
    // d3.json('assets/counties-albers-10m').then((data: any) => {
      
    let features: any[] = [];
    let FIPS: any = {};
    let zip2FIPS: any[] = [];
    let ZIPs: any = {}
    await d3.json('assets/cb_2017_us_county_20m.json').then((data: any) => {
      features = data.features;
    })
    await d3.json('assets/state-fips-xref.json').then((data: any) => {
      FIPS = data;
    })
    await d3.json('assets/data.json').then((data: any) => {
      zip2FIPS = data;
    })
    // zip2fFIPS.map((ZIP: any) => {
    //   ZIPs = {...ZIPs, ZIP.FIPS: {"AMT_SOLD": ZIP.AMT_SOLD }}
    // })

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

    console.log({features});
    console.log({FIPS});
    console.log({zip2FIPS});

    // https://stackoverflow.com/questions/41848677/how-to-make-a-color-scale-in-d3-js-to-use-in-fill-attribute

    let maxData = d3.max(features, function(d) {return d.data;});
    let minData = d3.min(features, function(d) {return d.data;});
    // if (minData < 0) {minData = 0}

    console.log({minData, maxData})

    // let colorCodes = ["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"];
    let colorCodes = ['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b']
    // let colors = d3.scaleQuantile()
    // .domain([minData,maxData])
    // .range(colorCodes);
    
    // let color = d3.scaleLinear<string, number>()
    //   .domain([minData, maxData])
    //   // .range(["red", "blue"]);
    //   .range(colorCodes);

    // https://r-graph-gallery.com/38-rcolorbrewers-palettes
    // https://d3-graph-gallery.com/graph/custom_color.html
    // Option 2: Color brewer.
    // Include <script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script> in your code!
    // https://d3js.org/d3-scale-chromatic/sequential
    let color = d3.scaleSequential()
      .domain([minData, maxData])
      .interpolator(d3.interpolateBlues);
      // .interpolator(d3.interpolatePuRd);

    // let color2 =  d3.scaleThreshold()
    //   .domain(d3.range(minData, maxData))
    //   .range(d3.schemeBlues[9])

    // color: {scheme: "Blues", type: "quantize", n: 9, domain: [1, 10], label: "Unemployment rate (%)", legend: true},
    // let color = {scheme: "Blues", type: "quantize", n: 9, domain: [minData, maxData], label: "Retail Sales", legend: true}

    // .attr('fill', '#abc')

    // let format = d3.format(',');
    const round = (num:number, digits: number) => {
      const multiplier = Math.pow(10, digits) * 2;
      const value = Math.round(num * multiplier) / multiplier;
      // return value.toFixed(digits + 1);
      return value.toFixed(digits);
      // return format(value.toFixed(digits))
      // var x = d3.format("$,.2f")(myVal);  
      // var x = d3.format(",.0f")(d.data); 
    }


    // Legend
    
    let x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

    let colorLegend = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9] as Iterable<number>); // this needs to be de-remmed

    let g = this.svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

    g.selectAll("rect")
    .data(colorLegend.range().map(function(d:any) {
      d = colorLegend.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d:any) { return x(d[0]); })
    .attr("width", function(d:any) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d:any) { return color(d[0]); });

    g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Unemployment rate");

    // .tickFormat(function(x, i) { return i ? x : x + "%"; })
    g.call(
    d3
    .axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x:any, i:any) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
    .select(".domain")
    .remove();






    // d3.json('assets/counties.json').then((data: any) => {
    // d3.json('assets/cb_2017_us_county_20m.json').then((data: any) => {
      this.svg.selectAll('path')
        // .data(data.features)
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('fill', function (d:any, i:number) {
          // console.log({event, d})
          return color(d.data)})
        .attr('stroke', '#fff')
        .on('mouseover', (event: any, d: any) => {
          this.tooltip.transition().duration(200).style('opacity', 0.9);
          // this.tooltip.html(`County: ${d.properties.NAME}<br>Value: ${d.properties.density}`)
          // this.tooltip.html(`County: ${d.properties.NAME}<br>STATEFP: ${d.properties.STATEFP}`)
          this.tooltip.html(`County: ${d.properties.STATEFP}${d.properties.COUNTYFP} - ${d.properties.NAME}<br>State: ${d.properties.STATEFP} ${d.state.name}<br>ALAND: ${round(d.properties.ALAND,0)}<br>Sales: ${d3.format("$,.0f")(d.data)}`)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
          this.tooltip.transition().duration(500).style('opacity', 0);
        });
    // });

// https://d3js.org/d3-geo/conic
// https://d3js.org/d3-geo/conic#geoAlbersUsa

    // https://www.youtube.com/watch?v=FsDyelH58F0
// states https://d3js.org/us-10m.v1.json

    console.log(this.svg)
  }
}
