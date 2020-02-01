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
 var closeSpaces;

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


/** Now we query the API to return the data of interest
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
    
});

});