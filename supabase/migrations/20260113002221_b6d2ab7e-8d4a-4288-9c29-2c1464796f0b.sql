-- Create table for NFT minting and tracking
CREATE TABLE public.nft_mints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id TEXT,
  customer_email TEXT,
  nft_name TEXT NOT NULL,
  nft_description TEXT,
  image_url TEXT,
  metadata_url TEXT,
  token_id TEXT,
  contract_address TEXT,
  blockchain TEXT DEFAULT 'polygon',
  marketplace_url TEXT,
  mint_status TEXT DEFAULT 'pending' CHECK (mint_status IN ('pending', 'minting', 'minted', 'listed', 'sold', 'failed')),
  mint_price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2),
  royalty_percentage DECIMAL(5,2) DEFAULT 5.0,
  nft_type TEXT DEFAULT 'transformation' CHECK (nft_type IN ('transformation', 'loyalty', 'exclusive', 'ar_filter', 'collection')),
  product_id TEXT,
  product_name TEXT,
  ai_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  minted_at TIMESTAMP WITH TIME ZONE,
  listed_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AR experiences
CREATE TABLE public.ar_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experience_name TEXT NOT NULL,
  experience_type TEXT DEFAULT 'try_on' CHECK (experience_type IN ('try_on', 'filter', 'transformation', 'product_preview')),
  product_id TEXT,
  product_name TEXT,
  ar_effect TEXT NOT NULL,
  ar_provider TEXT DEFAULT '8thwall',
  ar_project_id TEXT,
  preview_image_url TEXT,
  ar_url TEXT,
  qr_code_url TEXT,
  total_views INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue_attributed DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Web3 revenue tracking
CREATE TABLE public.web3_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  nft_sales_count INT DEFAULT 0,
  nft_revenue DECIMAL(10,2) DEFAULT 0,
  nft_royalties DECIMAL(10,2) DEFAULT 0,
  ar_conversions INT DEFAULT 0,
  ar_revenue DECIMAL(10,2) DEFAULT 0,
  total_web3_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, revenue_date)
);

-- Enable RLS
ALTER TABLE public.nft_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web3_revenue ENABLE ROW LEVEL SECURITY;

-- RLS policies for nft_mints
CREATE POLICY "Users can view their own NFT mints" ON public.nft_mints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own NFT mints" ON public.nft_mints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own NFT mints" ON public.nft_mints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own NFT mints" ON public.nft_mints FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for ar_experiences
CREATE POLICY "Users can view their own AR experiences" ON public.ar_experiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AR experiences" ON public.ar_experiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AR experiences" ON public.ar_experiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own AR experiences" ON public.ar_experiences FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for web3_revenue
CREATE POLICY "Users can view their own Web3 revenue" ON public.web3_revenue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own Web3 revenue" ON public.web3_revenue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own Web3 revenue" ON public.web3_revenue FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_nft_mints_updated_at BEFORE UPDATE ON public.nft_mints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ar_experiences_updated_at BEFORE UPDATE ON public.ar_experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_web3_revenue_updated_at BEFORE UPDATE ON public.web3_revenue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_nft_mints_user_id ON public.nft_mints(user_id);
CREATE INDEX idx_nft_mints_status ON public.nft_mints(mint_status);
CREATE INDEX idx_nft_mints_type ON public.nft_mints(nft_type);
CREATE INDEX idx_ar_experiences_user_id ON public.ar_experiences(user_id);
CREATE INDEX idx_ar_experiences_status ON public.ar_experiences(status);
CREATE INDEX idx_web3_revenue_user_id ON public.web3_revenue(user_id);
CREATE INDEX idx_web3_revenue_date ON public.web3_revenue(revenue_date);