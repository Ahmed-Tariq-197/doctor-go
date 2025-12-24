// ============================================
// Queue Display Component
// Shows current queue for a doctor
// ============================================

import React from 'react';
import { QueueEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QueueDisplayProps {
  entries: QueueEntry[];
  isDoctor?: boolean;
  onInviteNext?: () => void;
  isLoading?: boolean;
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({
  entries,
  isDoctor = false,
  onInviteNext,
  isLoading = false,
}) => {
  const waitingEntries = entries.filter(e => e.status === 'waiting');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Current Queue
        </CardTitle>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {waitingEntries.length}
        </Badge>
      </CardHeader>
      <CardContent>
        {waitingEntries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No patients in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitingEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${index === 0 ? 'border-primary bg-primary/5' : 'border-border bg-card'}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Position Badge */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${index === 0 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium text-foreground">{entry.patientName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Joined {formatDistanceToNow(new Date(entry.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {index === 0 && isDoctor && (
                  <Badge className="bg-primary text-primary-foreground">
                    Next
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Invite Next Button (Doctor Only) */}
        {isDoctor && waitingEntries.length > 0 && (
          <Button 
            className="w-full mt-4 gap-2"
            onClick={onInviteNext}
            disabled={isLoading}
          >
            <UserCheck className="h-4 w-4" />
            Invite Next Patient
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueDisplay;
