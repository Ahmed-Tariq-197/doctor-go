// ============================================
// Map Placeholder Component
// Shows a simple map representation
// Can be replaced with real map library later
// ============================================

import React from 'react';
import { Doctor, Clinic } from '@/types';
import { MapPin, ExternalLink } from 'lucide-react';

interface MapPlaceholderProps {
  doctors?: Doctor[];
  clinics?: Clinic[];
  selectedId?: number;
  onMarkerClick?: (id: number) => void;
  height?: string;
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  doctors = [],
  clinics = [],
  selectedId,
  onMarkerClick,
  height = '300px',
}) => {
  // Use doctors if provided, otherwise use clinics
  const locations = doctors.length > 0 
    ? doctors.map(d => ({ 
        id: d.id, 
        name: d.clinicName, 
        lat: d.lat, 
        lng: d.lng,
        doctorName: d.name 
      }))
    : clinics.map(c => ({ 
        id: c.id, 
        name: c.name, 
        lat: c.lat, 
        lng: c.lng,
        doctorName: undefined 
      }));

  // Get unique locations
  const uniqueLocations = locations.filter(
    (loc, index, self) =>
      index === self.findIndex(l => l.lat === loc.lat && l.lng === loc.lng)
  );

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15#map=15/${lat}/${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="relative bg-accent/30 rounded-lg overflow-hidden border border-border"
      style={{ height }}
    >
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur px-3 py-1.5 rounded-md border border-border">
        <span className="text-sm font-medium text-foreground">Map View</span>
      </div>

      {/* Location Markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 max-w-full overflow-auto">
          {uniqueLocations.slice(0, 6).map((location) => (
            <button
              key={location.id}
              onClick={() => onMarkerClick?.(location.id)}
              className={`
                group flex flex-col items-center gap-2 p-3 rounded-lg transition-all
                ${selectedId === location.id 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                  : 'bg-card/90 hover:bg-card text-foreground hover:shadow-md'
                }
              `}
            >
              <MapPin 
                className={`h-6 w-6 ${
                  selectedId === location.id ? 'text-primary-foreground' : 'text-primary'
                }`} 
              />
              <span className="text-xs font-medium text-center line-clamp-2">
                {location.name}
              </span>
              {location.doctorName && (
                <span className={`text-xs ${
                  selectedId === location.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                }`}>
                  {location.doctorName}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Open in Maps Button */}
      {uniqueLocations.length > 0 && (
        <button
          onClick={() => {
            const firstLoc = uniqueLocations[0];
            openInMaps(firstLoc.lat, firstLoc.lng, firstLoc.name);
          }}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Maps
        </button>
      )}

      {/* Empty State */}
      {uniqueLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No locations to display</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPlaceholder;
