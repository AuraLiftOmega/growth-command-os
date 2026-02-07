import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = "lovable-project-7fb70.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";

function getStorefrontUrl() {
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

async function storefrontRequest(query: string, variables: Record<string, unknown> = {}) {
  const token = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  if (!token) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured");

  const res = await fetch(getStorefrontUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Storefront API ${res.status}:`, text);
    throw new Error(`Storefront API error: ${res.status}`);
  }

  return res.json();
}

const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, cartId, variantId, quantity, lineId, lineIds } = await req.json();

    let result: any;

    switch (action) {
      case 'create': {
        const data = await storefrontRequest(CART_CREATE, {
          input: { lines: [{ quantity: quantity || 1, merchandiseId: variantId }] },
        });
        const cart = data.data?.cartCreate?.cart;
        const errors = data.data?.cartCreate?.userErrors || [];
        if (errors.length > 0) {
          return json({ error: errors[0].message }, 400);
        }
        if (!cart?.checkoutUrl) {
          return json({ error: 'Cart creation failed' }, 500);
        }
        const firstLineId = cart.lines.edges[0]?.node?.id;
        result = {
          cartId: cart.id,
          checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
          lineId: firstLineId,
        };
        break;
      }

      case 'addLine': {
        const data = await storefrontRequest(CART_LINES_ADD, {
          cartId,
          lines: [{ quantity: quantity || 1, merchandiseId: variantId }],
        });
        const errors = data.data?.cartLinesAdd?.userErrors || [];
        if (isCartNotFound(errors)) {
          return json({ success: false, cartNotFound: true });
        }
        if (errors.length > 0) {
          return json({ success: false, error: errors[0].message });
        }
        const lines = data.data?.cartLinesAdd?.cart?.lines?.edges || [];
        const newLine = lines.find((l: any) => l.node.merchandise.id === variantId);
        result = { success: true, lineId: newLine?.node?.id };
        break;
      }

      case 'updateLine': {
        const data = await storefrontRequest(CART_LINES_UPDATE, {
          cartId,
          lines: [{ id: lineId, quantity }],
        });
        const errors = data.data?.cartLinesUpdate?.userErrors || [];
        if (isCartNotFound(errors)) {
          return json({ success: false, cartNotFound: true });
        }
        if (errors.length > 0) {
          return json({ success: false, error: errors[0].message });
        }
        result = { success: true };
        break;
      }

      case 'removeLine': {
        const data = await storefrontRequest(CART_LINES_REMOVE, {
          cartId,
          lineIds: lineIds || [lineId],
        });
        const errors = data.data?.cartLinesRemove?.userErrors || [];
        if (isCartNotFound(errors)) {
          return json({ success: false, cartNotFound: true });
        }
        if (errors.length > 0) {
          return json({ success: false, error: errors[0].message });
        }
        result = { success: true };
        break;
      }

      case 'fetch': {
        const data = await storefrontRequest(CART_QUERY, { id: cartId });
        const cart = data.data?.cart;
        result = {
          exists: !!cart,
          totalQuantity: cart?.totalQuantity || 0,
        };
        break;
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }

    return json(result);
  } catch (error) {
    console.error("shopify-cart error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

function isCartNotFound(errors: Array<{ message: string }>): boolean {
  return errors.some(e =>
    e.message.toLowerCase().includes('cart not found') ||
    e.message.toLowerCase().includes('does not exist')
  );
}
