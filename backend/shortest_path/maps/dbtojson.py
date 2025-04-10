import json
from .models import Node, Edge

def generate_graph():
    """
    Generates a graph in the adjacency list format and returns it.
    """
    # Fetch nodes and edges from the database
    nodes = Node.objects.all()
    edges = Edge.objects.all()

    # Build the graph as an adjacency list
    graph = {node.id: [] for node in nodes}
    for edge in edges:
        graph[edge.start_node_id].append((edge.end_node_id, edge.weight))
        graph[edge.end_node_id].append((edge.start_node_id, edge.weight))

    return graph

def save_graph_to_json(file_path):
    """
    Saves the generated graph to a JSON file.
    """
    graph = generate_graph()

    # Write the graph to a JSON file
    with open(file_path, 'w') as f:
        json.dump(graph, f, indent=4)

if __name__ == "__main__":
    # Specify the file path where the graph will be saved
    file_path = 'graph_data.json'

    # Save the graph to the file
    save_graph_to_json(file_path)
    print(f"Graph has been saved to {file_path}")
