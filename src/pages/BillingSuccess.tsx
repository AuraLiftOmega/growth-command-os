import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BillingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('billing-checkout', {
          body: { action: 'verify-session', sessionId },
        });

        if (error) throw error;
        setSessionData(data);
      } catch (err) {
        console.error('Session verification error:', err);
        setError('Unable to verify payment session');
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-success/20 shadow-lg shadow-success/10">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10 text-success" />
            </motion.div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your account has been upgraded.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {sessionData && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">
                    ${((sessionData.amountTotal || 0) / 100).toFixed(2)} {sessionData.currency?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="default" className="bg-success text-success-foreground">
                    {sessionData.paymentStatus}
                  </Badge>
                </div>
                {sessionData.isLive && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mode</span>
                    <Badge variant="default">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Live Payment
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <p className="text-sm text-warning">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Don't worry — if your payment was successful, your account will be updated shortly.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/settings/billing">
                  View Billing Details
                </Link>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              A confirmation email has been sent to your registered email address.
              If you have any questions, please contact support.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
