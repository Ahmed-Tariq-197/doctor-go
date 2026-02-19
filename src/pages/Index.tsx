// ============================================
// Home Page (Landing Page)
// Main entry point with search and featured doctors
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor } from '@/types';
import { getDoctors } from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DoctorCard from '@/components/doctors/DoctorCard';
import MapPlaceholder from '@/components/doctors/MapPlaceholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import doctorGoLogo from '@/assets/doctorgo-logo.png';
import { 
  Search, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Brain,
  ChevronRight,
  Star,
  Shield,
  Users
} from 'lucide-react';

const Index: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />

          {/* Large Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <img
              src={doctorGoLogo}
              alt=""
              aria-hidden="true"
              className="w-[600px] md:w-[800px] lg:w-[1000px] max-w-none opacity-[0.04] mix-blend-multiply dark:mix-blend-screen dark:invert"
            />
          </div>
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Find the Right Doctor,
                <span className="text-primary block mt-2">Right Now</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Book appointments, join virtual queues, and get AI-powered recommendations. 
                Your healthcare journey simplified.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctors, specialties..."
                    className="pl-12 h-14 text-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8">
                  Search
                </Button>
              </form>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/doctors')}
                  className="gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Browse All Doctors
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/recommendations')}
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Get Recommendations
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Easy Booking</h3>
                <p className="text-muted-foreground">
                  Book appointments online in just a few clicks. No phone calls needed.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Queue</h3>
                <p className="text-muted-foreground">
                  Join virtual queues and get notified when it's your turn.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Smart Recommendations</h3>
                <p className="text-muted-foreground">
                  Describe your symptoms and get matched with the right specialist.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Featured Doctors
                </h2>
                <p className="text-muted-foreground mt-1">
                  Top-rated healthcare professionals near you
                </p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/doctors')}
                className="gap-1"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Map */}
            <div className="mb-8">
              <MapPlaceholder 
                doctors={doctors} 
                height="250px"
                onMarkerClick={(id) => navigate(`/doctors/${id}`)}
              />
            </div>

            {/* Doctor Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.slice(0, 6).map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <p className="text-primary-foreground/80">Verified Doctors</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50k+</div>
                <p className="text-primary-foreground/80">Happy Patients</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">4.8</div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  <p className="text-primary-foreground/80">Average Rating</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <p className="text-primary-foreground/80">Support Available</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Why Choose DoctorGo?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-4 p-4">
                <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Verified Professionals</h4>
                  <p className="text-sm text-muted-foreground">
                    All doctors are verified and licensed healthcare professionals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4">
                <Star className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Real Patient Reviews</h4>
                  <p className="text-sm text-muted-foreground">
                    Read honest reviews from verified patients to make informed decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4">
                <Users className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Easy Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Simple booking process with instant confirmation and reminders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-accent/30">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Create an account to book appointments, join queues, and manage your healthcare journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/auth?signup=true')}>
                Create Free Account
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/doctors')}>
                Browse Doctors First
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
