import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BillingCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"
            >
              <XCircle className="w-10 h-10 text-muted-foreground" />
            </motion.div>
            <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
            <CardDescription>
              Your payment was cancelled. No charges have been made to your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                If you experienced any issues during checkout or have questions about our plans, 
                please don't hesitate to reach out to our support team.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/pricing">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Pricing
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/support">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
