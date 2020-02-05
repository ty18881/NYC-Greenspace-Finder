
$(()=>{

 let myLatitude = 0;
 let myLongitude = 0;

 // English units - this is in miles.
 const radiusOfEarth = 3958.8;

 // this is used to determine which greenspaces get displayed
 // anything further than 1 mile away, won't appear on the map.
 const maxRadius = 1;

 // this is used in calcDistance several times so figured 
 // we'd have it here.
 const radianFactor = Math.PI / 180;

 // empty array to capture the closest green space
 // initializing up here because I'll need to use the contents in several places
 let closeSpaces;

 let selectedBorough = "B";

 let baseURL = "https://data.cityofnewyork.us/resource/ajxm-kzmj.json";

 // these will hold items eventually written to the DOM
 let $tableDiv;
 let $newTable;
 let $newBody;
 let myMap;


/**
 * Helper Functions
 */

/** buildMap
 * PURPOSE: 
 * Build the map when the page loads.  Default to my home location
 * Code courtesy of Leaflet tutorial
 * https://leafletjs.com/examples/mobile/
 */
const buildMap = () => {


            // render the whole world by default.
         myMap = L.map('mapid').fitWorld();


        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            accessToken: 'pk.eyJ1IjoidHkxODg4MSIsImEiOiJjazYyeHJ6N2owaTV5M2xtbXNvOTVxcmtuIn0.uOgry8Bn_ka1aici0x-7aw'
        }).addTo(myMap);

        // this will prompt user to let us get their location then will set the view to that location.
        myMap.locate({setView: true, maxZoom: 16});

        // in case the user doesn't let us get the location data or the 
        // query fails, Leaflet suggested we do this.
        function onLocationFound(e) {
            var radius = e.accuracy;

            myLatitude = e.latlng.lat;
            myLongitude = e.latlng.lng;

            console.log(`Detected Latitude: ${myLatitude}`);
            console.log(`Detected Longitude: ${myLongitude}`);
            // convert meters to miles

            let engRadius = radius * .000621371;

            // console.log(`auto detected location: ${e.latlng}`);
            L.marker(e.latlng).addTo(myMap)
                .bindPopup("You are within " + engRadius + " miles from this point").openPopup();

            L.circle(e.latlng, radius).addTo(myMap);
            // console.log(`Detected: latitude ${e.latlng.lat} longitude: ${e.latlng.lng}`);
            

        }

        // if the location is detected as expected, pinpoint it on the map.
        myMap.on('locationfound', onLocationFound);

        function onLocationError(e) {
            alert(e.message + " Defaulting to NYC City Hall");

            myLatitude = 40.713340;
            myLongitude = -74.003670;

            // default the location to NYC city hall.
            // center the map on that location
            // add a marker to the location
            // set the latitude and longitude coordinates used later to 
            // city hall.
            // set borough indicator to Manhattan.

            myMap.setView([myLatitude, myLongitude], 16);
            L.marker([myLatitude, myLongitude]).addTo(myMap);
            selectedBorough = "M";
           
        }

// if the location is not found or user denies the location sharing request, execute
// this function to set a default location.

                myMap.on('locationerror', onLocationError);
      

} // end building the map.
/** calcDistance
 * PURPOSE:  this function will calculate the distance between our starting point and 
 * the greenspace returned from the API.
 */


const calcDistance = (latitude, longitude) => {
    // use Equirectangular Approximation to calculate the approximate distance 
    // between our starting point and this greenspace.   

    // all latitude and longitude values must be in RADIANS.  

    let myLatInRad = myLatitude * radianFactor;
    let latInRad = latitude * radianFactor;

    let myLonInRad = myLongitude * radianFactor;

    let lonInRad = longitude * radianFactor;

    var x = (myLonInRad - lonInRad) * Math.cos((myLatInRad + latInRad)/2);

    var y = (myLatInRad - latInRad);

    var distance = Math.sqrt(x*x + y*y) * radiusOfEarth;

    // console.log(`distance calculated = ${distance}`);
    return distance;
     
}
/** isInRange:
 * PURPOSE:  Returns boolean that indicates if the particular
 * greenspace is within the desired range of the current 
 * location.
 */
const isInRange = (element) => {
    // console.log(`checking distance from ${myLatitude} ${myLongitude}`);
    
    // get the latitude and longitude values for the greenspace object in the array.
    // 2020.02.01 - if these values are not in the dataset, could we calculate them on the fly using
    // address?  Possible extension to the code for later consideration.

    var currLat = element.latitude;
    var currLong = element.longitude;

    // console.log(`Greenspace Location from the object: Latitude: ${element.latitude} Longitude: ${element.longitude}`);
    // calculate the distance between the greenspace and user's current location.

    // if no lat and long supplied, return false to the calling program.
    if (currLat != null && currLong != null){
    var distanceFrom = calcDistance(currLat, currLong);

        // RETURN TRUE if distance between greenspace and current location < maxRadius.
        if (distanceFrom <= maxRadius){
            // console.log(`Found one inside the radius`);
            return true;
        } else {
            return false;
        }
    } else{
        return false;
}
    
}

/** markTheMap:
 * PURPOSE:  Add new markers to our existing map object.
 * callback function for a forEach call against the array of greenspaces
 * within the specified range.
 */
const markTheMap = (element) => {

    var marker = L.marker([element.latitude, element.longitude], {opacity: 0.5, title: element.garden_name}).addTo(myMap);
    // 2020.02.01 - add garden name to the tooltip that pops up. DONE
}

/* buildTableStructure:
* function to build table that holds matrix of greenspaces to be displayed below the map
*  adds the table to the DOM as well.
*/

const buildTableStructure = () => {
    // container and table class designations to take advantage of Bootstrap styling.
    $tableDiv = $("<div>").addClass("greenspace-table", "container");
    $newTable = $("<table>").addClass("table", "table-condensed");
    $tableCaption = $("<caption>").text("Nearby Greenspaces").addClass("caption");
    let $tableHeader = $("<thead>").addClass("column-header");

    // make row that holds the column headings
    let $headerRow = $("<tr>");
    let $firstColumn = $("<th>").text("Space name");
    let $secondColumn = $("<th>").text("Address");
    $headerRow.append($firstColumn, $secondColumn);

    // append the header row to the table header
    $tableHeader.append($headerRow);

    // append the caption and header to the table
    $newTable.append($tableCaption, $tableHeader);

    // append the new body to the table.  contents will be populated later.
    $newBody = $("<tbody>").addClass("greenspace-body");

    $newTable.append($newBody);

    // append the table structure to the DIV container
    $tableDiv.append($newTable);

    // don't forget to append this all to the document body.
        $("body").append($tableDiv);
}


/*
* makeGreenspaceTable:  
*  function to generate divs to hold the matrix of greenspaces below the map
*/
const makeGreenspaceTable = (element) => {
    // this list will only include those places deemed closest to the user's current location.
        
    let $newRow = $("<tr>"); 
    let $spaceName = $("<td>").text(element.garden_name);
    let $spaceAddr = $("<td>").text(element.address);

    $newRow.append($spaceName, $spaceAddr);

    $newBody.append($newRow);

    // append our dynamically generated content to the table div
    $newTable.append($newBody);

}

/** MAIN PROGRAM BEGINS HERE:
 * Now we query the API to return the data of interest
 * First, let's just prove we can get the data back successfully.
 * Let's limit ourselves to Brooklyn.
 */

 // render the map. 
 // when the map signals ready, then call the API and the remainder of the program.

    buildMap();
    // whenReady doesn't work because the setting of lat and lng happens
    // after the map has the layer, i.e. before we examine
    // the event returned from the geolocation and grab the lat and lng.


    setTimeout(function(){    

   
     $.ajax({
            url: baseURL,
            type: "GET",
            data: {
            "$limit" : 600
            }
    }).then
            (function(data) {


                /**data = an array.  We would like to filter the contents of the array by 
                 * distance from our original point.
                 */

                closeSpaces = data.filter(isInRange);

                console.log(`Filtered Array has # ${closeSpaces.length} items`);
    
  
     // we have an array with just the spaces within the desired radius.
     // need to display them on our map.
    // 2020.02.01 - QUESTION:  Can I customize the markers that appear on the map?
    // want the located space markers to look different from the user's location.
    // ANSWER:  yes,  look here for details - we will need a selected image though.
    // https://leafletjs.com/examples/custom-icons/



                closeSpaces.forEach(markTheMap);
    

                // BEGIN:  displaying list of greenspaces below the map
                
                // build the table structure in the DOM.
                buildTableStructure();

                // populate the table structure with the data on the spaces we located.
                closeSpaces.forEach(makeGreenspaceTable);
    
            }); // end of AJAX call

        }, 4000); // end of the pause before executing the API call.

}); // end of document ready block.