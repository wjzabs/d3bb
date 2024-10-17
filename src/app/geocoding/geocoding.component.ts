import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-geocoding',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './geocoding.component.html',
  styleUrl: './geocoding.component.scss'
})
export class GeocodingComponent {

  geo_api_key = 'ge-90418a61b93e0051';
  data: any[] = [];

  constructor(
    private http: HttpClient,
  ) { }

  async ngOnInit() {
    await d3.csv("assets/the-counted-2016.csv", (data:any) => {
      // console.log(data)
      return data;
    }).then((data: any[]) => {
      console.log({data})
      this.data = data.slice(0,5);
       
    this.data.forEach((d:any, i:number) => {
      let search:string = d.streetaddress + ", " + d.city + ", " + d.state;
      d.search = search;
      console.log({d})
      setTimeout(() => {
        let url = `https://api.geocode.earth/v1/search?size=1&text=${search}&api_key=${this.geo_api_key}`
        this.http.get(url).subscribe((x:any) =>  {
            console.log('geocode', {d, i, x})
            d.geo = x;
            this.render(this.data)
            return x
        }) 

      }, 1000 + i * 200)        
    })

    this.render(this.data);

    d3.select("button").on("click", () => {
      let rows:any[] = []
      var unprocessed = []
      this.data.forEach(function(d:any) {
        var r = JSON.parse(JSON.stringify(d))
        var selected = r.selected;

        delete r.geo;
        delete r.selected;
        if(selected) {
          r.lat = selected.geometry.coordinates[1]
          r.lng = selected.geometry.coordinates[0]
          rows.push(r)
        } else {
          unprocessed.push(r)
        }
        
      })
      // let csv:any = d3.csv.format(rows)
      let csv:any = rows;
      d3.select("#csvout").text(csv)
      console.log("processed", rows.length)
      console.log("unprocessed", unprocessed.length)
    })

    }).catch (e => console.error(e)) 
  }

  render(data:any[]) {
    let rows = d3.select("#output").selectAll("div.row")
      .data(data)
    let rowEnter = rows.enter().append("div").classed("row", true)
    
    rowEnter.append("div").classed("original", true)
      .text(function(d) { return d.search })
      .on("click", function(d) {
        console.log(d);
      })
    
    let geos = rows
      .filter(function(d) { return !!d.geo })
      .selectAll("div.geo")
      .data(function(d) {
        let features: any[] = [];
        d.geo.features.forEach((f:any) => {
          if(f.properties.region_a === d.state) features.push(f)
        })
        if(features.length) {
          d.selected = features[0];
        }
        return features;
      })
    
    geos.enter().append("div").classed("geo", true)
    .on("click", (g) => {
      let d:any = d3.select(g.parentNode).datum() 
      d.selected = g;
      console.log(d, g);
      
      geos.style("background-color", bgColor)
    })

    function bgColor(g:any){ 
        let d:any = d3.select(g.parentNode).datum();
        if(d.selected === g) {return "#efefef"}
        return "white"
    }

    // geos.style('{"background-color": "blue"}')

    // geos.style(`{
    //   clear: (g:any, i:number) => { 
    //     return ((i === 0) ? "left" : 'right');
    //   },
    //   "background-color": this.bgColor
    // }`)

    // geos.style('{clear: "left", "background-color": #efefef}')

    geos.text(function(g) {
      return g.properties.label
    })
  }
}
