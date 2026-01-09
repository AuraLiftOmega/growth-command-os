/**
 * OAuth Callback Handler
 * 
 * Handles OAuth callbacks from all platforms (Pinterest, TikTok, etc.)
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Get stored platform info
    const platform = localStorage.getItem('oauth_platform') || 'unknown';
    const returnUrl = localStorage.getItem('oauth_return_url') || '/dashboard';

    // Clear stored data
    localStorage.removeItem('oauth_platform');
    localStorage.removeItem('oauth_return_url');

    if (error) {
      setStatus('error');
      setMessage(errorDescription || error || 'Authorization was denied');
      toast.error(`${platform} connection failed: ${errorDescription || error}`);
      
      setTimeout(() => {
        navigate(returnUrl);
      }, 2000);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Missing authorization code or state parameter');
      toast.error('Invalid callback parameters');
      
      setTimeout(() => {
        navigate(returnUrl);
      }, 2000);
      return;
    }

    try {
      setMessage(`Completing ${platform} connection...`);

      // Exchange code for tokens via edge function
      const { data, error: callbackError } = await supabase.functions.invoke('platform-oauth', {
        body: {
          platform,
          action: 'callback',
          code,
          state,
          redirect_uri: `${window.location.origin}/oauth/callback`
        }
      });

      if (callbackError) throw callbackError;

      if (data?.success) {
        setStatus('success');
        setMessage(`${platform} connected successfully!`);
        toast.success(`${platform} connected! You can now publish content.`);
      } else {
        throw new Error(data?.error || 'Connection failed');
      }

    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setMessage(err.message || 'Failed to complete authentication');
      toast.error(`Connection failed: ${err.message}`);
    }

    // Redirect back after a short delay
    setTimeout(() => {
      navigate(returnUrl);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8 max-w-md">
        {status === 'processing' && (
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-12 h-12 mx-auto text-success" />
        )}
        {status === 'error' && (
          <XCircle className="w-12 h-12 mx-auto text-destructive" />
        )}
        
        <h1 className="text-xl font-semibold">{message}</h1>
        
        <p className="text-sm text-muted-foreground">
          {status === 'processing' 
            ? 'Please wait while we complete the connection...'
            : 'Redirecting you back...'}
        </p>
      </div>
    </div>
  );
}
