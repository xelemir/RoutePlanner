var start = [null, null, null];
var destination = [null, null, null];


var map = new L.map('map', {
    center: [48.783, 9.183],
    zoom: 13,
    zoomControl: false,
});

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

/*const marker = L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();*/

function setMarker(lat, lng, role) {
    var marker = L.marker([lat, lng]).addTo(map).bindPopup('<b>' + role + '</b><br />' + lat.toFixed(6) + ", " + lng.toFixed(6)).openPopup();
}


function onMapClick(e) {
    if (destination[0] == null || start[0] == null) {
        getNearestNode(e.latlng.lat, e.latlng.lng);
    } else {
        restart();
    }
}

map.on('click', onMapClick);

function restart() {
    start = [null, null, null];
    destination = [null, null, null];
    
    document.getElementById("start").style.display = "none";
    document.getElementById("startHint").style.display = "flex";
    document.getElementById("startCoordinates").style.display = "none";
    document.getElementById("destinationHint").style.display = "flex";
    document.getElementById("destinationCoordinates").style.display = "none";
    document.getElementById("routeDecorator").style.display = "none";
    document.getElementById("calculate-button").style.display = "flex";
    document.getElementById("reset-button").style.display = "none";
    document.getElementById("calculating-wheel").style.display = "none";
    document.getElementById("buttons").style.display = "none";
    document.getElementById("restartButton").style.display = "none";

    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });

    document.getElementById("searchBar").value = "";
    document.getElementById("searchResults").style.display = "none";
    document.getElementById("close-search").style.display = "none";
}

function calculateRoute() {
    route();
}

function setCoordinates(lat, lon, node) {
    document.getElementById("searchBar").value = "";
    document.getElementById("close-search").style.display = "none";
    document.getElementById("searchResults").style.display = "none";
    document.getElementById("toggleView").style.display = "flex";

    if (destination[0] == null) {
        destination = [lat, lon, node];
        document.getElementById("start").style.display = "flex";
        document.getElementById("destinationHint").style.display = "none";
        document.getElementById("destinationCoordinates").style.display = "flex";
        document.getElementById("destinationCoordinates").innerHTML = destination[0].toFixed(6) + ", " + destination[1].toFixed(6);
        document.getElementById("routeDecorator").style.display = "flex";
        document.getElementById("restartButton").style.display = "flex";
        setMarker(destination[0], destination[1], "Destination");
    } else {
        start = [lat, lon, node];
        document.getElementById("startHint").style.display = "none";
        document.getElementById("startCoordinates").style.display = "flex";
        document.getElementById("startCoordinates").innerHTML = start[0].toFixed(6) + ", " + start[1].toFixed(6);
        document.getElementById("buttons").style.display = "flex";
        setMarker(start[0], start[1], "Start"); 
    }
}

function getNearestNode(lat, lon) {
    if (lat != null && lon != null) {
        $.ajax({
            url: "/nearestNode?lat=" + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lon),
            method: 'GET',
            success: function(response) {
                jsonData = JSON.parse(response);
                lat = jsonData[1];
                lon = jsonData[2];
                node = jsonData[0];
                setCoordinates(lat, lon, node);
            },
            error: function(xhr, status, error) {
                // Log or display the error message and status code
                console.error('Error:', error);
                console.error('Status Code:', xhr.status);
            }
        });
    }
}

function route() {
    if (start[0] != null && destination[0] != null) {
        document.getElementById("calculate-button").style.display = "none";
        document.getElementById("calculating-wheel").style.display = "flex";
        $.ajax({
            url: "/route?start=" + encodeURIComponent(start[2]) + "&end=" + encodeURIComponent(destination[2]),
            method: 'GET',
            success: function(response) {
                // add geojson to map
                var geojson = JSON.parse(response);
                L.geoJSON(geojson).addTo(map);

                document.getElementById("calculating-wheel").style.display = "none";
                document.getElementById("reset-button").style.display = "flex";
            },
            error: function(xhr, status, error) {
                // Log or display the error message and status code
                console.error('Error:', error);
                console.error('Status Code:', xhr.status);
            }
        });
    }
}

function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(useUserLocation);
    } else { 
        document.getElementById("startHint").innerHTML = "Not supported!<br>Please click on the map.";
    }
}

function useUserLocation(position) {
    getNearestNode(position.coords.latitude, position.coords.longitude);
}

function toggleView() {
    var toggleView = document.getElementById("toggleView");
    if (toggleView.style.display == "none") {
        toggleView.style.display = "flex";
    } else {
        toggleView.style.display = "none";
    }

}


$(document).ready(function() {
    // Define a variable to hold the timer ID
    let debounceTimer;

    // Function to send AJAX request and update results
    function updateSearchResults() {
        var inputSearchBar = $('#searchBar').val();
        var inputElement = $('#searchBar');
        var searchResults = $('#searchResults');
        var closeSearch = $('#close-search');
        if (inputSearchBar == "") {
            return;
        }
        searchResults.css("display", "flex");
        searchResults.html("Searching...");
        closeSearch.css("display", "flex");

        // Clear any existing timer
        clearTimeout(debounceTimer);
        /// Set a new timer to trigger the search after 1000ms (1 second)
        debounceTimer = setTimeout(function() {
            // Continue with the AJAX request and other code
            $.ajax({
                url: "/search_place?query=" + encodeURIComponent(inputSearchBar),
                type: 'GET',
                success: function(response) {
                    response = JSON.parse(response);
                    searchResults.empty();

                    if (response.length == 0) {
                        searchResults.append("No results found.");
                    }
                
                    for (var i = 0; i < response.length; i++) {
                        var place = response[i];
                        var id = place["id"];
                        var lat = place["lat"];
                        var lon = place["lon"];
                        var name = place["name"];
                        var building = place["building"];
                        var type = place["place_type"];

                        if (type == "city" || type == "town" || type == "village" || type == "hamlet" || type == "suburb" || type == "neighbourhood") {
                            symbol = "location_city";
                        } else if (building == "building") {
                            symbol = "house";
                        } else {
                            symbol = "place"
                        }

                        if (name == null) {
                            name = "Address";
                        }
                            
                        

                        var placeElement = document.createElement("div");
                        placeElement.innerHTML =  '<div onclick="getNearestNode(' + lat + ' ,' + lon + ')" style="cursor: pointer; width: 100%; display: flex; flex-direction: row; gap: 10px; margin: 10px 0;"><div style="display: flex; justify-content: left; align-items: center;"><span style="margin-right: 5px;" class="material-symbols-outlined align-icons-center">' + symbol + '</span><p>' + name + '</p></div><div style="display: flex; justify-content: right; align-items: center; flex: 1;">' + lat + ', ' + lon + '</div><div style="display: none; justify-content: right; align-items: center; flex: 1;"></div>'
                        searchResults.append(placeElement);

                    }
                },
            });
        }, 1000); // Delay the search by 1 second
    } 

    // Trigger the search when the input field changes
    $('#searchBar').on('input', function() {
        if (this.value == "") {
            return;
        }
        clearTimeout(debounceTimer); // Clear any existing timer
        debounceTimer = setTimeout(updateSearchResults, 1000); // Set a new timer to trigger the search
    });
}); 