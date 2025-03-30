import math

import heapq
from django.shortcuts import render
from django.core.cache import cache
from .models import Node, Edge

# Create your views here.
def load_graph():
    cached_graph = cache.get("graph_data")
    if cached_graph:
        return cached_graph
    
    nodes = Node.objects.all()
    edges = Edge.objects.all()

    graph = {node.id: [] for node in nodes}
    for edge in edges:
        graph[edge.start_node_id].append((edge.end_node_id, edge.weight))
        graph[edge.end_node.id].append((edge.start_node_id, edge.weight))
    
    cache.set("graph_data", graph)
    return graph


def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of the Earth in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def find_closest_node(lat,lon):
    nodes = Node.objects.all()
    closest_node = None
    min_distance = float('inf')
    
    for node in nodes:  
        distance = haversine(lat, lon, node.latitude, node.longitude)
        if distance < min_distance:
            min_distance = distance
            closest_node = node.id
    return closest_node

    
def dijkstra(graph, start, end):
    """
    Dijkstra's algorithm for finding the shortest path between start and end nodes.
    
    Args:
        graph: The graph representation as an adjacency list
        start: The starting node ID
        end: The destination node ID
        
    Returns:
        tuple: (distance, path) where distance is the shortest path cost and path is a list of nodes
    """

    queue = [(0, start, [])] #(distance, node, path)
    visited = set()

    while queue:
        ## Get the node with the smallest Distance
        (distance, current_node, path) = heapq.heappop(queue)

        if current_node == end:
            return distance, path + [current_node]
        
        # Skip if we have already processed this node
        if current_node in visited:
            continue
        
        # Mark as visited
        visited.add(current_node)

        for neighbor, weight in graph.get(current_node, []):
            if neighbor not in visited:
                # Calculate the distance
                new_distance = distance + weight
                # Add to the priority Queue
                heapq.heappush(queue, (new_distance, neighbor, path + [current_node]))
    
    return float('inf'), []

def heuristic(node1_id, node2_id):
    """
    Heuristic function for A* algorithm - estimates distance between two nodes
    """

    # Get node coordinates from database
    node1 = Node.objects.get(id = node1_id)
    node2 = Node.objects.get(id = node2_id)

    # Calculate the haversine Distance
    return haversine(node1.latitude, node1.longitude, node2.latitude, node2.longitude)


def precompute_subgraphs(graph,boundary_nodes,cache_prefix="subgraph"):

    for start in boundary_nodes:
        for end in boundary_nodes:
            if start != end:
                distance, path = dijkstra(graph, start, end)
                cache_key = f"{cache_prefix}_{start}_{end}"
                cache.set(cache_key, (distance, path))


def get_subgraph_distance(start, end,cache_prefix="subgraph"):
    return cache.get(f"{cache_prefix}_{start}_{end}")


def astar(graph,start,end,boundary_nodes=None):
    """
    A* algorithm for finding the shortest path, optimized with precomputed subgraphs
    
    Args:
        graph: The graph representation as an adjacency list
        start: The starting node ID
        end: The destination node ID
        boundary_nodes: List of nodes that connect different subgraphs
        
    Returns:
        tuple: (distance, path) where distance is the shortest path cost and path is a list of nodes
    """
    # Initialize the priority queue with the starting node
    # Format: (f_score, g_score, node, path)
    open_set = [(heuristic(start, end), 0, start, [])]
    # Set of visited nodes
    closed_set = set()
    # Dictionary to store g_scores (cost from start to node)
    g_scores = {start: 0}

    while open_set:
        # Get the node with lowest f_score
        _, g_score,current,path = heapq.heappop(open_set)

        # If we reached the end node, return the path and distance
        if current == end:
            return g_score, path + [current]
        
        # Skip if we have already processed this node
        if current in closed_set:
            continue

        closed_set.add(current)

        #Check if current node and neighbor are boundary nodes for optimization
        if boundary_nodes and current in boundary_nodes:
            for boundary_node in boundary_nodes:
                if boundary_node != current and boundary_node not in closed_set:
                    #Try to use precomputed path between boundary nodes
                    precomputed = get_subgraph_distance(current, boundary_node)
                    if precomputed:
                        pre_distance , pre_path = precomputed
                        new_g_score = g_score + pre_distance

                        if boundary_node not in g_scores or new_g_score < g_scores[boundary_node]:
                            g_scores[boundary_node ] =new_g_score
                            f_score = new_g_score + heuristic(boundary_node,end)
                            heapq.heappush(open_set,(f_score,new_g_score,boundary_node,path+pre_path[:-1]))

        #Process regular neighbors
        for neighbor,weight in graph.get(current,[]):
            if neighbor in closed_set:
                continue

            #Calculate the g_score
            new_g_score = g_score + weight

            #If we found a better path to the neighbor
            if neighbor not in g_scores or new_g_score<g_scores[neighbor]:
                g_scores[neighbor]=new_g_score
                f_score = new_g_score + heuristic(neighbor,end)
                heapq.heappush(open_set,(f_score,new_g_score,neighbor,path+[current]))
    # If we exhaust the queue without finding the end node, return None
    return float('inf'), []


def find_shortest_path(start_lat,start_lon,end_lat,end_lon,algorithm='astar'):
    """
    Find the shortest path between two geographical coordinates
    
    Args:
        start_lat: Starting latitude
        start_lon: Starting longitude
        end_lat: Ending latitude
        end_lon: Ending longitude
        algorithm: 'astar' or 'dijkstra'
        
    Returns:
        tuple: (distance, path) where distance is the shortest path cost and path is a list of nodes
    """
    #Find closet nodes to the given coordinates
    start_node = find_closest_node(start_lat,start_lon)
    end_node = find_closest_node(end_lat,end_lon)

    if not start_node or not end_node:
        return None, []
    
    #Load graph 
    graph = load_graph()

    #Get cached boundary nodes (these woulde be the nodes that connect different subgraphs)
    boundary_nodes = cache.get("boundary_nodes",[])

    #Run the chosen algorithm
    if algorithm == 'dijkstra':
        return dijkstra(graph,start_node,end_node)
    else:
        return astar(graph,start_node,end_node,boundary_nodes)
    

        


