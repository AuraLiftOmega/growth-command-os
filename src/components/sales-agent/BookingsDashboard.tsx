import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useDemoBooking } from '@/hooks/useDemoBooking';
import { format, parseISO, isToday } from 'date-fns';

export function BookingsDashboard() {
  const { bookings, getBookingStats } = useDemoBooking();
  const stats = getBookingStats();

  const todaysBookings = bookings.filter(b => 
    isToday(parseISO(b.scheduled_at)) && b.status !== 'cancelled'
  );

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <div className="text-xs text-muted-foreground">demos scheduled</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Show Rate</span>
            </div>
            <div className="text-2xl font-bold">{stats.showRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">{stats.attended} attended</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Conversion</span>
            </div>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">{stats.converted} closed</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
            <div className="text-xs text-muted-foreground">from demos</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No demos scheduled for today</p>
          ) : (
            <div className="space-y-2">
              {todaysBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{booking.prospect_name}</div>
                      <div className="text-xs text-muted-foreground">{booking.prospect_company || booking.prospect_email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{format(parseISO(booking.scheduled_at), 'h:mm a')}</div>
                    <Badge variant="outline" className="text-[10px]">{booking.duration_minutes}min</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
