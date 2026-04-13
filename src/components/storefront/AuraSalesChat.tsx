import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProducts, ShopifyProduct } from "@/lib/storefront-api";
import { useCartStore } from "@/stores/cart-store";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProductAction {
  handle: string;
  variantId: string;
  title: string;
  price: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-sales-agent`;

function parseProductActions(content: string): { cleanContent: string; actions: ProductAction[] } {
  const actions: ProductAction[] = [];
  const regex = /\[PRODUCT_ACTION:([^:]+):([^:]+):([^:]+):([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    actions.push({
      handle: match[1],
      variantId: match[2],
      title: match[3],
      price: match[4],
    });
  }
  const cleanContent = content.replace(regex, '').trim();
  return { cleanContent, actions };
}

export function AuraSalesChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [rawProducts, setRawProducts] = useState<ShopifyProduct[]>([]);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  // Load products with variant IDs for AI context
  useEffect(() => {
    fetchProducts({ first: 50 }).then((prods) => {
      setRawProducts(prods);
      setProducts(
        prods.map((p: ShopifyProduct) => ({
          title: p.node.title,
          handle: p.node.handle,
          price: p.node.priceRange.minVariantPrice.amount,
          variantId: p.node.variants.edges[0]?.node?.id || "",
          type: p.node.productType || "",
          available: p.node.variants.edges.some((v) => v.node.availableForSale),
        }))
      );
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowPulse(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) setShowPulse(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen, messages.length]);

  const handleAddToCart = useCallback(async (action: ProductAction) => {
    const product = rawProducts.find((p) => p.node.handle === action.handle);
    if (!product) {
      toast.error("Product not found");
      return;
    }
    const variant = product.node.variants.edges.find((v) => v.node.id === action.variantId) || product.node.variants.edges[0];
    if (!variant) return;

    await addItem({
      product,
      variantId: variant.node.id,
      variantTitle: variant.node.title,
      price: variant.node.price,
      quantity: 1,
      selectedOptions: variant.node.selectedOptions || [],
    });
    toast.success(`${action.title} added to cart!`, { position: "top-center" });
    setCartOpen(true);
  }, [rawProducts, addItem, setCartOpen]);

  const streamChat = useCallback(
    async (userMessages: Message[]) => {
      setIsLoading(true);
      let assistantContent = "";

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: userMessages, products }),
        });

        if (!resp.ok || !resp.body) throw new Error(`Stream failed: ${resp.status}`);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) =>
                      i === prev.length - 1 ? { ...m, content: assistantContent } : m
                    );
                  }
                  return [...prev, { role: "assistant", content: assistantContent }];
                });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I'm having a moment — please try again! ✨" },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [products]
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    await streamChat(allMessages);
  }, [input, isLoading, messages, streamChat]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hey there! ✨ Welcome to Aura Lift Essentials. I'm Aura, your personal beauty advisor.\n\nWhat are you looking for today? I can help you find the perfect skincare routine, recommend bestsellers, or find something within your budget. Just ask! 💎",
      }]);
    }
  }, [messages.length]);

  const quickActions = [
    { label: "🧴 Best sellers", msg: "What are your best sellers?" },
    { label: "🎁 Bundles", msg: "Show me your bundle deals" },
    { label: "✨ Anti-aging", msg: "I need anti-aging products" },
    { label: "💰 Under $50", msg: "What can I get under $50?" },
  ];

  const renderMessage = (msg: Message, i: number) => {
    if (msg.role === "user") {
      return (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
          <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-[#8B6F4E] text-white">
            {msg.content}
          </div>
        </motion.div>
      );
    }

    const { cleanContent, actions } = parseProductActions(msg.content);

    return (
      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
        <div className="max-w-[85%] space-y-2">
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-white text-gray-800 shadow-sm border border-gray-100">
            <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ul]:mb-0">
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            </div>
          </div>
          {actions.length > 0 && (
            <div className="space-y-1.5 pl-1">
              {actions.map((action, j) => (
                <div key={j} className="flex items-center gap-2 bg-[#F9F5F0] rounded-xl px-3 py-2 border border-[#8B6F4E]/10">
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${action.handle}`} className="text-xs font-semibold text-[#8B6F4E] hover:underline truncate block">
                      {action.title}
                    </Link>
                    <span className="text-xs text-gray-500">${parseFloat(action.price).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(action)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B6F4E] text-white text-xs font-medium hover:bg-[#6B4F2E] transition-colors whitespace-nowrap"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="fixed bottom-6 right-6 z-[9999]">
            <button onClick={handleOpen} className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-[#8B6F4E] to-[#6B4F2E] text-white hover:scale-110 transition-transform duration-200" aria-label="Chat with Aura">
              <MessageCircle className="w-7 h-7" />
              {showPulse && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500" />
                </span>
              )}
            </button>
            {showPulse && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl p-3 pr-6 min-w-[200px] border border-[#8B6F4E]/20">
                <p className="text-sm font-medium text-gray-800">Need help finding the perfect product? 💎</p>
                <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-[#8B6F4E]/20 rotate-45" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[9999] w-[390px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-4rem)] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#8B6F4E]/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#8B6F4E] to-[#6B4F2E] text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Aura • Beauty Advisor</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                    Online — Ready to help you shop
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAF8F5]">
              {messages.map((msg, i) => renderMessage(msg, i))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-[#8B6F4E]/40 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-[#8B6F4E]/40 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-[#8B6F4E]/40 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-[#FAF8F5] border-t border-gray-100 flex-shrink-0">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      const userMsg: Message = { role: "user", content: action.msg };
                      const all = [...messages, userMsg];
                      setMessages(all);
                      streamChat(all);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#8B6F4E]/20 text-[#8B6F4E] hover:bg-[#8B6F4E]/5 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about products or add to cart..."
                className="flex-1 text-sm bg-[#FAF8F5] rounded-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[#8B6F4E]/40 focus:ring-1 focus:ring-[#8B6F4E]/20 text-gray-800 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-[#8B6F4E] text-white flex items-center justify-center hover:bg-[#6B4F2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
