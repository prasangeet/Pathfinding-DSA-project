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