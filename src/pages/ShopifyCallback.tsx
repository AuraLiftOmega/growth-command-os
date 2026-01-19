import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Store as StoreIcon } from 'lucide-react';
import { useUserShopifyConnections } from '@/hooks/useUserShopifyConnections';
import { useUserStore } from '@/hooks/useUserStore';
import { useActiveStoreState } from '@/hooks/useActiveStore';
import { motion } from 'framer-motion';

export default function ShopifyCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuth } = useUserShopifyConnections();
  const { refetch: refetchStores } = useUserStore();
  const { setActiveStoreId } = useActiveStoreState();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing Shopify connection...');
  const [storeName, setStoreName] = useState<string | null>(null);

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
        const result = await completeOAuth(code, shop, state);
        
        // Set the store name for display
        setStoreName(result?.connection?.shop_name || shop.replace('.myshopify.com', ''));
        
        // Refresh the user stores list
        await refetchStores();
        
        // Auto-set this store as active if we got the connection ID
        if (result?.connection?.id) {
          // The OAuth flow syncs to user_store_connections, so we need to find it
          // We'll set active store after a brief delay to ensure sync completed
          setTimeout(async () => {
            const { refetch } = await import('@/hooks/useUserStore').then(m => ({ refetch: m.useUserStore }));
          }, 500);
        }
        
        setStatus('success');
        setMessage('Your store is now connected and ready!');
        
        // Redirect to dashboard after success
        setTimeout(() => navigate('/dashboard'), 2500);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to complete connection');
        setTimeout(() => navigate('/dashboard/settings'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, completeOAuth, navigate, refetchStores]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 p-8 max-w-md"
      >
        {status === 'loading' && (
          <>
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Connecting to Shopify...</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </>
        )}
        
        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Store Connected!</h1>
            {storeName && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
                <StoreIcon className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-600">{storeName}</span>
              </div>
            )}
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-4">Redirecting to dashboard...</p>
          </motion.div>
        )}
        
        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-destructive mb-2">Connection Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-4">Redirecting to settings...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}