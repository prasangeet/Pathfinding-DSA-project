import fiona
import psycopg2
from shapely.geometry import shape, LineString

# Database Connection
conn = psycopg2.connect("dbname=pathfindingdb user=postgres password=ppd12345 host=localhost")
cur = conn.cursor()

# Define road types to extract
road_types = {'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential'}

nodes = set()
edges = []

# Load and process the GeoJSON in chunks
with fiona.open(r"./pune.geojson", "r") as geojson_file:
    for feature in geojson_file:
        properties = feature["properties"]
        geometry = feature["geometry"]

        # Ensure it's a LineString (roads)
        if geometry and geometry["type"] == "LineString":
            road_type = properties.get("highway", None)
            if road_type in road_types:
                coords = geometry["coordinates"]

                # Extract nodes and edges
                for coord in coords:
                    nodes.add(tuple(coord))  # Save as (lon, lat) tuple

                for i in range(len(coords) - 1):
                    start, end = tuple(coords[i]), tuple(coords[i + 1])
                    length = LineString([start, end]).length
                    edges.append((start, end, length))

# Convert nodes to a list with IDs
nodes = list(nodes)
node_dict = {coord: idx for idx, coord in enumerate(nodes)}

# Insert nodes into PostgreSQL
for node_id, (lon, lat) in enumerate(nodes):
    cur.execute("INSERT INTO maps_node (id, latitude, longitude) VALUES (%s, %s, %s)", (node_id, lat, lon))

# Insert edges into PostgreSQL
for start, end, weight in edges:
    cur.execute("INSERT INTO maps_edge (start_node_id, end_node_id, weight) VALUES (%s, %s, %s)",
                (node_dict[start], node_dict[end], weight))

# Commit & Close
conn.commit()
cur.close()
conn.close()

print(f"Data Loaded Successfully! Nodes: {len(nodes)} | Edges: {len(edges)}")