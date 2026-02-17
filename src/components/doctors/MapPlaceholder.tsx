// ============================================
// Interactive Map Component
// Uses Leaflet for real map display
// ============================================

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Doctor, Clinic } from '@/types';

interface MapPlaceholderProps {
  doctors?: Doctor[];
  clinics?: Clinic[];
  selectedId?: string;
  onMarkerClick?: (id: string) => void;
  height?: string;
}

// Fix Leaflet default icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'selected-marker',
});

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  doctors = [],
  clinics = [],
  selectedId,
  onMarkerClick,
  height = '300px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Build locations from doctors or clinics
  const locations = doctors.length > 0
    ? doctors.map(d => ({
        id: d.id,
        name: d.clinicName || 'Clinic',
        lat: d.lat,
        lng: d.lng,
        doctorName: d.name,
        specialty: d.specialty,
      }))
    : clinics.map(c => ({
        id: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        doctorName: undefined as string | undefined,
        specialty: undefined as string | undefined,
      }));

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [40.7128, -74.006],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (locations.length === 0) return;

    // Add new markers
    const bounds = L.latLngBounds([]);

    locations.forEach(loc => {
      const isSelected = loc.id === selectedId;
      const marker = L.marker([loc.lat, loc.lng], {
        icon: isSelected ? selectedIcon : defaultIcon,
      }).addTo(map);

      // Popup content
      let popupContent = `<strong>${loc.name}</strong>`;
      if (loc.doctorName) popupContent += `<br/>${loc.doctorName}`;
      if (loc.specialty) popupContent += `<br/><em>${loc.specialty}</em>`;
      marker.bindPopup(popupContent);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(loc.id));
      }

      if (isSelected) {
        marker.openPopup();
      }

      bounds.extend([loc.lat, loc.lng]);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [locations, selectedId, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="rounded-lg overflow-hidden border border-border"
      style={{ height, width: '100%' }}
    />
  );
};

export default MapPlaceholder;
