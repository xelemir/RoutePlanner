mapboxgl.accessToken = '<MAPBOX_ACCESS_TOKEN>';

let start = [null, null, null];
let destination = [null, null, null];
let inputSelected = "destination";
let route = null;
const markers = [];

document.getElementById("destination-input").focus();
document.getElementById("start-input").addEventListener("focus", () => {
  inputSelected = "start";
});
document.getElementById("destination-input").addEventListener("focus", () => {
  inputSelected = "destination";
});

const map = new mapboxgl.Map({
  container: 'map',
  center: [9.183, 48.783],
  zoom: 16,
  style: 'mapbox://styles/mapbox/standard',

});

map.on('style.load', () => {
  
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14
  });
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 1 });
  map.addImport({
    id: 'hd-roads',
    url: 'mapbox://styles/mapbox/high-definition-roads',
  });
  
});

function setMarker(lat, lng, role) {
  const color = role === "Start" ? "#34C759" : "#FF3B30";
  const marker = new mapboxgl.Marker({ color })
    .setLngLat([lng, lat])
    .addTo(map);
  markers.push(marker);
}

function goIn3DThroughRoute() {
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 0 });

  if (!route || !route.features || !route.features.length) {
    console.error("No route available.");
    return;
  }
  const coordinates = route.features[0].geometry.coordinates;
  if (coordinates.length < 2) {
    console.error("Not enough coordinates to form a route.");
    return;
  }

  map.setPitch(90);
  const cameraAltitude = 1;
  const [startCoord, nextCoord] = [coordinates[0], coordinates[1]];
  const computedAngle = Math.atan2(nextCoord[1] - startCoord[1], nextCoord[0] - startCoord[0]) * (180 / Math.PI);
  const bearing = (90 - computedAngle + 360) % 360;
  const startLookAtTurf = turf.destination(turf.point(startCoord), 1, bearing, { units: "meters" });
  let startLookAt = {
    lng: startLookAtTurf.geometry.coordinates[0],
    lat: startLookAtTurf.geometry.coordinates[1]
  };

  const initialCamera = map.getFreeCameraOptions();
  initialCamera.position = mapboxgl.MercatorCoordinate.fromLngLat(
    { lng: startCoord[0], lat: startCoord[1] },
    cameraAltitude
  );
  initialCamera.lookAtPoint({ lng: startLookAt.lng, lat: startLookAt.lat });
  map.setFreeCameraOptions(initialCamera);

  const lerp = (a, b, t) => a + (b - a) * t;
  const speed = 10;

  function animateSegment(index) {
    if (index >= coordinates.length - 1) {
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1 });
      return;
    }

    const segStart = coordinates[index];
    const segEnd = coordinates[index + 1];

    // Average bearing over next few segments
    const segmentsToAverage = 4;
    let avgSin = 0, avgCos = 0, count = 0;
    for (let i = index; i < Math.min(index + segmentsToAverage, coordinates.length - 1); i++) {
      const angleRad = Math.atan2(
        coordinates[i + 1][1] - coordinates[i][1],
        coordinates[i + 1][0] - coordinates[i][0]
      );
      avgCos += Math.cos(angleRad);
      avgSin += Math.sin(angleRad);
      count++;
    }
    const segBearing = (90 - (Math.atan2(avgSin / count, avgCos / count) * (180 / Math.PI)) + 360) % 360;
    const targetLookAtTurf = turf.destination(turf.point(segEnd), 10, segBearing, { units: "meters" });
    const targetLookAt = {
      lng: targetLookAtTurf.geometry.coordinates[0],
      lat: targetLookAtTurf.geometry.coordinates[1]
    };

    const startPosition = { lng: segStart[0], lat: segStart[1], altitude: cameraAltitude };
    const targetPosition = { lng: segEnd[0], lat: segEnd[1], altitude: cameraAltitude };
    const distance = turf.distance(turf.point(segStart), turf.point(segEnd), { units: "meters" });
    const duration = (distance / speed) * 300;
    const startTime = performance.now();

    function animate() {
      const t = Math.min((performance.now() - startTime) / duration, 1);
      const interpPosition = mapboxgl.MercatorCoordinate.fromLngLat(
        { lng: lerp(startPosition.lng, targetPosition.lng, t), lat: lerp(startPosition.lat, targetPosition.lat, t) },
        lerp(startPosition.altitude, targetPosition.altitude, t)
      );
      const interpLookAt = {
        lng: lerp(startLookAt.lng, targetLookAt.lng, t),
        lat: lerp(startLookAt.lat, targetLookAt.lat, t)
      };

      const cam = map.getFreeCameraOptions();
      cam.position = interpPosition;
      cam.lookAtPoint(interpLookAt);
      map.setFreeCameraOptions(cam);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        startLookAt = targetLookAt;
        animateSegment(index + 1);
      }
    }
    requestAnimationFrame(animate);
  }

  animateSegment(0);
}

map.on('click', (e) => {
  if (markers.length >= 2) return;
  getNearestNode(e.lngLat.lat, e.lngLat.lng);
});

function showInputReset(input) {
  const displayStyle = input.endsWith("hide") ? "none" : "flex";
  const elementId = input.includes("start") ? "reset-start-input" : "reset-destination-input";
  document.getElementById(elementId).style.display = displayStyle;
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

  if (route) {
    try {
      map.removeLayer('route-line-inner');
      map.removeLayer('route-line-border');
      map.removeSource('route');
    } catch (error) {
      console.log("No route to remove.");
    }
  }

  if (input === "start") {
    start = [null, null, null];
    document.getElementById("start-input").value = "";
    document.getElementById("start-input").style.display = "flex";
    document.getElementById("start-coordinates").style.display = "none";
    document.getElementById("reset-start-input").style.display = "none";
    document.getElementById("my-location").style.display = "flex";
    inputSelected = "start";
    document.getElementById("start-node").innerHTML = "-";

    // Remove start markers
    for (let i = markers.length - 1; i >= 0; i--) {
      if (markers[i]._color === "#34C759") {
        markers[i].remove();
        markers.splice(i, 1);
      }
    }
  } else if (input === "destination") {
    destination = [null, null, null];
    document.getElementById("destination-input").value = "";
    document.getElementById("destination-input").style.display = "flex";
    document.getElementById("destination-coordinates").style.display = "none";
    document.getElementById("reset-destination-input").style.display = "none";
    inputSelected = "destination";
    document.getElementById("end-node").innerHTML = "-";

    for (let i = markers.length - 1; i >= 0; i--) {
      if (markers[i]._color === "#FF3B30") {
        markers[i].remove();
        markers.splice(i, 1);
      }
    }
  } else if (input === "all") {
    reset("start");
    reset("destination");
    inputSelected = "destination";
    document.getElementById("start").style.display = "none";
    document.getElementById("route-decorator").style.display = "none";
    document.getElementById("destination-icon").innerHTML = "search";
    document.getElementById("distance").innerHTML = "-";
    document.getElementById("timer").innerHTML = "-";
    document.getElementById("restart-button").style.display = "none";
    document.getElementById("destination-input").focus();

    markers.forEach(marker => marker.remove());
  }
}

function handleNodeResponse(lat, lon, node) {
  document.getElementById("start-results").style.display = "none";
  document.getElementById("start-results").innerHTML = "";
  document.getElementById("destination-results").style.display = "none";
  document.getElementById("destination-results").innerHTML = "";
  document.getElementById("restart-button").style.display = "flex";

  if (inputSelected === "start") {
    start = [lat, lon, node];
    markers.forEach(marker => {
      if (marker._color === "#34C759") marker.remove();
    });
    document.getElementById("my-location").style.display = "none";
    setMarker(lat, lon, "Start");
    document.getElementById("start-coordinates").innerHTML = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    document.getElementById("start-input").style.display = "none";
    document.getElementById("start-coordinates").style.display = "flex";
    document.getElementById("start-node").innerHTML = node;
  } else {
    destination = [lat, lon, node];
    markers.forEach(marker => {
      if (marker._color === "#FF3B30") marker.remove();
    });
    setMarker(lat, lon, "Destination");
    document.getElementById("destination-coordinates").innerHTML = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    document.getElementById("destination-input").style.display = "none";
    document.getElementById("destination-coordinates").style.display = "flex";
    document.getElementById("end-node").innerHTML = node;
    document.getElementById("start").style.display = "flex";
    document.getElementById("route-decorator").style.display = "flex";
    document.getElementById("destination-icon").innerHTML = "location_on";
    document.getElementById("start-input").focus();
  }

  if (start[0] !== null && destination[0] !== null) {
    document.getElementById("buttons").style.display = "flex";
  }
}

function getNearestNode(lat, lon) {
  if (lat && lon) {
    $.ajax({
      url: `/nearestNode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
      method: 'GET',
      success: (response) => {
        const jsonData = JSON.parse(response);
        handleNodeResponse(jsonData[1], jsonData[2], jsonData[0]);
      },
      error: (xhr, status, error) => {
        const message = xhr.status === 400 ? "No node in suitable distance found." : xhr.responseText;
        displayError(xhr, error, message);
      }
    });
  }
}

function calculateRoute() {
  if (start[0] && destination[0]) {
    document.getElementById("calculate-button").style.display = "none";
    document.getElementById("calculating-wheel").style.display = "flex";
    $.ajax({
      url: `/route?start=${encodeURIComponent(start[2])}&end=${encodeURIComponent(destination[2])}`,
      method: 'GET',
      success: (response) => {
        const json = JSON.parse(response);
        route = json.geoJson;

        map.addSource('route', { type: 'geojson', data: route });
        map.addLayer({
          id: 'route-line-border',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round', 'line-z-offset': 1 },
          paint: { 'line-color': '#007AFF', 'line-width': 14, 'line-opacity': 1}
        });
        map.addLayer({
          id: 'route-line-inner',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round', 'line-z-offset': 1 },
          paint: { 'line-color': '#009AFF', 'line-width': 8, 'line-opacity': 1 }
        });

        document.getElementById("calculating-wheel").style.display = "none";
        document.getElementById("reset-button").style.display = "flex";
        document.getElementById("start-node").innerHTML = json.startNode;
        document.getElementById("end-node").innerHTML = json.endNode;
        document.getElementById("distance").innerHTML = json.distance;
        document.getElementById("timer").innerHTML = `${json.timeElapsed}ms`;
      },
      error: (xhr, status, error) => {
        if (xhr.status === 400) {
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
    displayError(null, "Geolocation not supported.", null);
  }
}

function useUserLocation(position) {
  inputSelected = "start";
  getNearestNode(position.coords.latitude, position.coords.longitude);
}

function toggleDevViewContent() {
  const devContent = document.getElementById("dev-view-content");
  const toggleBtn = document.getElementById("toggle-dev-view");
  if (devContent.style.display === "none") {
    devContent.style.display = "flex";
    toggleBtn.style.boxShadow = "none";
  } else {
    devContent.style.display = "none";
    toggleBtn.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  }
}

function displayError(xhr, error, message) {
  const errorElement = document.getElementById("error");
  const errorMessageElement = document.getElementById("error-message");
  errorElement.style.display = "flex";
  errorMessageElement.innerHTML = `${xhr?.status || ""} ${error}<br>${message}`;
  setTimeout(() => (errorElement.style.display = "none"), 4000);
}

$(document).ready(() => {
  const debounceTimers = {};

  function updateSearchResults(role) {
    const inputEl = document.getElementById(`${role}-input`);
    const searchResults = document.getElementById(`${role}-results`);
    clearTimeout(debounceTimers[role]);
    debounceTimers[role] = setTimeout(() => {
      $.ajax({
        url: `/search_place?query=${encodeURIComponent(inputEl.value)}`,
        method: 'GET',
        success: (response) => {
          const results = JSON.parse(response);
          searchResults.innerHTML = "";
          searchResults.style.display = "flex";
          if (!results.length) {
            searchResults.textContent = "No results found.";
            return;
          }
          results.forEach(place => {
            const lat = place.lat.toFixed(6);
            const lon = place.lon.toFixed(6);
            const displayName = place.display_name;
            const placeElement = document.createElement("div");
            placeElement.innerHTML = `
                <div onclick="getNearestNode(${lat}, ${lon})" style="opacity: 0.8; cursor: pointer; align-items: start; display: flex; flex-direction: row; gap: 10px; margin: 0; white-space: wrap; overflow: hidden; text-overflow: ellipsis;">
                    <div style="display: flex; align-items: center;">
                      <span class="material-symbols-outlined" style="font-size: 1.5em;">public</span>
                    </div>
                    <div style="display: flex; align-items: center; flex: 1; margin-top: 1px;">
                      <p style="margin: 0; font-size: 0.9em;">${displayName}</p>
                    </div>
                </div>`;
            searchResults.appendChild(placeElement);
          });
        },
        error: (xhr, status, error) => {
          displayError(xhr, error, xhr.responseText);
        }
      });
    }, 1000);
  }

  $('#start-input, #destination-input').on('input', function () {
    const role = this.id.split("-")[0];
    document.getElementById("start-results").style.display = "none";
    document.getElementById("start-results").innerHTML = "";
    document.getElementById("destination-results").style.display = "none";
    document.getElementById("destination-results").innerHTML = "";
    if (role === "start") {
      document.getElementById("my-location").style.display = "none";
    }
    if (this.value === "") {
      document.getElementById("my-location").style.display = "flex";
      document.getElementById(`${role}-search-icon`).style.display = "none";
      clearTimeout(debounceTimers[role]);
      return;
    } else if (this.value.includes(",") && this.value.split(",").length === 2 &&
               !isNaN(this.value.split(",")[0]) && !isNaN(this.value.split(",")[1])) {
      const [lat, lon] = this.value.split(",");
      getNearestNode(lat, lon);
      return;
    }
    updateSearchResults(role);
  });
});