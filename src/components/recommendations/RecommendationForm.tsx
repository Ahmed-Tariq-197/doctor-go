// ============================================
// Recommendation Form Component
// Allows users to input symptoms and get doctor recommendations
// ============================================

import React, { useState } from 'react';
import { Recommendation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const RecommendationForm: React.FC = () => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: 'Please describe your symptoms',
        description: 'Enter your symptoms or health concerns to get recommendations.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await getRecommendations(query);
      if (response.success && response.data) {
        setRecommendations(response.data);
        if (response.data.length === 0) {
          toast({
            title: 'No specific matches found',
            description: 'We recommend consulting a General Practitioner for your symptoms.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleSymptoms = [
    'I have chest pain and shortness of breath',
    'My child has a fever and cough',
    'I have a skin rash that won\'t go away',
    'I injured my knee playing sports',
  ];

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Describe Your Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your symptoms or health concerns in detail. For example: 'I have been experiencing headaches and fatigue for the past week...'"
              className="min-h-[120px] resize-none"
            />

            {/* Example Symptoms */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleSymptoms.map((symptom, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setQuery(symptom)}
                    className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              <Sparkles className="h-4 w-4" />
              {isLoading ? 'Analyzing...' : 'Get Recommendations'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recommended Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.doctorId}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={index === 0 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          #{index + 1} Match
                        </Badge>
                        <Badge variant="outline">
                          {rec.matchScore}% match
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold text-foreground text-lg">
                        {rec.doctorName}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground">
                        {rec.specialty}
                      </p>
                      
                      <p className="text-sm text-foreground mt-2">
                        {rec.reason}
                      </p>
                    </div>

                    <Button 
                      size="sm"
                      onClick={() => navigate(`/doctors/${rec.doctorId}`)}
                      className="gap-1 flex-shrink-0"
                    >
                      View
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendationForm;
