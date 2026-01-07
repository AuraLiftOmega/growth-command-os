import { useState, useEffect } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'exit_popup_dismissed';

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      // Trigger when mouse moves to top of viewport (exit intent)
      if (e.clientY <= 5 && e.relatedTarget === null) {
        triggered = true;
        setIsVisible(true);
      }
    };

    // Delay adding listener to avoid immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call - in production, connect to your email service
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    
    toast({
      title: "You're in!",
      description: "Check your inbox for your exclusive guide.",
    });
    
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground relative">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close popup"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Gift className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-wide opacity-90">
                    Wait! Before you go...
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold">
                  Get Your Free Store Launch Guide
                </h2>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground mb-6">
                  Join 10,000+ merchants who launched profitable stores. Get our 
                  <span className="text-foreground font-medium"> step-by-step guide </span> 
                  plus exclusive tips delivered to your inbox.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Get Free Guide
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  No spam. Unsubscribe anytime.
                </p>
                
                <button
                  onClick={handleDismiss}
                  className="w-full text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
                >
                  No thanks, I'll figure it out myself
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
