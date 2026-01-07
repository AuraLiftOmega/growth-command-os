import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Video, 
  Bell,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface Booking {
  id: string;
  prospect_name: string;
  prospect_email: string;
  prospect_company?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  booking_source?: string;
  qualification_score?: number;
}

export function CEOCalendarWidget() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
      subscribeToBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_bookings')
        .select('*')
        .eq('user_id', user?.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(10);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToBookings = () => {
    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'demo_bookings',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Scheduled</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-muted">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await supabase
        .from('demo_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base">Upcoming Calls</CardTitle>
              <CardDescription>AI-booked strategy sessions</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Slot
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming calls</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              CEO Brain will book calls automatically via chat
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[260px]">
            <div className="space-y-3">
              {bookings.map((booking) => {
                const scheduledDate = new Date(booking.scheduled_at);
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-muted/50 border hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{booking.prospect_name}</p>
                          {booking.prospect_company && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" />
                              {booking.prospect_company}
                            </div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateLabel(scheduledDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(scheduledDate, 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {booking.duration_minutes}min
                      </div>
                    </div>

                    {booking.status === 'scheduled' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 h-7 text-xs"
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {booking.qualification_score && (
                      <div className="mt-2 pt-2 border-t flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Lead Score</span>
                        <Badge variant="outline" className={
                          booking.qualification_score >= 70 
                            ? 'bg-success/10 text-success' 
                            : booking.qualification_score >= 40 
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-muted'
                        }>
                          {booking.qualification_score}%
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
