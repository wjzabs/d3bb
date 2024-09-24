import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties, Geometry, GeometryCollection } from 'geojson';
import topojson from 'topojson';
// import {topology, feature } from 'topojson';
// import * as topojson from 'topojson' // '@types/topojson';
// import * as topojson from '@types/topojson';
// import * as topojson from 'topojson-client';
// import { GeometryCollection } from 'topojson-specification'
// import * as topojson from 'topojson-client';


@Component({
  selector: 'app-choropleth2',
  standalone: true,
  imports: [],
  templateUrl: './choropleth2.component.html',
  styleUrl: './choropleth2.component.scss'
})
export class Choropleth2Component {

  // https://stackoverflow.com/questions/44687090/how-to-include-ts-topojson-into-angular2-app

  // https://creatingwithdata.com/choropleth-map/

  // https://gist.github.com/mbostock/4060606

  // where do we get the us.json file?
  //   You can either get it or make it.

  // Here's how to make it:
  // http://bost.ocks.org/mike/bubble-map/

  // Here's just a download:
  // http://bost.ocks.org/mike/bubble-map/us.json
  // or maybe this one:
  // http://bl.ocks.org/mbostock/raw/4090846/us.json

  //   Download the us.json file from the second source:
  // http://bl.ocks.org/mbostock/raw/4090846/us.json
  // This one works OK for me. (works fine with firefox and safari, but showing nothing with Chrome)

  // BTW, the us.json file from the first source:
  // http://bost.ocks.org/mike/bubble-map/us.json
  // provided me a wrong image same as @anandongithub mentioned above.

  async ngOnInit() {

    let svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    let unemployment = new Map(); // d3.map();

    let path = d3.geoPath();
    // const projection = d3.geoAlbersUsa()
    //   .translate([width / 2, height / 2])
    //   .scale(1000);
    //   // .scale([1000]);
    // const path = d3.geoPath().projection(projection);

    let x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

    let color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9] as Iterable<number>); // this needs to be de-remmed

    console.log('schemeBlues[9]: ', d3.schemeBlues[9] )

    let g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

    g.selectAll("rect")
    .data(color.range().map(function(d:any) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

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

    await d3.tsv("assets/unemployment.tsv").then(async (data) => {
      data.forEach((d:any) => {unemployment.set( ('00000'+d.id).slice(-5) , +(d.rate * 100).toFixed(2)); });
      // d3.json("https://d3js.org/us-10m.v1.json").then(ready);
      // d3.json('assets/us-10m.v1.json').then(ready)
      await d3.json('assets/us-counties.json').then(ready.bind(this))
      await d3.json('assets/us-states.json').then(readyStates.bind(this))
    })

console.log({unemployment});

    // .data(topojson.feature(us, us.objects.counties).features)

    // https://www.google.com/search?q=d3+convert+topology+to+features&sca_esv=414fa47fd96e69ee&sca_upv=1&rlz=1C1GCEU_enUS1025US1025&sxsrf=ADLYWIIJFMqwFTo-7cjMXP0URkPB2e23WQ%3A1727115065181&ei=Oa_xZojSCtnm5NoPlNOqMA&ved=0ahUKEwjI0sj_1NmIAxVZM1kFHZSpCgYQ4dUDCA8&uact=5&oq=d3+convert+topology+to+features&gs_lp=Egxnd3Mtd2l6LXNlcnAiH2QzIGNvbnZlcnQgdG9wb2xvZ3kgdG8gZmVhdHVyZXMyBRAhGKABMgUQIRigAUjqD1CnClinCnABeAGQAQCYAVygAVyqAQExuAEDyAEA-AEBmAICoAJnwgIKEAAYsAMY1gQYR5gDAIgGAZAGBpIHATKgB9sC&sclient=gws-wiz-serp
    // topo2geo
    // A tool that converts TopoJSON objects to GeoJSON features. 
    // For example, to convert the "states" TopoJSON GeometryCollection object in us.json to a GeoJSON feature collection
    //  in us-states.json, use the command topo2geo states=us-states.json < us.json.
    // topo2geo counties=us-counties.json < us-10m.v1.json
    // topo2geo states=us-states.json < us-10m.v1.json

    
    // topo2geo counties=us-counties.json < us-10m.v1.json
    // topo2geo states=us-states.json < us-10m.v1.json

    // https://stackoverflow.com/questions/56022205/property-features-does-not-exist-on-type-featurepoint-name-string-any
    // https://stackoverflow.com/questions/56022205/property-features-does-not-exist-on-type-featurepoint-name-string-any
    
    // mapFeatures to GeoJSON.FeatureCollection
    function ready(us: any) {
      console.log({us});
      // let geojson = topojson.feature(us, us.objects.counties);
      // let mapFeatures: FeatureCollection<Geometry, GeoJsonProperties> = topojson.feature(us, us.objects.counties)
      svg
        .append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(us.features)
        // .data(us.objects.counties)
        // .data(us.objects.counties.geometries)
        // .data((geojson.features))
        // .data((topojson.feature(us, us.objects.counties) as GeometryCollection).features)
        // .data(mapFeatures.features)
        .enter()
        .append("path")
        .attr("fill", function (d:any) {
          // console.log(d.id, unemployment.get(d.id))
          return color((d.rate = unemployment.get(d.id)));
        })
        .attr("d", path as d3.ValueFn<SVGPathElement, unknown, string | number | boolean | readonly (string | number)[] | null>) // this needs to be de-remmed
        .append("title")
        .text(function (d:any) {
          return d.rate + "%"
        });

        console.log({svg})

    }

    function readyStates(us: any) {
      console.log({us});

      svg
      .append("g")
      .attr("class", "states")
      .selectAll("path")
      // .datum(
      //   topojson.mesh(us, us.objects.states, function (a,b) {
      //     return a != b;
      //   })
      // )
      .data(us.features)
      .enter()
      .append("path")
      .attr("fill", "none")
      // .attr("stroke", "white")
      .attr("d", path as d3.ValueFn<SVGPathElement, unknown, string | number | boolean | readonly (string | number)[] | null>) // this needs to be de-remmed  
      
      console.log({svg})
    }

    // d3.queue()
    // .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    // .defer(d3.tsv, "unemployment.tsv", function(d: any) { unemployment.set(d.id, +d.rate); })
    // .await(ready);

    // function ready(error: any, us: any) {
    // if (error) throw error;

    // .data(topojson.feature(us, us.objects.counties).features)

    // svg.append("g")
    //   .attr("class", "counties")
    // .selectAll("path")
    // .data(topojson.feature(us, us.objects.counties).geometry)
    // .enter().append("path")
    //   .attr("fill", function(d) { return color(d.rate = unemployment.get(d.id)); })
    //   .attr("d", path)
    // .append("title")
    //   .text(function(d) { return d.rate + "%"; });

    // svg.append("path")
    //   .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    //   .attr("class", "states")
    //   .attr("d", path);
    // }

  }  

}
