import time

import numpy as np

import numpy as np
import time

class DataStructures2:
    """
    A class to represent data structures used in route planning.
    
    IMPORTANT:
    This class builds a true adjacency list,
    instead of relying on an offset info and an array of edges like DataStructures1.
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
            
            # TODO Currently the coordinates' significand SHOULD be 17 digits long, 8 Byte = 64 Bit, but np does something weird here
            nodes_coordinates = np.zeros((amount_nodes, 3), dtype=np.float64)
            adjacency_list = np.empty((amount_nodes, 2), dtype=object)

            # Read the nodes and edges into the arrays.
            for i in range(amount_nodes):
                line = file.readline().split()
                nodes_coordinates[i] = [line[0], line[2], line[3]]
                adjacency_list[i][0] = int(line[0])

            # Iterate through the edges and add them to the array to temp_array as long as node_src is the same.
            # If node_src changes, convert temp_array to a numpy array and add it to the edge_array.
            temp_array = []
            node_src = -1
            for i in range(amount_edges):
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
            
        self.nodes_coordinates = nodes_coordinates
        self.adjacency_list = adjacency_list       

        if timer:
            time_end = time.time()
            print(f"Elapsed: {str(time_end - time_start)} seconds.")
            
if __name__ == "__main__":
    data = DataStructures2("germany.fmi", timer=True)
    while True:
        pass