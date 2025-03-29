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


