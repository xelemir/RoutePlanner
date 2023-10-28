
import heapq
from DataStructures import DataStructures
from tqdm import tqdm
import numpy as np


def dijkstra(nodes, edges, start_node, end_node):
    num_nodes = np.max(edges[:, :2]) + 1
    distance = np.full(num_nodes, np.inf)
    distance[start_node] = 0
    predecessors = np.full(num_nodes, -1, dtype=int)

    priority_queue = [(0, start_node)]

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_node == end_node:
            break

        if current_distance > distance[current_node]:
            continue

        for edge in edges[edges[:, 0] == current_node]:
            src, dest, weight = edge
            if src == current_node:
                new_distance = distance[current_node] + weight
                if new_distance < distance[dest]:
                    distance[dest] = new_distance
                    predecessors[dest] = current_node
                    heapq.heappush(priority_queue, (new_distance, dest))

    # Construct the shortest path from start_node to end_node
    path = []
    while end_node != -1:
        path.insert(0, end_node)
        end_node = predecessors[end_node]

    return distance[path[-1]], path

if __name__ == "__main__":
    ds = DataStructures("stuttgart.fmi", progressbar=True)
    edges = ds.get_edge_array()
    nodes = ds.get_node_array()


    start_node = 0#373220#int(ds.find_nearest_lat_lon(48.799678, 9.190228)[0])
    end_node = 3#373221#int(ds.find_nearest_lat_lon(48.801691, 9.189995)[0])

    shortest_distance, path = dijkstra(nodes, edges, start_node, end_node)
    if np.isinf(shortest_distance):
        print(f"Kein Pfad von Knoten {start_node} zu Knoten {end_node} gefunden.")
    else:
        print(f"Kürzester Weg von Knoten {start_node} zu Knoten {end_node} ist {shortest_distance}, Pfad: {path}")