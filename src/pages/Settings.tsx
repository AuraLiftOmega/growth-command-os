import { SmartSidebar } from "@/components/layout/SmartSidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Shield, LogOut, CreditCard, Store, Github } from "lucide-react";
import { StripePaymentsPanel } from "@/components/settings/StripePaymentsPanel";
import { PricingPanel } from "@/components/settings/PricingPanel";
import { ShopifyConnectionsPanel } from "@/components/settings/ShopifyConnectionsPanel";
import { BillingPanel } from "@/components/settings/BillingPanel";
import { GitHubIntegrationPanel } from "@/components/settings/GitHubIntegrationPanel";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <SmartSidebar />
      
      <main className="ml-64 transition-all duration-300">
        <Header />
        
        <div className="p-6 max-w-5xl">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full max-w-3xl">
              <TabsTrigger value="account" className="gap-2">
                <User className="w-4 h-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="shopify" className="gap-2">
                <Store className="w-4 h-4" />
                Shopify
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle>Account</CardTitle>
                  </div>
                  <CardDescription>
                    Your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-xs font-mono text-muted-foreground">{user?.id}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shopify Tab */}
            <TabsContent value="shopify">
              <ShopifyConnectionsPanel />
            </TabsContent>

            {/* GitHub Tab */}
            <TabsContent value="github">
              <GitHubIntegrationPanel />
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <BillingPanel />
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <StripePaymentsPanel />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <CardTitle>Security</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your session and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
