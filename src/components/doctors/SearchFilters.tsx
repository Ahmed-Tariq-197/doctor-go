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
import { Search, X } from 'lucide-react';

interface SearchFiltersProps {
  nameFilter: string;
  specialtyFilter: string;
  onNameChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
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

const SearchFilters: React.FC<SearchFiltersProps> = ({
  nameFilter,
  specialtyFilter,
  onNameChange,
  onSpecialtyChange,
  onClear,
}) => {
  const hasFilters = nameFilter || specialtyFilter;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
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
        <div className="w-full md:w-64">
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

        {/* Clear Button */}
        {hasFilters && (
          <Button variant="outline" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
