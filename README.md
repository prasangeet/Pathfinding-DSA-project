

## Folder Structure
```
project_root/
│── backend/            # Django Backend
|   |── shortest_path
|   │   ├── manage.py       # Django project manager
|   │   ├── backend/        # Django app
|   │   ├── routes/         # Django routes app
|   │   │   ├── models.py   # Database models
|   │   │   ├── views.py    # API views
|   │   ├── dijkstra/       # Compiled C++ module
│── frontend/           # Next.js Frontend
│   ├── components/     # React components
│   ├── pages/          # Next.js pages
│── algorithm/          # C++ Dijkstra Algorithm
│   ├── dijkstra.cpp    # C++ implementation
│   ├── setup.py        # Pybind11 setup
│── docs/               # Documentation
│── README.md           # Project documentation
```


### Setting up CMake file

cd algorithms
mkdir build && cd build


```sh
cmake ..
cmake --build . --config Release
```

We need to make a slice of OSM 
jodhpur.osm.pbf

convert to .mbtiles

intall docker desktop
run docker

cd backend && cd utils
docker run --rm -it -v ${PWD}:/data -p 8080:8080 maptiler/tileserver-gl --file /data/jodhpur.mbtiles 

convert .osm.pbf to .geojson