import numpy as np
from DataStructures import DataStructures
import json


import json
import numpy as np
from datetime import date, datetime, timedelta

"""
{
 "type": "FeatureCollection",
  "features": [
  {"type": "Feature",        
   "geometry": {
    "type": "LineString",    
     "coordinates": [        
[9.2078866,48.8042223],      
[9.2078786,48.8042273],      
[9.2078607,48.8042386],      
...
[9.2053348,48.8077722],
[9.2052865,48.807741],
[9.2051908,48.8075756],
[9.2050877,48.8074131],
    [9.2051382,48.8073757]
    ]},
    "properties": {
    }
     },   {
      "type": "Feature",
       "geometry": {
        "type": "Point",
         "coordinates": [9.2078866,48.8042223]
           },
           "properties": {
               "marker-symbol": "marker"
           }
   },   {
      "type": "Feature",
       "geometry": {
        "type": "Point",
         "coordinates": [9.2051382,48.8073757]
           },
           "properties": {
               "marker-symbol": "square"
           }
       }   ]
}
"""

class GeoJSON:
    def __init__(self, path, nodes):
        coordinates = []
        for node in path:
            # Find the node in the nodes array
            node_index = np.where(nodes[:, 0] == node)[0][0]
            coordinates.append([float(nodes[node_index, 2]), float(nodes[node_index, 1])])
            
        geojson = {
                "type": "FeatureCollection",
                "features": [
                {"type": "Feature",        
                "geometry": {
                    "type": "LineString",    
                    "coordinates": coordinates
                },
                    "properties": {
                    }
                    },   {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": coordinates[0]
                        },
                        "properties": {
                            "marker-symbol": "marker"
                        }
                },   {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": coordinates[-1]
                        },
                        "properties": {
                            "marker-symbol": "square"
                        }
                    }   ]
                }
        
        self.geojson = json.dumps(geojson, cls=NpEncoder)
   
        #with open("route.geojson", "w") as f:
        #    json.dump(geojson, f)
    
    def get_geojson(self):
        return self.geojson
            
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, (np.floating, np.complexfloating)):
            return float(obj)
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.string_):
            return str(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, timedelta):
            return str(obj)
        return super(NpEncoder, self).default(obj)
    
   
if __name__ == "__main__":
    # Erstellen Sie ein Beispiel-Array von Kanten
    ds = DataStructures("stuttgart.fmi", progressbar=True)
    edges = ds.get_edge_array()
    nodes = ds.get_node_array()

    #501437 501443 284 12 45

    # Startknoten und Endknoten
    start_node = int(ds.find_nearest_lat_lon(48.832696, 9.223443)[0])
    end_node = int(ds.find_nearest_lat_lon(48.825233, 9.228767)[0])

    """shortest_distance, path = dijkstra(nodes, edges, start_node, end_node)
    if np.isinf(shortest_distance):
        print(f"Kein Pfad von Knoten {start_node} zu Knoten {end_node} gefunden.")
    else:
        print(f"Kürzester Weg von Knoten {start_node} zu Knoten {end_node} ist {shortest_distance}, Pfad: {path}")
        
        
    geojson = GeoJSON(path, nodes)"""
        
    