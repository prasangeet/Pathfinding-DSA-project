# Pathfinding System with Django, Next.js, and Redis

## Project Overview
This project implements a **Shortest Pathfinding System** using **Dijkstra's Algorithm** and **A***. The backend is built with **Django**, the frontend with **Next.js**, and the shortest path computation is optimized using **Redis caching** for performance. The project also integrates **OpenStreetMap (OSM)** data for geospatial mapping and visualization.

---

## 📁 Folder Structure
```
project_root/
│── backend/            # Django Backend
│   ├── shortest_path/  # Django Project
│   │   ├── manage.py       # Django project manager
│   │   ├── shortest_path/        # Main Django app
│   │   ├── maps/         # Django routes app
│   │   │   ├── models.py   # Database models
│   │   │   ├── views.py    # API views
│── frontend/           # Next.js Frontend
│   ├── components/     # React components
│   ├── pages/          # Next.js pages
│   ├── public/         # Static assets
│   ├── styles/         # Global styles
│   ├── utils/          # Helper functions
│   ├── services/       # API calls and integrations
│── docs/               # Documentation
│── README.md           # Project documentation
```

---

## 🚀 Setting Up the Project
### 1️⃣ Preparing **Geospatial Data**
#### **Step 1: Download the OSM Data**
We need to extract a slice of OpenStreetMap (OSM) data for a specific region.
- Example: **Jodhpur.osm.pbf**

#### **Step 2: Convert OSM to MBTiles**
Install **Docker Desktop** and run the following command:

```sh
cd backend/utils

docker run --rm -it -v ${PWD}:/data -p 8080:8080 maptiler/tileserver-gl --file /data/jodhpur.mbtiles
```

This command starts a **Tile Server** to serve the **.mbtiles** data.

#### **Step 3: Convert .osm.pbf to .geojson**
Use online tools or libraries like `osmtogeojson` to convert the data:

```sh
osmtogeojson jodhpur.osm.pbf > jodhpur.geojson
```

---

### 2️⃣ Setting up **Django Backend**
#### **Step 1: Create a Virtual Environment**
```sh
pip install venv
python -m venv venv
```

#### **Step 2: Activate Virtual Environment**
**Windows:**
```sh
venv\Scripts\activate
```
**Linux/macOS:**
```sh
source venv/bin/activate
```

#### **Step 3: Install Dependencies**
```sh
cd backend
pip install --no-deps -r requirements.txt
```

---

### 3️⃣ Setting up **PostgreSQL Database**
#### **Step 1: Install PostgreSQL**
Download PostgreSQL from the official site: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

#### **Step 2: Setup the Database**
- Open **pgAdmin** and create a new database named `pathfindingdb`.
- Set up environment variables in `.env`:

```env
DB_NAME=pathfindingdb
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

- Apply migrations:
```sh
python manage.py migrate
```

#### **Step 3: Populate the Database with OSM Data**
Run the following utility scripts:
```sh
python backend/utils/util_jodhpur.py
python backend/utils/util_pune.py
```
This will populate the database with geospatial data.

---

### 4️⃣ Setting up **Next.js Frontend**
#### **Step 1: Install Node.js and npm**
Download and install Node.js from [https://nodejs.org/](https://nodejs.org/).

#### **Step 2: Install Dependencies**
```sh
cd frontend
npm install
```

#### **Step 3: Set Up Environment Variables**
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

#### **Step 4: Run the Frontend**
```sh
npm run dev
```

The Next.js application will be available at `http://localhost:3000/`.

---

### 5️⃣ Features of the Frontend
- **Interactive Map:** Displays OpenStreetMap with path visualization.
- **Shortest Path Calculation:** Users can select two points, and the shortest path is computed and displayed.
- **Live Updates:** The frontend dynamically fetches routes from the backend API.
- **Custom Markers:** Start and end points are marked on the map.
- **Mobile-Friendly UI:** Responsive design for mobile and desktop users.

---

## 🔥 Implementing the Shortest Path Algorithm
### **Using Redis Caching for Performance**
We use Redis to cache the graph data to improve performance. The graph is loaded from the database and cached automatically.

#### **Steps Implemented for Caching:**
- **Graph Data Caching:**
  - The adjacency list representation of the graph is stored in Redis for quick access.
  - If Redis is down, the data is loaded from the database.
- **Pathfinding Cache:**
  - Frequently accessed shortest paths are cached to prevent redundant computations.

#### **How to Use Redis Cache in Django?**
Since Redis is **open in the cloud**, no setup is needed. We directly integrate it into Django settings.

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://your-redis-instance-url',
    }
}
```

#### **Loading Graph from Cache**
```python
from django.core.cache import cache

def load_graph():
    cached_graph = cache.get("graph_data")
    if cached_graph:
        return cached_graph
    
    # Load from database if not cached
    nodes = Node.objects.all()
    edges = Edge.objects.all()
    graph = {node.id: [] for node in nodes}
    for edge in edges:
        graph[edge.start_node_id].append((edge.end_node_id, edge.weight))
        graph[edge.end_node_id].append((edge.start_node_id, edge.weight))
    
    cache.set("graph_data", graph)
    return graph
```

---

## 📌 Future Enhancements
- **Optimizing pathfinding by integrating Dijkstra directly into PostgreSQL** using recursive SQL queries.
- **Implementing an API to fetch routes dynamically** from the frontend.
- **Enhancing UI with interactive map features** using MapLibre GL JS.

---

## 🛠 Tech Stack
- **Backend:** Django, Django REST Framework
- **Frontend:** Next.js, React, MapLibre GL JS
- **Database:** PostgreSQL + PostGIS
- **Pathfinding:** Dijkstra’s Algorithm, A*
- **Geospatial Data:** OpenStreetMap (OSM), GeoJSON
- **Caching:** Redis

---

## 💡 Contributors
- **[Your Name]** - Project Lead
- **[Other Contributors]**

Feel free to contribute by submitting PRs or opening issues!

---

## 📜 License
This project is licensed under the **MIT License**.

Happy Coding! 🚀

