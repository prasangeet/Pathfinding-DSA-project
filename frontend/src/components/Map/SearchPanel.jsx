"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Navigation,
  MapPin,
  X,
  MapIcon,
  RotateCw,
  Car,
  Bike,
  PersonStanding,
  GripHorizontal,
} from "lucide-react";
import { commonLocations } from "./LocationPanel";
import maplibregl from "maplibre-gl";
import { useState, useRef } from "react";
import Draggable from "react-draggable";

export function SearchPanel({
  sourceSearch,
  setSourceSearch,
  destSearch,
  setDestSearch,
  source,
  setSource,
  destination,
  setDestination,
  markers,
  setMarkers,
  algorithm,
  setAlgorithm,
  loading,
  fetchShortestPath,
  routeInfo,
  mapInstance,
}) {
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const nodeRef = useRef(null);

  const getLocationSuggestions = (searchTerm) => {
    if (!searchTerm) return [];
    const normalizedSearch = searchTerm.toLowerCase();
    return commonLocations.filter((location) =>
      location.name.toLowerCase().includes(normalizedSearch)
    );
  };

  const handleLocationSelect = (location, isSource) => {
    if (isSource) {
      setSourceSearch(location.name);
      setSource({ lng: location.coords[0], lat: location.coords[1] });
      markers[0]?.remove();
      const newMarker = new maplibregl.Marker({ color: "#22c55e" })
        .setLngLat(location.coords)
        .addTo(mapInstance.current);
      setMarkers([newMarker, ...markers.slice(1)]);
      setShowSourceSuggestions(false);
    } else {
      setDestSearch(location.name);
      setDestination({ lng: location.coords[0], lat: location.coords[1] });
      markers[1]?.remove();
      const newMarker = new maplibregl.Marker({ color: "#ef4444" })
        .setLngLat(location.coords)
        .addTo(mapInstance.current);
      setMarkers([markers[0], newMarker]);
      setShowDestSuggestions(false);
    }
  };

  const sourceSuggestions = getLocationSuggestions(sourceSearch);
  const destSuggestions = getLocationSuggestions(destSearch);

  const formatCoordinates = (point) => {
    if (!point) return "";
    return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
  };

  return (
    <Draggable handle=".drag-handle" bounds="parent" nodeRef={nodeRef}>
      <div ref={nodeRef} className="absolute top-4 left-4 max-w-md z-10">
        <Card className="p-3 sm:p-4 shadow-lg bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-500">Search Panel</div>
            <div className="drag-handle cursor-move">
              <GripHorizontal className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Choose starting point"
                    value={sourceSearch}
                    onChange={(e) => {
                      setSourceSearch(e.target.value);
                      setShowSourceSuggestions(true);
                    }}
                    onFocus={() => setShowSourceSuggestions(true)}
                    className="pl-9"
                  />
                  <Navigation className="w-4 h-4 absolute left-3 top-3 text-green-500" />
                </div>
                {source && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSource(null);
                      setSourceSearch("");
                      markers[0]?.remove();
                      setMarkers(markers.slice(1));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {source && !sourceSuggestions.length && (
                <div className="mt-1 text-xs text-gray-500">
                  Coordinates: {formatCoordinates(source)}
                </div>
              )}
              {sourceSuggestions.length > 0 && showSourceSuggestions && (
                <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-20">
                  {sourceSuggestions.map((location) => {
                    const Icon = location.icon;
                    return (
                      <button
                        key={location.name}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleLocationSelect(location, true)}
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span>{location.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Choose destination"
                    value={destSearch}
                    onChange={(e) => {
                      setDestSearch(e.target.value);
                      setShowDestSuggestions(true);
                    }}
                    onFocus={() => setShowDestSuggestions(true)}
                    className="pl-9"
                  />
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-500" />
                </div>
                {destination && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDestination(null);
                      setDestSearch("");
                      markers[1]?.remove();
                      setMarkers([markers[0]]);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {destination && !destSuggestions.length && (
                <div className="mt-1 text-xs text-gray-500">
                  Coordinates: {formatCoordinates(destination)}
                </div>
              )}
              {destSuggestions.length > 0 && showDestSuggestions && (
                <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-20">
                  {destSuggestions.map((location) => {
                    const Icon = location.icon;
                    return (
                      <button
                        key={location.name}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleLocationSelect(location, false)}
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span>{location.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dijkstra">Dijkstra</SelectItem>
                  <SelectItem value="astar">A* Algorithm</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="w-full sm:flex-1 mt-2 sm:mt-0"
                onClick={fetchShortestPath}
                disabled={!source || !destination || loading}
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MapIcon className="w-4 h-4 mr-2" />
                    Find Route
                  </>
                )}
              </Button>
            </div>

            {routeInfo && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Route Information
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>Distance: {routeInfo.distance.toFixed(2)} km</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-2">
                      <Car className="w-5 h-5 text-blue-700" />
                      <div>
                        <p className="font-medium">By Car</p>
                        <p>{routeInfo.timeByCar} min</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-2">
                      <Bike className="w-5 h-5 text-blue-700" />
                      <div>
                        <p className="font-medium">By Bike</p>
                        <p>{routeInfo.timeByBike} min</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-2">
                      <PersonStanding className="w-5 h-5 text-blue-700" />
                      <div>
                        <p className="font-medium">By Foot</p>
                        <p>{routeInfo.timeByFoot} min</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Draggable>
  );
}
