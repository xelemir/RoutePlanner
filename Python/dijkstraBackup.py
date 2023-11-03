import heapq
import numpy as np

from DataStructures import DataStructures
from tqdm import tqdm
import numpy as np


def dijkstra_with_end_node(nodes, edges, start_node, end_node):
    num_nodes = np.max(edges[:, :2]) + 1
    distance = np.full(num_nodes, np.inf)
    distance[start_node] = 0
    visited = np.zeros(num_nodes, dtype=bool)
    predecessors = np.full(num_nodes, -1, dtype=int)

    for _ in tqdm(range(num_nodes), desc="Dijkstra"):
        # Choose the unvisited node with the shortest distance
        unvisited_nodes = np.where(visited, np.inf, distance)
        current_node = np.argmin(unvisited_nodes)
        visited[current_node] = True

        if current_node == end_node:
            break
        
        
        for edge in edges[edges[:, 0] == current_node]:
            src, dest, weight = edge
            if src == current_node and not visited[dest]:
                if distance[current_node] + weight < distance[dest]:
                    distance[dest] = distance[current_node] + weight
                    predecessors[dest] = current_node

    # Now, construct the shortest path from start_node to end_node
    path = []
    while end_node != -1:
        path.insert(0, end_node)
        end_node = predecessors[end_node]

    return distance[path[-1]], path