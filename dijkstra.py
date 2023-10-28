
from DataStructures1 import DataStructures1
from tqdm import tqdm
import numpy as np

from heapq import heappop, heappush

def dijkstra_with_end_node(nodes, edges, start_node, end_node):
    num_nodes = np.max(edges[:, :2]) + 1
    distance = np.full(num_nodes, np.inf)
    distance[start_node] = 0
    visited = np.zeros(num_nodes, dtype=bool)
    predecessors = np.full(num_nodes, -1, dtype=int)

    heap = [(0, start_node)]

    for _ in tqdm(range(num_nodes), desc="Dijkstra"):
        while heap:
            print(heap)
            current_distance, current_node = heappop(heap)
            if visited[current_node]:
                continue
            visited[current_node] = True

            if current_node == end_node:
                break
            
            for edge in edges[int(nodes[current_node][3])-1:int(nodes[current_node + 1][3])+1]:
                src, dest, weight = edge
                print("here")
                if src == current_node and not visited[dest]:
                    new_distance = distance[current_node] + weight
                    if new_distance < distance[dest]:
                        distance[dest] = new_distance
                        predecessors[dest] = current_node
                    heappush(heap, (new_distance, dest))

    # Now, construct the shortest path from start_node to end_node
    path = []
    while end_node != -1:
        path.insert(0, end_node)
        end_node = predecessors[end_node]

    return distance[path[-1]], path

if __name__ == "__main__":
    # Erstellen Sie ein Beispiel-Array von Kanten
    ds = DataStructures1("toy.fmi", progressbar=True)
    edges = ds.get_edge_array()
    nodes = ds.get_node_array()
    #edges = np.array([[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 7], [2, 3, 3]])


    # Startknoten und Endknoten
    start_node = 0#373220#int(ds.find_nearest_lat_lon(48.799678, 9.190228)[0])
    end_node = 3#373221#int(ds.find_nearest_lat_lon(48.801691, 9.189995)[0])

    shortest_distance, path = dijkstra_with_end_node(nodes, edges, start_node, end_node)
    if np.isinf(shortest_distance):
        print(f"Kein Pfad von Knoten {start_node} zu Knoten {end_node} gefunden.")
    else:
        print(f"Kürzester Weg von Knoten {start_node} zu Knoten {end_node} ist {shortest_distance}, Pfad: {path}")