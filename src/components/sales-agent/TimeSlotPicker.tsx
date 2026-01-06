import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Building2
} from 'lucide-react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { useDemoBooking, TimeSlot, DemoBooking } from '@/hooks/useDemoBooking';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingComplete?: (booking: DemoBooking) => void;
  conversationId?: string;
  prospectContext?: {
    name?: string;
    email?: string;
    company?: string;
    qualificationScore?: number;
    dealSizeEstimate?: number;
  };
}

type Step = 'date' | 'time' | 'details' | 'confirm';

export function TimeSlotPicker({
  open,
  onOpenChange,
  onBookingComplete,
  conversationId,
  prospectContext,
}: TimeSlotPickerProps) {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [prospectName, setProspectName] = useState(prospectContext?.name || '');
  const [prospectEmail, setProspectEmail] = useState(prospectContext?.email || '');
  const [prospectCompany, setProspectCompany] = useState(prospectContext?.company || '');

  const { 
    bookings, 
    generateAvailableSlots, 
    createBooking,
    isLoading 
  } = useDemoBooking();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('date');
      setSelectedDate(undefined);
      setSelectedSlot(null);
      setProspectName(prospectContext?.name || '');
      setProspectEmail(prospectContext?.email || '');
      setProspectCompany(prospectContext?.company || '');
    }
  }, [open, prospectContext]);

  // Generate slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const slots = generateAvailableSlots(selectedDate, bookings, 15);
      setAvailableSlots(slots);
    }
  }, [selectedDate, bookings, generateAvailableSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) {
      setStep('time');
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!prospectName.trim() || !prospectEmail.trim()) return;
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !prospectName || !prospectEmail) return;
    
    setIsSubmitting(true);
    try {
      const booking = await createBooking({
        prospect_name: prospectName,
        prospect_email: prospectEmail,
        prospect_company: prospectCompany || undefined,
        scheduled_at: selectedSlot.start,
        duration_minutes: 15,
        booking_source: 'ai_sales_agent',
        qualification_score: prospectContext?.qualificationScore,
        deal_size_estimate: prospectContext?.dealSizeEstimate,
        conversation_id: conversationId,
      });

      if (booking) {
        onBookingComplete?.(booking);
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 30),
  };

  const availableSlotsCount = availableSlots.filter(s => s.available).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-violet-500/10 to-purple-600/10 border-b">
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Book Your 15-Minute Demo
          </DialogTitle>
          <DialogDescription>
            {step === 'date' && 'Select a date that works for you'}
            {step === 'time' && 'Choose an available time slot'}
            {step === 'details' && 'Enter your contact information'}
            {step === 'confirm' && 'Review and confirm your booking'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            {(['date', 'time', 'details', 'confirm'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === s 
                    ? "bg-primary text-primary-foreground" 
                    : (['date', 'time', 'details', 'confirm'].indexOf(step) > i)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}>
                  {(['date', 'time', 'details', 'confirm'].indexOf(step) > i) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-1",
                    (['date', 'time', 'details', 'confirm'].indexOf(step) > i)
                      ? "bg-primary/40"
                      : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Date Selection */}
          {step === 'date' && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 pt-2"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                className="mx-auto pointer-events-auto"
              />
            </motion.div>
          )}

          {/* Step 2: Time Selection */}
          {step === 'time' && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 pt-2"
            >
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep('date')}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Badge variant="outline" className="gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {selectedDate && format(selectedDate, 'EEE, MMM d')}
                </Badge>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableSlotsCount === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No available slots for this date</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setStep('date')}
                  >
                    Choose another date
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[280px] pr-4">
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => handleSlotSelect(slot)}
                        className={cn(
                          "h-10",
                          !slot.available && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <Clock className="w-3 h-3 mr-1.5" />
                        {format(slot.start, 'h:mm a')}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </motion.div>
          )}

          {/* Step 3: Contact Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 pt-2"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep('time')}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    placeholder="John Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={prospectEmail}
                    onChange={(e) => setProspectEmail(e.target.value)}
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Company (Optional)
                  </Label>
                  <Input
                    id="company"
                    value={prospectCompany}
                    onChange={(e) => setProspectCompany(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>

                <Button 
                  className="w-full mt-4"
                  disabled={!prospectName.trim() || !prospectEmail.trim()}
                  onClick={handleDetailsSubmit}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && selectedSlot && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 pt-2"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep('details')}
                className="mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{format(selectedSlot.start, 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedSlot.start, 'h:mm a')} - {format(selectedSlot.end, 'h:mm a')} (15 min)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{prospectName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{prospectEmail}</span>
                  </div>
                  {prospectCompany && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{prospectCompany}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                className="w-full mt-6"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-3">
                You'll receive a confirmation email with meeting details
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
