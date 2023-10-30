import time
import traceback

class Benchmark :

	#read parameters (parameters are expected in exactly this order)

    #.fmi file 
	graphPath = args[1]
	
    #not sure which
	lon = Double.parseDouble(args[3])
	lat = Double.parseDouble(args[5])
	
    #read file .fmi
	quePath = open("deutschland.fmi", "r")
	
	sourceNodeId = Integer.parseInt(args[9])

        
	# run benchmarks
	print("Reading graph file and creating graph data structure (" + graphPath + ")")
	graphReadStart = time.process_time()
	    #TODO: read graph here
	graphReadEnd = time.process_time()
	print("\tgraph read took " + (graphReadEnd - graphReadStart) + "ms")

	print("Setting up closest node data structure...")		
		#TODO: set up closest node data structure here

	print("Finding closest node to coordinates " + lon + " " + lat)
	nodeFindStart = time.process_time()
	coords = [0.0, 0.0]
		#TODO: find closest node here and write coordinates into coords

	nodeFindEnd = time.process_time()
	print("\tfinding node took " + (nodeFindEnd - nodeFindStart) + "ms: " + coords[0] + ", " + coords[1])

	print("Running one-to-one Dijkstras for queries in .que file " + quePath)
	queStart = time.process_time()

	try:
		while currLine = quePath.readline() != null: 
			oneToOneSourceNodeId = Integer.parseInt(currLine.substring(0, currLine.indexOf(" ")))
			oneToOneTargetNodeId = Integer.parseInt(currLine.substring(currLine.indexOf(" ") + 1))
			oneToOneDistance = -42
			#TODO set oneToOneDistance to the distance from
			#oneToOneSourceNodeId to oneToOneSourceNodeId as computed by
			#the one-to-one Dijkstra
			print(oneToOneDistance)	
	except Exception as e:
		print("Exception...")
		traceback.print_tb(file="deutschland.fmi")
    
	queEnd = time.process_time()
	print("\tprocessing .que file took " + (queEnd - queStart) + "ms")

	print("Computing one-to-all Dijkstra from node id " + sourceNodeId)
	oneToAllStart = time.process_time()
		#TODO: run one-to-all Dijkstra here
	oneToAllEnd = time.process_time()
	print("\tone-to-all Dijkstra took " + (oneToAllEnd - oneToAllStart) + "ms")

	#ask user for a target node id
	print("Enter target node id... ")
	targetNodeId = int(input())
	oneToAllDistance = -42
		#TODO :set oneToAllDistance to the distance from sourceNodeId to
	#targetNodeId as computed by the one-to-all Dijkstra
	print("Distance from " + sourceNodeId + " to " + targetNodeId + " is " + oneToAllDistance)

