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

sdwfrost gist & github
https://gist.githubusercontent.com/sdwfrost/d1c73f91dd9d175998ed166eb216994a/raw/e89c35f308cee7e2e5a784e1d3afc5d449e9e4bb/counties.geojson

*** US Census - cb_2017_us_county_20m - this is the source of the counties geometries for the map
https://www.census.gov/geographies/mapping-files/2017/geo/carto-boundary-file.html


*** FIPS Master List - this is the source of FIPS master data - xls file
https://public.opendatasoft.com/explore/dataset/us-county-boundaries/export/?disjunctive.statefp&disjunctive.countyfp&disjunctive.name&disjunctive.namelsad&disjunctive.stusab&disjunctive.state_name

Plotly dataasets
https://github.com/plotly/datasets/commit/95672208c26b44a6e32363b17a35b8caa1b5d2ef#diff-e98d80e92d3253e3da6ee2efc6a0000b2b944ea450a2806e251d2ab470a3cdaa

reddit advice on zip to fips
https://www.reddit.com/r/Census/comments/llcsvk/census_block_fips_code_to_zip_code/

zip to fips - could not easily find what I was looking for - but a treasure trove of detailed info
https://www.censushardtocountmaps2020.us/?latlng=39.68183%2C-79.43115&z=6&query=coordinates%3A%3A40.61395%2C-72.99316&promotedfeaturetype=states&baselayerstate=4&rtrYear=sR2020latest&infotab=info-rtrselfresponse&filterQuery=false

xref zip to fips
https://www.kaggle.com/datasets/danofer/zipcodes-county-fips-crosswalk

HUD USPS ZIP Code Crosswalk Files
https://www.huduser.gov/portal/datasets/usps_crosswalk.html

12 cross walk files
https://www.huduser.gov/apps/public/uspscrosswalk/home

*** List of State Codes and County FIPS Codes- this is the source of State FIPS prefix -> State Code master data
https://transition.fcc.gov/oet/info/maps/census/fips/fips.txt


select JSON_OBJECT(GEO_POINT,
GEO_SHAPE,STATEFP,COUNTYFP,COUNTYNS,GEOID,NAME,NAMELSAD,STUSAB,LSAD,CLASSFP,MTFCC,
CSAFP,CBSAFP,METDIVFP,FUNCSTAT,ALAND,AWATER,INTPTLAT,INTPTLON,STATE_NAME,COUNTYFP_NOZERO)
 from GEODATA


*** List of State FIPS -> Code & Name - this is the source of State FIPS xref
https://gist.github.com/dantonnoriega/bf1acd2290e15b91e6710b6fd3be0a53

Converting Zip to FIPS is a bit problemmatic
file ZIP-COUNTY-FIPS_2017-06.CSV shows 2 FIPS for zip code 23061
ZIP	    COUNTYNAME	        ST  COUNTYFP	CLASSFP
23061	Gloucester County	VA	51073	    H1
23061	Mathews County	    VA	51115	    H1

Smarty has an API lookup that you provide City, State and Zip code and it returns the reall FIPS
https://www.smarty.com/products/single-address?city=&state=&zipcode=&address-type=us-zipcode
ZIP Code Type S
Default City Gloucester
County Name Gloucester
County FIPS 51073
State Virginia
Latitude 37.42635
Longitude -76.54519
Lat/Long Precision Zip5
above shows it worked for Gloucester, but Mathews returned 0 rows.


we could also use zip2fips which includes PR
and had 1 resolution for 23061 (Gloucester) with Mathews in its own zip code (23109)
*** this is the resource we selected to use for zip 2 fips - it was loaded into oracle and used to obtain sample retail sales data by fips
https://github.com/clauswilke/zipcodes/blob/main/data/zip2fips.csv
fixing data once imported into oracle
update zip2fips set zipcode = '00' || zipcode where length(zipcode) = 3;
update zip2fips set zipcode = '0' || zipcode where length(zipcode) = 4;
ALTER TABLE ZIP2FIPS ADD PRIMARY KEY (ZIPCODE);


SELECT LPAD(ZIP2FIPS.FIPS,5,'0') FIPS, X.* FROM ZIP2FIPS, (
SELECT SUBSTR(ARTCUST2.CUST_STORE_ZIP_CODE,1,5) CUST_STORE_ZIP_CODE
, SUM (RSTRETL1.AMT_SOLD) AMT_SOLD
FROM RSTRETL1, ARTCUST2
WHERE ARTCUST2.CUST_CODE = RSTRETL1.CUST_CODE
  AND ARTCUST2.CUST_STORE_NO = RSTRETL1.CUST_STORE_NO
AND RSTRETL1.OPS_YYYYPP = '202406'
GROUP BY SUBSTR(ARTCUST2.CUST_STORE_ZIP_CODE,1,5)
) X WHERE ZIP2FIPS.ZIPCODE (+) = X.CUST_STORE_ZIP_CODE

https://stackoverflow.com/questions/23560996/return-results-of-a-sql-query-as-json-in-oracle-12c

select JSON_OBJECT(FIPS, AMT_SOLD) from (
SELECT LPAD(ZIP2FIPS.FIPS,5,'0') FIPS, SUM (X.AMT_SOLD) AMT_SOLD FROM ZIP2FIPS, (
SELECT SUBSTR(ARTCUST2.CUST_STORE_ZIP_CODE,1,5) CUST_STORE_ZIP_CODE
, SUM (RSTRETL1.AMT_SOLD) AMT_SOLD
FROM RSTRETL1, ARTCUST2
WHERE ARTCUST2.CUST_CODE = RSTRETL1.CUST_CODE
  AND ARTCUST2.CUST_STORE_NO = RSTRETL1.CUST_STORE_NO
AND RSTRETL1.OPS_YYYYPP = '202406'
GROUP BY SUBSTR(ARTCUST2.CUST_STORE_ZIP_CODE,1,5)
) X WHERE ZIP2FIPS.ZIPCODE (+) = X.CUST_STORE_ZIP_CODE
GROUP BY LPAD(ZIP2FIPS.FIPS,5,'0')
)






We may have to subscribe to a database
https://www.zip-codes.com/zip-code-database.asp


from here I downloaded 12 files saved in the assets\hud folder
this one might be a better source to use for zip to fips
but it has an issue where the same zip code maps to multiple FIPS
https://www.huduser.gov/apps/public/uspscrosswalk/home
