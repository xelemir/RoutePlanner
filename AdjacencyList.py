# Not really working, ignore this file

import numpy as np

class AdjacencyList:
    def __init__(self, num_nodes):
        self.num_nodes = num_nodes
        self.adjacency_list = np.empty(num_nodes, dtype=object)
        self.weights = self.adjacency_list.copy()
        
        
        for i in range(num_nodes):
            self.adjacency_list[i] = np.empty(1, dtype=np.int32)
            self.weights[i] = np.empty(1, dtype=np.int32)
            
        print(self.adjacency_list)
            
    def add_edge(self, from_node, to_node, weight):
        self.adjacency_list[from_node] = np.append(self.adjacency_list[from_node], to_node)
        self.weights[from_node] = np.append(self.weights[from_node], weight)

    def get_weight(self, from_node, to_node):
        pass

    def neighbors(self, node):
        return self.adjacency_list[node]


if __name__ == "__main__":
    pass
