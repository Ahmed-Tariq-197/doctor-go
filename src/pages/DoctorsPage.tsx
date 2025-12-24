// ============================================
// Doctors List Page
// Browse and filter all doctors
// ============================================

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Doctor } from '@/types';
import { getDoctors } from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DoctorCard from '@/components/doctors/DoctorCard';
import MapPlaceholder from '@/components/doctors/MapPlaceholder';
import SearchFilters, { SortOption } from '@/components/doctors/SearchFilters';
import { Loader2 } from 'lucide-react';
import { calculateDistance } from '@/lib/distance';
import { toast } from 'sonner';

interface UserLocation {
  lat: number;
  lng: number;
}

const DoctorsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();
  
  // Filter states
  const [nameFilter, setNameFilter] = useState(searchParams.get('search') || '');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [maxDistance, setMaxDistance] = useState(25);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  // Request user location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortBy('distance');
        setIsLocating(false);
        toast.success('Location detected');
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An error occurred while getting your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Apply filters and sorting with distance calculation
  const filteredDoctors = useMemo(() => {
    let filtered = doctors.map((doctor) => ({
      ...doctor,
      distance: userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, doctor.lat, doctor.lng)
        : undefined,
    }));

    if (nameFilter) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        d.specialty.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (specialtyFilter) {
      filtered = filtered.filter(d =>
        d.specialty.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }

    // Apply distance filter if location is set
    if (userLocation) {
      filtered = filtered.filter(d => d.distance !== undefined && d.distance <= maxDistance);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.cost - b.cost);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.cost - a.cost);
        break;
      case 'queue':
        filtered.sort((a, b) => a.queueLength - b.queueLength);
        break;
      case 'distance':
        if (userLocation) {
          filtered.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }
        break;
    }

    return filtered;
  }, [doctors, nameFilter, specialtyFilter, sortBy, userLocation, maxDistance]);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await getDoctors();
      if (response.success && response.data) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setNameFilter('');
    setSpecialtyFilter('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Find a Doctor</h1>
            <p className="text-muted-foreground">
              Browse our network of healthcare professionals and book an appointment
            </p>
          </div>

          {/* Search Filters */}
          <div className="mb-8">
            <SearchFilters
              nameFilter={nameFilter}
              specialtyFilter={specialtyFilter}
              sortBy={sortBy}
              maxDistance={maxDistance}
              userLocation={userLocation}
              isLocating={isLocating}
              onNameChange={setNameFilter}
              onSpecialtyChange={setSpecialtyFilter}
              onSortChange={setSortBy}
              onMaxDistanceChange={setMaxDistance}
              onRequestLocation={requestLocation}
              onClear={handleClearFilters}
            />
          </div>

          {/* Map and Results Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Section */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Clinic Locations
                </h2>
                <MapPlaceholder
                  doctors={filteredDoctors}
                  selectedId={selectedDoctorId}
                  onMarkerClick={setSelectedDoctorId}
                  height="400px"
                />
              </div>
            </div>

            {/* Doctor List */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
                  {userLocation && ` within ${maxDistance} km`}
                </h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground">
                    No doctors found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredDoctors.map(doctor => (
                    <div
                      key={doctor.id}
                      onMouseEnter={() => setSelectedDoctorId(doctor.id)}
                      onMouseLeave={() => setSelectedDoctorId(undefined)}
                    >
                      <DoctorCard doctor={doctor} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorsPage;
