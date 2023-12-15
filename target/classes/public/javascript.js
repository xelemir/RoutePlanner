var start = [null, null, null];
var destination = [null, null, null];

var inputSelected = destination;

document.getElementById("destination-input").focus();

document.getElementById("start-input").addEventListener("focus", function() {
    inputSelected = "start";
});

document.getElementById("destination-input").addEventListener("focus", function() {
    inputSelected = "destination";
});


var map = new L.map('map', {
    center: [48.783, 9.183],
    zoom: 13,
    zoomControl: false,
});

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function setMarker(lat, lng, role) {
    var marker = L.marker([lat, lng]).addTo(map).bindPopup('<b>' + role + '</b><br />' + lat.toFixed(6) + ", " + lng.toFixed(6)).openPopup();
}


function onMapClick(e) {
    if (destination[0] == null || start[0] == null) {
        getNearestNode(e.latlng.lat, e.latlng.lng);
    }
}

map.on('click', onMapClick);

function showInputReset(input) {
    if (input == "start") {
        document.getElementById("reset-start-input").style.display = "flex";
    } else if (input == "destination") {
        document.getElementById("reset-destination-input").style.display = "flex";
    } else if (input == "start-hide") {
        document.getElementById("reset-start-input").style.display = "none";
    } else if (input == "destination-hide") {
        document.getElementById("reset-destination-input").style.display = "none";
    }
}

function reset(input) {
    document.getElementById("buttons").style.display = "none";
    document.getElementById("calculate-button").style.display = "flex";
    document.getElementById("reset-button").style.display = "none";
    document.getElementById("no-route-found").style.display = "none";

    document.getElementById("start-results").style.display = "none";
    document.getElementById("start-results").innerHTML = "";
    document.getElementById("destination-results").style.display = "none";
    document.getElementById("destination-results").innerHTML = "";
    document.getElementById("start-search-icon").style.display = "none";
    document.getElementById("destination-search-icon").style.display = "none";

    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });

    if (input == "start") {
        start = [null, null, null];
        document.getElementById("start-input").value = "";
        document.getElementById("start-input").style.display = "flex";
        document.getElementById("start-coordinates").style.display = "none";
        document.getElementById("reset-start-input").style.display = "none";

        document.getElementById("my-location").style.display = "flex";

        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getPopup().getContent().startsWith("<b>Start</b>")) {
                map.removeLayer(layer);
            }
        });
        inputSelected = "start";
        document.getElementById("start-node").innerHTML = "-";
        document.getElementById("start-input").focus();

    } else if (input == "destination") {
        destination = [null, null, null];
        document.getElementById("destination-input").value = "";
        document.getElementById("destination-input").style.display = "flex";
        document.getElementById("destination-coordinates").style.display = "none";
        document.getElementById("reset-destination-input").style.display = "none";

        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getPopup().getContent().startsWith("<b>Destination</b>")) {
                map.removeLayer(layer);
            }
        });
        inputSelected = "destination";
        document.getElementById("end-node").innerHTML = "-";
        document.getElementById("destination-input").focus();

    } else if (input == "all") {
        reset("start");
        reset("destination");

        inputSelected = "destination";
        document.getElementById("start").style.display = "none";
        document.getElementById("route-decorator").style.display = "none";
        document.getElementById("distance").innerHTML = "-";
        document.getElementById("timer").innerHTML = "-";
        document.getElementById("restart-button").style.display = "none";
        document.getElementById("destination-input").focus();
    }
}

function handleNodeResponse(lat, lon, node) {
    document.getElementById("start-results").style.display = "none";
    document.getElementById("start-results").innerHTML = "";
    document.getElementById("destination-results").style.display = "none";
    document.getElementById("destination-results").innerHTML = "";
    document.getElementById("start-search-icon").style.display = "none";
    document.getElementById("destination-search-icon").style.display = "none";
    document.getElementById("restart-button").style.display = "flex";

    if (inputSelected == "start") {
        start = [lat, lon, node];
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getPopup().getContent().startsWith("<b>Start</b>")) {
                map.removeLayer(layer);
            }
        });
        document.getElementById("my-location").style.display = "none";
        setMarker(lat, lon, "Start");
        document.getElementById("start-coordinates").innerHTML = lat.toFixed(6) + ", " + lon.toFixed(6);
        document.getElementById("start-input").style.display = "none";
        document.getElementById("start-coordinates").style.display = "flex";
        document.getElementById("start-node").innerHTML = node;

    } else {
        inputSelected = "start";
        destination = [lat, lon, node];
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getPopup().getContent().startsWith("<b>Destination</b>")) {
                map.removeLayer(layer);
            }
        });
        setMarker(lat, lon, "Destination");
        document.getElementById("destination-coordinates").innerHTML = lat.toFixed(6) + ", " + lon.toFixed(6);
        document.getElementById("destination-input").style.display = "none";
        document.getElementById("destination-coordinates").style.display = "flex";
        document.getElementById("end-node").innerHTML = node;

        document.getElementById("start").style.display = "flex";
        document.getElementById("route-decorator").style.display = "flex";
        document.getElementById("start-input").focus();
    }

    if (start[0] != null && destination[0] != null) {
        document.getElementById("buttons").style.display = "flex";
    }

    

    if (inputSelected == "start") {
        
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
                handleNodeResponse(lat, lon, node);
            },
            error: function(xhr, status, error) {
                if (xhr.status == 400) {
                    displayError(xhr, error, "No node in suitable distance found.");
                } else {
                    displayError(xhr, error, xhr.responseText);
                }
            }
        });
    }
}

function calculateRoute() {
    if (start[0] != null && destination[0] != null) {
        document.getElementById("calculate-button").style.display = "none";
        document.getElementById("calculating-wheel").style.display = "flex";
        $.ajax({
            url: "/route?start=" + encodeURIComponent(start[2]) + "&end=" + encodeURIComponent(destination[2]),
            method: 'GET',
            success: function(response) {

                var json = JSON.parse(response);
                var timeElapsed = json["timeElapsed"];
                var start = json["startNode"];
                var destination = json["endNode"];
                var distance = json["distance"];
                var geojson = json["geoJson"];

                map.eachLayer(function (layer) {
                    if (layer instanceof L.GeoJSON) {
                        map.removeLayer(layer);
                    }
                });

                L.geoJSON(geojson).addTo(map);
                console.log("Time elapsed: " + timeElapsed + "ms");

                document.getElementById("calculating-wheel").style.display = "none";
                document.getElementById("reset-button").style.display = "flex";
                document.getElementById("start-node").innerHTML = start;
                document.getElementById("end-node").innerHTML = destination;
                document.getElementById("distance").innerHTML = distance;
                document.getElementById("timer").innerHTML = timeElapsed + "ms";

                map.fitBounds(L.geoJSON(geojson).getBounds());
            },
            error: function(xhr, status, error) {
                if (xhr.status == 400) {
                    document.getElementById("calculating-wheel").style.display = "none";
                    document.getElementById("no-route-found").style.display = "flex";
                } else {
                    displayError(xhr, error, xhr.responseText);
                }
            }
        });
    }
}

function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(useUserLocation);
    } else { 
        displayError(null, "Geolocation is not supported by this browser.", null);
    }
}

function useUserLocation(position) {
    inputSelected = "start";
    getNearestNode(position.coords.latitude, position.coords.longitude);
}

function toggleDevViewContent() {
    if (document.getElementById("dev-view-content").style.display == "none") {
        document.getElementById("dev-view-content").style.display = "flex";
        document.getElementById("toggle-dev-view").style.boxShadow = "none";
    } else {
        document.getElementById("dev-view-content").style.display = "none";
        document.getElementById("toggle-dev-view").style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
    }
}

function displayError(xhr, error, message) {
    var errorElement = document.getElementById("error");
    var errorMessageElement = document.getElementById("error-message");

    errorElement.style.display = "flex";
    errorMessageElement.innerHTML = xhr.status + " " + error + "<br>" + message;

    setTimeout(function() {
        errorElement.style.display = "none";
    }, 4000);
}



$(document).ready(function() {
    let debounceTimers = {};

    function updateSearchResults(role) {
        var inputSearchBar = document.getElementById(role + "-input").value;
        var searchResults = document.getElementById(role + "-results");

        clearTimeout(debounceTimers[role]);
        debounceTimers[role] = setTimeout(function() {

            $.ajax({
                url: "/search_place?query=" + encodeURIComponent(inputSearchBar),
                type: 'GET',
                success: function(response) {
                    response = JSON.parse(response);
                    searchResults.innerHTML = "";
                    searchResults.style.display = "flex";

                    if (response.length == 0) {
                        searchResults.append("No results found.");
                        return;
                    }
                
                    for (var i = 0; i < response.length; i++) {
                        var place = response[i];
                        var lat = place["lat"].toFixed(6);
                        var lon = place["lon"].toFixed(6);
                        var display_name = place["display_name"];

                        var placeElement = document.createElement("div");
                        placeElement.innerHTML =  '<div onclick="getNearestNode(' + lat + ' ,' + lon + ')" style="cursor: pointer; width: 100%; display: flex; flex-direction: row; gap: 10px; margin: 10px 0;"><div style="display: flex; justify-content: left; align-items: center;"><span style="margin-right: 5px; font-size: 1.8em;" class="material-symbols-outlined align-icons-center">public</span></div><div style="display: flex; justify-content: right; align-items: center; flex: 1;"><p style="margin: 0;">' + display_name + '</p></div></div>';
                        searchResults.append(placeElement);

                    }
                },
                error: function(xhr, status, error) {
                    displayError(xhr, error, xhr.responseText);
                }
            });
        }, 1000);
    } 

    $('#start-input, #destination-input').on('input', function() {
        var role = this.id.split("-")[0];

        document.getElementById("start-results").style.display = "none";
        document.getElementById("start-results").innerHTML = "";
        document.getElementById("destination-results").style.display = "none";
        document.getElementById("destination-results").innerHTML = "";

        if (role == "start") {
            document.getElementById("my-location").style.display = "none";
            document.getElementById("start-search-icon").style.display = "flex";
        } else {
            document.getElementById("destination-search-icon").style.display = "flex";
        }
        
        if (this.value === "") {
            document.getElementById("my-location").style.display = "flex";
            if (role == "start") {
                document.getElementById("start-search-icon").style.display = "none";
            } else {
                document.getElementById("destination-search-icon").style.display = "none";
            }
            clearTimeout(debounceTimers[role]);
            return;
        } else if (this.value.includes(",") && this.value.split(",").length == 2 && !isNaN(this.value.split(",")[0]) && !isNaN(this.value.split(",")[1])) {
            var lat = this.value.split(",")[0];
            var lon = this.value.split(",")[1];
            getNearestNode(lat, lon);
            return;
        }
        
        updateSearchResults(role);
    });
});