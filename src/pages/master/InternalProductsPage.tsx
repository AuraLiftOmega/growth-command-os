import { useState } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { useInternalProducts, useCreateProduct, useDeleteProduct, useInternalOrders } from '@/hooks/useInternalProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Plus, DollarSign, TrendingUp, ShoppingCart, 
  Eye, Trash2, Edit, Zap, BarChart3 
} from 'lucide-react';

function CreateProductDialog({ onCreated }: { onCreated?: () => void }) {
  const createProduct = useCreateProduct();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', base_price: '', cost_price: '',
    product_type: 'physical', status: 'draft', fulfillment_type: 'manual',
  });

  const handleSubmit = () => {
    createProduct.mutate({
      title: form.title,
      description: form.description,
      base_price: parseFloat(form.base_price) || 0,
      cost_price: parseFloat(form.cost_price) || 0,
      product_type: form.product_type,
      status: form.status,
      fulfillment_type: form.fulfillment_type,
    }, {
      onSuccess: () => { setOpen(false); setForm({ title: '', description: '', base_price: '', cost_price: '', product_type: 'physical', status: 'draft', fulfillment_type: 'manual' }); onCreated?.(); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Create Internal Product</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Product title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Sell price" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} />
            <Input type="number" placeholder="Cost price" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select value={form.product_type} onValueChange={v => setForm(f => ({ ...f, product_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.fulfillment_type} onValueChange={v => setForm(f => ({ ...f, fulfillment_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="cj">CJ Auto</SelectItem>
                <SelectItem value="dropship">Dropship</SelectItem>
                <SelectItem value="digital_delivery">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={!form.title || createProduct.isPending} className="w-full">
            {createProduct.isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InternalProductsPage() {
  const { data: products = [], isLoading } = useInternalProducts();
  const { data: orders = [] } = useInternalOrders();
  const deleteProduct = useDeleteProduct();

  const totalRevenue = products.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
  const totalSold = products.reduce((sum, p) => sum + (p.total_sold || 0), 0);
  const activeProducts = products.filter(p => p.status === 'active').length;

  const statusColor = (s: string) => {
    switch (s) { case 'active': return 'bg-green-500/10 text-green-400'; case 'draft': return 'bg-yellow-500/10 text-yellow-400'; default: return 'bg-muted text-muted-foreground'; }
  };

  return (
    <MasterOSLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> Internal Commerce Engine</h1>
            <p className="text-sm text-muted-foreground mt-1">Your products, your rules — zero external dependencies</p>
          </div>
          <CreateProductDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Products', value: products.length, icon: Package, color: 'text-primary' },
            { label: 'Active', value: activeProducts, icon: Zap, color: 'text-green-400' },
            { label: 'Total Sold', value: totalSold, icon: ShoppingCart, color: 'text-blue-400' },
            { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-3 mt-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : products.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No internal products yet. Create your first product above.</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {products.map(product => (
                  <Card key={product.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {product.thumbnail_url ? (
                          <img src={product.thumbnail_url} className="w-full h-full object-cover rounded-lg" alt="" />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{product.title}</h3>
                          <Badge variant="outline" className={statusColor(product.status)}>{product.status}</Badge>
                          <Badge variant="outline" className="text-xs">{product.product_type}</Badge>
                          {product.external_source && product.external_source !== 'internal' && (
                            <Badge variant="outline" className="text-xs text-orange-400">synced: {product.external_source}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{product.description || 'No description'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-lg">${product.base_price?.toFixed(2)}</p>
                        {product.cost_price != null && product.cost_price > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Margin: <span className={(product.margin_percentage || 0) >= 60 ? 'text-green-400' : 'text-red-400'}>
                              {product.margin_percentage?.toFixed(0)}%
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="text-center px-3">
                          <p className="text-sm font-medium">{product.total_sold}</p>
                          <p className="text-[10px] text-muted-foreground">sold</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct.mutate(product.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-3 mt-4">
            {orders.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No orders yet. Orders will appear here when customers purchase through your internal checkout.</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">#{order.order_number}</span>
                          <Badge variant="outline">{order.status}</Badge>
                          <Badge variant="outline">{order.payment_status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{order.customer_email} · {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold">${order.total?.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MasterOSLayout>
  );
}
