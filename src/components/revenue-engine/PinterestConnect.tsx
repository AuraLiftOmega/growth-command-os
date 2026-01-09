import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface PinterestConnectProps {
  onConnected?: () => void;
}

export function PinterestConnect({ onConnected }: PinterestConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [boards, setBoards] = useState<Array<{ id: string; name: string; pin_count: number }>>([]);

  const connectPinterest = async () => {
    setIsConnecting(true);
    try {
      // Get the OAuth URL
      const { data, error } = await supabase.functions.invoke('platform-oauth', {
        body: {
          platform: 'pinterest',
          action: 'authorize',
          redirect_uri: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      if (data.requires_credentials) {
        toast.error('Pinterest OAuth not configured', {
          description: 'PINTEREST_APP_ID and PINTEREST_APP_SECRET are required.'
        });
        return;
      }

      if (data.authUrl) {
        // Store return URL
        localStorage.setItem('oauth_platform', 'pinterest');
        localStorage.setItem('oauth_return_url', window.location.pathname);
        
        // Redirect to Pinterest
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Pinterest connect error:', error);
      toast.error('Failed to connect Pinterest');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadBoards = async () => {
    try {
      const { data } = await supabase.functions.invoke('platform-oauth', {
        body: {
          platform: 'pinterest',
          action: 'get_boards'
        }
      });

      if (data?.boards) {
        setBoards(data.boards);
        setIsConnected(true);
        onConnected?.();
      }
    } catch (error) {
      console.error('Failed to load boards:', error);
    }
  };

  return (
    <Card className="border-red-500/30 bg-gradient-to-br from-red-900/20 to-pink-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
          </svg>
          Pinterest Connection
          {isConnected && (
            <Badge className="ml-auto bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your Pinterest Business account to publish Pins directly from DOMINION.
            </p>
            
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
              <h4 className="text-sm font-medium mb-2">Requirements:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Pinterest Business Account</li>
                <li>• At least one board created</li>
                <li>• OAuth app configured in Pinterest Developer</li>
              </ul>
            </div>

            <Button
              onClick={connectPinterest}
              disabled={isConnecting}
              className="w-full bg-[#E60023] hover:bg-[#AD081B]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Pinterest Account
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/20 border border-green-500/30">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium">Pinterest Connected!</p>
                <p className="text-xs text-muted-foreground">
                  {boards.length} boards available for posting
                </p>
              </div>
            </div>

            {boards.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Your Boards</h4>
                <div className="grid grid-cols-2 gap-2">
                  {boards.slice(0, 6).map((board) => (
                    <div 
                      key={board.id}
                      className="p-2 rounded border border-muted text-xs"
                    >
                      <p className="font-medium truncate">{board.name}</p>
                      <p className="text-muted-foreground">{board.pin_count} pins</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={loadBoards}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Boards
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
