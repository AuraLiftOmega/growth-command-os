import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including:
          </p>
          <ul>
            <li>Name and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Order history and preferences</li>
            <li>Communications with us</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about products, services, and promotions</li>
            <li>Improve and personalize your experience</li>
            <li>Analyze usage and trends</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            except as described in this policy. We may share your information with:
          </p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Payment processors to complete transactions</li>
            <li>Shipping carriers to deliver your orders</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. All payment transactions are 
            encrypted using SSL technology.
          </p>

          <h2>5. Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, gather general visitor 
            information, and track visits to our website. You can choose to disable cookies through 
            your browser settings.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            For any questions about this Privacy Policy, please contact us at privacy@dominion.store.
          </p>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
