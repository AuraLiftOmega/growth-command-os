import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useUserShopifyConnections } from '@/hooks/useUserShopifyConnections';

export default function ShopifyCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuth } = useUserShopifyConnections();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing Shopify connection...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const shop = searchParams.get('shop') || localStorage.getItem('shopify_oauth_shop');
      const state = searchParams.get('state');

      if (!code || !shop || !state) {
        setStatus('error');
        setMessage('Missing OAuth parameters. Please try connecting again.');
        setTimeout(() => navigate('/dashboard/settings'), 3000);
        return;
      }

      try {
        await completeOAuth(code, shop, state);
        setStatus('success');
        setMessage('Successfully connected to Shopify!');
        setTimeout(() => navigate('/dashboard/settings'), 2000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to complete connection');
        setTimeout(() => navigate('/dashboard/settings'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, completeOAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-semibold">Connecting to Shopify...</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h1 className="text-xl font-semibold text-green-600">Connected!</h1>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to settings...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold text-destructive">Connection Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to settings...</p>
          </>
        )}
      </div>
    </div>
  );
}
