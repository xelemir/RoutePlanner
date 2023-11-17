package com.gruettecloud.www;

import java.util.*;

/**
 * Dijkstra class represents an implementation of the Dijkstra algorithm for
 * finding the shortest path between two nodes in a graph.
 * It can also find the shortest path from a single source node to all other
 * nodes in the graph.
 */
public class Dijkstra {
    private int[][] edges;
    private int numNodes;
    private int[][] nodesWithOffset;
    private int[] distances;
    private int[] previousNodes;
    private int start;

    /**
     * Dijkstra constructor that initializes the edges, numNodes, and
     * nodesWithOffset fields.
     * 
     * @param dataStructures the data structures object containing the edges and
     *                       nodes information
     */
    public Dijkstra(DataStructures dataStructures) {
        this.edges = dataStructures.getEdges();
        this.numNodes = dataStructures.getNodesWithOffset().length;
        this.nodesWithOffset = dataStructures.getNodesWithOffset();
    }

    /**
     * Finds the shortest path from a single source node to a single target node.
     * If the target node is -1 a one to all Dijkstra is performed.
     * The necessary data for the one to all Dijkstra is stored
     * in the class fields and can be accessed with the toAllShortestPath method.
     * 
     * @param start the source node
     * @param end   the target node
     * @return the shortest path from the source node to the target node. The last
     *         element is the distance.
     */
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

        boolean targetNodeFound = false;

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

                        if (heapSize == minHeap.length) {
                            minHeap = Arrays.copyOf(minHeap, minHeap.length * 2);
                        }
                        minHeap[heapSize] = v;
                        heapSize++;
                        bubbleUp(minHeap, distances, heapSize - 1);
                    }

                    if (v == end) {
                        targetNodeFound = true;
                        break;
                    }
                }
            }
        }

        if (targetNodeFound) {
            List<Integer> route = new ArrayList<>();
            int currentNode = end;
            while (currentNode != -1) {
                route.add(currentNode);
                currentNode = previousNodes[currentNode];
            }
            Collections.reverse(route);

            int shortestDistance = distances[end];
            if (shortestDistance == Integer.MAX_VALUE) {
                return null;
            }

            route.add(shortestDistance);
            return route;

        } else {
            if (end == -1) {
                this.distances = distances;
                this.previousNodes = previousNodes;
                this.start = start;
            }
        }
        return null;
    }

    /**
     * Returns the shortest path from the start node to the specified node,
     * including the distance.
     * Throws an IllegalStateException if the necessary data has not been computed
     * yet.
     *
     * @param node the destination node
     * @return a List of integers representing the nodes in the shortest path, in
     *         order, with the distance as the last element
     */
    public List<Integer> getAllRouteTo(int node) {
        // return Route for specified node. Last index is the distance
        if (this.distances == null || this.previousNodes == null || this.start == 0) {
            throw new IllegalStateException("Data not available. Please run dijkstra.shortestPath(start, -1) first.");
        }
        int[] distances = this.distances;
        int[] previousNodes = this.previousNodes;
        int start = this.start;
        List<Integer> route = new ArrayList<>();
        int currentNode = node;
        while (currentNode != -1) {
            route.add(currentNode);
            currentNode = previousNodes[currentNode];
        }
        Collections.reverse(route);
        route.add(distances[node]);
        return route;
    }

    /**
     * This method performs heapify operation on the given minHeap array based on
     * the distances array.
     * 
     * @param minHeap   The array to be heapified.
     * @param distances The array containing distances.
     * @param heapSize  The size of the heap.
     * @param i         The index of the element to be heapified.
     */
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

    /**
     * Bubbles up the element at index i in the minHeap until its parent is smaller
     * or it reaches the root.
     * 
     * @param minHeap   the minHeap array
     * @param distances the distances array
     * @param i         the index of the element to bubble up
     */
    private void bubbleUp(int[] minHeap, int[] distances, int i) {
        while (i > 0 && distances[minHeap[i]] < distances[minHeap[(i - 1) / 2]]) {
            int temp = minHeap[i];
            minHeap[i] = minHeap[(i - 1) / 2];
            minHeap[(i - 1) / 2] = temp;
            i = (i - 1) / 2;
        }
    }

    public static void main(String[] args) {
        DataStructures ds = new DataStructures("germany.fmi");
        Dijkstra dijkstra = new Dijkstra(ds);


        int startNode = 480860;
        int endNode = 480861;
        int thirdNode = 480862;
        // 146
        // 382
        
        List<Integer> route = dijkstra.shortestPath(8371825, 16743651);

        System.out.println(route.get(route.size() - 1));

    }
}
