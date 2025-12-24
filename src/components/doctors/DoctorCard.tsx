// ============================================
// Doctor Card Component
// Displays doctor info in a card format
// ============================================

import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign, Users } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = forwardRef<HTMLDivElement, DoctorCardProps>(({ doctor }, ref) => {
  const navigate = useNavigate();

  return (
    <Card ref={ref} className="h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-6">
        {/* Doctor Avatar Placeholder */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary">
              {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate">
              {doctor.name}
            </h3>
            <Badge variant="secondary" className="mt-1">
              {doctor.specialty}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 space-y-2">
          {/* Rating */}
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-foreground">{doctor.rating}</span>
            <span className="text-muted-foreground">/ 5.0</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{doctor.clinicName}</span>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>${doctor.cost} per visit</span>
          </div>

          {/* Queue */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {doctor.queueLength === 0 ? (
                <span className="text-accent-foreground font-medium">No wait</span>
              ) : (
                <>
                  <span className="font-medium text-foreground">{doctor.queueLength}</span> in queue
                </>
              )}
            </span>
          </div>

          {/* Available Slots */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {doctor.availableSlots.filter(s => s.available).length}
              </span> slots available today
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full" 
          onClick={() => navigate(`/doctors/${doctor.id}`)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
});

DoctorCard.displayName = 'DoctorCard';

export default DoctorCard;
