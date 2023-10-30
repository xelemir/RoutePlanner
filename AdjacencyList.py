import time

from tqdm import tqdm
import numpy as np
import time

class AdjacencyList:
    """
    A class to represent data structures used in route planning.
    
    IMPORTANT:
    This class builds a true adjacency list,
    instead of relying on offset info and an array of edges like DataStructures1 does.
    However this is way more memory intensive. (~5.2 GB vs ~1.4 GB for germany.fmi)
    
    So while DataStructures1 is more memory efficient, it does in fact not build a true adjacency list.
    
    ...
    Attributes
    ----------
    nodes_coordinates : numpy.ndarray
        an array of nodes' coordinates TODO: dtype is set set to np.float64 but something weird happens
    adjacency_list : numpy.ndarray
        an array of true adjacency lists for each node
    Methods
    -------
    __init__(filepath, timer=False)
        Initializes the DataStructures2 object.
    """

    def __init__(self, filepath, timer=False):
        """
        Initializes the DataStructures2 object.
        Parameters
        ----------
        filepath : str
            the path to the file containing nodes and edges data
        timer : bool, optional
            a flag to indicate whether to print elapsed time or not (default is False)
        """
        if timer:
            time_start = time.time()

        with open(filepath, "r") as file:
            for _ in range(5):
                next(file)

            amount_nodes = int(file.readline())
            amount_edges = int(file.readline())

            nodes = np.zeros((amount_nodes, 3), dtype=np.longdouble)
            adjacency_list = np.empty((amount_nodes, 2), dtype=object)

            # Read the nodes and edges into the arrays.
            for i in tqdm(range(amount_nodes), desc="1/2 Reading nodes"):
                line = file.readline().split()
                nodes[i] = [line[0], np.longdouble(line[2]), np.longdouble(line[3])]
                adjacency_list[i][0] = int(line[0])

            # Iterate through the edges and add them to the array to temp_array as long as node_src is the same.
            # If node_src changes, convert temp_array to a numpy array and add it to the edge_array.
            temp_array = []
            node_src = -1
            for i in tqdm(range(amount_edges), desc="2/2 Reading edges"):
                line = file.readline().split()
                if node_src != int(line[0]):
                    if temp_array:
                        adjacency_list[node_src][1] = np.array(temp_array, dtype=np.int32)
                        temp_array = []
                    node_src = int(line[0])
                node_dst = int(line[1])
                distance = int(line[2])
                temp_array.append((node_dst, distance))
            adjacency_list[node_src][1] = np.array(temp_array, dtype=np.int32)
            temp_array = []

        self.nodes = nodes
        self.sort_by_latitude()
        self.adjacency_list = adjacency_list       

        if timer:
            time_end = time.time()
            print(f"Elapsed: {str(time_end - time_start)} seconds.")
            
    def sort_by_latitude(self):
        """
        Sorts the nodes by latitude.
        """
        self.nodes = self.nodes[self.nodes[:,1].argsort()]
        
    def get_nodes(self):
        """
        Returns the nodes' coordinates.
        """
        return self.nodes
    
    def get_adj_list(self):
        """
        Returns the adjacency list.
        """
        return self.adjacency_list
        

if __name__ == "__main__":
    data = AdjacencyList("toy.fmi", timer=True)
    data.get_adj_list()
    print(data.get_adj_list())
    
    while True:
        pass