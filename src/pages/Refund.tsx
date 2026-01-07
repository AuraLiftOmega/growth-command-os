import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";

export default function Refund() {
  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1>Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>30-Day Return Policy</h2>
          <p>
            We want you to be completely satisfied with your purchase. If you're not happy with your 
            order, we offer a hassle-free 30-day return policy.
          </p>

          <h2>Eligibility for Returns</h2>
          <p>To be eligible for a return, your item must be:</p>
          <ul>
            <li>Within 30 days of the original purchase date</li>
            <li>In its original packaging</li>
            <li>Unused and in the same condition that you received it</li>
            <li>Accompanied by the receipt or proof of purchase</li>
          </ul>

          <h2>Non-Returnable Items</h2>
          <p>The following items cannot be returned:</p>
          <ul>
            <li>Gift cards</li>
            <li>Personalized or custom-made products</li>
            <li>Items marked as final sale</li>
            <li>Items that have been used, damaged, or altered</li>
          </ul>

          <h2>How to Initiate a Return</h2>
          <ol>
            <li>Contact our support team at returns@dominion.store</li>
            <li>Provide your order number and reason for return</li>
            <li>Receive your prepaid return shipping label</li>
            <li>Pack the item securely in its original packaging</li>
            <li>Drop off the package at any authorized shipping location</li>
          </ol>

          <h2>Refund Process</h2>
          <p>
            Once we receive and inspect your return, we will notify you of the approval or rejection 
            of your refund.
          </p>
          <ul>
            <li>Approved refunds are processed within 5-7 business days</li>
            <li>Refunds are issued to the original payment method</li>
            <li>Shipping costs are non-refundable unless the item was defective</li>
          </ul>

          <h2>Exchanges</h2>
          <p>
            If you need to exchange an item for a different size or color, please return the original 
            item and place a new order for the replacement.
          </p>

          <h2>Damaged or Defective Items</h2>
          <p>
            If you receive a damaged or defective item, please contact us immediately at 
            support@dominion.store. We will provide free return shipping and a full refund or replacement.
          </p>

          <h2>Contact Us</h2>
          <p>
            For any questions about returns or refunds, please contact us at returns@dominion.store 
            or call 1-800-DOMINION.
          </p>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
