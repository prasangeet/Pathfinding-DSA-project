import math
import heapq
from django.shortcuts import render
from django.http import JsonResponse
from django.core.cache import cache
from .models import Node, Edge

def load_graph():
    """
    Loads the graph from the database and caches it for performance.
    Returns an adjacency list representation of the graph.
    """
    cached_graph = cache.get("graph_data")
    if cached_graph:
        return cached_graph
    
    nodes = Node.objects.all()
    edges = Edge.objects.all()

    graph = {node.id: [] for node in nodes}
    for edge in edges:
        graph[edge.start_node_id].append((edge.end_node_id, edge.weight))
        graph[edge.end_node_id].append((edge.start_node_id, edge.weight))
    
    cache.set("graph_data", graph)
    return graph

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculates the Haversine distance between two latitude-longitude points.
    """
    R = 6371  # Radius of Earth in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def find_closest_node(lat, lon):
    """
    Finds the closest node in the graph to the given latitude and longitude.
    """
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
    Implements Dijkstra's algorithm to find the shortest path between two nodes.
    """
    queue = [(0, start, [])]  # (distance, node, path)
    visited = set()

    while queue:
        distance, current_node, path = heapq.heappop(queue)
        if current_node == end:
            return distance, path + [current_node]
        
        if current_node in visited:
            continue
        
        visited.add(current_node)
        for neighbor, weight in graph.get(current_node, []):
            if neighbor not in visited:
                new_distance = distance + weight
                heapq.heappush(queue, (new_distance, neighbor, path + [current_node]))
    
    return float('inf'), []

def heuristic(node1_id, node2_id):
    """
    A heuristic function for A* algorithm using Haversine distance.
    """
    node1 = Node.objects.get(id=node1_id)
    node2 = Node.objects.get(id=node2_id)
    return haversine(node1.latitude, node1.longitude, node2.latitude, node2.longitude)

def astar(graph, start, end):
    """
    Implements the A* algorithm for shortest pathfinding.
    """
    open_set = [(heuristic(start, end), 0, start, [])]  # (f_score, g_score, node, path)
    closed_set = set()
    g_scores = {start: 0}
    
    while open_set:
        _, g_score, current, path = heapq.heappop(open_set)
        if current == end:
            return g_score, path + [current]
        
        if current in closed_set:
            continue
        
        closed_set.add(current)
        for neighbor, weight in graph.get(current, []):
            if neighbor in closed_set:
                continue
            new_g_score = g_score + weight
            if neighbor not in g_scores or new_g_score < g_scores[neighbor]:
                g_scores[neighbor] = new_g_score
                f_score = new_g_score + heuristic(neighbor, end)
                heapq.heappush(open_set, (f_score, new_g_score, neighbor, path + [current]))
    
    return float('inf'), []

def find_shortest_path(request, algorithm='astar'):
    """
    API endpoint to find the shortest path using either A* or Dijkstra's algorithm.
    """
    start_lat = float(request.GET.get('start_lat'))
    start_lon = float(request.GET.get('start_lon'))
    end_lat = float(request.GET.get('end_lat'))
    end_lon = float(request.GET.get('end_lon'))
    
    start_node = find_closest_node(start_lat, start_lon)
    end_node = find_closest_node(end_lat, end_lon)
    
    if not start_node or not end_node:
        return JsonResponse({"error": "Could not find nearest nodes"}, status=400)
    
    graph = load_graph()
    
    if algorithm == 'dijkstra':
        distance, path = dijkstra(graph, start_node, end_node)
    else:
        distance, path = astar(graph, start_node, end_node)
    
    return JsonResponse({"distance": distance, "path": path})

def dijkstra_api(request):
    """
    API for finding the shortest path using Dijkstra's algorithm.
    """
    return find_shortest_path(request, algorithm='dijkstra')

def astar_api(request):
    """
    API for finding the shortest path using A* algorithm.
    """
    return find_shortest_path(request, algorithm='astar')
