# D3bb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Development Objectives

create an angular v17 app which includes a d3 bubble chart.
add a brush with the ability to replot just the brush selection.
add x and y axes and labels.
add drag and drop.
add zoom capability.
add tooltip showing data values on hover.
make component view responsive to viewport size.

From Jeffery
GeoJSON and KML data for the United States
https://eric.clst.org/tech/usgeojson/

Choropleth 1
https://observablehq.com/@d3/choropleth

Choropleth 2
https://observablehq.com/@d3/choropleth/2?intent=fork

US-Atlas MB
https://github.com/topojson/us-atlas/tree/master/img

US Census
https://www.census.gov/


FIPS Master List
https://public.opendatasoft.com/explore/dataset/us-county-boundaries/export/?disjunctive.statefp&disjunctive.countyfp&disjunctive.name&disjunctive.namelsad&disjunctive.stusab&disjunctive.state_name

Plotly dataasets
https://github.com/plotly/datasets/commit/95672208c26b44a6e32363b17a35b8caa1b5d2ef#diff-e98d80e92d3253e3da6ee2efc6a0000b2b944ea450a2806e251d2ab470a3cdaa

reddit advice on zip to fips
https://www.reddit.com/r/Census/comments/llcsvk/census_block_fips_code_to_zip_code/

zip to fips
https://www.censushardtocountmaps2020.us/?latlng=39.68183%2C-79.43115&z=6&query=coordinates%3A%3A40.61395%2C-72.99316&promotedfeaturetype=states&baselayerstate=4&rtrYear=sR2020latest&infotab=info-rtrselfresponse&filterQuery=false

xref zip to fips
https://www.kaggle.com/datasets/danofer/zipcodes-county-fips-crosswalk

HUD USPS ZIP Code Crosswalk Files
https://www.huduser.gov/portal/datasets/usps_crosswalk.html

12 cross walk files
https://www.huduser.gov/apps/public/uspscrosswalk/home



