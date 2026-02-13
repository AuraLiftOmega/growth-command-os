import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Clock, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { PLATFORM_CONFIG } from "@/lib/store-config";
import { toast } from "sonner";

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5–7 business days within the US. Express shipping (2–3 days) and next-day delivery options are also available at checkout.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day hassle-free return policy. Items must be unused and in original packaging. Defective items qualify for free return shipping.",
  },
  {
    q: "Are your products cruelty-free?",
    a: "Yes! All Aura Lift Essentials products are 100% cruelty-free. We never test on animals and are certified by Leaping Bunny.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship worldwide. International shipping typically takes 7–14 business days depending on your location. Customs duties may apply.",
  },
  {
    q: "How do I use the LED therapy mask?",
    a: "Cleanse your face, then wear the mask for 10–20 minutes per session, 3–5 times per week. Start with shorter sessions and gradually increase. Full instructions are included with the product.",
  },
  {
    q: "Can I use multiple serums together?",
    a: "Yes! We recommend layering from thinnest to thickest consistency. Apply Vitamin C in the morning and Retinol at night. Our bundles are pre-curated for optimal combinations.",
  },
  {
    q: "What if a product doesn't work for my skin type?",
    a: "Everyone's skin is different. If a product causes irritation, discontinue use and contact us. Our 30-day return policy covers products that don't suit your skin.",
  },
  {
    q: "Do you offer discounts on bundles?",
    a: "Yes! Our curated bundles offer 15–25% savings compared to buying individual products. Check our Bundles & Sets collection for current offers.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    document.title = `Help & Contact | ${PLATFORM_CONFIG.name}`;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent!", {
      description: "We'll get back to you within 24 hours.",
      position: "top-center",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 {...fadeUp} className="text-5xl md:text-7xl font-bold mb-6">
            How Can We <span className="gradient-text">Help</span>?
          </motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.1, duration: 0.6 }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions or reach out directly — we're here for you.
          </motion.p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-10 text-center">
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-border/40 rounded-xl overflow-hidden bg-background"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Form */}
            <motion.div {...fadeUp}>
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help?"
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="btn-power w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 rounded-xl border border-border/40 bg-card/50">
                  <Mail className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground text-sm">{PLATFORM_CONFIG.email}</p>
                    <p className="text-muted-foreground text-sm">We respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-xl border border-border/40 bg-card/50">
                  <MessageSquare className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Social Media</h3>
                    <p className="text-muted-foreground text-sm">DM us on Instagram {PLATFORM_CONFIG.instagram}</p>
                    <p className="text-muted-foreground text-sm">or TikTok {PLATFORM_CONFIG.tiktok}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-xl border border-border/40 bg-card/50">
                  <Clock className="w-6 h-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Support Hours</h3>
                    <p className="text-muted-foreground text-sm">Monday – Friday: 9am – 6pm EST</p>
                    <p className="text-muted-foreground text-sm">Weekend: Limited support via email</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
