# TileMap Server Setup Guide

## Prerequisites

### Install Docker Desktop
Before running the TileMap server, ensure you have Docker Desktop installed and running on your system.
- Download Docker from [Docker's official website](https://www.docker.com/products/docker-desktop/)
- Follow the installation instructions for your operating system.
- Start Docker Desktop before running the commands below.

---

## Running the TileMap Server
To start the TileMap server and serve `.mbtiles` files, use the following command:

```shell
docker run --rm -it -v ${PWD}:/data -p 8080:8080 maptiler/tileserver-gl --file /data/pune.mbtiles
```

### Explanation:
- `--rm` → Automatically removes the container once it stops.
- `-it` → Runs the container interactively.
- `-v ${PWD}:/data` → Mounts the current directory (`${PWD}`) to the `/data` directory inside the container.
- `-p 8080:8080` → Maps port 8080 of the container to port 8080 on your host machine.
- `maptiler/tileserver-gl` → The Docker image used to serve the tiles.
- `--file /data/jodhpur2.mbtiles` → Specifies the tile file to serve.

Once the server is running, you can access the tiles at:
- **http://localhost:8080/** (Main UI)
- **http://localhost:8080/styles/basic-preview/?vector#12/26.2389/73.0243** (Basic map preview)

---

## Converting `.osm.pbf` to `.mbtiles`
To convert OpenStreetMap `.osm.pbf` files into `.mbtiles`, run the following command:

```shell
docker run -it --rm -v ${PWD}:/data ghcr.io/systemed/tilemaker:master /data/jodhpur2.osm.pbf --output /data/jodhpur2.mbtiles
```

### Explanation:
- `docker run -it --rm` → Runs an interactive container and removes it after execution.
- `-v ${PWD}:/data` → Mounts the current directory to `/data` inside the container.
- `ghcr.io/systemed/tilemaker:master` → The Tilemaker Docker image.
- `/data/jodhpur2.osm.pbf` → Input `.osm.pbf` file (Make sure this file exists in the directory).
- `--output /data/jodhpur2.mbtiles` → Specifies the output `.mbtiles` file.

---

## Troubleshooting

### 1. Docker is Not Running
Ensure Docker Desktop is installed and running before executing any commands.
- Run `docker info` in the terminal to verify if Docker is running.

### 2. File Not Found Errors
If you encounter `Couldn't open .pbf file`, check the following:
- Ensure `jodhpur2.osm.pbf` exists in the current directory.
- Run `ls` (Linux/macOS) or `dir` (Windows) to confirm the file is present.
- Try using an absolute path instead of `${PWD}`:
  ```shell
  docker run -it --rm -v "D:\Projects\Pathfinding-DSA-project:/data" ghcr.io/systemed/tilemaker:master /data/jodhpur2.osm.pbf --output /data/jodhpur2.mbtiles
  ```

### 3. Docker Volume Permissions Issue
If the container can't access files, ensure Docker has permission to access your drives:
- Open Docker Desktop → **Settings** → **Resources** → **File Sharing**.
- Ensure the drive containing your project (`D:` in this case) is shared.

### 4. Memory Issues
If Docker exits unexpectedly due to memory limits, try reducing memory usage:
```shell
docker run -it --rm -v "D:\Projects\Pathfinding-DSA-project:/data" ghcr.io/systemed/tilemaker:master /data/jodhpur2.osm.pbf --output /data/jodhpur2.mbtiles --store
```

---

## References
- [Docker Documentation](https://docs.docker.com/)
- [Tilemaker GitHub](https://github.com/systemed/tilemaker)
- [Tileserver-GL](https://github.com/maptiler/tileserver-gl)

