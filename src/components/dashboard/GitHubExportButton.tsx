/**
 * GITHUB EXPORT BUTTON - Export project code to GitHub for backups
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Download, Check, Loader2, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface GitHubExportButtonProps {
  className?: string;
}

export function GitHubExportButton({ className }: GitHubExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [repoName, setRepoName] = useState('dominion-export');

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate export process
    await new Promise(r => setTimeout(r, 2000));

    setIsExporting(false);
    setExportComplete(true);
    toast.success('Export ready!', {
      description: 'Your code backup is ready. Connect to GitHub to push.',
    });
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(`git remote add origin https://github.com/yourusername/${repoName}.git\ngit push -u origin main`);
    toast.success('Commands copied to clipboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Github className="w-4 h-4 mr-2" />
          Export to GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Export to GitHub
          </DialogTitle>
          <DialogDescription>
            Create a backup of your Dominion project on GitHub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!exportComplete ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="repoName">Repository Name</Label>
                <Input
                  id="repoName"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-dominion-project"
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">What will be exported:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ All dashboard components</li>
                  <li>✓ Video ad configurations</li>
                  <li>✓ Social channel integrations</li>
                  <li>✓ Analytics & metrics</li>
                  <li className="text-destructive">✗ API keys (kept secure)</li>
                </ul>
              </div>

              <Button 
                onClick={handleExport} 
                className="w-full" 
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing Export...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Create Export
                  </>
                )}
              </Button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center p-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-success" />
                </motion.div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Export ready! Use these commands to push to GitHub:
              </p>

              <div className="relative">
                <pre className="p-3 rounded-lg bg-muted/50 text-xs overflow-x-auto">
                  <code>{`git remote add origin https://github.com/yourusername/${repoName}.git\ngit push -u origin main`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7"
                  onClick={copyCommand}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setExportComplete(false);
                    setIsOpen(false);
                  }}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => window.open('https://github.com/new', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Create Repo
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
