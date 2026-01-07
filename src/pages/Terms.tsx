import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using our website and services, you agree to be bound by these Terms of Service. 
            If you disagree with any part of these terms, you may not access our services.
          </p>

          <h2>2. Use of Our Services</h2>
          <p>
            You agree to use our services only for lawful purposes and in accordance with these Terms. 
            You agree not to:
          </p>
          <ul>
            <li>Use the service in any way that violates any applicable laws</li>
            <li>Attempt to interfere with the proper working of the service</li>
            <li>Use automated systems to access the service without permission</li>
            <li>Impersonate any person or entity</li>
          </ul>

          <h2>3. Products and Purchases</h2>
          <p>
            All purchases through our site are subject to product availability. We reserve the right to 
            limit quantities, refuse orders, or discontinue products at any time without notice.
          </p>
          <p>
            Prices for products are subject to change without notice. We reserve the right to refuse 
            or cancel orders at any time for any reason.
          </p>

          <h2>4. Account Responsibilities</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. 
            You are responsible for maintaining the confidentiality of your account and password.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are owned by DOMINION 
            and are protected by international copyright, trademark, patent, trade secret, and other 
            intellectual property laws.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall DOMINION, nor its directors, employees, partners, agents, suppliers, 
            or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
            damages arising out of or relating to your use of the service.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, 
            we will provide at least 30 days notice prior to any new terms taking effect.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@dominion.store.
          </p>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
