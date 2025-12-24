// ============================================
// Search Filters Component
// Allows filtering doctors by specialty and name
// ============================================

import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, X, ArrowUpDown, MapPin, Loader2 } from 'lucide-react';

export type SortOption = 'rating' | 'price-low' | 'price-high' | 'queue' | 'distance';

interface SearchFiltersProps {
  nameFilter: string;
  specialtyFilter: string;
  sortBy: SortOption;
  maxDistance: number;
  userLocation: { lat: number; lng: number } | null;
  isLocating: boolean;
  onNameChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onMaxDistanceChange: (value: number) => void;
  onRequestLocation: () => void;
  onClear: () => void;
}

// Available specialties for filtering
const specialties = [
  'All Specialties',
  'General Practice',
  'Cardiology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
];

// Radix Select doesn't allow empty string values for SelectItem.
const ALL_SPECIALTIES_VALUE = 'all';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Highest Rating' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'queue', label: 'Shortest Queue' },
  { value: 'distance', label: 'Nearest First' },
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  nameFilter,
  specialtyFilter,
  sortBy,
  maxDistance,
  userLocation,
  isLocating,
  onNameChange,
  onSpecialtyChange,
  onSortChange,
  onMaxDistanceChange,
  onRequestLocation,
  onClear,
}) => {
  const hasFilters = nameFilter || specialtyFilter;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Name Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name..."
            value={nameFilter}
            onChange={(e) => onNameChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Specialty Filter */}
        <div className="w-full md:w-48">
          <Select
            value={specialtyFilter || undefined}
            onValueChange={(value) =>
              onSpecialtyChange(value === ALL_SPECIALTIES_VALUE ? '' : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((specialty) => (
                <SelectItem
                  key={specialty}
                  value={specialty === 'All Specialties' ? ALL_SPECIALTIES_VALUE : specialty}
                >
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        {hasFilters && (
          <Button variant="outline" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Distance Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-border">
        <Button
          variant={userLocation ? 'secondary' : 'outline'}
          size="sm"
          onClick={onRequestLocation}
          disabled={isLocating}
          className="gap-2 shrink-0"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {userLocation ? 'Location Set' : 'Use My Location'}
        </Button>

        {userLocation && (
          <div className="flex-1 flex items-center gap-4 w-full">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Within {maxDistance} km
            </span>
            <Slider
              value={[maxDistance]}
              onValueChange={([value]) => onMaxDistanceChange(value)}
              min={1}
              max={50}
              step={1}
              className="flex-1"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
