import { 
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnChanges, 
  OnDestroy, OnInit, Output, SimpleChanges, 
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ScatterDatum {
  x: number;
  y: number;
  r: number;
  COLLECTION_CODE: string;
  COLLECTION_NAME: string;
  BRAND_CODE: string;
  AMT_SOLD: number;
  QTY_SOLD: number;
  STORES: number;
  PRICE: number;
}

@Component({
  selector: 'cmp-scatter-graph2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scatter-graph2.component.html',
  styleUrl: './scatter-graph2.component.scss'
})
export class ScatterGraph2Component implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private svg: any;
  private mainGroup: any;
  private xAxisGroup: any;
  private yAxisGroup: any;
  private scaleX: any;
  private scaleY: any;
  private scaleR: any;

  private xMin: number = 0;
  private xMax: number = 10;
  private yMin: number = 0;
  private yMax: number = 10;

  private minRadius = 2;
  private maxRadius = 25;
  private rMin = 0;
  private rMax = 100;

  caption: string = "Play"

  data: Array<ScatterDatum> = [];

  @Output('change')
  private changeEvent = new EventEmitter();

  @ViewChild('slider') slider!: ElementRef;

  private svgWidth = 0;
  private svgHeight = 0;
  private width = 900;
  private height = 400;
  private top = 5;
  private bottom = 20;
  private left = 60;
  private right = 30;
  tooltip?: unknown;

  ENTITY_GROUPs: any[] = [];
  ENTITY_CODEs: any[] = [];
  history: any[] = [];
  dates: any[] = [];
  
intervalId!: any;
sliderValue: number = 0; //  1; // 17;

yyyyxx: string = '';
yyyyxx_type: string = 'Weeks';
initialized = false;

private m = new Map()

DATA_CODE_selected: string = "";
dataOptions = [
  {DATA_CODE: 'SLS', DATA_CAPTION: '$Sales'},
  {DATA_CODE: 'JOBS', DATA_CAPTION: '#Jobs'},
  {DATA_CODE: 'GPD', DATA_CAPTION: '$GP'},
  {DATA_CODE: 'ASP', DATA_CAPTION: '$ASP'},
]

ENTITY_CODE_selected: string = "";
entityOptions = [
  {ENTITY_CODE: '1', ENTITY_CAPTION: 'Designs within Designers'},
  {ENTITY_CODE: '2', ENTITY_CAPTION: 'Customers within Groups'},
]

LENS_DESIGNER_CODE_selected: string = "";

  constructor(
    private el: ElementRef,
    // private cd: ChangeDetectorRef,
    // private svc: AbblabService
  ) {}

  async ngOnInit() {
    await this.initializeState();   
  }		

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
  }

  async ngAfterViewInit() {
    // await this.initializeState() // do not do this or else the bubbles will never apper
  }	   
  
  public async initializeState() {
    
    await d3.json('assets/dates.json').then((data: any) => {
      this.dates = data;
    })
    // console.log(this.dates)

    await d3.json('assets/brands.json').then((data: any) => {
      this.ENTITY_GROUPs = data;
    })
    // console.log(this.brands)

    await d3.json('assets/collections.json').then((data: any) => {
      this.ENTITY_CODEs = data;   
    })
    // console.log(this.collections)

    await d3.json('assets/retail_sales.json').then((data: any) => {
      this.history = data;
    })
    // console.log(this.retail_sales)
    this.history.forEach(x => {
      x.AMT_SOLD = x.AMT_SOLD || 0
      x.QTY_SOLD = x.QTY_SOLD || 0
      x.STORES = x.STORES || 0
    })

    this.initializeDate()

    this.slider.nativeElement.min = 0
    this.slider.nativeElement.max = this.dates.length -1

    console.log('this.slider', this.slider.nativeElement.min, this.slider.nativeElement.max, this.dates)

    this.setMinMax()

    console.log('element', this.el)
    this.createSvg(this.el.nativeElement);
    this.setScales();
    this.drawAxes();
    this.setupTooltip();
    this.drawScatter();

    this.initialized = true;
  }

  setMinMax() {

    this.xMax = d3.max(this.history, (d:any) => {return d.STORES}) as number;
    this.xMin = d3.min(this.history, function(d) {return d.STORES}) as number;

    this.yMax = d3.max(this.history, function(d) {return d.QTY_SOLD ? d.AMT_SOLD/d.QTY_SOLD : 0}) as number;
    this.yMin = d3.min(this.history, function(d) {return d.QTY_SOLD ? d.AMT_SOLD/d.QTY_SOLD : 0}) as number;

    this.rMax = d3.max(this.history, (d:ScatterDatum) => {return d.AMT_SOLD}) as number;
    this.rMin = d3.min(this.history, (d:ScatterDatum) => {return d.AMT_SOLD}) as number;
    this.rMax = 250000

    console.log('min/max/x', this.xMin, this.xMax)
    console.log('min/max/y', this.yMin, this.yMax)
    console.log('min/max/r', this.rMin, this.rMax)
  }

  playClick() {
    if (this.caption === "Play") {
      this.startInterval()
    } else {
      this.stopInterval()
    }
  }

  loadData() {
    let i = this.sliderValue
    let date = this.dates[i]
    let YYYYXX: string = date.YYYYWW
    let dataYX = this.history.filter(x => {return x.OPS_YYYYWW === YYYYXX})

    this.m = new Map()
    dataYX.forEach((d:any) => { this.m.set(d.COLLECTION_CODE, d)})
    console.log({i, dataYX, m:this.m})

    if (this.data.length === 0) {this.initializeData()}
  
    this.data.forEach((x:ScatterDatum) => {
      let sales_data = this.m.get(x.COLLECTION_CODE)
      if (!sales_data) {
        x.QTY_SOLD = 0
        x.AMT_SOLD = 0
        x.PRICE = 0
        x.STORES = 0
      } else {
        x.QTY_SOLD = sales_data.QTY_SOLD || 0
        x.AMT_SOLD = sales_data.AMT_SOLD || 0
        x.STORES = sales_data.STORES || 0
        x.PRICE = sales_data.QTY_SOLD ? sales_data.AMT_SOLD / sales_data.QTY_SOLD : 0
      }
      x.x = x.STORES
      x.y = x.PRICE
      x.r = x.AMT_SOLD

    })
  }

  initializeData() {
    // this.data = []
    this.ENTITY_CODEs.forEach(x => {      
      let dp: ScatterDatum = {
        AMT_SOLD: 0,
        x: 0, 
        y: 0, 
        r: 0,
        BRAND_CODE: x.BRAND_CODE,
        COLLECTION_CODE: x.COLLECTION_CODE,
        COLLECTION_NAME: x.COLLECTION_NAME,
        QTY_SOLD: 0,
        PRICE: 0,
        STORES: 0
      } 
      this.data.push(dp)
    })
  }

  // getData() {
  //   this.data.forEach((x: ScatterDatum ) => {
  //     x.r = Math.random() * 100
  //   })
  // }

// https://observablehq.com/@mbostock/scrubber

startInterval() {
  this.caption = "Pause"
  console.log(this.caption)
  if (this.sliderValue === +this.slider.nativeElement.max) {
    console.log(this.sliderValue, this.slider.nativeElement.max)
    this.sliderValue = 0
  }
  this.intervalId = setInterval(() => {
    if (this.sliderValue === +this.slider.nativeElement.max ) {
      console.log('stopping interval')
      this.stopInterval();
    } else {

      this.sliderValue +=1
      this.initializeDate()
      // this.cd.detectChanges()

      // console.log(this.data)
      // console.log(this.data[0].x, this.scaleX(this.data[0].x))
      d3.selectAll(".data")
      .transition()
      .duration(500)
      .attr("cx", (d: any) => this.scaleX(d.x) || 0)
      .attr("cy", (d: any) => this.scaleY(d.y))
      .attr("r", (d: any) => this.scaleR(d.r))
    }
  }, 1000)
}

stopInterval() {
  this.caption = "Play"
  clearInterval(this.intervalId);
  console.log('interval stopped')
}

initializeDate() {
  let dateData = this.dates[this.sliderValue]
  // this.week = dateData.YYYYWW + ' Week Ending:' + dateData.WEEK_END_DATE
  this.yyyyxx = 'Week ' + this.format642(dateData.YYYYWW) + ' Ending ' + this.formatDate(dateData.WEEK_END_DATE)

  this.loadData()
}

formatDate(d: string) {
  let dx = d.substr(0,10)
  return dx.substr(5,2) + '/' + dx.substr(8,2) + '/' + dx.substr(0,4)
}

format642(d: string) {
  return d.substr(0,4) + '-' + d.substr(4,2)
}

  private createSvg(nativeElement: any) {
    this.svgWidth = this.width + this.left + this.right + 200;
    this.svgHeight = this.height + this.top + this.bottom;

    d3.selectAll('svg').remove()

    this.svg = d3.select(nativeElement)
      .append('div')
        .attr('id', 'tooltip')
        .classed('tooltip', true)
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "30px")
        .style("margin-left", "50px")
        .style("position", "absolute");

    this.svg = d3.select(nativeElement)
      .insert('svg', 'h1')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)

    this.mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.left}, ${this.top})`);

    this.xAxisGroup = this.mainGroup.append('g')
      .classed('x-axis', true);

    this.yAxisGroup = this.mainGroup.append('g')
      .classed('y-axis', true);
  }

  private setScales() {
    this.scaleX = d3.scaleLog()
      .base(5)
      .range([0, this.width])
      .domain([this.xMin, this.xMax]);
      
    this.scaleY = d3.scaleLinear()
      .range([this.height, 0])
      .domain([this.yMin, this.yMax]);
      
      this.scaleR = d3.scaleLinear()
        .range([this.minRadius, this.maxRadius])
        .domain([this.rMin, this.rMax]);
  }

  private drawAxes() {
    this.xAxisGroup.empty();
    this.xAxisGroup.attr('transform', `translate(0, ${this.height})`)
    this.xAxisGroup.call(
      d3.axisBottom(this.scaleX)
    );

    this.yAxisGroup.empty()
    //this.yAxisGroup.attr('transform', `translate(${this.width}, 0)`)
    this.yAxisGroup.call(
      d3.axisLeft(this.scaleY)
    );
  }

  private setupTooltip()  { 
  }

  private drawScatter() {

    let customColors = [
      '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
      '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
      '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
      '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
  ];
  const brandCodes = this.ENTITY_GROUPs.map(b => b.BRAND_CODE);
  const colorScale = d3.scaleOrdinal()
      .domain(brandCodes)
      .range(customColors);

    const move = (selection: any, event: any, d: any) => {

      const x = this.clamped(this.scaleX(d.x) + event.dx, 0, this.width)
      const y = this.clamped(this.scaleY(d.y) + event.dy, 0, this.height)

      d.x = this.scaleX.invert(x);
      d.y = this.scaleY.invert(y);

      selection
        .attr("cx", x)
        .attr("cy", y);

      d3.select('#tooltip')
        // .style("left", (d:any) => {x + 'px'})
        .style("left", (x + 'px'))
        .style("top", (y + 30) + 'px')

      this.changeEvent.emit();
    };

    let scaleX = this.scaleX
    let scaleY = this.scaleY
    let scaleR = this.scaleR

    this.mainGroup
       .selectAll('circle')
       .data(this.data)
      //  .data(this.collections)
       .enter()
       .append('circle')
          .attr("cx", (d: any) => scaleX(d.x) || 0)
          .attr("cy", (d: any) => scaleY(d.y))
          .attr("r", (d: any) => scaleR(d.r))
          .attr("class", "data")
          .attr("id", (d: any) => d.COLLECTION_CODE) // this needs to be changed to the key of the data Map
          // .attr("fill", 'red')
          .attr("fill", (d: any) => colorScale(d.BRAND_CODE))
          .style("stroke", 'black')
          .on("mouseover", (event: any, d: any) => {

            const [rawX, rawY] = d3.pointer(event);

            const posX = rawX;
            const posY = rawY + 30;

            const amtSold = d3.format(",.2f")(d.AMT_SOLD) || d.AMT_SOLD.toFixed(2);
            const price = d3.format("$,.2f")(d.PRICE) || d.PRICE.toFixed(2);

            d3.select('#tooltip')
              // .html(`label`)
              .html(`
                <div>
                  <strong>Collection Code:</strong> ${d.COLLECTION_CODE} <br/>
                  <strong>Collection Name:</strong> ${d.COLLECTION_NAME} <br/>
                  <strong>Brand Code:</strong> ${d.BRAND_CODE} <br/>
                  <strong>Qty Sold:</strong> ${d.QTY_SOLD} <br/>
                  <strong>Amt Sold:</strong> ${amtSold} <br/>
                  <strong>Price:</strong> ${price} <br/>
                </div>
              `)
              // .attr("text", function (d:ScatterDatum) { return d.COLLECTION_CODE || 'NO COLL'})
              .style("left", rawX + 'px')
              .style("top", rawY + 'px')
              // .style("left", (event.pageX + "px"))
              // .style("top", ((event.pageY) + "px"))  
              // .style("left", posX + 'px')
              // .style("top", posY + 'px')
              .style('opacity', 1)
          })
          .on("mousemove", (event: any, d: any) => {

          })
          .on("mouseout", (event: any, d: any) => {
            // hide tooltip
            d3.select('#tooltip')
              .transition()
              .duration(500)
              .style("opacity", 0)
          })
          .on("click", (d: any) => {
            // console.log('click circle', {d});
          })
          .call(d3.drag()
            .on("start", null)
            .on("drag", function(event: any, d: any) {
              move(d3.select(this), event, d);
            })
            .on("end", d => {
              console.log('end', {d});

              
            })
          );
          
          this.drawLegend(colorScale);
  }

  private drawLegend(colorScale: any) {

    
    this.mainGroup.append("text")
      .attr("x", 12)
      .attr("y", 6)
      .attr("class", "label")
      .text("ASP");

      this.mainGroup.append("text")
      .attr("x", this.svgWidth - 60)
      .attr("y", this.svgHeight - 20)
      .attr("text-anchor", "end")
      .attr("class", "label")
      .text("Stores");

    const legend = this.mainGroup.selectAll('.legend') //creating the legend itself
        .data(colorScale.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d: string, i: number) => `translate(0, ${i * 20})`);
 
    legend.append('rect') //making the colored squares for the legend
        .attr('x', this.width + 100)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', colorScale);
 
    legend.append('text') //making the keys for the legend
        .attr('x', this.width + 95) //5 px to the left of the box
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text((d: any) => d);

        
    legend
    .on("mouseover", (event: MouseEvent, type: string) => {
      d3.selectAll(".legend").style("opacity", 0.1);
      d3.selectAll(".legend").filter((d:any) => { return d === type; }).style("opacity", 1);
      d3.selectAll(".data")
        .style("opacity", 0.1)
        .filter((d:any) => { 
          // console.log({d, type})
          return d["BRAND_CODE"] === type; 
        })
        .style("opacity", 1);
    })
    .on("mouseout", (event: any, type: string) => {
      d3.selectAll(".legend").style("opacity", 1);
      d3.selectAll(".data").style("opacity", 1);
    });

  }

  private clamped(value: number, min: number, max: number): number {
    if(value < min) {
      return min;
    } else if (value > max) {
      return max;
    }
    return value;
  }
}
