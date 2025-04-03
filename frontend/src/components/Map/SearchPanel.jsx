"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation, MapPin, X, MapIcon, RotateCw, Car, Bike, PersonStanding } from "lucide-react"

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
}) {
  return (
    <div className="absolute top-4 left-4 right-4 max-w-md mx-auto z-10">
      <Card className="p-3 sm:p-4 shadow-lg bg-white/95 backdrop-blur">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Choose starting point"
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                className="pl-9"
              />
              <Navigation className="w-4 h-4 absolute left-3 top-3 text-green-500" />
            </div>
            {source && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSource(null)
                  setSourceSearch("")
                  markers[0]?.remove()
                  setMarkers(markers.slice(1))
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Choose destination"
                value={destSearch}
                onChange={(e) => setDestSearch(e.target.value)}
                className="pl-9"
              />
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-500" />
            </div>
            {destination && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDestination(null)
                  setDestSearch("")
                  markers[1]?.remove()
                  setMarkers([markers[0]])
                }}
              >
                <X className="w-4 h-4" />
              </Button>
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
              <h3 className="font-medium text-blue-900 mb-2">Route Information</h3>
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
                      <p className="font-medium">On Foot</p>
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
  )
}

