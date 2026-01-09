import { useState } from 'react';
import { Share2, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ShareStoreButton() {
  const [copied, setCopied] = useState(false);
  const storeUrl = `${window.location.origin}/store`;

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success('Store link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnPlatform = (platform: string) => {
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=Check%20out%20my%20store!&url=${encodeURIComponent(storeUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storeUrl)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(storeUrl)}&description=Check%20out%20my%20store!`,
    };
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Store
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Share your store</h4>
            <p className="text-sm text-muted-foreground">
              Drive traffic by sharing your store link
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={storeUrl}
              readOnly
              className="flex-1 text-sm"
            />
            <Button onClick={copyLink} size="icon" variant="outline">
              {copied ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => shareOnPlatform('twitter')}
            >
              <span className="text-lg">𝕏</span>
              <span className="text-[10px]">Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => shareOnPlatform('facebook')}
            >
              <span className="text-lg">📘</span>
              <span className="text-[10px]">Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => shareOnPlatform('pinterest')}
            >
              <span className="text-lg">📌</span>
              <span className="text-[10px]">Pinterest</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => shareOnPlatform('linkedin')}
            >
              <span className="text-lg">💼</span>
              <span className="text-[10px]">LinkedIn</span>
            </Button>
          </div>
          
          <Button
            className="w-full gap-2"
            onClick={() => window.open(storeUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Preview Store
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
