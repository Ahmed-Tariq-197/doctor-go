// ============================================
// Doctor Profile Page
// View doctor details, join queue, or book appointment
// ============================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Doctor, AppointmentSlot, QueueEntry } from '@/types';
import { getDoctorById, joinQueue, getQueue, createAppointment, processPayment } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppointmentSlots from '@/components/appointments/AppointmentSlots';
import QueueDisplay from '@/components/queue/QueueDisplay';
import MapPlaceholder from '@/components/doctors/MapPlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Star,
  MapPin,
  DollarSign,
  Users,
  Clock,
  ArrowLeft,
  Calendar,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoiningQueue, setIsJoiningQueue] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadDoctor(parseInt(id));
      loadQueue(parseInt(id));
    }
  }, [id]);

  const loadDoctor = async (doctorId: number) => {
    setIsLoading(true);
    try {
      const response = await getDoctorById(doctorId);
      if (response.success && response.data) {
        setDoctor(response.data);
      } else {
        toast({
          title: 'Doctor not found',
          description: 'The requested doctor could not be found.',
          variant: 'destructive',
        });
        navigate('/doctors');
      }
    } catch (error) {
      console.error('Failed to load doctor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQueue = async (doctorId: number) => {
    try {
      const response = await getQueue(doctorId);
      if (response.success && response.data) {
        setQueueEntries(response.data);
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  };

  const handleJoinQueue = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to join the queue.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!doctor) return;

    setIsJoiningQueue(true);
    try {
      const response = await joinQueue(doctor.id);
      if (response.success) {
        toast({
          title: 'Joined queue!',
          description: `You are now #${doctor.queueLength + 1} in line.`,
        });
        loadQueue(doctor.id);
        loadDoctor(doctor.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join queue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoiningQueue(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to book an appointment.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!doctor || !selectedSlot) {
      toast({
        title: 'Select a time slot',
        description: 'Please select an available time slot.',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);
    try {
      // Create appointment
      const appointmentResponse = await createAppointment(doctor.id, selectedSlot.time);
      
      if (appointmentResponse.success && appointmentResponse.data) {
        // Process mock payment
        const paymentResponse = await processPayment(
          appointmentResponse.data.id,
          doctor.cost
        );

        if (paymentResponse.success && paymentResponse.data) {
          setReceipt(paymentResponse.data);
          setBookingComplete(true);
          toast({
            title: 'Booking confirmed!',
            description: 'Your appointment has been booked successfully.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  // Show booking confirmation
  if (bookingComplete && receipt) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-lg">
            <Card>
              <CardContent className="pt-8 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Booking Confirmed!
                </h1>
                
                <p className="text-muted-foreground mb-8">
                  Your appointment has been booked successfully.
                </p>

                <div className="bg-accent/30 rounded-lg p-6 text-left mb-8">
                  <h3 className="font-semibold text-foreground mb-4">Receipt Details</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receipt #</span>
                      <span className="font-mono text-foreground">{receipt.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Doctor</span>
                      <span className="text-foreground">{doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="text-foreground">
                        {selectedSlot && new Date(selectedSlot.time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 mt-3">
                      <span className="font-semibold text-foreground">Amount Paid</span>
                      <span className="font-semibold text-primary">${receipt.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/appointments')}
                  >
                    View Appointments
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/doctors')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Doctors
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Doctor Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                      <span className="text-4xl font-bold text-primary">
                        {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {doctor.name}
                      </h1>
                      <Badge variant="secondary" className="text-sm mb-4">
                        {doctor.specialty}
                      </Badge>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-3 bg-accent/30 rounded-lg">
                          <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">{doctor.rating}</p>
                          <p className="text-xs text-muted-foreground">Rating</p>
                        </div>

                        <div className="text-center p-3 bg-accent/30 rounded-lg">
                          <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">${doctor.cost}</p>
                          <p className="text-xs text-muted-foreground">Per Visit</p>
                        </div>

                        <div className="text-center p-3 bg-accent/30 rounded-lg">
                          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">{doctor.queueLength}</p>
                          <p className="text-xs text-muted-foreground">In Queue</p>
                        </div>

                        <div className="text-center p-3 bg-accent/30 rounded-lg">
                          <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                          <p className="text-lg font-bold text-foreground">
                            {doctor.availableSlots.filter(s => s.available).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Slots Available</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{doctor.clinicName}</p>
                        <p className="text-sm text-muted-foreground">{doctor.clinicAddress}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <MapPlaceholder
                        doctors={[doctor]}
                        height="200px"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Slots */}
              <AppointmentSlots
                slots={doctor.availableSlots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Book Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    disabled={!selectedSlot || isBooking}
                    onClick={handleBookAppointment}
                  >
                    {isBooking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {selectedSlot 
                      ? `Book for $${doctor.cost}` 
                      : 'Select a time slot'
                    }
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isJoiningQueue}
                    onClick={handleJoinQueue}
                  >
                    {isJoiningQueue && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Users className="h-4 w-4 mr-2" />
                    Join Walk-in Queue
                  </Button>
                </CardContent>
              </Card>

              {/* Queue Display */}
              <QueueDisplay entries={queueEntries} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorProfilePage;
