/**
 * PRODUCT INTAKE PANEL
 * 
 * Flexible product import supporting:
 * - Platform connection (Shopify)
 * - Store URL entry for scraping
 * - CSV/feed import
 * - Manual product entry
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Link2,
  Upload,
  PlusCircle,
  FileSpreadsheet,
  Globe,
  CheckCircle,
  Loader2,
  ArrowRight,
  Package,
  Sparkles,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type IntakeMethod = 'connect' | 'url' | 'csv' | 'manual';
type ImportStatus = 'idle' | 'importing' | 'processing' | 'complete' | 'error';

interface ImportedProduct {
  id: string;
  title: string;
  price: string;
  image?: string;
  description?: string;
  category?: string;
}

interface ProductIntakePanelProps {
  onProductsImported?: (products: ImportedProduct[]) => void;
  className?: string;
  showConnectOption?: boolean;
}

const INTAKE_METHODS = [
  {
    id: 'connect' as IntakeMethod,
    title: 'Connect Store',
    description: 'Link your existing commerce platform',
    icon: Store,
    badge: 'RECOMMENDED',
    badgeColor: 'bg-success/20 text-success'
  },
  {
    id: 'url' as IntakeMethod,
    title: 'Import from URL',
    description: 'Enter your store URL to import products',
    icon: Globe,
    badge: 'QUICK',
    badgeColor: 'bg-primary/20 text-primary'
  },
  {
    id: 'csv' as IntakeMethod,
    title: 'Upload CSV/File',
    description: 'Import products from spreadsheet',
    icon: FileSpreadsheet,
    badge: null,
    badgeColor: ''
  },
  {
    id: 'manual' as IntakeMethod,
    title: 'Add Manually',
    description: 'Enter product details by hand',
    icon: PlusCircle,
    badge: 'FLEXIBLE',
    badgeColor: 'bg-blue-500/20 text-blue-400'
  }
];

export function ProductIntakePanel({ 
  onProductsImported, 
  className,
  showConnectOption = true 
}: ProductIntakePanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<IntakeMethod | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importProgress, setImportProgress] = useState(0);
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  
  // Form states
  const [storeUrl, setStoreUrl] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualProduct, setManualProduct] = useState({
    title: '',
    price: '',
    description: '',
    category: ''
  });

  const handleUrlImport = useCallback(async () => {
    if (!storeUrl.trim()) {
      toast.error('Please enter a valid store URL');
      return;
    }

    setImportStatus('importing');
    setImportProgress(0);

    // Simulate import process
    const steps = [20, 40, 60, 80, 100];
    for (const progress of steps) {
      await new Promise(r => setTimeout(r, 500));
      setImportProgress(progress);
    }

    // Simulate imported products
    const products: ImportedProduct[] = [
      { id: '1', title: 'Sample Product 1', price: '49.99', category: 'General' },
      { id: '2', title: 'Sample Product 2', price: '79.99', category: 'General' },
      { id: '3', title: 'Sample Product 3', price: '129.99', category: 'Premium' }
    ];

    setImportedProducts(products);
    setImportStatus('complete');
    onProductsImported?.(products);
    toast.success(`Imported ${products.length} products from URL`);
  }, [storeUrl, onProductsImported]);

  const handleCsvImport = useCallback(async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setImportStatus('importing');
    setImportProgress(0);

    // Simulate CSV processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setImportProgress(i);
    }

    // Parse CSV (simplified)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      
      const products: ImportedProduct[] = lines
        .filter(line => line.trim())
        .slice(0, 50) // Limit to 50 products
        .map((line, index) => {
          const [title, price, description, category] = line.split(',');
          return {
            id: `csv-${index}`,
            title: title?.trim() || `Product ${index + 1}`,
            price: price?.trim() || '0.00',
            description: description?.trim(),
            category: category?.trim()
          };
        });

      setImportedProducts(products);
      setImportStatus('complete');
      onProductsImported?.(products);
      toast.success(`Imported ${products.length} products from CSV`);
    };
    reader.readAsText(csvFile);
  }, [csvFile, onProductsImported]);

  const handleManualAdd = useCallback(() => {
    if (!manualProduct.title.trim() || !manualProduct.price.trim()) {
      toast.error('Please enter product title and price');
      return;
    }

    const newProduct: ImportedProduct = {
      id: `manual-${Date.now()}`,
      title: manualProduct.title,
      price: manualProduct.price,
      description: manualProduct.description,
      category: manualProduct.category
    };

    setImportedProducts(prev => [...prev, newProduct]);
    setManualProduct({ title: '', price: '', description: '', category: '' });
    onProductsImported?.([...importedProducts, newProduct]);
    toast.success('Product added successfully');
  }, [manualProduct, importedProducts, onProductsImported]);

  const removeProduct = (productId: string) => {
    const updated = importedProducts.filter(p => p.id !== productId);
    setImportedProducts(updated);
    onProductsImported?.(updated);
  };

  const resetImport = () => {
    setSelectedMethod(null);
    setImportStatus('idle');
    setImportProgress(0);
    setStoreUrl('');
    setCsvFile(null);
  };

  const filteredMethods = showConnectOption 
    ? INTAKE_METHODS 
    : INTAKE_METHODS.filter(m => m.id !== 'connect');

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Product Intake</h3>
          <p className="text-sm text-muted-foreground">
            {importedProducts.length > 0 
              ? `${importedProducts.length} products imported` 
              : 'Add products to your catalog'}
          </p>
        </div>
        {importedProducts.length > 0 && (
          <Badge className="ml-auto bg-success/20 text-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedMethod ? (
          <motion.div
            key="method-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {filteredMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    "border-border bg-card"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{method.title}</span>
                        {method.badge && (
                          <Badge className={cn("text-[10px]", method.badgeColor)}>
                            {method.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="import-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetImport}
              className="mb-4 gap-2"
            >
              <X className="w-4 h-4" />
              Back to methods
            </Button>

            {/* URL Import */}
            {selectedMethod === 'url' && (
              <div className="space-y-4">
                <div>
                  <Label>Store URL</Label>
                  <Input
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="https://yourstore.com"
                    className="mt-1"
                    disabled={importStatus === 'importing'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your store homepage to scan for products
                  </p>
                </div>

                {importStatus === 'importing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scanning products...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                <Button
                  onClick={handleUrlImport}
                  disabled={importStatus === 'importing' || !storeUrl.trim()}
                  className="w-full gap-2"
                >
                  {importStatus === 'importing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Import Products
                </Button>
              </div>
            )}

            {/* CSV Import */}
            {selectedMethod === 'csv' && (
              <div className="space-y-4">
                <div>
                  <Label>Upload CSV File</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium">{csvFile?.name || 'Click to upload'}</p>
                      <p className="text-xs text-muted-foreground mt-1">CSV, XLSX up to 10MB</p>
                    </label>
                  </div>
                </div>

                {importStatus === 'importing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing file...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                <Button
                  onClick={handleCsvImport}
                  disabled={importStatus === 'importing' || !csvFile}
                  className="w-full gap-2"
                >
                  {importStatus === 'importing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  Process File
                </Button>
              </div>
            )}

            {/* Manual Entry */}
            {selectedMethod === 'manual' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Title *</Label>
                    <Input
                      value={manualProduct.title}
                      onChange={(e) => setManualProduct(p => ({ ...p, title: e.target.value }))}
                      placeholder="Product name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Price *</Label>
                    <Input
                      value={manualProduct.price}
                      onChange={(e) => setManualProduct(p => ({ ...p, price: e.target.value }))}
                      placeholder="29.99"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={manualProduct.description}
                    onChange={(e) => setManualProduct(p => ({ ...p, description: e.target.value }))}
                    placeholder="Product description..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={manualProduct.category}
                    onChange={(e) => setManualProduct(p => ({ ...p, category: e.target.value }))}
                    placeholder="e.g., Electronics"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleManualAdd}
                  disabled={!manualProduct.title.trim() || !manualProduct.price.trim()}
                  className="w-full gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Product
                </Button>
              </div>
            )}

            {/* Connect Store */}
            {selectedMethod === 'connect' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Connect Your Store</h4>
                  <p className="text-sm text-muted-foreground">
                    Link your commerce platform to automatically sync products
                  </p>
                </div>
                <Button className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Connect Store
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Imported Products List */}
      {importedProducts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Imported Products</h4>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod('manual')} className="gap-1 text-xs">
              <PlusCircle className="w-3 h-3" />
              Add More
            </Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {importedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.title}</p>
                    <p className="text-xs text-muted-foreground">${product.price}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
