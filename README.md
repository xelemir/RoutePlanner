<img src="src/main/java/public/fmi_maps.png" alt="FMI Maps">

<h1 align="center">FMI Maps</h1>

<p align="center">
FMI Maps, a University of Stuttgart course project, leverages Javalin, a Java web framework, to serve both the frontend and API endpoints.
A custom Dijkstra algorithm implementation handles route calculation, with data provided by the University of Stuttgart's <a href="https://fmi.uni-stuttgart.de/alg/research/stuff/">Institute for Formal Methods in Computer Science</a>. The graph for the Germany road network contains around 25 million nodes and 50 million edges.
Routes are visualized using MAPBOX GL JS. When a route is calculated, the frontend displays the route on the map as a blue line using GeoJSON. The Route can then be viewed in 3D.
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
  - On an M1 Pro MacBook Pro, the one-to-all Dijkstra takes 8696ms to calculate.

- <u>Route Visualization</u>
  - After the route is calculated, it will be displayed on the map as a blue line using GeoJSON.
  - In the upper right corner of the map, you can open the DevView to get more information about the route, like startNodeID, endNodeID, distance and calculation time.
  - If an error occurs during the calculation or the nearest node search, you will get an error message displayed on the map.

- <u>One-to-All Dijkstra</u>
  - You can also calculate the shortest path from a single node to all other nodes.
  - This however cannot be done using the frontend. You must use the code interface provided by the `Dijkstra` class.
  - Please use the Method `shortestPath(int start, int end)` with the arguments `<YOUR_START_NODE_ID>` and `-1` within the `Dijkstra` class. The `-1` will make sure that the algorithm will calculate the shortest path to all other nodes without stopping early.
  - Now you can use the `getAllRouteTo(int EndNode)` method to get the shortest path from the start node to any point you desire with the distances and predecessors you just calculated.

## 📷 Stuttgart <a name = "images"></a>


<img src="src/main/java/public/fmi_maps_stuttgart.png" style="border-radius: 20px;" alt="Stuttgart, just because the screenshots looks so good :)">


## 🔧 Configuration <a name = "configuration"></a>
To execute the project as required by the course, you need to do the following:
- Install Java with Maven.
- Clone the repository.
- Download the graph data (germany.fmi.bz2) from the [FMI](https://fmi.uni-stuttgart.de/alg/research/stuff/) and the benchmark data from [here]( https://fmi.uni-stuttgart.de/files/alg/data/graphs/Benchs.tar.bz2).
- Place the extracted files (germany.fmi, germany.que and germany.sol) in the root directory of the project.
- Increase the JVM heap size to 6GB. (On Linux and MacOS, you may use `export MAVEN_OPTS="-Xmx6g"`, on Windows, you may use `set MAVEN_OPTS="-Xmx6g"`.)
- cd into the project directory.
- Run `mvn compile`.
- Run the benchmark with `mvn exec:java -Dexec.mainClass="com.gruettecloud.www.Benchmark" -Dexec.args="-graph germany.fmi -lon 9.098 -lat 48.746 -que germany.que -s 638394"`.
- If you'd like to use the GUI, obtain a Mapbox API key and place it in the `src/main/java/public/javascripts.js` file.
- Finally, run `mvn exec:java -Dexec.mainClass="com.gruettecloud.www.App"`. The web app will be available at http://localhost:7070/.

## ✍️ Authors <a name = "authors"></a>
- [@Xiwen](https://github.com/Xiwen728)
- [@Knut](https://github.com/KnutHer)
- [@Jan](https://github.com/xelemir)