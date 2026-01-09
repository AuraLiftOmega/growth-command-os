import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShoppingCart, Mail, MessageSquare, DollarSign, Loader2, Send, RefreshCw } from 'lucide-react';

interface AbandonedCart {
  id: string;
  customer_email: string;
  customer_phone: string;
  cart_total: number;
  items: Array<{ title: string; price: number; image?: string }>;
  abandoned_at: string;
  recovery_sent_at: string | null;
  recovered: boolean;
  recovery_revenue: number;
}

export function CartRecoveryPanel() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const stats = {
    total: carts.length,
    pending: carts.filter(c => !c.recovery_sent_at && !c.recovered).length,
    sent: carts.filter(c => c.recovery_sent_at && !c.recovered).length,
    recovered: carts.filter(c => c.recovered).length,
    totalValue: carts.reduce((sum, c) => sum + c.cart_total, 0),
    recoveredValue: carts.filter(c => c.recovered).reduce((sum, c) => sum + c.recovery_revenue, 0)
  };

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('user_id', user.id) as { data: AbandonedCart[] | null }
        .order('abandoned_at', { ascending: false })
        .limit(50);

      setCarts(data || []);
    } catch (error) {
      console.error('Failed to load carts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scanForAbandoned = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('cart-recovery', {
        body: { action: 'check_abandoned' }
      });

      if (error) throw error;

      toast.success(`Found ${data.carts_found} abandoned carts`, {
        description: 'Recovery emails queued for sending.'
      });

      loadCarts();
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan for abandoned carts');
    } finally {
      setIsScanning(false);
    }
  };

  const sendRecovery = async (cartId: string, channel: 'email' | 'sms') => {
    setSendingId(cartId);
    try {
      const { data, error } = await supabase.functions.invoke('cart-recovery', {
        body: {
          action: 'send_recovery',
          cart_id: cartId,
          channel,
          discount_code: 'COMEBACK10'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Recovery ${channel} sent!`);
        loadCarts();
      } else {
        toast.error(data.error || 'Failed to send recovery');
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast.error('Failed to send recovery');
    } finally {
      setSendingId(null);
    }
  };

  const formatTimeAgo = (date: string) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card className="border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-orange-400" />
          Cart Recovery Engine
          <Badge variant="outline" className="ml-auto text-orange-400 border-orange-400">
            +30% Revenue
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-black/30">
            <p className="text-xl font-bold text-orange-400">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-black/30">
            <p className="text-xl font-bold text-yellow-400">{stats.sent}</p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-black/30">
            <p className="text-xl font-bold text-green-400">{stats.recovered}</p>
            <p className="text-xs text-muted-foreground">Recovered</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-black/30">
            <p className="text-xl font-bold text-green-400">${stats.recoveredValue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Saved</p>
          </div>
        </div>

        {/* Potential Value */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Potential Recovery Value</p>
              <p className="text-xs text-muted-foreground">
                {stats.pending} carts waiting for recovery
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              ${(stats.totalValue - stats.recoveredValue).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Scan Button */}
        <Button 
          onClick={scanForAbandoned}
          disabled={isScanning}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan for Abandoned Carts
            </>
          )}
        </Button>

        {/* Cart List */}
        {carts.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {carts.filter(c => !c.recovered).slice(0, 10).map((cart) => (
              <div 
                key={cart.id}
                className="p-3 rounded-lg border border-muted bg-black/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {cart.customer_email || cart.customer_phone || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cart.items?.length || 0} items • Abandoned {formatTimeAgo(cart.abandoned_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-orange-400">${cart.cart_total}</p>
                    {cart.recovery_sent_at ? (
                      <Badge variant="outline" className="text-xs">Sent</Badge>
                    ) : (
                      <div className="flex gap-1 mt-1">
                        {cart.customer_email && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => sendRecovery(cart.id, 'email')}
                            disabled={sendingId === cart.id}
                          >
                            {sendingId === cart.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Mail className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        {cart.customer_phone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => sendRecovery(cart.id, 'sms')}
                            disabled={sendingId === cart.id}
                          >
                            {sendingId === cart.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <MessageSquare className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && carts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No abandoned carts yet</p>
            <p className="text-xs">Carts will appear when customers abandon checkout</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Powered by Resend + Twilio • Auto-recovery at 1hr, 24hr, 72hr
        </p>
      </CardContent>
    </Card>
  );
}
