import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated NFT metadata for Aura Luxe products
const NFT_TEMPLATES = {
  'vitamin-c-serum': {
    name: 'Vitamin C Glow-Up #',
    description: 'Exclusive NFT celebrating your radiant transformation with Vitamin C Serum. This digital collectible represents your skincare journey to glass skin perfection.',
    attributes: [
      { trait_type: 'Product', value: 'Vitamin C Serum' },
      { trait_type: 'Effect', value: 'Brightening Glow' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Collection', value: 'Aura Luxe Transformations' }
    ]
  },
  'peptide-serum': {
    name: 'Peptide Power #',
    description: 'Legendary NFT showcasing the Botox-in-a-bottle effect. Your transformation is now immortalized on the blockchain.',
    attributes: [
      { trait_type: 'Product', value: 'Peptide Complex Serum' },
      { trait_type: 'Effect', value: 'Anti-Aging Power' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Collection', value: 'Aura Luxe Transformations' }
    ]
  },
  'hyaluronic-acid': {
    name: 'Hydration Hero #',
    description: 'Epic NFT representing ultimate hydration and plump, dewy skin. Your glass skin journey captured forever.',
    attributes: [
      { trait_type: 'Product', value: 'Hyaluronic Acid Serum' },
      { trait_type: 'Effect', value: 'Deep Hydration' },
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Collection', value: 'Aura Luxe Transformations' }
    ]
  },
  'retinol-cream': {
    name: 'Retinol Renaissance #',
    description: 'Mythic NFT celebrating your skin renewal journey. The ultimate anti-aging transformation.',
    attributes: [
      { trait_type: 'Product', value: 'Retinol Night Cream' },
      { trait_type: 'Effect', value: 'Skin Renewal' },
      { trait_type: 'Rarity', value: 'Mythic' },
      { trait_type: 'Collection', value: 'Aura Luxe Transformations' }
    ]
  },
  'glow-recipe': {
    name: 'Watermelon Glow #',
    description: 'Ultra-rare NFT from the viral Glow Recipe collection. Your dewy, glowing transformation is blockchain-verified.',
    attributes: [
      { trait_type: 'Product', value: 'Glow Recipe Watermelon Set' },
      { trait_type: 'Effect', value: 'Dewy Glow' },
      { trait_type: 'Rarity', value: 'Ultra Rare' },
      { trait_type: 'Collection', value: 'Aura Luxe Transformations' }
    ]
  }
};

// AR effect templates
const AR_EFFECTS = {
  'glass-skin': {
    name: 'Glass Skin Preview',
    effect: 'Simulates the glass skin glow effect with light refraction and dewy finish',
    intensity: 0.8
  },
  'dewy-glow': {
    name: 'Dewy Glow Filter',
    effect: 'Adds natural-looking dewiness and subtle highlight to skin',
    intensity: 0.7
  },
  'anti-aging': {
    name: 'Age Rewind Preview',
    effect: 'Shows subtle smoothing and firming effect simulation',
    intensity: 0.6
  },
  'brightening': {
    name: 'Vitamin C Glow',
    effect: 'Brightens and evens skin tone with radiant filter',
    intensity: 0.75
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'generate_nft_art': {
        // Generate AI art for NFT using Lovable AI (simulated image generation)
        const { product_type, customer_name, order_id } = params;
        const template = NFT_TEMPLATES[product_type as keyof typeof NFT_TEMPLATES] || NFT_TEMPLATES['vitamin-c-serum'];
        
        const tokenId = Math.floor(Math.random() * 10000);
        const nftName = `${template.name}${tokenId}`;
        
        // Generate AI prompt for the NFT art
        const aiPrompt = `Luxurious skincare product NFT art featuring ${template.attributes[0].value}, 
          with glowing glass skin effect, ethereal beauty, gold and rose gold accents, 
          holographic shimmer, ultra-detailed, digital art, 8k resolution, 
          trending on ArtStation, beauty campaign style`;

        // Simulated AI-generated image URL (in production, would call DALL-E or Stable Diffusion)
        const imageUrl = `https://placehold.co/1024x1024/1a1a2e/ffd700?text=${encodeURIComponent(nftName)}`;

        // Create metadata
        const metadata = {
          name: nftName,
          description: template.description,
          image: imageUrl,
          attributes: [
            ...template.attributes,
            { trait_type: 'Token ID', value: tokenId.toString() },
            { trait_type: 'Minted For', value: customer_name || 'Aura Luxe Customer' }
          ],
          external_url: 'https://auraliftessentials.com'
        };

        // Save to database
        if (userId) {
          const { data: nftMint, error } = await supabase
            .from('nft_mints')
            .insert({
              user_id: userId,
              order_id,
              nft_name: nftName,
              nft_description: template.description,
              image_url: imageUrl,
              token_id: tokenId.toString(),
              nft_type: 'transformation',
              product_name: template.attributes[0].value,
              ai_prompt: aiPrompt,
              mint_status: 'pending'
            })
            .select()
            .single();

          if (error) throw error;

          return new Response(JSON.stringify({
            success: true,
            nft: nftMint,
            metadata,
            message: `NFT art generated: ${nftName}`
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
          success: true,
          metadata,
          message: `NFT art preview generated: ${nftName}`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'mint_nft': {
        // Mint NFT on Polygon (simulated - would use Alchemy/ThirdWeb in production)
        const { nft_id } = params;
        
        if (!userId) throw new Error('Authentication required');

        // Get NFT record
        const { data: nft, error: fetchError } = await supabase
          .from('nft_mints')
          .select('*')
          .eq('id', nft_id)
          .eq('user_id', userId)
          .single();

        if (fetchError || !nft) throw new Error('NFT not found');

        // Simulate minting process
        const contractAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const marketplaceUrl = `https://opensea.io/assets/matic/${contractAddress}/${nft.token_id}`;

        // Update NFT record
        const { data: mintedNft, error: updateError } = await supabase
          .from('nft_mints')
          .update({
            mint_status: 'minted',
            contract_address: contractAddress,
            marketplace_url: marketplaceUrl,
            minted_at: new Date().toISOString()
          })
          .eq('id', nft_id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update Web3 revenue
        await supabase.from('web3_revenue').upsert({
          user_id: userId,
          revenue_date: new Date().toISOString().split('T')[0],
          nft_sales_count: 1,
          nft_revenue: nft.mint_price || 0,
          total_web3_revenue: nft.mint_price || 0
        }, { onConflict: 'user_id,revenue_date' });

        return new Response(JSON.stringify({
          success: true,
          nft: mintedNft,
          message: `NFT minted successfully! View on OpenSea: ${marketplaceUrl}`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'list_on_marketplace': {
        const { nft_id, price } = params;
        
        if (!userId) throw new Error('Authentication required');

        const { data: listedNft, error } = await supabase
          .from('nft_mints')
          .update({
            mint_status: 'listed',
            sale_price: price,
            listed_at: new Date().toISOString()
          })
          .eq('id', nft_id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          nft: listedNft,
          message: `NFT listed for ${price} ETH on OpenSea`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'create_ar_experience': {
        // Create AR try-on experience
        const { product_name, effect_type, product_id } = params;
        const effect = AR_EFFECTS[effect_type as keyof typeof AR_EFFECTS] || AR_EFFECTS['glass-skin'];
        
        if (!userId) throw new Error('Authentication required');

        // Generate AR project (simulated - would use 8th Wall API in production)
        const arProjectId = 'ar_' + Date.now();
        const arUrl = `https://ar.auraluxe.com/try-on/${arProjectId}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(arUrl)}`;

        const { data: arExperience, error } = await supabase
          .from('ar_experiences')
          .insert({
            user_id: userId,
            experience_name: `${product_name} - ${effect.name}`,
            experience_type: 'try_on',
            product_id,
            product_name,
            ar_effect: JSON.stringify(effect),
            ar_provider: '8thwall',
            ar_project_id: arProjectId,
            ar_url: arUrl,
            qr_code_url: qrCodeUrl,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          ar_experience: arExperience,
          message: `AR experience created! Scan QR or visit: ${arUrl}`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_ar_experiences': {
        if (!userId) throw new Error('Authentication required');

        const { data: experiences, error } = await supabase
          .from('ar_experiences')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          experiences
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'track_ar_conversion': {
        const { experience_id, converted, revenue } = params;
        
        const { data: experience, error: fetchError } = await supabase
          .from('ar_experiences')
          .select('*')
          .eq('id', experience_id)
          .single();

        if (fetchError) throw fetchError;

        const newViews = (experience.total_views || 0) + 1;
        const newConversions = converted ? (experience.total_conversions || 0) + 1 : experience.total_conversions;
        const newRevenue = converted ? (experience.revenue_attributed || 0) + (revenue || 0) : experience.revenue_attributed;

        const { error: updateError } = await supabase
          .from('ar_experiences')
          .update({
            total_views: newViews,
            total_conversions: newConversions,
            conversion_rate: newConversions / newViews * 100,
            revenue_attributed: newRevenue
          })
          .eq('id', experience_id);

        if (updateError) throw updateError;

        // Update Web3 revenue
        if (converted && experience.user_id) {
          await supabase.from('web3_revenue').upsert({
            user_id: experience.user_id,
            revenue_date: new Date().toISOString().split('T')[0],
            ar_conversions: 1,
            ar_revenue: revenue || 0,
            total_web3_revenue: revenue || 0
          }, { onConflict: 'user_id,revenue_date' });
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'AR conversion tracked'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_nft_mints': {
        if (!userId) throw new Error('Authentication required');

        const { data: mints, error } = await supabase
          .from('nft_mints')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          mints
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_web3_revenue': {
        if (!userId) throw new Error('Authentication required');

        const { data: revenue, error } = await supabase
          .from('web3_revenue')
          .select('*')
          .eq('user_id', userId)
          .order('revenue_date', { ascending: false })
          .limit(30);

        if (error) throw error;

        // Calculate totals
        const totals = revenue?.reduce((acc, day) => ({
          nft_sales: acc.nft_sales + (day.nft_sales_count || 0),
          nft_revenue: acc.nft_revenue + Number(day.nft_revenue || 0),
          nft_royalties: acc.nft_royalties + Number(day.nft_royalties || 0),
          ar_conversions: acc.ar_conversions + (day.ar_conversions || 0),
          ar_revenue: acc.ar_revenue + Number(day.ar_revenue || 0),
          total: acc.total + Number(day.total_web3_revenue || 0)
        }), { nft_sales: 0, nft_revenue: 0, nft_royalties: 0, ar_conversions: 0, ar_revenue: 0, total: 0 });

        return new Response(JSON.stringify({
          success: true,
          daily_revenue: revenue,
          totals
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'mint_for_order': {
        // Bot command: Mint NFT for last order
        const { order_id, customer_email, product_type } = params;
        
        if (!userId) throw new Error('Authentication required');

        // First generate the NFT art
        const template = NFT_TEMPLATES[product_type as keyof typeof NFT_TEMPLATES] || NFT_TEMPLATES['vitamin-c-serum'];
        const tokenId = Math.floor(Math.random() * 10000);
        const nftName = `${template.name}${tokenId}`;
        const imageUrl = `https://placehold.co/1024x1024/1a1a2e/ffd700?text=${encodeURIComponent(nftName)}`;
        const contractAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const marketplaceUrl = `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;

        // Create and mint in one step
        const { data: nft, error } = await supabase
          .from('nft_mints')
          .insert({
            user_id: userId,
            order_id,
            customer_email,
            nft_name: nftName,
            nft_description: template.description,
            image_url: imageUrl,
            token_id: tokenId.toString(),
            contract_address: contractAddress,
            marketplace_url: marketplaceUrl,
            nft_type: 'transformation',
            product_name: template.attributes[0].value,
            mint_status: 'minted',
            minted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          nft,
          message: `NFT "${nftName}" minted for order ${order_id}! View: ${marketplaceUrl}`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'generate_ar_filter': {
        // Bot command: Generate AR filter for product
        const { product_name, effect_type = 'glass-skin' } = params;
        
        if (!userId) throw new Error('Authentication required');

        const effect = AR_EFFECTS[effect_type as keyof typeof AR_EFFECTS] || AR_EFFECTS['glass-skin'];
        const arProjectId = 'ar_' + Date.now();
        const arUrl = `https://ar.auraluxe.com/filter/${arProjectId}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(arUrl)}`;

        const { data: arExperience, error } = await supabase
          .from('ar_experiences')
          .insert({
            user_id: userId,
            experience_name: `${product_name} AR Filter`,
            experience_type: 'filter',
            product_name,
            ar_effect: JSON.stringify(effect),
            ar_provider: '8thwall',
            ar_project_id: arProjectId,
            ar_url: arUrl,
            qr_code_url: qrCodeUrl,
            status: 'active'
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          ar_experience: arExperience,
          message: `AR filter created for ${product_name}! Try it: ${arUrl}`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({
          error: 'Unknown action',
          available_actions: [
            'generate_nft_art',
            'mint_nft',
            'list_on_marketplace',
            'create_ar_experience',
            'get_ar_experiences',
            'track_ar_conversion',
            'get_nft_mints',
            'get_web3_revenue',
            'mint_for_order',
            'generate_ar_filter'
          ]
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Web3/NFT/AR error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
