"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import axios from "axios"
import { RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LocationPanel } from "@/components/Map/LocationPanel"
import { SearchPanel } from "@/components/Map/SearchPanel"

export default function MapComponent() {
  const mapContainer = useRef(null)
  const mapInstance = useRef(null)
  const [markers, setMarkers] = useState([])
  const [source, setSource] = useState(null)
  const [destination, setDestination] = useState(null)
  const [algorithm, setAlgorithm] = useState("dijkstra")
  const [loading, setLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [sourceSearch, setSourceSearch] = useState("")
  const [destSearch, setDestSearch] = useState("")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: "osm-layer",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [73.853, 18.525],
        zoom: 13,
        maxBounds: [
          [73.603, 18.337],
          [74.072, 18.771],
        ],
      })

      map.on("load", () => {
        setMapLoaded(true)
        console.log("Map loaded successfully")
      })

      map.on("error", (e) => {
        console.error("MapLibre GL Error:", e)
        setMapError(`Map Error: ${e.error?.message || "Unknown error"}`)
      })

      mapInstance.current = map

      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove()
          mapInstance.current = null
        }
      }
    } catch (err) {
      console.error("Map initialization error:", err)
      setMapError(`Failed to initialize map: ${err.message}`)
    }
  }, [])

  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return

    const handleMapClick = (e) => {
      const { lng, lat } = e.lngLat
      console.log("Map clicked at:", lng, lat)

      if (!source) {
        markers.forEach((marker) => marker.remove())
        setMarkers([])
        setSource({ lng, lat })

        const sourceMarker = new maplibregl.Marker({ color: "#22c55e" })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current)

        setMarkers([sourceMarker])
      } else if (!destination) {
        setDestination({ lng, lat })

        const destinationMarker = new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current)

        setMarkers((prevMarkers) => [...prevMarkers, destinationMarker])
      }
    }

    mapInstance.current.on("click", handleMapClick)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off("click", handleMapClick)
      }
    }
  }, [source, destination, markers, mapLoaded])

  useEffect(() => {
    if (source === null || destination === null) {
      clearRoute()
      setRouteInfo(null)
    }
  }, [source, destination])

  const clearRoute = () => {
    if (!mapInstance.current || !mapLoaded) return

    try {
      const layers = ["route-outline", "route"]
      layers.forEach((layer) => {
        if (mapInstance.current.getLayer(layer)) {
          mapInstance.current.removeLayer(layer)
        }
      })

      if (mapInstance.current.getSource("route")) {
        mapInstance.current.removeSource("route")
      }
    } catch (err) {
      console.error("Error clearing route:", err)
    }
  }

  const resetPoints = () => {
    markers.forEach((marker) => marker.remove())
    setMarkers([])
    setSource(null)
    setDestination(null)
    setSourceSearch("")
    setDestSearch("")
    setRouteInfo(null)
    clearRoute()
  }

  const handleLocationSelect = (coords, isSource) => {
    if (!mapInstance.current || !mapLoaded) return

    if (isSource) {
      markers.forEach((marker) => marker.remove())
      setMarkers([])
      setSource({ lng: coords[0], lat: coords[1] })

      const sourceMarker = new maplibregl.Marker({ color: "#22c55e" }).setLngLat(coords).addTo(mapInstance.current)

      setMarkers([sourceMarker])
    } else {
      setDestination({ lng: coords[0], lat: coords[1] })

      const destMarker = new maplibregl.Marker({ color: "#ef4444" }).setLngLat(coords).addTo(mapInstance.current)

      setMarkers((prev) => [...prev, destMarker])
    }

    mapInstance.current.flyTo({
      center: coords,
      zoom: 16,
      essential: true,
    })
  }

  const calculateRouteInfo = (coordinates) => {
    const R = 6371
    let totalDistance = 0

    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lon1, lat1] = coordinates[i]
      const [lon2, lat2] = coordinates[i + 1]

      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      totalDistance += R * c
    }

    const speedCar = 30
    const speedBike = 15
    const speedFoot = 5

    return {
      distance: totalDistance,
      timeByCar: Math.round((totalDistance / speedCar) * 60),
      timeByBike: Math.round((totalDistance / speedBike) * 60),
      timeByFoot: Math.round((totalDistance / speedFoot) * 60),
    }
  }

  const fetchShortestPath = async () => {
    if (!source || !destination || !mapInstance.current || !mapLoaded) {
      alert("Please select both source and destination points.")
      return
    }

    setLoading(true)

    try {
      const response = await axios.get(`http://localhost:8000/api/${algorithm}/`, {
        params: {
          start_lat: source.lat,
          start_lon: source.lng,
          end_lat: destination.lat,
          end_lon: destination.lng,
        },
      })

      const pathData = response.data.path

      if (!Array.isArray(pathData) || pathData.length === 0) {
        alert("No valid path found.")
        setLoading(false)
        return
      }

      const coordinates = pathData
        .map((point) => {
          if (Array.isArray(point) && point.length === 2) {
            return [Number(point[0]), Number(point[1])]
          } else if (point && typeof point === "object") {
            const lon = point.lon ?? point.lng ?? null
            const lat = point.lat ?? null
            return lon !== null && lat !== null ? [Number(lon), Number(lat)] : null
          }
          return null
        })
        .filter(Boolean)

      if (coordinates.length < 2) {
        alert("Error: Not enough valid coordinates to draw a path")
        setLoading(false)
        return
      }

      clearRoute()

      // Create an initial empty LineString
      const initialRouteData = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [coordinates[0]],
        },
      }

      try {
        mapInstance.current.addSource("route", {
          type: "geojson",
          data: initialRouteData,
        })

        mapInstance.current.addLayer({
          id: "route-outline",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#FFFFFF",
            "line-width": 8,
            "line-opacity": 0.7,
          },
        })

        mapInstance.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
            "line-opacity": 1,
          },
        })

        // Animate the route drawing
        let step = 0
        const numSteps = coordinates.length
        const animationDuration = 1500 // ms
        const stepDuration = animationDuration / numSteps

        const bounds = new maplibregl.LngLatBounds()
        coordinates.forEach((coord) => bounds.extend(coord))

        mapInstance.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 17,
        })

        const animateRoute = () => {
          if (step < numSteps) {
            // Add the next coordinate to the route
            const animatedRoute = {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: coordinates.slice(0, step + 1),
              },
            }

            if (mapInstance.current.getSource("route")) {
              mapInstance.current.getSource("route").setData(animatedRoute)
            }

            step++
            setTimeout(animateRoute, stepDuration)
          } else {
            // Animation complete, set route info
            setRouteInfo(calculateRouteInfo(coordinates))
            setLoading(false)
          }
        }

        // Start the animation
        animateRoute()
      } catch (err) {
        console.error("Error adding route layers:", err)
        alert("Error rendering the route. See console for details.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error fetching path:", error)
      alert("Error fetching shortest path. Check the console for details.")
      setLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainer} className="h-full w-full" />

      <SearchPanel
        sourceSearch={sourceSearch}
        setSourceSearch={setSourceSearch}
        destSearch={destSearch}
        setDestSearch={setDestSearch}
        source={source}
        setSource={setSource}
        destination={destination}
        setDestination={setDestination}
        markers={markers}
        setMarkers={setMarkers}
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        loading={loading}
        fetchShortestPath={fetchShortestPath}
        routeInfo={routeInfo}
        mapInstance={mapInstance}
      />

      <LocationPanel
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        handleLocationSelect={handleLocationSelect}
        setSourceSearch={setSourceSearch}
        setDestSearch={setDestSearch}
      />

      <Button variant="secondary" className="absolute bottom-4 right-4 shadow-lg z-10" onClick={resetPoints}>
        Reset Points
      </Button>

      {!source && !destination && (
        <Alert className="absolute bottom-4 left-4 right-20 max-w-md z-10">
          <AlertDescription>
            Click on the map to set your source point first, then click again to set your destination, or use the search
            panel above.
          </AlertDescription>
        </Alert>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <RotateCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
            <p className="text-gray-700">Loading map...</p>
          </div>
        </div>
      )}

      {mapError && (
        <Alert className="absolute top-20 left-4 right-4 max-w-md mx-auto z-20 bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {mapError}
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-800"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}