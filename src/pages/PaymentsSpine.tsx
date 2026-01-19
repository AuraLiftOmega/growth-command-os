import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentsSpineHeader } from '@/components/payments-spine/PaymentsSpineHeader';
import { GlobalStatusCards } from '@/components/payments-spine/GlobalStatusCards';
import { ProjectsBindingTable } from '@/components/payments-spine/ProjectsBindingTable';
import { AlertCenter } from '@/components/payments-spine/AlertCenter';
import { MetricsCharts } from '@/components/payments-spine/MetricsCharts';
import { WebhookHealthPanel } from '@/components/payments-spine/WebhookHealthPanel';
import { StripeObjectsHealth } from '@/components/payments-spine/StripeObjectsHealth';
import { usePaymentsSpineData } from '@/hooks/usePaymentsSpineData';

export default function PaymentsSpine() {
  const [selectedEnv, setSelectedEnv] = useState<'dev' | 'staging' | 'prod'>('prod');
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | 'custom'>('30d');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const {
    stripeHealth,
    projects,
    metrics,
    alerts,
    webhookHealth,
    isLoading,
    refetch,
  } = usePaymentsSpineData(selectedEnv, dateRange);

  return (
    <div className="min-h-screen bg-background">
      <PaymentsSpineHeader
        selectedEnv={selectedEnv}
        onEnvChange={setSelectedEnv}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        stripeStatus={stripeHealth?.status || 'UNKNOWN'}
        onRefresh={refetch}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Global Status Cards */}
        <GlobalStatusCards
          stripeHealth={stripeHealth}
          metrics={metrics}
          projects={projects}
          alerts={alerts}
          isLoading={isLoading}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="metrics">Analytics</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="stripe">Stripe Health</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <ProjectsBindingTable
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              onRevalidate={refetch}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <MetricsCharts
              metrics={metrics}
              dateRange={dateRange}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <WebhookHealthPanel
              webhookHealth={webhookHealth}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertCenter
              alerts={alerts}
              onRefresh={refetch}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="stripe" className="space-y-6">
            <StripeObjectsHealth
              stripeHealth={stripeHealth}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
