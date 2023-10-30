

import heapq
import time
from DataStructures import DataStructures
from AdjacencyList import AdjacencyList
from tqdm import tqdm
import numpy as np
import networkx as nx
from collections import deque
from heapq import heappop, heappush
from itertools import count


from heapq import heappush, heappop
from itertools import count




def _dijkstra_multisource(G, sources, weight, pred=None, paths=None, cutoff=None, target=None):
    G_succ = G._adj  # For speed-up (and works for both directed and undirected graphs)

    push = heappush
    pop = heappop
    dist = {}  # dictionary of final distances
    seen = {}
    # fringe is heapq with 3-tuples (distance,c,node)
    # use the count c to avoid comparing nodes (may not be able to)
    c = count()
    fringe = []
    for source in sources:
        seen[source] = 0
        push(fringe, (0, next(c), source))
    while fringe:
        (d, _, v) = pop(fringe)
        if v in dist:
            continue  # already searched this node.
        dist[v] = d
        if v == target:
            break
        for u, e in G_succ[v].items():
            cost = weight(v, u, e)
            if cost is None:
                continue
            vu_dist = dist[v] + cost
            if cutoff is not None:
                if vu_dist > cutoff:
                    continue
            if u in dist:
                u_dist = dist[u]
                if vu_dist < u_dist:
                    raise ValueError("Contradictory paths found:", "negative weights?")
                elif pred is not None and vu_dist == u_dist:
                    pred[u].append(v)
            elif u not in seen or vu_dist < seen[u]:
                seen[u] = vu_dist
                push(fringe, (vu_dist, next(c), u))
                if paths is not None:
                    paths[u] = paths[v] + [u]
                if pred is not None:
                    pred[u] = [v]
            elif vu_dist == seen[u]:
                if pred is not None:
                    pred[u].append(v)

    # The optional predecessor and path dictionaries can be accessed
    # by the caller via the pred and paths objects passed as arguments.
    return dist


def _dijkstra_multisource2(sources, weight, pred=None, paths=None, cutoff=None, target=None):
    push = heappush
    pop = heappop
    dist = {}  # dictionary of final distances
    seen = {}
    
    c = count()
    fringe = []
    
    for source in sources:
        seen[source] = 0
        push(fringe, (0, next(c), source))

    while fringe:
        (d, _, v) = pop(fringe)
        if v in dist:
            continue  # already searched this node.
        dist[v] = d
        if v == target:
            break

        # Iterate through edges starting from adj_offset until node_id changes
        node_id, adjacent_edges = adj_list[v]
        for edge in adjacent_edges:
            node_dest, weight_value = edge
            
            u = node_dest
            cost = weight(int(node_id), int(u), int(weight_value))
            if cost is None:
                continue
            vu_dist = dist[v] + cost
            if cutoff is not None:
                if vu_dist > cutoff:
                    continue
            if u in dist:
                u_dist = dist[u]
                if vu_dist < u_dist:
                    raise ValueError("Contradictory paths found:", "negative weights?")
                elif pred is not None and vu_dist == u_dist:
                    pred[u].append(v)
            elif u not in seen or vu_dist < seen[u]:
                seen[u] = vu_dist
                push(fringe, (vu_dist, next(c), u))
                if paths is not None:
                    paths[u] = paths[v] + [u]
                if pred is not None:
                    pred[u] = [v]
            elif vu_dist == seen[u]:
                if pred is not None:
                    pred[u].append(v)

    # The optional predecessor and path dictionaries can be accessed
    # by the caller via the pred and paths objects passed as arguments.
    return dist


def _weight_function(G, weight):
    if callable(weight):
        return weight
    # If the weight keyword argument is not callable, we assume it is a
    # string representing the edge attribute containing the weight of
    # the edge.
    return lambda u, v, data: data.get(weight, 1) if isinstance(data, dict) else 1

def multi_source_dijkstra(sources, target=None, cutoff=None, weight="weight"):
    if not sources:
        raise ValueError("sources must not be empty")
    if target in sources:
        return (0, [target])
    weight = _weight_function(adj_list, weight)
    paths = {source: [source] for source in sources}  # dictionary of paths
    dist = _dijkstra_multisource2(adj_list, sources, weight, paths=paths, cutoff=cutoff, target=target)
    if target is None:
        return (dist, paths)
    try:
        return (dist[target], paths[target])
    except KeyError as err:
        raise nx.NetworkXNoPath(f"No path to {target}.") from err
        
def single_source_dijkstra(source, target=None, cutoff=None, weight="weight"):
    return multi_source_dijkstra({source}, cutoff=cutoff, target=target, weight=weight)

def dijkstra_path(source, target, weight="weight"):
    (length, path) = single_source_dijkstra(source, target=target, weight=weight)
    return path

if __name__ == "__main__":
    global adj_list
    adjacency_list = AdjacencyList("toy.fmi", timer=True)
    adj_list = adjacency_list.get_adj_list()
    
    
    start_node = 0#int(ds.find_nearest_lat_lon(48.832752, 9.223327)[0])
    end_node = 3#int(ds.find_nearest_lat_lon(48.746431, 9.109677)[0])

    """start = time.time()
    shortest_distance, path = dijkstra(nodes, edges, start_node, end_node)
    end = time.time()
    print(f"Laufzeit: {end - start} s")
    if np.isinf(shortest_distance):
        print(f"Kein Pfad von Knoten {start_node} zu Knoten {end_node} gefunden.")
    else:
        print(f"Kürzester Weg von Knoten {start_node} zu Knoten {end_node} ist {shortest_distance}, Pfad: {path}")"""
        
    #G = nx.Graph()
    #G.add_weighted_edges_from(edges)
    start = time.time()
    x = dijkstra_path(start_node, end_node)
    end = time.time()
    print(f"Laufzeit: {end - start} s")
    print(x)
    
    while True:
        pass