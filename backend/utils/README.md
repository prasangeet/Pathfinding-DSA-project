docker run --rm -it -v ${PWD}:/data -p 8080:8080 maptiler/tileserver-gl --file /data/jodhpur2.mbtiles 

docker run -it --rm -v ${PWD}:/data ghcr.io/systemed/tilemaker:master /data/jodhpur2.osm.pbf --output /data/jodhpur2.mbtiles