# AURAOMEGA – Autonomous Revenue Operating System

> **The World's Most Advanced Self-Running CEO System with 99% Profit Certainty**

---

## 🌐 Dual-Domain Production Architecture

| Domain | Purpose | Status |
|--------|---------|--------|
| **[profitreaper.com](https://profitreaper.com)** | Primary Application | 🟢 LIVE |
| **[omegaalpha.io](https://omegaalpha.io)** | Tech Docs & API | 🟢 LIVE |
| [profitreaper.vercel.app](https://profitreaper.vercel.app) | Staging/Preview | 🟡 STAGING |

### Shopify Integration
- **Multi-Tenant**: Each user connects their own Shopify store via OAuth
- **Storefront API**: Products synced per-user with real-time data
- **Dynamic Config**: All store URLs and tokens fetched from user_store_connections

---

## 🚀 Quick Start

1. **Access App**: Visit [profitreaper.com](https://profitreaper.com)
2. **Connect Store**: Add your Shopify store via OAuth
3. **Generate Videos**: Create AI video ads with D-ID Pro
4. **Post Everywhere**: TikTok, Instagram, Pinterest, YouTube
5. **Scale Winners**: Super Grok CEO auto-scales profitable content

---

## 🎯 Core Features

### Multi-Model AI Engine
- **Grok 4** (xAI) – Complex reasoning & strategy
- **GPT-5** (OpenAI) – General intelligence
- **Claude 4** (Anthropic) – Nuanced analysis
- **Gemini 2.5** (Google) – Multimodal processing
- **Llama 3.3** (Groq) – Ultra-fast inference

### Video Generation
- **D-ID Pro** – Avatar-based video ads
- **ElevenLabs** – Premium voice synthesis
- **Real-time rendering** – 60-second turnaround

### Social Publishing
- TikTok Shop integration
- Pinterest Rich Pins
- Instagram Reels
- YouTube Shorts
- Multi-platform scheduling

### Super Grok CEO
- Autonomous decision engine
- Real-time market analysis
- Auto-scaling profitable content
- Kill underperformers instantly

---

## 🔧 Vercel Deployment

### Auto-Deploy Workflow
GitHub Actions automatically deploys on push to `main`:
```yaml
# .github/workflows/vercel-deploy.yml
- Push to main → Build → Deploy to Vercel
- Pull requests → Preview URL generated
```

### Domain Configuration

#### Primary Domain (profitreaper.com)
```
Type: A
Host: @
Value: 76.76.19.61

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

#### Alias Domain (omegaalpha.io)
```
Type: A
Host: @
Value: 76.76.19.61

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### Vercel Settings
- **Speed Insights**: Enabled (real user metrics)
- **Spend Management**: $50/month alert
- **Preview Deployments**: Auto on PRs
- **SSL**: Auto-provisioned

---

## 🔐 Environment Variables

### Vercel (Production)
```
VITE_SUPABASE_URL=https://phpektarjfbgnuyqjnmj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
```

### Supabase Edge Functions
```
DID_API_KEY=***
ELEVENLABS_API_KEY=***
XAI_API_KEY=***
LOVABLE_API_KEY=***
SHOPIFY_ACCESS_TOKEN=***
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PROFITREAPER.COM                     │
│                   (Primary Domain)                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │Dashboard│  │Video Ad │  │ Social  │  │  Super  │    │
│  │  Panel  │  │ Studio  │  │Channels │  │Grok CEO │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       │            │            │            │          │
│  ┌────▼────────────▼────────────▼────────────▼────┐    │
│  │              Supabase Edge Functions            │    │
│  │  • D-ID Video Gen    • Multi-Model AI          │    │
│  │  • Social Publishing • Shopify Sync            │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│  ┌─────────────────────▼───────────────────────────┐    │
│  │              Supabase Database                   │    │
│  │  • ads, creatives, channels                     │    │
│  │  • user_shopify_connections                     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    OMEGAALPHA.IO                        │
│                  (Tech Docs Domain)                      │
├─────────────────────────────────────────────────────────┤
│  • API Documentation                                    │
│  • Integration Guides                                   │
│  • Developer Resources                                  │
│  • Webhook References                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Development

### Local Setup
```bash
npm install
npm run dev
```

### Deploy to Vercel
```bash
# Automatic via GitHub Actions
git push origin main

# Manual
vercel --prod
```

### Supabase Functions
```bash
# Functions auto-deploy via Lovable Cloud
# View logs in Supabase dashboard
```

---

## 📈 Metrics & Monitoring

- **Vercel Speed Insights**: Real user performance
- **Supabase Analytics**: Edge function logs
- **Custom Dashboards**: Revenue, ROAS, engagement

---

## 🔗 Quick Links

- **App**: [profitreaper.com](https://profitreaper.com)
- **Docs**: [omegaalpha.io](https://omegaalpha.io)
- **Store**: [auraliftessentials.com](https://www.auraliftessentials.com)
- **GitHub**: Connected via Lovable

---

## 📝 License

Proprietary – AURAOMEGA/Dominion © 2025

---

**Launch Complete – Real Revenue Mode Active** 🚀💰
