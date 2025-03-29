import geopandas as gpd
import pandas as pd
from shapely.geometry import LineString
import psycopg2

# Load road data from GeoJSON
roads = gpd.read_file(r"./Jodhpur/lines.geojson")

# Filter only road-related features
road_types = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential']
roads = roads[roads['highway'].isin(road_types)]

# Extract nodes (intersections) and edges
nodes = set()
edges = []

for _, road in roads.iterrows():
    coords = list(road.geometry.coords)
    
    for coord in coords:
        nodes.add(coord)

    for i in range(len(coords) - 1):
        start, end = coords[i], coords[i + 1]
        length = LineString([start, end]).length
        edges.append((start, end, length))

# Convert nodes to a DataFrame
nodes_df = pd.DataFrame(list(nodes), columns=['longitude', 'latitude'])
nodes_df['id'] = nodes_df.index  # Assign unique IDs

# Convert edges to a DataFrame
edges_df = pd.DataFrame(edges, columns=['start', 'end', 'weight'])

# Map edges to node IDs
node_dict = {tuple(row[:2]): row[2] for row in nodes_df.itertuples(index=False)}
edges_df['start_id'] = edges_df['start'].map(node_dict)
edges_df['end_id'] = edges_df['end'].map(node_dict)
edges_df.drop(['start', 'end'], axis=1, inplace=True)

# Connect to PostgreSQL
try:
    conn = psycopg2.connect(
        dbname="pathfindingdsaproject",
        user="postgres",
        password="ppd12345",
        host="localhost"
    )
    cur = conn.cursor()

    # Insert nodes
    for _, row in nodes_df.iterrows():
        cur.execute("INSERT INTO maps_node (id, latitude, longitude) VALUES (%s, %s, %s)", 
                    (int(row['id']), float(row['latitude']), float(row['longitude'])))

    # Insert edges
    for _, row in edges_df.iterrows():
        cur.execute("INSERT INTO maps_edge (start_node_id, end_node_id, weight) VALUES (%s, %s, %s)",
                    (int(row['start_id']), int(row['end_id']), float(row['weight'])))

    conn.commit()
    print(f"✅ Data loaded successfully! Nodes: {len(nodes_df)} | Edges: {len(edges_df)}")

except psycopg2.Error as e:
    print(f"❌ Database error: {e}")

finally:
    cur.close()
    conn.close()
