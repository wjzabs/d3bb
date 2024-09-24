import { 
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input, OnChanges, 
  OnDestroy, OnInit, Output, SimpleChanges, 
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import { tooltip } from './tooltip';
import { html } from 'd3';
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
  private height = 500;
  private top = 5;
  private bottom = 20;
  private left = 30;
  private right = 30;
  tooltip?: unknown;

  brands: any[] = [];
  collections: any[] = [];
  retail_sales: any[] = [];
  dates: any[] = [];
  
intervalId!: any;
sliderValue: number =   1; // 17;
week: string = '';

private m = new Map()

  constructor(private el: ElementRef) {}

  async ngOnInit() {

    await d3.json('assets/dates.json').then((data: any) => {
      this.dates = data;
      // select JSON_OBJECT(YYYYWW,WEEK_END_DATE,LEGEND,YYYYPP,YYYYMM,REL_WEEK,MAX_WEEK) from (
      //   SELECT * from GLTPARM3 WHERE YYYYPP BETWEEN '201907' AND '202406'
      //   ) ORDER BY YYYYWW      
    })
    // console.log(this.dates)

    await d3.json('assets/brands.json').then((data: any) => {
      this.brands = data;
      // select JSON_OBJECT(BRAND_CODE, BRAND_NAME) from (
      //   SELECT BRAND_CODE, BRAND_NAME FROM ICTBRAN1
      //   ) ORDER BY BRAND_CODE      
    })
    // console.log(this.brands)

    await d3.json('assets/collections.json').then((data: any) => {
      this.collections = data;
      // select JSON_OBJECT(COLLECTION_CODE, COLLECTION_NAME, BRAND_CODE) from (
      //   SELECT COLLECTION_CODE, COLLECTION_NAME, BRAND_CODE FROM ICTCOLL1
      //   ) ORDER BY BRAND_CODE, COLLECTION_CODE      
    })
    console.log(this.collections)

    await d3.json('assets/retail_sales.json').then((data: any) => {
      this.retail_sales = data;
      // select JSON_OBJECT(BRAND_CODE, COLLECTION_CODE, OPS_YYYYWW, AMT_SOLD, QTY_SOLD, STORES) from (
      //   SELECT ICTCOLL1.BRAND_CODE, ICTITEM1.COLLECTION_CODE, RSTRETL1.OPS_YYYYWW
      //   , SUM (RSTRETL1.AMT_SOLD) AMT_SOLD, SUM (RSTRETL1.QTY_SOLD) QTY_SOLD
      //   , COUNT (DISTINCT RSTRETL1.CUST_CODE || ':' || RSTRETL1.CUST_STORE_NO) STORES
      //   FROM RSTRETL1, ICTITEM1, ICTCOLL1
      //   WHERE RSTRETL1.OPS_YYYYWW BETWEEN '201907' AND '202406'
      //   AND ICTITEM1.ITEM_CODE = RSTRETL1.ITEM_CODE
      //   AND ICTCOLL1.COLLECTION_CODE = ICTITEM1.COLLECTION_CODE
      //   GROUP BY ICTCOLL1.BRAND_CODE, ICTITEM1.COLLECTION_CODE, RSTRETL1.OPS_YYYYWW
      //   ) ORDER BY BRAND_CODE, COLLECTION_CODE, OPS_YYYYWW      
    })
    console.log(this.retail_sales)
    this.retail_sales.forEach(x => {
      x.AMT_SOLD = x.AMT_SOLD || 0
      x.QTY_SOLD = x.QTY_SOLD || 0
      x.STORES = x.STORES || 0
    })

    this.loadData(this.sliderValue)

    // console.log(this.dates)
    this.slider.nativeElement.min = 1
    this.slider.nativeElement.max = this.dates.length
console.log(this.slider.nativeElement.min, this.slider.nativeElement.max)

    this.setMinMax()

    console.log('element', this.el)
    this.createSvg(this.el.nativeElement);
    this.setScales();
    this.drawAxes();
    this.setupTooltip();
    this.drawScatter();
  }
  

  setMinMax() {

    this.xMax = d3.max(this.retail_sales, (d:any) => {return d.STORES}) as number;
    this.xMin = d3.min(this.retail_sales, function(d) {return d.STORES}) as number;

    this.yMax = d3.max(this.retail_sales, function(d) {return d.QTY_SOLD ? d.AMT_SOLD/d.QTY_SOLD : 0}) as number;
    this.yMin = d3.min(this.retail_sales, function(d) {return d.QTY_SOLD ? d.AMT_SOLD/d.QTY_SOLD : 0}) as number;

    // this.maxRadius = d3.max(this.retail_sales, (d:ScatterDatum) => {return d.AMT_SOLD}) as number;
    // this.minRadius = d3.min(this.retail_sales, (d:ScatterDatum) => {return d.AMT_SOLD}) as number;
    this.rMax = d3.max(this.retail_sales, (d:ScatterDatum) => {return d.AMT_SOLD}) as number;
    this.rMin = d3.min(this.retail_sales, (d:ScatterDatum) => {return d.AMT_SOLD}) as number;
    this.rMax = 250000
console.log(this.rMin, this.rMax)
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit() {
//     console.log(this.dates)
//     this.slider.nativeElement.min = 1
//     this.slider.nativeElement.max = this.dates.length
// console.log(this.slider.nativeElement.min, this.slider.nativeElement.max)

  }

  playClick() {
    if (this.caption === "Play") {
      this.startInterval()
    } else {
      this.stopInterval()
    }
  }

  loadData(i: number) {
    let date = this.dates[i]
    let YYYYWW: string = date.YYYYWW
    let dataYW = this.retail_sales.filter(x => {return x.OPS_YYYYWW === YYYYWW})

    this.m = new Map()
    dataYW.forEach((d:any) => { this.m.set(d.COLLECTION_CODE, d)})
    console.log({i, dataYW, m:this.m})

    this.data = []
    this.collections.forEach(x => {
      let sales_data = this.m.get(x.COLLECTION_CODE)
      if (!sales_data) {
        sales_data = {
          BRAND_CODE: x.BRAND_CODE,
          COLLECTION_CODE: x.COLLECTION_CODE,
          COLLECTION_NAME: x.COLLECTION_NAME,
          QTY_SOLD: 0,
          AMT_SOLD: 0,
          PRICE: 0,
          STORES: 0
        }
      } else {
        sales_data.QTY_SOLD = sales_data.QTY_SOLD || 0
        sales_data.AMT_SOLD = sales_data.AMT_SOLD || 0
        sales_data.STORES = sales_data.STORES || 0
      }
      // console.log({x, sales_data})
      sales_data.PRICE = sales_data.QTY_SOLD ? sales_data.AMT_SOLD / sales_data.QTY_SOLD : 0

      let dp: ScatterDatum = {
        AMT_SOLD: sales_data.AMT_SOLD,
        x: sales_data.STORES, 
        y: sales_data.PRICE, 
        r: sales_data.AMT_SOLD,
        BRAND_CODE: sales_data.BRAND_CODE,
        COLLECTION_CODE: sales_data.COLLECTION_CODE,
        COLLECTION_NAME: sales_data.COLLECTION_NAME,
        QTY_SOLD: sales_data.QTY_SOLD,
        PRICE: sales_data.PRICE,
        STORES: sales_data.STORES
      }    
      this.data.push(dp)
    })
    
    console.log({data: this.data, m: this.m})
    // this.xMax = d3.max(this.data, (d:ScatterDatum) => {return d.x}) as number;
    // this.xMin = d3.min(this.data, function(d) {return d.x}) as number;

    // this.yMax = d3.max(this.data, function(d) {return d.y}) as number;
    // this.yMin = d3.min(this.data, function(d) {return d.y}) as number;

    // this.rMax = d3.max(this.data, (d:ScatterDatum) => {return d.r}) as number;
    // this.rMin = d3.min(this.data, (d:ScatterDatum) => {return d.r}) as number;
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
      // console.log('->', this.slider.nativeElement.value)
      this.sliderValue +=1
      let weekData = this.dates[this.sliderValue -1]

      this.week = weekData.YYYYWW + ' Week Ending:' + weekData.WEEK_END_DATE
      // console.log(this.week)

      // this.getData()
      this.loadData(this.sliderValue)
      this.slider.nativeElement.value = this.sliderValue
      // console.log('+1', this.slider.nativeElement.value)

      let thisdata = this.data
      d3.selectAll('.data').each(function(d:any, i:number) {
        // Within this function d is this group's data.
        // Iterate, accumulate, do whatever you like at this point.
        // console.log({d})
        if (i===255) { console.log(d) }
        d = {...thisdata[i]}
      });

      // let oldd: any[] = []
      // d3.selectAll('.data').each(function(d:any) {
      //   // Within this function d is this group's data.
      //   // Iterate, accumulate, do whatever you like at this point.
      //   // console.log({d})
      //   oldd = d;
      // });

      // oldd.forEach((d: any) => {
      //   let COLLECTION_CODE = d.COLLECTION_CODE || ''
      //   let sales_data = this.m.get(COLLECTION_CODE)
      //   d.x = sales_data.STORES
      //   d.x = sales_data.STORES
      //   d.r = sales_data.QTY_SOLD ? sales_data.AMT_SOLD / sales_data.QTY_SOLD : 0
      // })

      d3.selectAll(".data")
      .transition()
      .duration(500)
      .attr("cy", (d: any) => this.scaleY(d.y))
      .attr("cy", (d: any) => this.scaleY(d.y))
      .attr("r", (d: any) => this.scaleR(d.r))
      // 
      // .attr("cy", (d: any) => this.scaleY(d.y))
      // .attr("r", (d: any) => this.scaleR(d.r))

      // d3.selectAll(".data")
      // .transition()
      // .duration(1000)
      // .attr("cx", 1000)
      // .attr("cy", 250)
      // .attr("r", 20)

    }
  }, 500)
}

stopInterval() {
  this.caption = "Play"
  clearInterval(this.intervalId);
  console.log('interval stopped')
}

  private createSvg(nativeElement: any) {
    this.svgWidth = this.width + this.left + this.right;
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
        .style("padding", "10px")
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
          // .attr("cx", function (d: any) { return scaleX(d.x)})

          .attr("cx", (d: any) => scaleX(d.x))
          .attr("cy", (d: any) => scaleY(d.y))
          .attr("r", (d: any) => scaleR(d.r))

          // .attr("cx", (d: any) => this.scaleX(d.x))
          // .attr("cy", (d: any) => this.scaleY(d.y))
          // .attr("r", (d: any) => this.scaleR(d.r))
          .attr("class", "data")
          .attr("id", (d: any) => d.COLLECTION_CODE) // this needs to be changed to the key of the data Map
          .attr("fill", 'red')
          .style("stroke", 'black')
          .on("mouseover", (event: any, d: any) => {

            const [rawX, rawY] = d3.pointer(event);

            const posX = rawX;
            const posY = rawY + 30;

            d3.select('#tooltip')
              .html(`label`)
              // .attr("text", function (d:ScatterDatum) { return d.COLLECTION_CODE || 'NO COLL'})
              .style("left", rawX + 'px')
              .style("top", rawY + 'px')
              .style('opacity', 1)
          })
          .on("mousemove", (event: any, d: any) => {
          })
          .on("mouseout", (event: any, d: any) => {
            // hide tooltip
            d3.select('#tooltip')
              .transition()
              .duration(200)
              .style("opacity", 0)
          })
          .on("click", (d: any) => {
            // console.log('click', {d});
          })
          .call(d3.drag()
            .on("start", null)
            .on("drag", function(event: any, d: any) {
              move(d3.select(this), event, d);
            })
            .on("end", d => {
              console.log('end', {d});
            })
          )
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
