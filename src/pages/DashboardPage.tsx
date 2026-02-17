// ============================================
// Dashboard Page
// Different views for patients and doctors
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Appointment, QueueEntry } from '@/types';
import { getAppointments, getQueue, inviteNextPatient, updateAppointment } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppointmentList from '@/components/appointments/AppointmentList';
import QueueDisplay from '@/components/queue/QueueDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar, Users, Clock, Stethoscope, Search, Brain, Loader2,
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); }
  }, [user, navigate]);

  useEffect(() => {
    if (user) { loadData(); }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (user?.role === 'doctor') {
        // Find the doctor record linked to this user
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (doctorData) {
          setDoctorId(doctorData.id);
          const [appointmentsRes, queueRes] = await Promise.all([
            getAppointments(doctorData.id),
            getQueue(doctorData.id),
          ]);
          if (appointmentsRes.success && appointmentsRes.data) setAppointments(appointmentsRes.data);
          if (queueRes.success && queueRes.data) setQueueEntries(queueRes.data);
        }
      } else {
        const appointmentsRes = await getAppointments();
        if (appointmentsRes.success && appointmentsRes.data) setAppointments(appointmentsRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteNext = async () => {
    if (!doctorId) return;
    setIsInviting(true);
    try {
      const response = await inviteNextPatient(doctorId);
      if (response.success) {
        toast({
          title: response.data ? 'Patient invited' : 'Queue empty',
          description: response.data ? `${response.data.patientName} has been invited.` : 'No patients waiting.',
        });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to invite next patient.', variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await updateAppointment(id, 'cancelled');
      if (response.success) {
        toast({ title: 'Appointment cancelled' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      const response = await updateAppointment(id, 'completed');
      if (response.success) {
        toast({ title: 'Appointment completed' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  if (!user) return null;

  const isDoctor = user.role === 'doctor' || user.role === 'secretary';
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const waitingPatients = queueEntries.filter(q => q.status === 'waiting');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name.split(' ')[0] || 'User'}!</h1>
            <p className="text-muted-foreground">
              {isDoctor ? 'Manage your appointments and patient queue' : 'View your appointments and find doctors'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming</p>
                        <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isDoctor && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/50 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">In Queue</p>
                          <p className="text-2xl font-bold text-foreground">{waitingPatients.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-chart-2/20 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-chart-2" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-foreground">{appointments.filter(a => a.status === 'completed').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(isDoctor ? '/dashboard' : '/doctors')}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {isDoctor ? <Stethoscope className="h-6 w-6 text-primary" /> : <Search className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{isDoctor ? 'Your Profile' : 'Find Doctors'}</p>
                        <p className="text-sm font-medium text-primary">{isDoctor ? 'View & Edit →' : 'Browse →'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <AppointmentList appointments={appointments} isDoctor={isDoctor} onCancel={handleCancelAppointment} onComplete={isDoctor ? handleCompleteAppointment : undefined} />
                </div>
                <div className="space-y-6">
                  {isDoctor && <QueueDisplay entries={queueEntries} isDoctor={true} onInviteNext={handleInviteNext} isLoading={isInviting} />}
                  <Card>
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {!isDoctor && (
                        <>
                          <Button className="w-full gap-2" onClick={() => navigate('/doctors')}>
                            <Stethoscope className="h-4 w-4" /> Find a Doctor
                          </Button>
                          <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/recommendations')}>
                            <Brain className="h-4 w-4" /> Get Recommendations
                          </Button>
                        </>
                      )}
                      {isDoctor && (
                        <>
                          <Button className="w-full gap-2" disabled={waitingPatients.length === 0 || isInviting} onClick={handleInviteNext}>
                            {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Users className="h-4 w-4" /> Invite Next Patient
                          </Button>
                          <Button variant="outline" className="w-full gap-2">
                            <Calendar className="h-4 w-4" /> Manage Availability
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
