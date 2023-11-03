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
    
        int[] minHeap = new int[this.numNodes];
        int heapSize = 1;
        minHeap[0] = start;
    
        boolean targetNodeFound = false; // Added condition
    
        while (heapSize > 0 && !targetNodeFound) {
            int u = minHeap[0];
            visited[u] = true;
    
            if (heapSize == 1) {
                heapSize = 0;
            } else {
                minHeap[0] = minHeap[--heapSize];
                heapify(minHeap, distances, heapSize, 0);
            }
    
            for (int j = this.nodesWithOffset[u][1]; j < this.nodesWithOffset[u][1] + this.nodesWithOffset[u][2]; j++) {
                if (edges[j][0] == u) {
                    int v = edges[j][1];
                    int weight = edges[j][2];
                    int newDistance = distances[u] + weight;
                    if (!visited[v] && newDistance < distances[v]) {
                        distances[v] = newDistance;
                        previousNodes[v] = u;
    
                        // Insert or update the element in the minHeap
                        if (heapSize == minHeap.length) {
                            minHeap = Arrays.copyOf(minHeap, minHeap.length * 2);
                        }
                        minHeap[heapSize] = v;
                        heapSize++;
                        bubbleUp(minHeap, distances, heapSize - 1);
                    }
    
                    if (v == end) {
                        targetNodeFound = true; // Set the flag if the target node is found
                        break;
                    }
                }
            }
        }
    
        // Find the route and array of passed nodes if the target node was found
        if (targetNodeFound) {
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
        } else {
            System.out.println("No path from start to end");
            return new ArrayList<>(); // Return an empty list if the target node was not found
        }
    }    
    
    private void heapify(int[] minHeap, int[] distances, int heapSize, int i) {
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        int smallest = i;
    
        if (left < heapSize && distances[minHeap[left]] < distances[minHeap[i]]) {
            smallest = left;
        }
    
        if (right < heapSize && distances[minHeap[right]] < distances[minHeap[smallest]]) {
            smallest = right;
        }
    
        if (smallest != i) {
            int temp = minHeap[i];
            minHeap[i] = minHeap[smallest];
            minHeap[smallest] = temp;
            heapify(minHeap, distances, heapSize, smallest);
        }
    }
    
    private void bubbleUp(int[] minHeap, int[] distances, int i) {
        while (i > 0 && distances[minHeap[i]] < distances[minHeap[(i - 1) / 2]]) {
            int temp = minHeap[i];
            minHeap[i] = minHeap[(i - 1) / 2];
            minHeap[(i - 1) / 2] = temp;
            i = (i - 1) / 2;
        }
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
