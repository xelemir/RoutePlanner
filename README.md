<p align="center">
  <a href="" rel="noopener">
    <img width="600px" src="https://www.gruettecloud.com/static/renders/routeplanner/routeLight.png" style="border-radius: 20px;" alt="FMI Maps">
  </a>
</p>
<br>

<h1 align="center">FMI Maps</h1>

<p align="center">
FMI Maps, a University of Stuttgart course project, leverages Javalin, a Java web framework, to serve both the frontend and API endpoints.
A custom Dijkstra algorithm implementation handles route calculation, with data provided by the University of Stuttgart's <a href="https://fmi.uni-stuttgart.de/alg/research/stuff/">Institute for Formal Methods in Computer Science</a>. The graph for the Germany road network contains around 25 million nodes and 50 million edges.
Routes are visualized using GeoJSON and the Leaflet JavaScript library.
</p>

## ✨ Features <a name = "features"></a>
- <u>Nearest Node Search</u>
  - Select a start and end point on the map by clicking on it.
  - You may also enter the coordinates manually or search for a place name or address.
  - For the selection of the start point, you can also use your current location.
  - We will always find the nearest node to your selection.

- <u>Route Calculation</u>
  - After start and end point are selected, you can calculate the route.
  - The route will be calculated using a custom Dijkstra algorithm implementation.
  - Depending on the distance, the calculation may take a few seconds.
  - On an M1 Pro MacBook Pro, the longest possible route (from the most northern point to the most southern point of Germany) takes about 15 seconds to calculate.

- <u>Route Visualization</u>
  - After the route is calculated, it will be visualized on the map using GeoJSON.
  - On the upper right corner of the map, you can open the DevView to get more information about the route, like startNodeID, endNodeID, distance and calculation time.
  - If an error occurs during the calculation or the nearest node search, you will get an error message displayed on the map.

- <u>One-to-All Dijkstra</u>
  - You can also calculate the shortest path from a single node to all other nodes.
  - This however can only be done via the API. The frontend does not support this feature.
  - Please use the Method `shortestPath(int start, int end)` with the arguments `startNodeID` and `-1` within the `Dijkstra` class. The -1 endNodeID will make sure that the algorithm will calculate the shortest path to all other nodes.
  - After the calculation, please use the `getDistances()` method tand the `getPreviousNodes()` method to get the distances and predecessors of all nodes. Now you can use the `getAllRouteTo(int node, int start, int[] distances, int[] previousNodes)` method to get the shortest path from the start node to any point you desire with the distances and predecessors you just calculated.

- <u>Dark Mode</u>
  - Most importantly, we added a hacky looking dark mode to the website.
  - You can toggle the dark mode by clicking on the moon icon in the upper right corner.
  - The map is still loading the tiles normally from OpenStreetMap. However we are using a custom stylesheet to edit the colors using a filter which is layered on top of the map.

## 📷 Images <a name = "images"></a>

<div align="center">
    <img width="49%" src="https://www.gruettecloud.com/static/renders/routeplanner/routeDark.png" style="border-radius: 20px;" alt="FMI Maps">
    <img width="49%" src="https://www.gruettecloud.com/static/renders/routeplanner/addressLight.png" style="border-radius: 20px;" alt="FMI Maps">
</div>

## 🔧 Configuration <a name = "configuration"></a>
TODO

## ✍️ Authors <a name = "authors"></a>
- [@Xiwen](https://github.com/Xiwen728)
- [@Knut](https://github.com/KnutHer)
- [@Jan](https://github.com/xelemir)