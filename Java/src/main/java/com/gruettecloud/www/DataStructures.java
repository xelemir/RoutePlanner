package com.gruettecloud.www;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;

/**
 * DataStructures
 */
public class DataStructures {

    private int[][] nodesWithOffset;
    private double[][] nodesOrderedByLatitude;
    private int[][] edges;

    public DataStructures(String filePath, boolean timer) {
        long startTime = System.currentTimeMillis();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            for (int i = 0; i < 5; i++) {
                    reader.readLine();
                }

            int amountNodes = Integer.parseInt(reader.readLine());
            int amountEdges = Integer.parseInt(reader.readLine());

            this.nodesWithOffset = new int[amountNodes][4];
            this.nodesOrderedByLatitude = new double[amountNodes][3];
            this.edges = new int[amountEdges][3];

            System.out.println("Reading data from file...");

            // Read the nodes and edges into the arrays.
            for (int i = 0; i < amountNodes; i++) {
                String[] line = reader.readLine().split(" ");
                this.nodesOrderedByLatitude[i] = new double[] {Double.parseDouble(line[0]), Double.parseDouble(line[2]), Double.parseDouble(line[3])};
                this.nodesWithOffset[i][0] = Integer.parseInt(line[0]);
            }

            for (int i = 0; i < amountEdges; i++) {
                String[] line = reader.readLine().split(" ");
                this.edges[i] = new int[] {Integer.parseInt(line[0]), Integer.parseInt(line[1]), Integer.parseInt(line[2])};
            }

            // Get the offset for each node as described in the specification to improve performance for Dijkstra's algorithm as well as the amount of edges for each node.
            for (int i = 0; i < edges.length; i++) {
                if (i == 0) {
                    this.nodesWithOffset[this.edges[i][0]][1] = 0;
                    this.nodesWithOffset[this.edges[i][0]][2] = 1;
                } else {
                    if (this.edges[i][0] != this.edges[i - 1][0]) {
                        this.nodesWithOffset[this.edges[i - 1][0]][2] = i - this.nodesWithOffset[this.edges[i - 1][0]][1];
                        this.nodesWithOffset[this.edges[i][0]][1] = i;
                        this.nodesWithOffset[this.edges[i][0]][2] = 1;
                    } else {
                        this.nodesWithOffset[this.edges[i][0]][2] += 1;
                    }
                }
            }

            sortNodeArrayByLatitude();

            System.out.println("DataStructures initialized");
            long endTime = System.currentTimeMillis();
            long elapsedTimeMilliseconds = endTime - startTime;
            double elapsedTimeSeconds = elapsedTimeMilliseconds / 1000.0;
            System.out.println("Time elapsed: " + elapsedTimeSeconds + " seconds");

        } catch (IOException e) {
                e.printStackTrace();
        }
    }
        
    public void sortNodeArrayByLatitude() {
        Arrays.sort(this.nodesOrderedByLatitude, (a, b) -> Double.compare(a[1], b[1]));
        for (int i = 0; i < this.nodesOrderedByLatitude.length; i++) {
            int nodeId = (int) this.nodesOrderedByLatitude[i][0];
            this.nodesWithOffset[nodeId][3] = i;
        }
    }

    public double[] getNearestNode(double targetLat, double targetLon, double tolerance) {
        double[] nearestCombination = null;
        double[][] data = this.nodesOrderedByLatitude;
    
        // Create a double array with all coordinates within the latitude and longitude tolerance range.
        double[][] filteredData = Arrays.stream(data)
                .filter(row -> 
                    row[1] >= targetLat - tolerance && row[1] <= targetLat + tolerance &&
                    row[2] >= targetLon - tolerance && row[2] <= targetLon + tolerance
                )
                .toArray(double[][]::new);
    
        if (filteredData.length == 0) {
            return nearestCombination;
        }
    
        // Calculate distances to all points within the square-like area.
        double minDistance = Double.MAX_VALUE;
    
        for (double[] row : filteredData) {
            double distance = Math.sqrt(Math.pow(row[1] - targetLat, 2) + Math.pow(row[2] - targetLon, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearestCombination = row;
            }
        }
    
        return nearestCombination;
    }
    

    public double[][] getNodesOrderedByLatitude() {
        return this.nodesOrderedByLatitude;
    }

    public int[][] getNodesWithOffset() {
        return this.nodesWithOffset;
    }

    public int[][] getEdges() {
        return this.edges;
    }

    public static void main(String[] args) {
        // java -Xmx8g src/main/java/com/gruettecloud/www/Datastructures.java
        DataStructures ds = new DataStructures("germany.fmi", false);

        double[] node = ds.getNearestNode(48.832639, 9.223725, 0.01);
        System.out.println(Arrays.toString(node));
    }
}