"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Navigation,
  MapPin,
  ChevronRight,
  Building2,
  Landmark,
  Bus,
  ShoppingBag,
  Building,
  TreePine,
  Plane,
  Castle,
} from "lucide-react"

export const commonLocations = [
  { name: "Pune Station", coords: [73.874, 18.528], icon: Bus },
  { name: "Shaniwar Wada", coords: [73.855, 18.519], icon: Castle },
  { name: "Swargate", coords: [73.857, 18.501], icon: Building2 },
  { name: "Koregaon Park", coords: [73.891, 18.535], icon: TreePine },
  { name: "Phoenix Mall", coords: [73.919, 18.562], icon: ShoppingBag },
  { name: "Dagdusheth Temple", coords: [73.857, 18.516], icon: Landmark },
  { name: "Sarasbaug", coords: [73.851, 18.502], icon: TreePine },
  { name: "Pune Airport", coords: [73.913, 18.582], icon: Plane },
  { name: "Hinjewadi IT Park", coords: [73.738, 18.589], icon: Building },
  { name: "Aga Khan Palace", coords: [73.904, 18.547], icon: Building },
]

export function LocationPanel({ searchOpen, setSearchOpen, handleLocationSelect, setSourceSearch, setDestSearch }) {
  return (
    <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="absolute top-4 right-4 shadow-lg z-10 bg-white hover:bg-gray-100">
          <span className="hidden sm:inline">Popular Places</span>
          <span className="sm:hidden">Places</span>
          <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] md:w-[540px] bg-white overflow-hidden flex flex-col h-full">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold text-gray-800">Popular Destinations</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto flex-1 pr-2">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Set as Starting Point</h3>
              <div className="grid grid-cols-1 gap-2">
                {commonLocations.map((loc) => {
                  const Icon = loc.icon
                  return (
                    <Button
                      key={`source-${loc.name}`}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                      onClick={() => {
                        handleLocationSelect(loc.coords, true)
                        setSourceSearch(loc.name)
                        setSearchOpen(false)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                        </div>
                        <Navigation className="w-4 h-4 text-green-500" />
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
            <Separator className="my-6" />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Set as Destination</h3>
              <div className="grid grid-cols-1 gap-2">
                {commonLocations.map((loc) => {
                  const Icon = loc.icon
                  return (
                    <Button
                      key={`dest-${loc.name}`}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                      onClick={() => {
                        handleLocationSelect(loc.coords, false)
                        setDestSearch(loc.name)
                        setSearchOpen(false)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                        </div>
                        <MapPin className="w-4 h-4 text-red-500" />
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

