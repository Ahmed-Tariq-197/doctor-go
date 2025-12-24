// ============================================
// Recommendations Page
// AI-powered doctor recommendations
// ============================================

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RecommendationForm from '@/components/recommendations/RecommendationForm';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, Shield, Clock } from 'lucide-react';

const RecommendationsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Smart Doctor Recommendations
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Describe your symptoms and let our intelligent system match you with 
              the most suitable healthcare specialist.
            </p>
          </div>

          {/* How It Works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-foreground mb-1">Describe Symptoms</h4>
                <p className="text-sm text-muted-foreground">
                  Tell us what you're experiencing in your own words
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-foreground mb-1">Smart Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our system analyzes and matches specialties
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-foreground mb-1">Instant Results</h4>
                <p className="text-sm text-muted-foreground">
                  Get matched doctors in seconds
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation Form */}
          <RecommendationForm />

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-accent/30 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Medical Disclaimer</p>
                <p className="text-xs text-muted-foreground">
                  This recommendation system is for informational purposes only and should not 
                  replace professional medical advice. Always consult with a qualified healthcare 
                  provider for medical diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecommendationsPage;
