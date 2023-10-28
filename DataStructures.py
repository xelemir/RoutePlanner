import time
import numpy as np
import tqdm

class DataStructures:
    def __init__(self, filepath, progressbar=False, timer=False):
        """ Creates the data structures from the given file path.

        Args:
            filepath (str): Path to the .fmi file to create the data structures from.
            progressbar (bool, optional): Whether to show a progress bar. This will hurt performance. Defaults to False.
            timer (bool, optional): Whether to show a timer. Defaults to False.
        """

        if timer:
            time_start = time.time()

        with open(filepath, "r") as file:
            for _ in range(5):
                next(file)

            amount_nodes = int(file.readline())
            amount_edges = int(file.readline())
            
            node_array = np.zeros((amount_nodes, 4), dtype=np.longdouble)
            edge_array = np.zeros((amount_edges, 3), dtype=np.int32)

            # Read the nodes and edges into the arrays.
            for i in tqdm.tqdm(range(amount_nodes), disable=not progressbar, desc="1/3 Reading nodes"):
                line = file.readline().split()
                node_array[i] = [int(line[0]), np.longdouble(line[2]), np.longdouble(line[3]), 0]

            for i in tqdm.tqdm(range(amount_edges), disable=not progressbar, desc="2/3 Reading edges"):
                line = file.readline().split()
                edge_array[i] = [line[0], line[1], line[2]]
            
            # Get the offset for each node as described in the specification to improve performance for Dijkstra's algorithm.
            for i in tqdm.tqdm(range(len(edge_array)), disable=not progressbar, desc="3/3 Calculating offsets"):
                if i == 0:
                    node_array[edge_array[i][0]][3] = 0
                else:
                    if edge_array[i][0] != edge_array[i - 1][0]:
                        node_array[edge_array[i][0]][3] = i
                
                    

        self.node_array = node_array
        self.sort_node_array_by_latitude()
        
        self.edge_array = edge_array
            
        if timer:
            time_end = time.time()
            print(f"Elapsed: {str(time_end - time_start)} seconds.")
            
            
    def sort_node_array_by_latitude(self):
        """ Sorts the node array by latitude.
        """

        sorted_indices = np.argsort(self.node_array[:, 1])
        self.node_array = self.node_array[sorted_indices]

    def find_nearest_lat_lon(self, target_lat, target_lon, tolerance=0.1):
        
        # TODO: Documentation needed.
        
        data = self.node_array
        # Create a numpy array with all coordinates within the latitude tolerance range.
        latitude_range = np.logical_and(data[:, 1] >= target_lat - tolerance, data[:, 1] <= target_lat + tolerance)
        filtered_data = data[latitude_range]

        if len(filtered_data) == 0:
            return None

        # Create a numpy array with all coordinates within the longitude tolerance range.
        longitude_range = np.logical_and(filtered_data[:, 2] >= target_lon - tolerance, filtered_data[:, 2] <= target_lon + tolerance)
        filtered_data = filtered_data[longitude_range]

        if len(filtered_data) == 0:
            return None

        # Calculate distances to all points within the square-like area.
        distances = np.sqrt((filtered_data[:, 1] - target_lat) ** 2 + (filtered_data[:, 2] - target_lon) ** 2)

        # Find the nearest point within the square-like area.
        nearest_index = np.argmin(distances)
        nearest_combination = filtered_data[nearest_index]

        return nearest_combination

            
    def get_node_array(self):
        """ Returns the node array.

        Returns:
            np.ndarray: Node array.
        """

        return self.node_array
    
    def get_edge_array(self):
        """ Returns the edge array.

        Returns:
            np.ndarray: Edge array.
        """

        return self.edge_array
            
if __name__ == "__main__":
    ds = DataStructures("toy.fmi")
    edges = ds.get_edge_array()
    nodes = ds.get_node_array()
    print(nodes[3][3])
