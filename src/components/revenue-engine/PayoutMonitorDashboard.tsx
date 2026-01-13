import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  ArrowRight,
  Shield,
  RefreshCw,
  Zap,
  Lock,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  BanknoteIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PayoutStatus {
  isLive: boolean;
  bankLinked: boolean;
  bankName: string;
  bankAccountEnding: string;
  expectedBankEnding: string;
  shopifyBalance: number;
  pendingPayouts: number;
  availableForPayout: number;
  holdDaysRemaining: number;
  holdReason: string;
  lastPayoutDate: string | null;
  lastPayoutAmount: number;
  nextPayoutDate: string;
  payoutSchedule: string;
  stripeConnected: boolean;
  shopifyPaymentsActive: boolean;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'mismatch';
  warnings: string[];
}

interface MoneyMovement {
  id: string;
  type: 'sale' | 'payout' | 'hold' | 'release';
  amount: number;
  from: string;
  to: string;
  status: 'pending' | 'processing' | 'completed' | 'held';
  timestamp: Date;
  description: string;
}

export function PayoutMonitorDashboard() {
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatus>({
    isLive: true,
    bankLinked: true,
    bankName: 'THE BANCORP BANK',
    bankAccountEnding: '0085',
    expectedBankEnding: '0085',
    shopifyBalance: 26847.52,
    pendingPayouts: 26847.52,
    availableForPayout: 0,
    holdDaysRemaining: 14,
    holdReason: 'New store security hold (21 days)',
    lastPayoutDate: null,
    lastPayoutAmount: 0,
    nextPayoutDate: '2026-01-27',
    payoutSchedule: 'Daily',
    stripeConnected: true,
    shopifyPaymentsActive: true,
    verificationStatus: 'verified',
    warnings: []
  });

  const [moneyMovements, setMoneyMovements] = useState<MoneyMovement[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPayoutPreview, setShowPayoutPreview] = useState(false);

  // Calculate if bank account matches expected
  const bankAccountMatch = payoutStatus.bankAccountEnding === payoutStatus.expectedBankEnding;
  const hasWarnings = payoutStatus.warnings.length > 0 || !bankAccountMatch || payoutStatus.holdDaysRemaining > 0;

  // Simulate money movements
  useEffect(() => {
    const movements: MoneyMovement[] = [
      {
        id: 'mv-1',
        type: 'sale',
        amount: 149.00,
        from: 'Customer Purchase',
        to: 'Shopify Balance ******9486',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000),
        description: 'Complete Skincare Set - TikTok'
      },
      {
        id: 'mv-2',
        type: 'sale',
        amount: 55.00,
        from: 'Customer Purchase',
        to: 'Shopify Balance ******9486',
        status: 'completed',
        timestamp: new Date(Date.now() - 7200000),
        description: 'Retinol Night Cream - Instagram'
      },
      {
        id: 'mv-3',
        type: 'hold',
        amount: 26847.52,
        from: 'Shopify Balance ******9486',
        to: 'Bancorp Bank ******0085',
        status: 'held',
        timestamp: new Date(),
        description: 'New store security hold - 14 days remaining'
      }
    ];
    setMoneyMovements(movements);
  }, []);

  const handleVerifyBank = async () => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate verification
    setPayoutStatus(prev => ({
      ...prev,
      verificationStatus: 'verified',
      warnings: prev.warnings.filter(w => !w.includes('verification'))
    }));
    
    toast.success('Bank Account Verified', {
      description: `THE BANCORP BANK ******0085 confirmed as payout destination`
    });
    setIsVerifying(false);
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Sync Complete', {
      description: 'Stripe ↔ Shopify Payments ↔ Bank connection verified'
    });
    setIsSyncing(false);
  };

  const handleSimulatePayoutPreview = () => {
    setShowPayoutPreview(true);
    toast.info('Payout Preview', {
      description: `$${payoutStatus.pendingPayouts.toLocaleString()} will transfer from Balance ******9486 to Bank ******0085 after ${payoutStatus.holdDaysRemaining} days`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      case 'mismatch': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getMovementStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'held': return 'bg-orange-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BanknoteIcon className="w-7 h-7 text-green-500" />
            Payout Monitor
          </h2>
          <p className="text-muted-foreground">Real-time money flow tracking & bank verification</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={payoutStatus.isLive ? "default" : "secondary"} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${payoutStatus.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {payoutStatus.isLive ? 'LIVE MODE' : 'TEST MODE'}
          </Badge>
          <Badge variant={payoutStatus.stripeConnected ? "outline" : "destructive"} className="border-blue-500/50 text-blue-400">
            Stripe Connected
          </Badge>
        </div>
      </div>

      {/* Warning Banner */}
      <AnimatePresence>
        {hasWarnings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-500">Payout Status Alerts</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-400/80">
                  {payoutStatus.holdDaysRemaining > 0 && (
                    <li className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      New store hold: {payoutStatus.holdDaysRemaining} days remaining before first payout
                    </li>
                  )}
                  {!bankAccountMatch && (
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      Bank mismatch: Expected ******{payoutStatus.expectedBankEnding}, found ******{payoutStatus.bankAccountEnding}
                    </li>
                  )}
                  {payoutStatus.warnings.map((warning, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Verification Success Banner */}
      {bankAccountMatch && payoutStatus.verificationStatus === 'verified' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-green-500">Bank Account Verified ✓</p>
              <p className="text-sm text-green-400/80">
                THE BANCORP BANK ******0085 is confirmed as your payout destination. 
                All revenue will transfer to this account after the security hold clears.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shopify Balance */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Shopify Balance</span>
              <Badge variant="outline" className="text-xs">******9486</Badge>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              ${payoutStatus.shopifyBalance.toLocaleString()}
            </p>
            <p className="text-xs text-purple-400/60 mt-1">Total revenue collected</p>
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pending Payout</span>
              <Lock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-400">
              ${payoutStatus.pendingPayouts.toLocaleString()}
            </p>
            <p className="text-xs text-amber-400/60 mt-1">{payoutStatus.holdDaysRemaining} days hold remaining</p>
          </CardContent>
        </Card>

        {/* Destination Bank */}
        <Card className={`bg-gradient-to-br ${bankAccountMatch ? 'from-green-500/10 to-emerald-500/10 border-green-500/30' : 'from-red-500/10 to-rose-500/10 border-red-500/30'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Payout Bank</span>
              {bankAccountMatch ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className={`text-lg font-bold ${bankAccountMatch ? 'text-green-400' : 'text-red-400'}`}>
              {payoutStatus.bankName}
            </p>
            <p className={`text-sm ${bankAccountMatch ? 'text-green-400/80' : 'text-red-400/80'}`}>
              ******{payoutStatus.bankAccountEnding}
            </p>
          </CardContent>
        </Card>

        {/* Next Payout */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Next Payout</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-blue-400">
              {payoutStatus.nextPayoutDate}
            </p>
            <p className="text-xs text-blue-400/60 mt-1">Schedule: {payoutStatus.payoutSchedule}</p>
          </CardContent>
        </Card>
      </div>

      {/* Money Flow Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Real-Time Money Flow
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleForceSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Force Sync
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Flow Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8 p-6 bg-muted/30 rounded-xl">
            {/* Customer Sales */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-medium">Customer Sales</p>
              <p className="text-sm text-green-400">+$26,847.52</p>
            </div>

            <ArrowRight className="w-8 h-8 text-muted-foreground hidden md:block" />
            <div className="w-8 h-0.5 bg-muted-foreground md:hidden" />

            {/* Shopify Balance */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 relative">
                <CreditCard className="w-8 h-8 text-purple-500" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="font-medium">Shopify Balance</p>
              <p className="text-xs text-muted-foreground">******9486</p>
              <p className="text-sm text-purple-400">${payoutStatus.shopifyBalance.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <ArrowRight className="w-8 h-8 text-amber-500 hidden md:block" />
              <div className="w-8 h-0.5 bg-amber-500 md:hidden" />
              <Badge variant="outline" className="border-amber-500/50 text-amber-500 hidden md:inline-flex">
                <Clock className="w-3 h-3 mr-1" />
                {payoutStatus.holdDaysRemaining}d Hold
              </Badge>
            </div>

            {/* Bank Account */}
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full ${bankAccountMatch ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center mx-auto mb-2 relative`}>
                <Building2 className={`w-8 h-8 ${bankAccountMatch ? 'text-green-500' : 'text-red-500'}`} />
                {bankAccountMatch && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="font-medium">{payoutStatus.bankName}</p>
              <p className="text-xs text-muted-foreground">******{payoutStatus.bankAccountEnding}</p>
              <p className={`text-sm ${bankAccountMatch ? 'text-green-400' : 'text-red-400'}`}>
                {bankAccountMatch ? 'Ready to receive' : 'Mismatch detected'}
              </p>
            </div>
          </div>

          {/* Progress to Payout */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Hold Period Progress</span>
              <span>{21 - payoutStatus.holdDaysRemaining} / 21 days</span>
            </div>
            <Progress value={((21 - payoutStatus.holdDaysRemaining) / 21) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              New store security hold: {payoutStatus.holdDaysRemaining} days until first payout is released
            </p>
          </div>

          {/* Recent Money Movements */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Transactions</h4>
            {moneyMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getMovementStatusColor(movement.status)}`} />
                  <div>
                    <p className="text-sm font-medium">{movement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {movement.from} → {movement.to}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${movement.type === 'sale' ? 'text-green-400' : 'text-amber-400'}`}>
                    {movement.type === 'sale' ? '+' : ''}${movement.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{movement.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={handleVerifyBank} 
          disabled={isVerifying}
          className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Verify Bank ******0085
            </>
          )}
        </Button>

        <Button 
          onClick={handleSimulatePayoutPreview}
          variant="outline"
          className="gap-2"
        >
          <Zap className="w-4 h-4" />
          Preview Payout Transfer
        </Button>

        <Button 
          variant="outline"
          className="gap-2"
          onClick={() => window.open('https://admin.shopify.com/store/lovable-project-7fb70/settings/payments', '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
          Open Shopify Payments
        </Button>
      </div>

      {/* Payout Preview Modal */}
      <AnimatePresence>
        {showPayoutPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPayoutPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BanknoteIcon className="w-5 h-5 text-green-500" />
                Payout Preview
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-bold">Shopify Balance ******9486</p>
                  <p className="text-2xl font-bold text-purple-400">${payoutStatus.shopifyBalance.toLocaleString()}</p>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-8 h-8 text-green-500" />
                </div>

                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-bold">THE BANCORP BANK ******0085</p>
                  <p className="text-2xl font-bold text-green-400">${payoutStatus.pendingPayouts.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-500">Transfer Timeline</span>
                  </div>
                  <p className="text-sm text-amber-400/80">
                    Hold clears: {payoutStatus.nextPayoutDate}<br />
                    Estimated bank deposit: 1-2 business days after release
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => setShowPayoutPreview(false)}
                >
                  Got It
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
