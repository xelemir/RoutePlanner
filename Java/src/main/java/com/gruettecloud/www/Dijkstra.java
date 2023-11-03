package com.gruettecloud.www;

import java.util.*;


public class Dijkstra {
    private int[][] edges;
    private int numNodes;
    private int[][] nodesWithOffset;


    public Dijkstra(String filePath) {
        DataStructures dataStructures = new DataStructures(filePath, false);
        this.edges = dataStructures.getEdges();
        this.numNodes = dataStructures.getNodesWithOffset().length;
        this.nodesWithOffset = dataStructures.getNodesWithOffset();
    }

    public Dijkstra(DataStructures dataStructures) {
        this.edges = dataStructures.getEdges();
        this.numNodes = dataStructures.getNodesWithOffset().length;
        this.nodesWithOffset = dataStructures.getNodesWithOffset();
    }

    public List<Integer> shortestPath(int start, int end) {

        int[] distances = new int[this.numNodes];
        int[] previousNodes = new int[this.numNodes];
        boolean[] visited = new boolean[this.numNodes];

        Arrays.fill(distances, Integer.MAX_VALUE);
        Arrays.fill(previousNodes, -1);
        distances[start] = 0;

        // Create a priority queue with custom comparator
        PriorityQueue<Integer> minHeap = new PriorityQueue<>(this.numNodes, (a, b) -> Integer.compare(distances[a], distances[b]));
        minHeap.offer(start);

        while (!minHeap.isEmpty()) {
            int u = minHeap.poll();
            visited[u] = true;

            for (int j = this.nodesWithOffset[u][1]; j <  this.nodesWithOffset[u][1] +  this.nodesWithOffset[u][2]; j++) {
                if (edges[j][0] == u) {
                    int v = edges[j][1];
                    int weight = edges[j][2];
                    int newDistance = distances[u] + weight;
                    if (!visited[v] && newDistance < distances[v]) {
                        distances[v] = newDistance;
                        previousNodes[v] = u;
                        minHeap.offer(v);
                    }
                }
            }
        }

        // Find the route and array of passed nodes
        List<Integer> route = new ArrayList<>();
        int currentNode = end;
        while (currentNode != -1) {
            route.add(currentNode);
            currentNode = previousNodes[currentNode];
        }
        Collections.reverse(route);

        // The shortest distance from 'start' to 'end' is in distances[end]
        int shortestDistance = distances[end];
        if (shortestDistance == Integer.MAX_VALUE) {
            System.out.println("No path from start to end");
        } else {
            System.out.println("Shortest distance from " + start + " to " + end + ": " + shortestDistance);
            System.out.println("Route: " + route);
        }

        return route;
    }

    public static void main(String[] args) {
        DataStructures ds = new DataStructures("germany.fmi", false);
        double[] startNode = ds.getNearestNode(48.825452, 9.226731, 0.01);
        double[] endNode = ds.getNearestNode(48.826732, 9.222793, 0.01);
        int start = (int) startNode[0];
        int end = (int) endNode[0];

        Dijkstra dijkstra = new Dijkstra(ds);
        dijkstra.shortestPath(start, end);
        
    }
}
