console.log("JS is connected up");

$(()=>{

/**Build the map when the page loads.  Default to my home location
 * Code courtesy of Leaflet tutorial
 */

 const myLatitude = 40.6677;
 const myLongitude = -73.9947;

 // English units - this is in miles.
 const radiusOfEarth = 3958.8;

 const maxRadius = 1;

 // empty array to capture the closest green space
 // initializing up here because I'll need to use the contents in several places
 var closeSpaces;


 // these will hold items eventually written to the DOM
 let $tableDiv;
 let $newTable;
 let $newBody;
var mymap = L.map('mapid').setView([40.6677, -73.9947], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoidHkxODg4MSIsImEiOiJjazYyeHJ6N2owaTV5M2xtbXNvOTVxcmtuIn0.uOgry8Bn_ka1aici0x-7aw'
}).addTo(mymap);

var marker = L.marker([40.6677, -73.9947]).addTo(mymap);


// this function will calculate the distance between our starting point and 
// the greenspace returned from the API.

const calcDistance = (latitude, longitude) => {
    // use Equirectangular Approximation to calculate the approximate distance 
    // between our starting point and this greenspace.
    
    // longitude calculation
    // the lat and long values are numbers according to the API documentation.
    // 2020.02.01 - come back and check if we can remove this conversion step later.

    // also need to check for blank values as some items in the data set don't have lat and long specified.

    var numLatitude = parseFloat(latitude);
    var numLongitude = parseFloat(longitude);
     

    // console.log(`Greenspace Location: Latitude: ${numLatitude} Longitude: ${numLongitude}`);

    var x = (myLongitude - numLongitude) * Math.cos((myLatitude + numLatitude)/2);

    var y = (myLatitude - numLatitude);

    // var distance = Math.sqrt(x*x + y*y) * radiusOfEarth;

    var distance = Math.sqrt(x*x + y*y);

    console.log(`distance calculated = ${distance}`);
    return distance;
     
}

const isInRange = (element) => {
    console.log(`checking distance from ${myLatitude} ${myLongitude}`);
    
    // get the latitude and longitude values for the greenspace object in the array.
    // 2020.02.01 - if these values are not in the dataset, could we calculate them on the fly using
    // address?  Possible extension to the code for later consideration.

    var currLat = element.latitude;
    var currLong = element.longitude;

    console.log(`Greenspace Location from the object: Latitude: ${element.latitude} Longitude: ${element.longitude}`);
    // calculate the distance between the greenspace and user's current location.

    var distanceFrom = calcDistance(currLat, currLong);

    // 2020.02.01 - Need to return to this.  Got turned around about the units on this calculation.
    // for right now just using the raw number calculated and not multiplying by feet, yards, miles, etc.

    // RETURN TRUE if distance between greenspace and current location < maxRadius.
    return distanceFrom <= maxRadius;
}

/** PURPOSE:  Add new markers to our existing map object.
 * callback function for a forEach call against the array of greenspaces
 * within the specified range.
 */
const markTheMap = (element) => {

    var marker = L.marker([element.latitude, element.longitude]).addTo(mymap);
    // 2020.02.01 - add garden name to the tooltip that pops up.
}

// function to build table that holds matrix of greenspaces to be displayed below the map
// adds the table to the DOM as well.

const buildTableStructure = () => {
    $tableDiv = $("<div>").addClass("greenspace-table");
    $newTable = $("<table>");
    $tableCaption = $("<caption>").text("Nearby Greenspaces");
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
// function to generate divs to hold the matrix of greenspaces below the map
const makeGreenspaceTable = (element) => {
    // this list will only include those places deemed closest to the user's current location.
    /**
     * <tr>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
	</tr>
	<tr>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
	</tr>
     */
    
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

$.ajax({
    url: "https://data.cityofnewyork.us/resource/ajxm-kzmj.json?boro=B&community_board=B07",
    type: "GET",
    data: {
      "$limit" : 300
    }
}).then
    (function(data) {
//   alert("Retrieved " + data.length + " records from the dataset!");
//   console.log(data);

/**data = an array.  We would like to filter the contents of the array by 
 * distance from our original point.
 */

     closeSpaces = data.filter(isInRange);
     console.log(closeSpaces);
  
     // we have an array with just the spaces within the desired radius.
     // need to display them on our map.
    // 2020.02.01 - QUESTION:  Can I customize the markers that appear on the map?
    // want the located space markers to look different from the user's location.
    // ANSWER:  yes,  look here for details - we will need a selected image though.
    // https://leafletjs.com/examples/custom-icons/


    // logic to add a marker for each space within the radius
    // forEach loop with callback to create the markers on the map?

    closeSpaces.forEach(markTheMap);
    

    // BEGIN:  displaying list of greenspaces below the map
    
    // build the table structure in the DOM.
    buildTableStructure();

    // populate the table structure with the data on the spaces we located.
    closeSpaces.forEach(makeGreenspaceTable);
    
});

});