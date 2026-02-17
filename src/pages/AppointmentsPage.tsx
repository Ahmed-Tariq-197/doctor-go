// ============================================
// Appointments Page
// View and manage user appointments
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/types';
import { getAppointments, updateAppointment } from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppointmentList from '@/components/appointments/AppointmentList';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Loader2, Plus } from 'lucide-react';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      loadAppointments();
    }
  }, [user, navigate]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await getAppointments();
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await updateAppointment(id, 'cancelled');
      if (response.success) {
        toast({ title: 'Appointment cancelled', description: 'Your appointment has been cancelled successfully.' });
        loadAppointments();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel appointment.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
              <p className="text-muted-foreground">View and manage your upcoming appointments</p>
            </div>
            <Button onClick={() => navigate('/doctors')} className="gap-2">
              <Plus className="h-4 w-4" /> Book New
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                You haven't booked any appointments. Find a doctor and schedule your first visit.
              </p>
              <Button onClick={() => navigate('/doctors')}>Find a Doctor</Button>
            </div>
          ) : (
            <AppointmentList appointments={appointments} onCancel={handleCancel} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppointmentsPage;
