import math


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
    