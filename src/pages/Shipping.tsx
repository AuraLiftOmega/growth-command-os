import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1>Shipping Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Shipping Options</h2>
          <p>We offer the following shipping options for all orders:</p>
          
          <h3>Standard Shipping</h3>
          <ul>
            <li>Delivery Time: 5-7 business days</li>
            <li>Cost: FREE on orders over $50</li>
            <li>Cost: $5.99 on orders under $50</li>
          </ul>

          <h3>Express Shipping</h3>
          <ul>
            <li>Delivery Time: 2-3 business days</li>
            <li>Cost: $12.99</li>
          </ul>

          <h3>Next Day Delivery</h3>
          <ul>
            <li>Delivery Time: 1 business day</li>
            <li>Cost: $24.99</li>
            <li>Order by 2pm EST for same-day processing</li>
          </ul>

          <h2>Order Processing</h2>
          <p>
            Orders are typically processed within 1-2 business days. You will receive a confirmation 
            email with tracking information once your order has shipped.
          </p>

          <h2>Shipping Destinations</h2>
          <p>
            We currently ship to the United States and Canada. International shipping may be available 
            for select products—please contact us for more information.
          </p>

          <h2>Tracking Your Order</h2>
          <p>
            Once your order ships, you will receive an email with tracking information. You can also 
            track your order by logging into your account on our website.
          </p>

          <h2>Shipping Restrictions</h2>
          <ul>
            <li>We cannot ship to P.O. boxes for express or next-day delivery</li>
            <li>Some items may have shipping restrictions based on size or destination</li>
            <li>Additional fees may apply for remote or hard-to-reach addresses</li>
          </ul>

          <h2>Missing or Damaged Packages</h2>
          <p>
            If your package is lost or arrives damaged, please contact us within 48 hours at 
            shipping@dominion.store. We will work with the carrier to resolve the issue and ensure 
            you receive your order.
          </p>

          <h2>Contact Us</h2>
          <p>
            For any questions about shipping, please contact us at shipping@dominion.store 
            or call 1-800-DOMINION.
          </p>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
