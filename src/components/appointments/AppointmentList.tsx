// ============================================
// Appointment List Component
// Shows list of appointments
// ============================================

import React from 'react';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentListProps {
  appointments: Appointment[];
  isDoctor?: boolean;
  onCancel?: (id: number) => void;
  onComplete?: (id: number) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'bg-accent text-accent-foreground';
    case 'in-progress':
      return 'bg-primary text-primary-foreground';
    case 'completed':
      return 'bg-chart-2 text-foreground';
    case 'cancelled':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isDoctor = false,
  onCancel,
  onComplete,
  isLoading = false,
}) => {
  // Sort appointments by date, most recent first
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {isDoctor ? 'Patient Appointments' : 'My Appointments'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="flex items-start justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="space-y-2">
                  {/* Date and Time */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {format(new Date(appointment.appointmentTime), 'EEEE, MMM d')}
                    </span>
                    <span className="text-muted-foreground">
                      at {format(new Date(appointment.appointmentTime), 'h:mm a')}
                    </span>
                  </div>

                  {/* Doctor or Patient Name */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {isDoctor ? appointment.patientName : appointment.doctorName}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>

                {/* Action Buttons */}
                {appointment.status === 'scheduled' && (
                  <div className="flex gap-2">
                    {isDoctor && onComplete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onComplete(appointment.id)}
                        disabled={isLoading}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Complete
                      </Button>
                    )}
                    {onCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancel(appointment.id)}
                        disabled={isLoading}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentList;
