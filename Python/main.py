import numpy as np
from DataStructures import DataStructures

# Note: DataStructure2 is also available. See DataStructure2.py for more information.
# DataStructure1 is more memory efficient (1.4 GB vs 5.2 GB for germany.fmi) but does not build a true adjacency list, it uses offsets instead.
# I'm not sure whether we need a true adjacency list or not, so I'm leaving both options here.

if __name__ == "__main__":
    # To improve performance, set progressbar to False
    data = DataStructures("germany.fmi", progressbar=False, timer=True)
    while True:
        
        # Enter coordinates in the format "lat, lon"
        coordinates = input("Enter coordinates: ").split()
        for i in range(len(coordinates)):
            coordinates[i] = coordinates[i].replace(",", "")
        
        nearest_combination = data.find_nearest_lat_lon(float(coordinates[0]), float(coordinates[1]))
        
        print(nearest_combination[1:3])