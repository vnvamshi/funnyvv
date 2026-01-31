# VistaView.live Deployment Guide

## Global Affiliate Aggregator - Ready for Launch

**Domain**: vistaview.live
**Company**: Vista View Realty Services LLC
**Owner**: Naga Vamshi Krishna Vuppaladadiyam

---

## What's Been Built

### 1. Global Affiliate Router (100+ Retailers)

**File**: `src/services/GlobalAffiliateRouter.ts`

Supports retailers across 12 countries:

| Region | Retailers |
|--------|-----------|
| 🇺🇸 US | Amazon, Wayfair, IKEA, Target, Walmart, Home Depot, Overstock, West Elm, Pottery Barn, CB2, Crate & Barrel, Article, AllModern, Joss & Main, Z Gallerie, Rooms To Go, Ashley, Ethan Allen, Havertys (20+) |
| 🇮🇳 India | Amazon India, Flipkart, Pepperfry, Urban Ladder, WoodenStreet, Godrej Interio, IKEA India, Home Centre, FabIndia, HomeTown, Durian (11+) |
| 🇬🇧 UK | Amazon UK, Wayfair UK, IKEA UK, John Lewis, Made.com, Dunelm, Argos (7+) |
| 🇩🇪 Germany | Amazon DE, IKEA DE, Wayfair DE, OTTO, Höffner (5+) |
| 🇫🇷 France | Amazon FR, IKEA FR, Maisons du Monde, Conforama (4+) |
| 🇮🇹 Italy | Amazon IT, IKEA IT (2+) |
| 🇪🇸 Spain | Amazon ES, IKEA ES (2+) |
| 🇨🇳 China | Taobao, Tmall, JD.com (3+) |
| 🇯🇵 Japan | Amazon JP, Rakuten, IKEA JP, Nitori (4+) |
| 🇦🇺 Australia | Amazon AU, Temple & Webster, IKEA AU, Fantastic Furniture (4+) |
| 🇧🇷 Brazil | Amazon BR, Magazine Luiza (2+) |
| 🇦🇪 UAE | Amazon AE, Home Box, IKEA AE (3+) |

### 2. Pages Created

| Page | Route | Purpose |
|------|-------|---------|
| Affiliate Landing | `/affiliate`, `/shop` | Main entry point for vistaview.live |
| Compare Prices | `/compare`, `/search` | Search & compare across retailers |
| Privacy Policy | `/privacy` | GDPR/CCPA compliant |
| Terms of Service | `/terms` | Legal terms |
| Affiliate Disclosure | `/disclosure` | FTC compliant disclosure |

### 3. Backend APIs

| Endpoint | Purpose |
|----------|---------|
| `POST /api/analytics/affiliate-click` | Track clicks |
| `GET /api/analytics/stats` | Get analytics |
| `GET /api/analytics/revenue-estimate` | Estimate revenue |
| `GET /api/analytics/export` | Export to CSV |
| `POST /api/leads/capture` | Capture leads |
| `GET /api/leads` | View leads |
| `GET /api/leads/stats` | Lead statistics |

### 4. Configured Credentials

| Service | Status | Tag/Key |
|---------|--------|---------|
| Amazon Associates (US) | ✅ Configured | `visataview-20` |
| Stripe | ✅ Configured | Test keys in .env |

---

## Deployment Steps

### Option A: Vercel (Recommended - FREE)

1. **Push to GitHub**
```bash
git add .
git commit -m "VistaView.live global affiliate aggregator"
git push origin main
```

2. **Connect to Vercel**
- Go to https://vercel.com
- Import your GitHub repository
- Vercel will auto-detect Vite settings

3. **Add Custom Domain**
- In Vercel dashboard → Settings → Domains
- Add `vistaview.live`
- Update DNS on GoDaddy:
  - Type: A, Name: @, Value: 76.76.21.21
  - Type: CNAME, Name: www, Value: cname.vercel-dns.com

4. **Set Environment Variables in Vercel**
```
VITE_APP_NAME=VistaView Live
VITE_APP_URL=https://vistaview.live
VITE_AMAZON_AFFILIATE_TAG=visataview-20
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Svh4KLQVR2o6CpTbQ0fupbGjJkNHHePMDYyWvSMaeWzUefujwzi29598W514Dxa0ThlV8WFW0yBt3dr75qBf0s400VamtxqoT
```

### Option B: Manual Deploy

```bash
# Build
npm run build

# The `dist` folder contains the static site
# Upload to any static host (Netlify, Cloudflare Pages, AWS S3, etc.)
```

---

## Affiliate Network Signup Checklist

### Priority 1 - Sign Up Immediately (Free)

| Network | URL | Partners |
|---------|-----|----------|
| Amazon Associates | https://affiliate-program.amazon.com/ | Amazon (all countries) |
| Awin | https://www.awin.com/ | IKEA, Wayfair, John Lewis, 15,000+ |
| CJ Affiliate | https://www.cj.com/ | Overstock, CB2, Crate & Barrel |
| ShareASale | https://www.shareasale.com/ | Article, Ethan Allen, Z Gallerie |
| Rakuten | https://rakutenadvertising.com/ | West Elm, Pottery Barn, Lowe's |

### Priority 2 - Regional Networks

| Network | URL | Region |
|---------|-----|--------|
| Cuelinks | https://www.cuelinks.com/ | India |
| Admitad | https://www.admitad.com/ | Europe/Middle East |
| Commission Factory | https://www.commissionfactory.com/ | Australia |
| Alimama | https://www.alimama.com/ | China |

---

## Revenue Model

### Affiliate Commissions
- Average commission: 3-8% per sale
- Average furniture order: $300-800
- Average commission per sale: $12-64
- Industry click-to-purchase rate: 1-3%

### Example Revenue (1000 daily visitors)
- 1000 visitors × 30% click-through = 300 clicks/day
- 300 clicks × 2% conversion = 6 purchases/day
- 6 purchases × $35 avg commission = $210/day
- Monthly: ~$6,300

### Lead Generation (Skyven Tower)
- Hot leads: $200-500 each
- Warm leads: $50-150 each
- Cold leads: $10-30 each

---

## DNS Setup on GoDaddy

1. Log into GoDaddy → My Products → DNS
2. Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 600 |
| CNAME | www | cname.vercel-dns.com | 600 |

3. Wait 15-30 minutes for propagation
4. Verify at https://vistaview.live

---

## Files Reference

### Frontend
```
src/services/GlobalAffiliateRouter.ts  # 100+ retailers
src/pages/AffiliateLanding.tsx         # Landing page
src/pages/ComparePrices.tsx            # Search & compare
src/pages/legal/PrivacyPolicy.tsx      # Privacy policy
src/pages/legal/TermsOfService.tsx     # Terms
src/pages/legal/AffiliateDisclosure.tsx # FTC disclosure
src/components/AffiliateProductCard.tsx # Product card
```

### Backend
```
backend/routes/affiliate-analytics.cjs # Click tracking
backend/routes/leads.cjs               # Lead capture
```

### Config
```
.env.production                        # Environment vars
vercel.json                            # Vercel config
```

---

## Testing Locally

```bash
# Start frontend
npm run dev

# Start backend (in another terminal)
cd backend && npm start

# Visit:
# http://localhost:5180/affiliate - Landing page
# http://localhost:5180/compare - Compare prices
# http://localhost:5180/disclosure - Affiliate disclosure
```

---

## Legal Compliance ✅

- [x] Privacy Policy (GDPR + CCPA compliant)
- [x] Terms of Service
- [x] Affiliate Disclosure (FTC compliant)
- [x] Cookie notice in pages
- [x] "We may earn a commission" notices on product cards

---

## Next Steps After Deployment

1. **Sign up for affiliate networks** (see checklist above)
2. **Update affiliate tags** in GlobalAffiliateRouter.ts as you get approved
3. **Drive traffic**:
   - SEO: Add meta tags, sitemap
   - Social: Share on Pinterest, Instagram
   - Content: Write comparison articles
4. **Monitor analytics** at `/api/analytics/stats`
5. **Switch Stripe to production keys** when ready for payments

---

© 2026 Vista View Realty Services LLC. All Rights Reserved.
