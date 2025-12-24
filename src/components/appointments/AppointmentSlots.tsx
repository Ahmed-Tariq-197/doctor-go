// ============================================
// Appointment Slots Component
// Displays available time slots for booking
// ============================================

import React from 'react';
import { AppointmentSlot } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { format, isSameDay, isToday, isTomorrow } from 'date-fns';

interface AppointmentSlotsProps {
  slots: AppointmentSlot[];
  selectedSlot: AppointmentSlot | null;
  onSelectSlot: (slot: AppointmentSlot) => void;
  isLoading?: boolean;
}

const AppointmentSlots: React.FC<AppointmentSlotsProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}) => {
  // Group slots by date
  const groupedSlots: { [key: string]: AppointmentSlot[] } = {};
  
  slots.forEach(slot => {
    const date = new Date(slot.time);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!groupedSlots[dateKey]) {
      groupedSlots[dateKey] = [];
    }
    groupedSlots[dateKey].push(slot);
  });

  const getDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Available Time Slots
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No available slots</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([dateKey, daySlots]) => (
              <div key={dateKey}>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {getDateLabel(dateKey)}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {daySlots.map(slot => {
                    const time = new Date(slot.time);
                    const isSelected = selectedSlot?.id === slot.id;
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? 'default' : slot.available ? 'outline' : 'ghost'}
                        size="sm"
                        disabled={!slot.available || isLoading}
                        onClick={() => onSelectSlot(slot)}
                        className={`
                          ${!slot.available ? 'opacity-50 line-through' : ''}
                          ${isSelected ? '' : ''}
                        `}
                      >
                        {format(time, 'h:mm a')}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Slot Summary */}
        {selectedSlot && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Selected appointment</p>
            <p className="font-medium text-foreground">
              {format(new Date(selectedSlot.time), 'EEEE, MMMM d, yyyy')} at{' '}
              {format(new Date(selectedSlot.time), 'h:mm a')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentSlots;
