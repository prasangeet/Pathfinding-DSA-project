# Pathfinding System with Django, Next.js, and C++

## Project Overview
This project implements a **Shortest Pathfinding System** using **Dijkstra's Algorithm**. The backend is built with **Django**, the frontend with **Next.js**, and the shortest path computation is optimized using **C++**. The project also integrates **OpenStreetMap (OSM)** data for geospatial mapping and visualization.

---

## 📁 Folder Structure
```
project_root/
│── backend/            # Django Backend
│   ├── shortest_path/  # Django Project
│   │   ├── manage.py       # Django project manager
│   │   ├── backend/        # Main Django app
│   │   ├── routes/         # Django routes app
│   │   │   ├── models.py   # Database models
│   │   │   ├── views.py    # API views
│   │   ├── dijkstra/       # Compiled C++ module for shortest path computation
│── frontend/           # Next.js Frontend
│   ├── components/     # React components
│   ├── pages/          # Next.js pages
│── algorithm/          # C++ Dijkstra Algorithm
│   ├── dijkstra.cpp    # C++ implementation
│   ├── setup.py        # Pybind11 setup for Python integration
│── docs/               # Documentation
│── README.md           # Project documentation
```

---

## 🚀 Setting Up the Project
### 1️⃣ Setting up the **C++ Module**
The **Dijkstra algorithm** is implemented in C++ and compiled using **CMake**. Follow these steps:

```sh
cd algorithm
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

---

### 2️⃣ Preparing **Geospatial Data**
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

### 3️⃣ Setting up **Django Backend**
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

### 4️⃣ Setting up **PostgreSQL Database**
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

### 5️⃣ Running the **Backend and Frontend**
#### **Start the Django Backend**
```sh
cd backend
python manage.py runserver
```

#### **Start the Next.js Frontend**
```sh
cd frontend
npm install  # Install dependencies
npm run dev  # Start development server
```

---

## 🔥 Implementing the Shortest Path Algorithm
### **Approach 1: Using C++ for Performance (Slower Approach)**
We utilize a **C++ file** to compute the shortest path using Dijkstra’s algorithm:

#### **Step 1: Setup CMake**
```sh
cd algorithm
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

#### **Step 2: Use Pybind11 for Python Integration**
A `setup.py` script is included in `algorithm/` to wrap the C++ code as a Python module.

---

## 📌 Future Enhancements
- **Optimizing pathfinding by integrating Dijkstra directly into PostgreSQL** using recursive SQL queries.
- **Implementing an API to fetch routes dynamically** from the frontend.
- **Enhancing UI with interactive map features** using MapLibre GL JS.

---

## 🛠 Tech Stack
| Component      | Technology Used      |
|---------------|----------------------|
| **Backend**   | Django, Django REST Framework |
| **Frontend**  | Next.js, React, MapLibre GL JS |
| **Database**  | PostgreSQL + PostGIS |
| **Pathfinding** | C++ (Dijkstra’s Algorithm) |
| **Geospatial Data** | OpenStreetMap (OSM), GeoJSON |

---

## 💡 Contributors
- **[Your Name]** - Project Lead
- **[Other Contributors]**

Feel free to contribute by submitting PRs or opening issues!

---

## 📜 License
This project is licensed under the **MIT License**.

Happy Coding! 🚀

