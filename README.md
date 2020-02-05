# NYC-Greenspace-Finder

This application locates New York City Community Gardens that participate in the city's Green Thumb program.
The program uses data provide by NYC Open Data APIs.

## URL for the NYC Greenspace Finder
https://ty18881.github.io/NYC-Greenspace-Finder/

## Technologies and Frameworks
The following technologies and frameworks are used in this project:
1.  AJAX
2.  Bootstrap
3.  CSS
4.  HTML
5.  Leaflet
6.  Javascript
7.  jQuery
8.  Mapbox

## Development Approach
1. Sketch out a wireframe.
2. Divide functionality into modules
- Render Map on screen and set user's location at the center.
- Execute API query, iterate through data and render icons for each greenspace within range.
- Populate table of addresses on the screen
- Display photo carousel
- Style the address table
- Add responsive design elements
- Distinguish between user's location and the greenspaces in range on the map.


## Installation Instructions
No special install is required but you will need an internet connection to use the application

## Unsolved Problems or Wonky Things
1.  Use of setTimeout to force a pause before the API call executes.  This ensures the location finder method completes before the API call begins.
- this may result in poor performance on slower internet connections because the pre-set timeout might not be long enough.
2.  Slower response for users outside of Brooklyn or Manhattan since the dataset returned by the API won't be filtered by borough.
