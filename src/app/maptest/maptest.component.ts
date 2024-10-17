import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, Inject, Injectable, InjectionToken, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as mapboxgl from 'mapbox-gl';

// these lines typically go into a more globally accessible file like config.ts
export const SVG_CONFIG_TOKEN = new InjectionToken<SVGConfig>('config');
export interface SVGConfig {
  svg: any;
  otherProperty: string;
}

// this section might go into a module.ts but is ok to appear in a standalone component
export const APP_CONFIG: SVGConfig = {
  svg: 'blue',
  otherProperty: 'hi mom'
};

@Component({
  selector: 'app-maptest',
  standalone: true,
  imports: [HttpClientModule],
  // providers: [{ provide: SVG_CONFIG_TOKEN, useValue: APP_CONFIG }],
  templateUrl: './maptest.component.html',
  styleUrl: './maptest.component.scss'
})
export class MaptestComponent implements OnInit {

  geo_api_key = 'ge-90418a61b93e0051';
  data: any[] = [];
  ACCESS_TOKEN = 'pk.eyJ1Ijoid2p6YWJzIiwiYSI6ImNtMjdtMnZ6YTFmdngycW9qdmw0YThvMXEifQ.5AoecNjEcJpmQrygYmhLtw'
  
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v12'; // Use your preferred Mapbox style
  center: [number, number] = [-0.1, 51.51]; // [-76.5, 37.4]; // [-74.5, 40]; // Set your initial map center
  zoom: number = 13.5 // 9; // Set your initial map zoom level
  
  // @ViewChild('.map') mapdiv!: HTMLElement;

  constructor(
    private http: HttpClient,
    // @Inject(APP_CONFIG) private appConfig: SVGConfig,
  ) {
      // console.log(appConfig);
      // this.appConfig = appConfig

   }

  async ngOnInit() {

    // console.log(this.map)

    //     'https://stackoverflow.com/questions/44332290/mapbox-gl-typing-wont-allow-accesstoken-assignment'    // mapboxgl.accessToken = ''
    // (mapboxgl as any).getOwnPropertyDescriptor(mapboxgl, "accessToken").set('pk.eyJ1Ijoid2p6YWJzIiwiYSI6ImNtMjdtMnZ6YTFmdngycW9qdmw0YThvMXEifQ.5AoecNjEcJpmQrygYmhLtw');
    // (mapboxgl as any).accessToken = 'pk.eyJ1Ijoid2p6YWJzIiwiYSI6ImNtMjdtMnZ6YTFmdngycW9qdmw0YThvMXEifQ.5AoecNjEcJpmQrygYmhLtw'

    //Setup mapbox-gl map
    let map = new mapboxgl.Map({
      accessToken: this.ACCESS_TOKEN,
      container: 'map', // container id
      style: this.style, // 'mapbox://styles/enjalot/cihmvv7kg004v91kn22zjptsc', // this.style,
      center:  this.center, // [30.2672, -87.7431], // [-0.1,51.5119112],
      zoom: this.zoom, // 13.5,
    })
    map.dragPan.enable(); // map.dragPan.disable();
    map.scrollZoom.enable(); //  map.scrollZoom.disable();

    
    map.on('load', ()=> {
      // Add our Polygon Datasource
      map.addSource(
        'Austin Hex', 
        {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': [],
            'geometry': {
              'type': 'Polygon',
              'coordinates': [
                [
                  [ -76.592921355615277, 37.427749592004189 ], 
                  [ -76.592921355615277, 37.496912993949898 ], 
                  [ -76.523644348336762, 37.531476492188843 ], 
                  [ -76.454367341058247, 37.496912993949898 ], 
                  [ -76.454367341058247, 37.427749592004189 ], 
                  [ -76.523644348336762, 30.093149704984011 ], 
                  [ -76.592921355615277, 37.427749592004189 ]
                ]
              ]
            }
          }
        }
      );
      // Add our Point Datasource
      map.addSource(
        'Austin Points', 
        {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [-76.593686723567652, 37.582059053494251]
                },
                'properties': {
                  'title': 'Austin 1'
                }
              },
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [-76.463899906620225, 37.551333606714322]
                },
                'properties': {
                  'title': 'Austin 2'
                }
              }
            ]
          }
        }
      );
      
      // Add our Polygon layer referencing our polygon source
      map.addLayer({
          'id': 'Austin Hex',
          'type': 'fill',
          'source': 'Austin Hex', // reference the data source
          'layout': {},
          'paint': {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.5
          }
      });
      // Add our Point layer referencing our point source
      map.addLayer({
        'id': 'Austin Points',
        'type': 'circle', // circle marker types
        'source': 'Austin Points', // reference the data source
        'layout': {},
        'paint': {
          'circle-color': 'orange',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'white'
        }
      });
    });

    
    // this.renderMap()
    
       // Setup our svg layer that we can manipulate with d3
       let container = map.getCanvasContainer()
       let svg = d3.select(container).append("svg") 
   
      //  this.appConfig.svg = svg
              
       let active = true;
       let circleControl = new circleSelector()
       circleControl.svg = svg
       circleControl.callme()
       circleControl.projection(project)
      //  circleControl.inverseProjection((a:any) => {
      //      return map.unproject({x: a[0], y: a[1]});
      //    })
      circleControl.activate(active);
       
       d3.select("#circle").on("click", function() {
         active = !active;
         circleControl.activate(active)
         if(active) {
           map.dragPan.disable();
         } else {
           map.dragPan.enable();
         }
         d3.select(this).classed("active", active)
       })
       
       // Add zoom and rotation controls to the map.
       // map.addControl(new mapboxgl!.Navigation());
       
       function project(d:any) {
         return map.project(getLL(d));
       }
       function getLL(d:any) {
        console.log('in getLL', d)
         return new mapboxgl.LngLat(+d.lng, +d.lat)
       }
     
       await d3.csv("assets/dots.csv", (data:any, i: number) => {
        if (i===0) {
          console.log('csv', data, getLL(data), project(data)) // data[0], getLL(data[0]), project(data[0]))
        }
         return data;
       }).then((data: any[]) => {
   
         console.log({data})
         this.data = data;
   
         let dots = svg.selectAll("circle.dot")
         .data(this.data)
        
         dots.enter().append("circle").classed("dot", true)
           .attr("r", 1)
           .style("fill", "#0082a3")
           .style("fill-opacity", 0.6)
           .style("stroke", "#004d60")
           .style("stroke-width", 1)
           .transition().duration(1000)
           .attr("cx", (d:any) => project(d).x)
           .attr("cy", (d:any) => project(d).y)
           .attr("r", 6)
   
         // circleControl.on("update", function() {
         //   svg.selectAll("circle.dot").style(
         //     "fill", (d:any) {
         //       let thisDist = circleControl.distance(d);
         //       let circleDist = circleControl.distance()
         //       if(thisDist < circleDist) {
         //         return "#ff8eec";
         //       } else {
         //         return "#0082a3"
         //       }
         //     }
         //   )
         // })
         // circleControl.on("clear", function() {
         //   svg.selectAll("circle.dot").style("fill", "#0082a3")
         // })
         
         function render() {
           dots.attr("cx", (d:any) => project(d).x)
           dots.attr("cy", (d:any) => project(d).y)       
           // circleControl.update(svg)
         }
   
         // re-render our visualization whenever the view changes
         map.on("viewreset", function() {
           render()
         })
         map.on("move", function() {
           render()
         })
   
         // render our initial visualization
         render()
       })
  }

  ngOnDestroy() {
    // this.map.remove();
  }

}

// @Injectable()
export class circleSelector {
  public svg: any

    public that = this;
    public circleCenter:any
    public circleOuter:any; //control points
    public circleSelected = false; //have we completed the circle?
    public dragging = false; //track whether we are dragging
    public active = false; // user can turn on/off this behavior
    public container:any // = this.svg; // the container we render our points in

    //we expose events on our component
    public dispatch = d3.dispatch("update", "clear");

    // this will likely be overriden by leaflet projection
    public project = d3.geoMercator();
    public unproject = d3.geoMercator().invert;

  constructor(
    // private svg: any,
    // @Inject(APP_CONFIG) private appConfig: SVGConfig,
  ) {
    // this.svg = appConfig.svg
    // console.log('within constructor', this.svg, this.circleCenter)
  }

  public callme() {
    console.log('within callme', this.svg, this.circleCenter)
    this.initialize();
  }

initialize() {
      this.svg.on("mouseup.circle", () => {
      if(!this.active) return;
      if(this.dragging && this.circleSelected) return;
      
      let p = d3.pointer(this);
      let ll = this.unproject ? this.unproject([p[0],p[1]]) : null
      
      if(this.circleCenter) {
        // if we already have the circle's center and the circle
        // is finished selecting, another click means destroy the circle
        if(!this.circleSelected) {
          // Set the outer point
          this.circleOuter = ll;
          this.circleSelected = true;
        }
      } else {
        // We set the center to the initial click
        this.circleCenter = ll;
        this.circleOuter = ll;
      }
      // we let the user know 
      this.update()
    })
    this.svg.on("mousemove.circle", () => {
      if(!this.active) return;
      if(this.circleSelected) return;
      // we draw a guideline for where the next point would go.
      let p = d3.pointer(this);
      let ll = this.unproject ? this.unproject([p[0],p[1]]) : null
      this.circleOuter = ll;
      this.update();
    })
    
    // let drag = d3.behavior.drag()  // NEED TO CONVERT
    //   .on("drag", (d:any, i:number) => {
    //     if(!this.active) return;
    //     if(this.circleSelected) {
    //       this.dragging = true;
    //       let p = d3.pointer(this.svg.node());
    //       let ll = this.unproject ? this.unproject([p[0],p[1]]) : [0, 0] // {lat:0, lng:0}
    //       if(i) {
    //         this.circleOuter = ll;
    //       } else {
    //         let dlat = this.circleCenter.lat - (ll ? ll[0] : 0) // ll.lat;
    //         let dlng = this.circleCenter.lng - (ll ? ll[1] : 0) // ll.lng;
    //         this.circleCenter = ll;
    //         this.circleOuter.lat -= dlat;
    //         this.circleOuter.lng -= dlng;
    //       }
    //       this.update();
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   })
    //   .on("dragend", (d:any) => {
    //     // kind of a dirty hack...
    //     setTimeout(() => {
    //       this.dragging = false;
    //     },100)
    //   })
        
    // d3.rebind(this, this.dispatch, "on") // NEED TO CONVERT
    return this;

}

distanceC(ll:any) {
  if(!ll) ll = this.circleOuter;
  return this.distance(this.circleCenter, ll)
}

distance(ll0:any, ll1:any) {
  var p0 = this.project(ll0) || [0, 0]
  var p1 = this.project(ll1) || [0, 0]
  // var dist = Math.sqrt(p1.x - p0.x)*(p1.x - p0.x) + (p1.y - p0.y)*(p1.y-p0.y))
  var dist = Math.sqrt((p1[0] - p0[0]) * (p1[0] - p0[0]) + (p1[1] - p0[1]) * (p1[1] - p0[1]))
  return dist;
}

projection (val:any) {
  if(!val) return this.project;
  this.project = val;
  return this;
}

public inverseProjection (val:any) {
  if(!val) return this.unproject;
  this.unproject = val;
  return this;
}
activate (val:any) {
  this.active = val;
  return this;
}

update(g?:any) {
  if(g) this.container = g;
  if(!this.circleCenter || !this.circleOuter) return;
  var dist = this.distance(this.circleCenter, this.circleOuter)
  var circleLasso = this.container.selectAll("circle.lasso").data([dist])
  circleLasso.enter().append("circle").classed("lasso", true)
  .on("click", () => {
    if(!this.active) return;
    // start over
    this.circleCenter = null;
    this.circleOuter = null;
    this.circleSelected = false;
    this.container.selectAll("circle.lasso").remove();
    this.container.selectAll("circle.control").remove();
    this.container.selectAll("line.lasso").remove();
    // this.dispatch.clear(); // NEED TO CONVERT
  })
  circleLasso
  .attr({
    cx: this.project(this.circleCenter)?['x']:0,
    cy: this.project(this.circleCenter)?['y']:0,
    r: dist
  })
  .style({
    stroke: "#010",
    fill: "#010",
    "fill-opacity": 0.1
  })
  
  var line = this.container.selectAll("line.lasso").data([this.circleOuter])
  line.enter().append("line").classed("lasso", true)
  
  if(!this.circleSelected && this.circleCenter || this.dragging) {
    line.attr({
      x1: this.project(this.circleCenter)?['x']:0,
      y1: this.project(this.circleCenter)?['y']:0,
      x2: this.project(this.circleOuter)?['x']:0,
      y2: this.project(this.circleOuter)?['y']:0
    })
    .style({
      stroke: "#111",
      "stroke-dasharray": "5 5"
    })
  } else {
    line.remove();
  }
  
  var controls = this.container.selectAll("circle.control")
  .data([this.circleCenter, this.circleOuter])
  controls.enter().append("circle").classed("control", true)
  controls
  .attr("cx",(d:any) => this.project(d)?['x']:0)
  .attr("cy",(d:any) => this.project(d)?['y']:0)
  .attr("r",8)
  .attr("stroke","#010")
  .attr("fill","#b7feb7")
  .attr("fill-opacity", 0.9)
  .style({
    "cursor": this.active ? "move" : null
  })
  .call(d3.drag)
  
  // this.dispatch.update(); // NEED TO CONVERT
}






//   class circleSelector {
       
//     public that = this;
//     public circleCenter:any
//     public circleOuter:any; //control points
//     public circleSelected = false; //have we completed the circle?
//     public dragging = false; //track whether we are dragging
//     public active = false; // user can turn on/off this behavior
//     public container:any // = this.svg; // the container we render our points in

//     //we expose events on our component
//     public dispatch = d3.dispatch("update", "clear");

//     // this will likely be overriden by leaflet projection
//     public project = d3.geo.mercator();
//     public unproject = d3.geo.mercator().invert;

//     constructor(private svg:any) {
//       this.container = svg

//     }
      
//     ngOnInit() {
    
    
//     // The user provides an svg element to listen on events
//     this.svg.on("mouseup.circle", function() {
//       if(!active) return;
//       if(dragging && circleSelected) return;
      
//       let p = d3.mouse(this);
//       let ll = unproject([p[0],p[1]])
      
//       if(circleCenter) {
//         // if we already have the circle's center and the circle
//         // is finished selecting, another click means destroy the circle
//         if(!circleSelected) {
//           // Set the outer point
//           circleOuter = ll;
//           circleSelected = true;
//         }
//       } else {
//         // We set the center to the initial click
//         circleCenter = ll;
//         circleOuter = ll;
//       }
//       // we let the user know 
//       update()
//     })
//     this.svg.on("mousemove.circle", function() {
//       if(!active) return;
//       if(circleSelected) return;
//       // we draw a guideline for where the next point would go.
//       let p = d3.mouse(this);
//       let ll = unproject([p[0],p[1]])
//       circleOuter = ll;
//       update();
//     })
    
//     let drag = d3.behavior.drag()
//       .on("drag", function (d:any, i:number) {
//         if(!active) return;
//         if(circleSelected) {
//           dragging = true;
//           let p = d3.mouse(this.svg.node());
//           let ll = unproject([p[0],p[1]])
//           if(i) {
//             circleOuter = ll;
//           } else {
//             let dlat = circleCenter.lat - ll.lat;
//             let dlng = circleCenter.lng - ll.lng;
//             circleCenter = ll;
//             circleOuter.lat -= dlat;
//             circleOuter.lng -= dlng;
//           }
//           update();
//         } else {
//           return false;
//         }
//       })
//       .on("dragend", function(d:any) {
//         // kind of a dirty hack...
//         setTimeout(function() {
//           dragging = false;
//         },100)
//       })
    
//     function update(g) {
//       if(g) container = g;
//       if(!circleCenter || !circleOuter) return;
//       var dist = distance(circleCenter, circleOuter)
//       var circleLasso = container.selectAll("circle.lasso").data([dist])
//       circleLasso.enter().append("circle").classed("lasso", true)
//       .on("click", function() {
//         if(!active) return;
//         // start over
//         circleCenter = null;
//         circleOuter = null;
//         circleSelected = false;
//         container.selectAll("circle.lasso").remove();
//         container.selectAll("circle.control").remove();
//         container.selectAll("line.lasso").remove();
//         dispatch.clear();
//       })
//       circleLasso
//       .attr({
//         cx: project(circleCenter).x,
//         cy: project(circleCenter).y,
//         r: dist
//       })
//       .style({
//         stroke: "#010",
//         fill: "#010",
//         "fill-opacity": 0.1
//       })
      
//       var line = container.selectAll("line.lasso").data([circleOuter])
//       line.enter().append("line").classed("lasso", true)
      
//       if(!circleSelected && circleCenter || dragging) {
//         line.attr({
//           x1: project(circleCenter).x,
//           y1: project(circleCenter).y,
//           x2: project(circleOuter).x,
//           y2: project(circleOuter).y
//         })
//         .style({
//           stroke: "#111",
//           "stroke-dasharray": "5 5"
//         })
//       } else {
//         line.remove();
//       }
      
//       var controls = container.selectAll("circle.control")
//       .data([circleCenter, circleOuter])
//       controls.enter().append("circle").classed("control", true)
//       controls
//       .attr("cx",(d:any) => project(d).x)
//       .attr("cy",(d:any) => project(d).y)
//       .attr("r",8)
//       .attr("stroke","#010")
//       .attr("fill","#b7feb7")
//       .attr("fill-opacity", 0.9)
//       .style({
//         "cursor": active ? "move" : null
//       })
//       .call(drag)
      
//       dispatch.update();
//     }
//     this.update = update;
//     this.projection = (val:any) => {
//       if(!val) return project;
//       project = val;
//       return this;
//     }
//     this.inverseProjection = function(val) {
//       if(!val) return unproject;
//       unproject = val;
//       return this;
//     }
//     this.activate = function(val:any) {
//       active = val;
//       return this;
//     }
//     this.distance = function(ll:any) {
//       if(!ll) ll = circleOuter;
//       return distance(circleCenter, ll)
//     }
    
//     function distance(ll0:any, ll1:any) {
//       var p0 = project(ll0)
//       var p1 = project(ll1)
//       var dist = Math.sqrt((p1.x - p0.x)*(p1.x - p0.x) + (p1.y - p0.y)*(p1.y-p0.y))
//       return dist;
//     }
    
//     d3.rebind(this, dispatch, "on")
//     return this;

//   }
// }
}