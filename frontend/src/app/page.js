"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import { MapIcon, RotateCw } from "lucide-react";

export default function MapComponent() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [loading, setLoading] = useState(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "pune-source": {
            type: "raster",
            tiles: [
              "http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "pune-layer",
            type: "raster",
            source: "pune-source",
          },
        ],
      },
      center: [73.853, 18.525], // pune Coordinates
      zoom: 16,
      maxBounds: [
        [73.603, 18.337],
        [74.072, 18.771],
      ],
    });

    return () => mapInstance.current.remove();
  }, []);

  // Set up click handler with awareness of source and destination state
  useEffect(() => {
    if (!mapInstance.current) return;

    const handleMapClick = (e) => {
      const { lng, lat } = e.lngLat;
      console.log({ lng, lat });

      if (!source) {
        // Clear previous markers if restarting
        markers.forEach((marker) => marker.remove());
        setMarkers([]);

        setSource({ lng, lat });

        // Add marker for source
        const sourceMarker = new maplibregl.Marker({ color: "green" })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);

        setMarkers([sourceMarker]);
      } else if (!destination) {
        setDestination({ lng, lat });

        // Add marker for destination
        const destinationMarker = new maplibregl.Marker({ color: "red" })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);

        setMarkers((prevMarkers) => [...prevMarkers, destinationMarker]);
      }
    };

    // Add click event listener
    mapInstance.current.on("click", handleMapClick);

    // Clean up the event listener when component unmounts or source/destination change
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off("click", handleMapClick);
      }
    };
  }, [source, destination, markers]);

  // Clear the route when source or destination changes
  useEffect(() => {
    if (source === null || destination === null) {
      clearRoute();
    }
  }, [source, destination]);

  // Helper function to safely clear the route
  const clearRoute = () => {
    if (!mapInstance.current) return;

    try {
      // Remove layers first, then sources
      if (mapInstance.current.getLayer("route-outline")) {
        mapInstance.current.removeLayer("route-outline");
      }
      if (mapInstance.current.getLayer("route")) {
        mapInstance.current.removeLayer("route");
      }
      if (mapInstance.current.getSource("route")) {
        mapInstance.current.removeSource("route");
      }
    } catch (err) {
      console.error("Error clearing route:", err);
    }
  };

  const resetPoints = () => {
    // Remove all markers
    markers.forEach((marker) => marker.remove());
    setMarkers([]);

    // Clear source and destination
    setSource(null);
    setDestination(null);

    // Clear the route
    clearRoute();
  };

  const fetchShortestPath = async () => {
    if (!source || !destination) {
      alert("Please select both source and destination points.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending request with:", { source, destination, algorithm });

      const response = await axios.get(
        `http://localhost:8000/api/${algorithm}/`,
        {
          params: {
            start_lat: source.lat,
            start_lon: source.lng,
            end_lat: destination.lat,
            end_lon: destination.lng,
          },
        }
      );

      console.log("Response received:", response.data);

      const pathData = response.data.path; // Expecting an array of coordinates

      if (!Array.isArray(pathData) || pathData.length === 0) {
        alert("No valid path found.");
        setLoading(false);
        return;
      }

      // ✅ Standardize coordinate format to [longitude, latitude]
      let coordinates = pathData
        .map((point) => {
          if (Array.isArray(point) && point.length === 2) {
            // Already in [lon, lat] format
            return [Number(point[0]), Number(point[1])];
          } else if (point && typeof point === "object") {
            // Handle object format { lat, lon } or { lat, lng }
            const lon = point.lon ?? point.lng ?? null;
            const lat = point.lat ?? null;
            return lon !== null && lat !== null
              ? [Number(lon), Number(lat)]
              : null;
          }
          return null;
        })
        .filter(Boolean); // Remove any null values

      console.log("Processed coordinates:", coordinates);

      if (coordinates.length < 2) {
        alert("Error: Not enough valid coordinates to draw a path");
        setLoading(false);
        return;
      }

      // Instead of joining points directly, use the coordinates as they come from the API
      // The API should already be returning coordinates that follow the road network

      // Wait for the map to be fully loaded
      if (!mapInstance.current.isStyleLoaded()) {
        await new Promise((resolve) => {
          mapInstance.current.once("styledata", resolve);
        });
      }

      // Clear any existing route
      clearRoute();

      // Create a GeoJSON object with the route
      const routeData = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      };

      console.log("Adding route with data:", routeData);

      // Add new route source
      try {
        mapInstance.current.addSource("route", {
          type: "geojson",
          data: routeData,
        });

        // Add route layers
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
        });

        mapInstance.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#FF0000",
            "line-width": 4,
            "line-opacity": 1,
          },
        });

        console.log("Route layers added successfully");
      } catch (err) {
        console.error("Error adding route layers:", err);
        alert("Error rendering the route. See console for details.");
      }

      // Fit the map to the path bounds
      const bounds = new maplibregl.LngLatBounds();
      coordinates.forEach((coord) => bounds.extend(coord));

      mapInstance.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 17,
      });

      // Force map update
      mapInstance.current.triggerRepaint();
    } catch (error) {
      console.error("Error fetching path:", error);
      console.error(
        "Error details:",
        error.response ? error.response.data : "No response data"
      );
      alert("Error fetching shortest path. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Control Panel */}
      <div className="bg-white shadow-md p-4 mb-2 flex flex-wrap items-center gap-4 w-full">
        <div className="flex items-center">
          <label className="text-sm font-medium mr-2">Algorithm:</label>
          <select
            className="p-2 border rounded-md bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="dijkstra">Dijkstra</option>
            <option value="astar">A*</option>
          </select>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchShortestPath}
          disabled={!source || !destination || loading}
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4" />
              Find Shortest Path
            </>
          )}
        </button>

        <button
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          onClick={resetPoints}
        >
          Reset Points
        </button>

        <div className="flex-grow"></div>

        <div className="text-sm flex flex-col sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                source ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <span>{source ? "Source: Selected" : "Source: Click on map"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                destination ? "bg-red-500" : "bg-gray-300"
              }`}
            ></div>
            <span>
              {destination ? "Destination: Selected" : "Destination: Not set"}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!source && !destination && (
        <div className="bg-blue-50 text-blue-800 p-3 mb-2 rounded-md mx-4">
          <p>
            Click on the map to set your source point first, then click again to
            set your destination.
          </p>
        </div>
      )}

      {/* Map */}
      <div ref={mapContainer} className="flex-grow w-full" />
    </div>
  );
}
