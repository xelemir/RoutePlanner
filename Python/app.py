import json
from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, send_file
import networkx as nx

from DataStructures import DataStructures
from GeoJSON import GeoJSON, NpEncoder
from dijkstra import dijkstra_path
app = Flask("Route Planner", template_folder='frontend')
ds = DataStructures("stuttgart.fmi", progressbar=True, timer=True)

edges = ds.get_edge_array()
nodes = ds.get_node_array()

G = nx.Graph()
G.add_weighted_edges_from(edges)


@app.route('/')
def index():
    return render_template('/index.html')

@app.route('/static/<filename>')
def deliverStatic(filename):
    return send_file(f'frontend/static/{filename}')

@app.route('/nearest_node')
def nearest_node():
    if request.args.get('lat') and request.args.get('lon'):
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        nearest_node = ds.find_nearest_lat_lon(lat, lon)
        response = json.dumps(nearest_node, cls=NpEncoder)
        return response
    
    return redirect("/")
    
@app.route('/route')
def route():
    if request.args.get('start') and request.args.get('end'):
        start = int(request.args.get('start'))
        end = int(request.args.get('end'))
                
        path = dijkstra_path(G, start, end)
        
        geojson = GeoJSON(path, nodes).get_geojson()
        
        return geojson
        
    return redirect("/")
    
    
    

if __name__ == '__main__':
    app.run(debug=False)