import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  ArrowRight,
  Link2Off,
  FileWarning
} from "lucide-react";
import { toast } from "sonner";

type WalletStatus = 'not-assessed' | 'safe' | 'at-risk' | 'action-needed';

export const WalletSecurityAudit = () => {
  const [walletConnected, setWalletConnected] = useState<'yes' | 'no' | null>(null);
  const [transactionSigned, setTransactionSigned] = useState<'yes' | 'no' | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('not-assessed');

  const assessWalletRisk = () => {
    if (walletConnected === 'no') {
      setWalletStatus('safe');
      toast.success('Wallet status: SAFE - No connection detected');
    } else if (walletConnected === 'yes' && transactionSigned === 'no') {
      setWalletStatus('safe');
      toast.success('Wallet status: SAFE - Connection only, no transactions signed');
    } else if (walletConnected === 'yes' && transactionSigned === 'yes') {
      setWalletStatus('action-needed');
      toast.warning('Wallet status: ACTION NEEDED - Review recommended');
    }
  };

  const getStatusBadge = () => {
    switch (walletStatus) {
      case 'safe':
        return <Badge className="bg-success">✅ SAFE</Badge>;
      case 'at-risk':
        return <Badge variant="destructive">🚨 AT RISK</Badge>;
      case 'action-needed':
        return <Badge className="bg-amber-500">⚠️ ACTION NEEDED</Badge>;
      default:
        return <Badge variant="secondary">NOT ASSESSED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <CardTitle>Crypto Wallet Safety Assessment</CardTitle>
                <CardDescription>Non-invasive wallet security check (no connection required)</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
      </Card>

      {/* Important Notice */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-400">Privacy First</p>
              <p className="text-sm text-muted-foreground">
                This assessment does NOT request seed phrases or connect to your wallet. 
                We only ask confirmation questions to assess risk level.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="w-5 h-5" />
            Wallet Risk Assessment
          </CardTitle>
          <CardDescription>
            Answer these questions to determine your wallet safety status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question 1 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Was your wallet ever connected to this or any related application?
            </Label>
            <RadioGroup 
              value={walletConnected || undefined} 
              onValueChange={(value) => setWalletConnected(value as 'yes' | 'no')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="connected-yes" />
                <Label htmlFor="connected-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="connected-no" />
                <Label htmlFor="connected-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question 2 - Only show if wallet was connected */}
          {walletConnected === 'yes' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Was any transaction signed using your wallet?
              </Label>
              <RadioGroup 
                value={transactionSigned || undefined} 
                onValueChange={(value) => setTransactionSigned(value as 'yes' | 'no')}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="signed-yes" />
                  <Label htmlFor="signed-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="signed-no" />
                  <Label htmlFor="signed-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Button 
            onClick={assessWalletRisk}
            disabled={walletConnected === null || (walletConnected === 'yes' && transactionSigned === null)}
            className="w-full gap-2"
          >
            <Shield className="w-4 h-4" />
            Assess Wallet Risk
          </Button>
        </CardContent>
      </Card>

      {/* Risk Assessment Result */}
      {walletStatus !== 'not-assessed' && (
        <Card className={`border-2 ${
          walletStatus === 'safe' 
            ? 'border-success/30 bg-success/5' 
            : 'border-amber-500/30 bg-amber-500/5'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {walletStatus === 'safe' ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
              Assessment Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletStatus === 'safe' && (
              <div className="p-4 rounded-lg bg-success/10">
                <p className="font-medium text-success mb-2">✅ Your wallet appears SAFE</p>
                <p className="text-sm text-muted-foreground">
                  {walletConnected === 'no' 
                    ? 'No wallet connection was detected. Your funds are not at risk from this application.'
                    : 'Wallet was connected but no transactions were signed. Connection-only does not expose funds.'}
                </p>
              </div>
            )}

            {walletStatus === 'action-needed' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-500/10">
                  <p className="font-medium text-amber-500 mb-2">⚠️ Action Recommended</p>
                  <p className="text-sm text-muted-foreground">
                    A transaction was signed using your wallet. As a precaution, we recommend the following steps:
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Create a Fresh Wallet</p>
                      <p className="text-sm text-muted-foreground">Generate a new wallet with a new seed phrase</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Transfer Assets</p>
                      <p className="text-sm text-muted-foreground">Move all valuable assets to the new wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Decommission Old Wallet</p>
                      <p className="text-sm text-muted-foreground">Stop using the old wallet for any new transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Reminder */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Link2Off className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Never Share Your Seed Phrase</p>
              <p className="text-sm text-muted-foreground">
                No legitimate service will ever ask for your seed phrase. 
                If anyone asks, it's a scam. This tool does not request or access wallet credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
