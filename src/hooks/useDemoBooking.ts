import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, addMinutes, startOfDay, isBefore, isAfter, parseISO } from 'date-fns';

export interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  timezone: string;
  is_active: boolean;
}

export interface DemoBooking {
  id: string;
  user_id: string;
  prospect_name: string;
  prospect_email: string;
  prospect_phone?: string;
  prospect_company?: string;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  status: 'scheduled' | 'confirmed' | 'attended' | 'no_show' | 'cancelled' | 'rescheduled' | 'closed';
  outcome?: 'converted' | 'not_interested' | 'follow_up' | 'disqualified';
  outcome_notes?: string;
  booking_source?: string;
  qualification_score?: number;
  deal_size_estimate?: number;
  revenue_closed?: number;
  created_at: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export function useDemoBooking() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [calendarIntegrations, setCalendarIntegrations] = useState<any[]>([]);

  // Fetch availability settings
  const fetchAvailability = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('demo_availability_slots')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setAvailabilitySlots(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  }, [user]);

  // Fetch existing bookings
  const fetchBookings = useCallback(async (options?: { 
    startDate?: Date; 
    endDate?: Date; 
    status?: string[];
  }) => {
    if (!user) return;
    setIsLoading(true);

    try {
      let query = supabase
        .from('demo_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (options?.startDate) {
        query = query.gte('scheduled_at', options.startDate.toISOString());
      }
      if (options?.endDate) {
        query = query.lte('scheduled_at', options.endDate.toISOString());
      }
      if (options?.status?.length) {
        query = query.in('status', options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBookings(data as DemoBooking[] || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch calendar integrations
  const fetchCalendarIntegrations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCalendarIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching calendar integrations:', error);
    }
  }, [user]);

  // Generate available time slots for a specific date
  const generateAvailableSlots = useCallback((
    date: Date,
    existingBookings: DemoBooking[],
    slotDuration: number = 15
  ): TimeSlot[] => {
    const dayOfWeek = date.getDay();
    const daySlots = availabilitySlots.filter(s => s.day_of_week === dayOfWeek);
    
    if (daySlots.length === 0) return [];

    const slots: TimeSlot[] = [];
    const now = new Date();

    daySlots.forEach(availability => {
      const [startHour, startMinute] = availability.start_time.split(':').map(Number);
      const [endHour, endMinute] = availability.end_time.split(':').map(Number);
      
      let currentStart = new Date(date);
      currentStart.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      while (isBefore(addMinutes(currentStart, slotDuration), endTime) || 
             format(addMinutes(currentStart, slotDuration), 'HH:mm') === format(endTime, 'HH:mm')) {
        const slotEnd = addMinutes(currentStart, slotDuration);
        
        // Check if slot is in the past
        const isPast = isBefore(currentStart, now);
        
        // Check for conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          if (booking.status === 'cancelled') return false;
          const bookingStart = parseISO(booking.scheduled_at);
          const bookingEnd = addMinutes(bookingStart, booking.duration_minutes);
          
          // Buffer time consideration
          const bufferStart = addMinutes(bookingStart, -availability.buffer_minutes);
          const bufferEnd = addMinutes(bookingEnd, availability.buffer_minutes);
          
          return (
            (isAfter(currentStart, bufferStart) && isBefore(currentStart, bufferEnd)) ||
            (isAfter(slotEnd, bufferStart) && isBefore(slotEnd, bufferEnd)) ||
            (isBefore(currentStart, bufferStart) && isAfter(slotEnd, bufferEnd))
          );
        });

        slots.push({
          start: new Date(currentStart),
          end: slotEnd,
          available: !isPast && !hasConflict,
        });

        currentStart = slotEnd;
      }
    });

    return slots;
  }, [availabilitySlots]);

  // Create a new booking
  const createBooking = useCallback(async (bookingData: {
    prospect_name: string;
    prospect_email: string;
    prospect_phone?: string;
    prospect_company?: string;
    scheduled_at: Date;
    duration_minutes?: number;
    timezone?: string;
    booking_source?: string;
    qualification_score?: number;
    deal_size_estimate?: number;
    conversation_id?: string;
  }): Promise<DemoBooking | null> => {
    if (!user) return null;

    try {
      // Double-check for conflicts
      const slotStart = bookingData.scheduled_at;
      const slotEnd = addMinutes(slotStart, bookingData.duration_minutes || 15);

      const { data: conflictCheck } = await supabase
        .from('demo_bookings')
        .select('id')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .gte('scheduled_at', addMinutes(slotStart, -30).toISOString())
        .lte('scheduled_at', addMinutes(slotEnd, 30).toISOString());

      if (conflictCheck && conflictCheck.length > 0) {
        toast.error('This time slot is no longer available');
        return null;
      }

      const { data, error } = await supabase
        .from('demo_bookings')
        .insert({
          user_id: user.id,
          prospect_name: bookingData.prospect_name,
          prospect_email: bookingData.prospect_email,
          prospect_phone: bookingData.prospect_phone,
          prospect_company: bookingData.prospect_company,
          scheduled_at: bookingData.scheduled_at.toISOString(),
          duration_minutes: bookingData.duration_minutes || 15,
          timezone: bookingData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          status: 'scheduled',
          booking_source: bookingData.booking_source || 'ai_sales_agent',
          qualification_score: bookingData.qualification_score,
          deal_size_estimate: bookingData.deal_size_estimate,
        })
        .select()
        .single();

      if (error) throw error;

      // Create reminders
      await createBookingReminders(data.id, bookingData.scheduled_at);

      // Link to conversation if provided
      if (bookingData.conversation_id) {
        await supabase
          .from('ai_sales_conversations')
          .update({ booking_id: data.id })
          .eq('id', bookingData.conversation_id);
      }

      setBookings(prev => [...prev, data as DemoBooking]);
      toast.success('Demo booked successfully!', {
        description: `Scheduled for ${format(bookingData.scheduled_at, 'PPpp')}`,
      });

      return data as DemoBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to book demo');
      return null;
    }
  }, [user]);

  // Create booking reminders
  const createBookingReminders = async (bookingId: string, scheduledAt: Date) => {
    const reminders = [
      { type: '24h_before', time: addMinutes(scheduledAt, -24 * 60) },
      { type: '1h_before', time: addMinutes(scheduledAt, -60) },
      { type: '15m_before', time: addMinutes(scheduledAt, -15) },
    ];

    const reminderInserts = reminders
      .filter(r => isAfter(r.time, new Date()))
      .map(r => ({
        booking_id: bookingId,
        reminder_type: r.type,
        scheduled_for: r.time.toISOString(),
        delivery_channel: 'email',
      }));

    if (reminderInserts.length > 0) {
      await supabase.from('booking_reminders').insert(reminderInserts);
    }
  };

  // Update booking status
  const updateBookingStatus = useCallback(async (
    bookingId: string,
    status: DemoBooking['status'],
    outcome?: DemoBooking['outcome'],
    outcomeNotes?: string,
    revenueClosed?: number
  ) => {
    if (!user) return false;

    try {
      const updates: any = { status };
      if (outcome) updates.outcome = outcome;
      if (outcomeNotes) updates.outcome_notes = outcomeNotes;
      if (revenueClosed !== undefined) updates.revenue_closed = revenueClosed;
      if (status === 'attended') updates.attended_at = new Date().toISOString();

      const { error } = await supabase
        .from('demo_bookings')
        .update(updates)
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, ...updates } : b
      ));

      toast.success('Booking updated');
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
      return false;
    }
  }, [user]);

  // Reschedule booking
  const rescheduleBooking = useCallback(async (
    bookingId: string,
    newScheduledAt: Date
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('demo_bookings')
        .update({
          scheduled_at: newScheduledAt.toISOString(),
          status: 'rescheduled',
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Update reminders
      await supabase
        .from('booking_reminders')
        .delete()
        .eq('booking_id', bookingId);
      
      await createBookingReminders(bookingId, newScheduledAt);

      await fetchBookings();
      toast.success('Demo rescheduled');
      return true;
    } catch (error) {
      console.error('Error rescheduling:', error);
      toast.error('Failed to reschedule');
      return false;
    }
  }, [user, fetchBookings]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    return updateBookingStatus(bookingId, 'cancelled', 'not_interested', reason);
  }, [updateBookingStatus]);

  // Set availability
  const setAvailability = useCallback(async (slots: Omit<AvailabilitySlot, 'id'>[]) => {
    if (!user) return false;

    try {
      // Deactivate existing slots
      await supabase
        .from('demo_availability_slots')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Insert new slots
      const { error } = await supabase
        .from('demo_availability_slots')
        .insert(slots.map(s => ({
          ...s,
          user_id: user.id,
        })));

      if (error) throw error;

      await fetchAvailability();
      toast.success('Availability updated');
      return true;
    } catch (error) {
      console.error('Error setting availability:', error);
      toast.error('Failed to update availability');
      return false;
    }
  }, [user, fetchAvailability]);

  // Get booking stats
  const getBookingStats = useCallback(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    
    const today = bookings.filter(b => 
      parseISO(b.scheduled_at) >= todayStart &&
      b.status !== 'cancelled'
    );
    
    const attended = bookings.filter(b => b.status === 'attended').length;
    const noShows = bookings.filter(b => b.status === 'no_show').length;
    const converted = bookings.filter(b => b.outcome === 'converted').length;
    const totalRevenue = bookings
      .filter(b => b.revenue_closed)
      .reduce((sum, b) => sum + (b.revenue_closed || 0), 0);

    return {
      todayCount: today.length,
      totalBooked: bookings.filter(b => b.status !== 'cancelled').length,
      attended,
      noShows,
      showRate: attended > 0 ? (attended / (attended + noShows) * 100) : 0,
      converted,
      conversionRate: attended > 0 ? (converted / attended * 100) : 0,
      totalRevenue,
      avgDealSize: converted > 0 ? totalRevenue / converted : 0,
    };
  }, [bookings]);

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchAvailability();
      fetchBookings();
      fetchCalendarIntegrations();
    }
  }, [user, fetchAvailability, fetchBookings, fetchCalendarIntegrations]);

  return {
    isLoading,
    availabilitySlots,
    bookings,
    calendarIntegrations,
    generateAvailableSlots,
    createBooking,
    updateBookingStatus,
    rescheduleBooking,
    cancelBooking,
    setAvailability,
    getBookingStats,
    refreshBookings: fetchBookings,
    refreshAvailability: fetchAvailability,
  };
}
