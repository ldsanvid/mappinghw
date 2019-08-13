// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, marker) {
    marker.bindPopup("<h3>" + "Place  " + "</h3>" + "<h2>" + feature.properties.place + "</h2><hr><p>" + 
    "<h3>" + "Date" + "</h3>" + new Date(feature.properties.time) + "<hr><p>" +
    "<h1>" + "Magnitude" + "</h1>" + "<h1>" + feature.properties.mag + "</h1>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

   pointToLayer: function(feature, latlng) {
    return new L.circleMarker(latlng, 
      {radius: markerSize(feature.properties.mag * 2)});
    },
   
    style: function(d){
        return {
            fillColor: getColor(d.properties.mag),
            fillOpacity: .6,
            color: "white",
            stroke: true,
            weight: .8
        }
    }
    
});

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// making circles size proportional to earthquake magnitude
function markerSize(magnitude){
    return magnitude * 3;
  }

//selecting the colors for circle markers
function getColor(d) {
    return d>6 ? "magenta":
          d>4.4 ? "red":
          d>2.6 ? "yellow":
          d>1 ? "lime":
          "#00fa00";
  };

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        30, 0
      ],
      zoom: 2.4,
      layers: [darkmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    //legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [1, 2.6, 4.4, 6],
      labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
           //   '<i style="background:' + getColor(magn[i] + 1) + '"></i> ' +
           //   magn[i] + (magn[i + 1] ? '&ndash;' + magn[i + 1] + '<br>' : '+');
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
    return div;
    };
  
  legend.addTo(myMap);
};
