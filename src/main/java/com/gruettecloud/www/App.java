package com.gruettecloud.www;

import java.util.List;
import java.util.ArrayList;
import java.net.URI;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;

/**
 * This class represents the main application for the RoutePlannerFMI project.
 * It contains the main method which starts the Javalin web server and handles HTTP requests.
 * The HTTP requests include searching for a place, finding the nearest node to a given location,
 * and finding the shortest route between two nodes.
 * The class also uses various external libraries such as Apache HttpComponents and Gson.
 * The class is responsible for parsing the response from the Overpass API and returning the results as JSON.
 */
public class App {

    /**
     * Converts a route represented as a list of node indices to a GeoJSON string.
     * 
     * @param route the route represented as a list of node indices
     * @param dataStructures the data structures object containing the nodes information
     * @return the route represented as a GeoJSON string
     */
    public static String toGeoJson(List<Integer> route, DataStructures dataStructures) {
        double[][] nodesCoordinates = dataStructures.getNodesOrderedByLatitude();
        int[][] nodesWithOffset = dataStructures.getNodesWithOffset();
        double[][] routeCoordinates = new double[route.size()-1][2];
        route.remove(route.size() - 1);

        for (int i = 0; i < route.size(); i++) {
            int nodeIndex = route.get(i);
            int nodeOffset = nodesWithOffset[nodeIndex][3];
            double lat = nodesCoordinates[nodeOffset][1];
            double lon = nodesCoordinates[nodeOffset][2];
            routeCoordinates[i][1] = lat;
            routeCoordinates[i][0] = lon;
        }

        // create GeoJSON by iterating over route
        String geoJson = "{\n" +
                "  \"type\": \"FeatureCollection\",\n" +
                "  \"features\": [\n" +
                "    {\n" +
                "      \"type\": \"Feature\",\n" +
                "      \"properties\": {},\n" +
                "      \"geometry\": {\n" +
                "        \"type\": \"LineString\",\n" +
                "        \"coordinates\": [\n";
        for (int i = 0; i < routeCoordinates.length; i++) {
            geoJson += "          [\n" +
                    "            " + routeCoordinates[i][0] + ",\n" +
                    "            " + routeCoordinates[i][1] + "\n" +
                    "          ]";
            if (i < routeCoordinates.length - 1) {
                geoJson += ",\n";
            }
        }
        geoJson += "\n" +
                "        ]\n" +
                "      }\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        return geoJson;
    }

    /**
     * The main method which starts the Javalin web server and handles HTTP requests.
     * 
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        DataStructures dataStructures = new DataStructures("stuttgart.fmi", false);
        Dijkstra dijkstra = new Dijkstra(dataStructures);

        
        /*
         * Javalin is a lightweight Java web framework.
         * You can access the web server at http://localhost:7070
         */
        Javalin app = Javalin.create(config -> {
            config.staticFiles.add("/public", Location.CLASSPATH);
            config.plugins.enableDevLogging();
        }).start(7070);

        /*
         * Javalin route for API which searches for a place using the Overpass API.
         * Not part of specification, so please ignore.
         */
        app.get("/search_place", ctx -> {
            String query = ctx.queryParam("query");
            String[] queryParts = query.split(", ");
            String responseBody = null;

            String overpassQuery = null;

            if (queryParts.length == 1) {
                overpassQuery = String.format(
                    "[out:json];\nrel[\"name\"=\"%s\"];\nout center;",
                    queryParts[0]
                );
            } else if (queryParts.length == 2) {
                overpassQuery = String.format(
                    "[out:json];\n(\nway[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\nway[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\nway[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"];\nway[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"];\nway[\"addr:street\"=\"%s\"][\"addr:postcode\"=\"%s\"];\nway[\"addr:street\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n);\nout center;",
                    queryParts[0], queryParts[1], queryParts[1], queryParts[0], queryParts[0], queryParts[1],
                    queryParts[1], queryParts[0], queryParts[0], queryParts[1], queryParts[1], queryParts[0]
                );
            } else if (queryParts.length == 3) {
                overpassQuery = String.format(
                    "[out:json];\n(\nway[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:housenumber\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:postcode\"=\"%s\"];\n\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\n" +
                    "way[\"addr:street\"=\"%s\"][\"addr:city\"=\"%s\"][\"addr:housenumber\"=\"%s\"];\n" +
                    ");\nout center;",
                    queryParts[0], queryParts[1], queryParts[2],
                    queryParts[0], queryParts[2], queryParts[1],
                    queryParts[1], queryParts[0], queryParts[2],
                    queryParts[1], queryParts[2], queryParts[0],
                    queryParts[2], queryParts[0], queryParts[1],
                    queryParts[2], queryParts[1], queryParts[0],
                    queryParts[0], queryParts[1], queryParts[2],
                    queryParts[0], queryParts[2], queryParts[1],
                    queryParts[1], queryParts[0], queryParts[2],
                    queryParts[1], queryParts[2], queryParts[0],
                    queryParts[0], queryParts[2], queryParts[1],
                    queryParts[0], queryParts[1], queryParts[2],
                    queryParts[1], queryParts[2], queryParts[0],
                    queryParts[2], queryParts[0], queryParts[1],
                    queryParts[2], queryParts[1], queryParts[0],
                    queryParts[0], queryParts[2], queryParts[1],
                    queryParts[0], queryParts[1], queryParts[2],
                    queryParts[1], queryParts[2], queryParts[0],
                    queryParts[2], queryParts[0], queryParts[1],
                    queryParts[2], queryParts[1], queryParts[0]
                );
            }

            try {
                HttpClient httpClient = HttpClients.createDefault();
                String baseUrl = "http://overpass-api.de/api/interpreter";
                URI uri = new URIBuilder(baseUrl)
                        .setParameter("data", overpassQuery)
                        .build();

                HttpGet httpGet = new HttpGet(uri);
                HttpResponse response = httpClient.execute(httpGet);
                responseBody = EntityUtils.toString(response.getEntity());
            } catch (Exception e) {
                e.printStackTrace();
            }

            JsonArray elements = new Gson().fromJson(responseBody, JsonElement.class).getAsJsonObject().getAsJsonArray("elements");
        
            // Create a list to rank elements by the number of tags

            List<JsonObject> ranked = new ArrayList<>();
                                    
            for (int i = 0; i < elements.size(); i++) {
                JsonObject element = elements.get(i).getAsJsonObject();
                JsonObject tags = element.getAsJsonObject("tags");
                int numTags = tags != null ? tags.size() : 0;
                JsonObject elementCopy = element.deepCopy();
                elementCopy.addProperty("tagCount", numTags);
                ranked.add(elementCopy);
            }

            // Sort by the number of tags in descending order
            ranked.sort((a, b) -> b.get("tagCount").getAsInt() - a.get("tagCount").getAsInt());

            // Get the top 10 ranked elements
            ranked = ranked.subList(0, Math.min(10, ranked.size()));
        
            List<JsonObject> results = new ArrayList<>();
        
            for (JsonObject place : ranked) {
                double lat, lon;

                if (place.has("center")) {
                    JsonObject center = place.getAsJsonObject("center");
                    lat = center.get("lat").getAsDouble();
                    lon = center.get("lon").getAsDouble();
                } else {
                    try {
                        lat = place.get("lat").getAsDouble();
                        lon = place.get("lon").getAsDouble();
                    } catch (Exception e) {
                        // Couldn't find coordinates, skip
                        continue;
                    }
                }

                String name = place.getAsJsonObject("tags").has("name") ? place.getAsJsonObject("tags").get("name").getAsString() : null;
                String building = place.getAsJsonObject("tags").has("building") ? "building" : null;
                String placeType = place.getAsJsonObject("tags").has("place") ? place.getAsJsonObject("tags").get("place").getAsString() : null;

                JsonObject result = new JsonObject();
                result.addProperty("id", place.get("id").getAsLong());
                result.addProperty("lat", lat);
                result.addProperty("lon", lon);
                result.addProperty("name", name);
                result.addProperty("building", building);
                result.addProperty("place_type", placeType);
        
                results.add(result);
            }
        
            Gson gson = new Gson();
            JsonElement jsonElement = gson.toJsonTree(results);
            String json = gson.toJson(jsonElement);
            ctx.result(json);
        });

        // Javalin route for API which finds the nearest node to a given location.
        app.get("/nearestNode", ctx -> {
            double lat = Double.parseDouble(ctx.queryParam("lat"));
            double lon = Double.parseDouble(ctx.queryParam("lon"));
            double[] nearestNode = dataStructures.getNearestNode(lat, lon, 0.01);

            if (nearestNode == null) {
                // Throw 400 Bad Request if no nodes are found within the tolerance range.
                ctx.status(400);
            }

            Gson gson = new Gson();
            JsonElement jsonElement = gson.toJsonTree(nearestNode);
            String json = gson.toJson(jsonElement);
            ctx.result(json);
        });

        // Javalin route for API which finds the shortest route between two nodes using Dijkstra's algorithm.
        app.get("/route", ctx -> {
            int start = Integer.parseInt(ctx.queryParam("start"));
            int end = Integer.parseInt(ctx.queryParam("end"));

            double startTime = System.currentTimeMillis();

            List<Integer> route = dijkstra.shortestPath(start, end);

            if (route == null) {
                // Throw 400 Bad Request if no route is found.
                ctx.status(400);
            }

            double endTime = System.currentTimeMillis();
            double timeElapsed = (endTime - startTime) / 1000.0;
            System.out.println("Time elapsed: " + timeElapsed + " seconds.");

            int distance = route.get(route.size() - 1);
            route.remove(route.size() - 1);

            String geoJson = toGeoJson(route, dataStructures);

            String timeAndGeoJson = "{\n" +
                    "  \"startNode\": " + start + ",\n" +
                    "  \"endNode\": " + end + ",\n" +
                    "  \"distance\": " + distance + ",\n" +
                    "  \"timeElapsed\": " + timeElapsed + ",\n" +
                    "  \"geoJson\": " + geoJson + "\n" +
                    "}";

            ctx.result(timeAndGeoJson);
        });
    }
}