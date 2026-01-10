import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Globe, 
  Image, 
  Lock, 
  CheckCircle2,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePricingStore, WhiteLabelLevel } from '@/stores/pricing-store';

/**
 * WHITE-LABEL FRAMEWORK
 * 
 * Brand overlays (logo, color, typography)
 * Custom domains
 * Language adaptation
 * Industry-specific framing
 */

interface WhiteLabelConfigProps {
  accessLevel: WhiteLabelLevel;
  onSave: (config: WhiteLabelFormData) => void;
  onCancel: () => void;
}

interface WhiteLabelFormData {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  customDomain: string;
  industry?: string;
}

export const WhiteLabelConfig = ({ 
  accessLevel, 
  onSave, 
  onCancel 
}: WhiteLabelConfigProps) => {
  const [formData, setFormData] = useState<WhiteLabelFormData>({
    brandName: '',
    logoUrl: '',
    primaryColor: '#6366F1',
    customDomain: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const features = [
    { 
      id: 'brand_overlay', 
      label: 'Brand Overlay', 
      description: 'Custom logo and colors',
      levels: ['partial', 'full'],
      icon: Palette
    },
    { 
      id: 'custom_domain', 
      label: 'Custom Domain', 
      description: 'Your own domain',
      levels: ['full'],
      icon: Globe
    },
    { 
      id: 'language_adaptation', 
      label: 'Language Adaptation', 
      description: 'Industry-specific terminology',
      levels: ['partial', 'full'],
      icon: Building2
    },
    { 
      id: 'core_access', 
      label: 'Core Intelligence Access', 
      description: 'Never exposed to customers',
      levels: [],
      icon: Lock
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <p className="text-xs font-mono text-primary uppercase tracking-[0.3em] mb-2">
          White-Label Configuration
        </p>
        <h2 className="text-2xl font-bold">
          {accessLevel === 'full' ? 'Full Customization' : 'Partial Customization'}
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure your branded deployment
        </p>
      </div>

      {/* Access level indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {features.map(feature => {
          const isAvailable = feature.levels.includes(accessLevel);
          return (
            <div 
              key={feature.id}
              className={cn(
                "p-3 rounded-lg border text-center transition-colors",
                isAvailable 
                  ? "bg-card border-border" 
                  : "bg-muted/20 border-border/50 opacity-50"
              )}
            >
              <feature.icon className={cn(
                "w-5 h-5 mx-auto mb-2",
                isAvailable ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="text-xs font-medium">{feature.label}</p>
              {isAvailable ? (
                <CheckCircle2 className="w-3 h-3 text-success mx-auto mt-1" />
              ) : (
                <Lock className="w-3 h-3 text-muted-foreground mx-auto mt-1" />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Name */}
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand Name</Label>
          <Input
            id="brandName"
            value={formData.brandName}
            onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
            placeholder="Your Brand"
            className="bg-card"
          />
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            value={formData.logoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
            placeholder="https://your-domain.com/logo.png"
            className="bg-card"
          />
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex gap-3">
            <Input
              type="color"
              id="primaryColor"
              value={formData.primaryColor}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="w-12 h-10 p-1 bg-card cursor-pointer"
            />
            <Input
              value={formData.primaryColor}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
              placeholder="#6366F1"
              className="bg-card flex-1"
            />
          </div>
        </div>

        {/* Custom Domain - Only for full access */}
        {accessLevel === 'full' && (
          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain</Label>
            <Input
              id="customDomain"
              value={formData.customDomain}
              onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
              placeholder="app.your-domain.com"
              className="bg-card"
            />
            <p className="text-xs text-muted-foreground">
              DNS configuration will be provided after setup
            </p>
          </div>
        )}

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Security Preserved</p>
            <p className="text-xs text-muted-foreground mt-1">
              Core intelligence, system logic, and learning engine remain protected.
              White-label customers only access branded interfaces.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Save Configuration
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

/**
 * White-Label Access Level Selector
 */
export const WhiteLabelAccessSelector = ({ 
  currentLevel,
  onUpgrade 
}: { 
  currentLevel: WhiteLabelLevel;
  onUpgrade: (level: WhiteLabelLevel) => void;
}) => {
  const levels: { id: WhiteLabelLevel; name: string; tier: string }[] = [
    { id: 'none', name: 'No White-Label', tier: 'CORE' },
    { id: 'partial', name: 'Partial White-Label', tier: 'SCALE' },
    { id: 'full', name: 'Full White-Label', tier: 'AURAOMEGA' },
  ];

  return (
    <div className="space-y-3">
      {levels.map(level => (
        <button
          key={level.id}
          onClick={() => onUpgrade(level.id)}
          disabled={level.id === currentLevel}
          className={cn(
            "w-full p-4 rounded-lg border text-left transition-all",
            level.id === currentLevel
              ? "bg-primary/10 border-primary/30"
              : "bg-card border-border hover:border-border/80"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{level.name}</p>
              <p className="text-xs text-muted-foreground">
                Available with {level.tier}
              </p>
            </div>
            {level.id === currentLevel && (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
