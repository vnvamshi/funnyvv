# VistaView AI Agent Training Document

## 🎯 Purpose
This document trains the VistaView Agentic AI to understand and process:
- User voice commands
- File uploads and extraction
- Product/Property management
- System interactions

---

## 📋 Core Concepts

### 1. User Roles
| Role | Purpose | Data Goes To |
|------|---------|--------------|
| **Vendor** | Sells products/materials | Product Catalog |
| **Builder** | Construction projects | Real Estate (Projects) |
| **Agent** | Property listings | Real Estate (Sale/Rent) |
| **Customer** | Browse & shop | N/A |
| **Home Buyer** | Find homes | N/A |
| **Investor** | Investment opportunities | N/A |

### 2. The 5-Step Extraction Process
```
STEP 1: UPLOAD
  → File uploaded to MinIO storage
  → URL generated for processing
  → File metadata saved to database

STEP 2: EXTRACT
  → PDF: Parse text using pdf-parse
  → Excel: Parse with xlsx library
  → Images: OCR if needed
  → Extract raw content

STEP 3: PROCESS
  → Identify products/properties from text
  → Extract prices (pattern: $XX.XX)
  → Extract SKUs (pattern: SKU-XXXXX)
  → Extract dimensions (pattern: XX x XX)
  → Categorize items

STEP 4: VECTORIZE
  → Generate embeddings for semantic search
  → Store in document_vectors table
  → Enable similarity search

STEP 5: PUBLISH
  → Insert into products/properties table
  → Update catalog/listings page
  → Notify user of completion
```

### 3. Voice Command Patterns

#### Phone Number Entry
```
User says: "seven zero three four five six seven eight nine zero"
AI should: Convert to digits → "7034567890"
           Fill phone input field
           Speak: "Phone number complete!"
```

#### Company Description
```
User says: "My company is ABC Construction and we build custom homes"
AI should: Extract company name → "ABC Construction"
           Extract services → "build custom homes"
           Fill both fields
           Speak: "Got it, ABC Construction."
```

#### Beautify Command
```
User says: "beautify" or "enhance" or "improve"
AI should: Take current description
           Enhance with professional language
           Add relevant keywords
           Speak: "Description enhanced!"
```

#### Navigation Commands
```
"next" or "continue" → Go to next step
"back" or "previous" → Go to previous step
"clear" or "reset" → Clear current field
"save" → Save current data
```

### 4. File Upload Patterns

#### Voice File Search
```
User says: "Upload the vistaview catalog from downloads"
AI should: 1. Search ~/Downloads for "vistaview catalog"
           2. Find best matching file
           3. Show match to user
           4. Ask "Say upload to confirm"
```

#### Supported File Types
| Category | Extensions | Processing |
|----------|-----------|------------|
| Catalog | .pdf, .xlsx, .csv | Extract products |
| Images | .jpg, .png, .webp | Upload to MinIO |
| CAD | .dwg, .dxf | Store reference |
| 3D | .glb, .obj, .fbx | Store reference |
| Video | .mp4, .mov | Upload to MinIO |

### 5. Product Extraction Patterns

#### From PDF Text
```
Input: "Premium Hardwood Flooring - $8.99/sqft - SKU: HWF-001"
Output: {
  name: "Premium Hardwood Flooring",
  price: 8.99,
  sku: "HWF-001",
  unit: "sqft"
}
```

#### From Excel
```
| Product Name | Price | SKU | Category |
|--------------|-------|-----|----------|
| Oak Flooring | 12.99 | OF-100 | Flooring |

Output: {
  name: "Oak Flooring",
  price: 12.99,
  sku: "OF-100",
  category: "Flooring"
}
```

---

## 🎤 Voice Comment Processing

### What to Extract from Voice
```
User says: "We have premium oak flooring for twelve dollars 
            per square foot, it's waterproof and comes in 
            three colors: natural, walnut, and gray."

AI should extract:
- Product: "premium oak flooring"
- Price: $12.00
- Features: ["waterproof"]
- Variants: ["natural", "walnut", "gray"]
- Unit: "per square foot"
```

### Store Voice Comments
Every voice comment should be:
1. Transcribed to text
2. Saved to voice_comments table
3. Processed for extraction
4. Linked to user profile

---

## 🚶 Walker Behavior

### Element Discovery
```javascript
// Find interactive elements
selectors = 'button, input, textarea, select, a, [role="button"], .clickable'

// Filter visible elements
visible = elements.filter(el => 
  rect.width > 0 && 
  rect.height > 0 && 
  display !== 'none'
)

// Sort by position (top-to-bottom, left-to-right)
sorted = visible.sort((a, b) => 
  Math.abs(a.top - b.top) < 20 
    ? a.left - b.left 
    : a.top - b.top
)
```

### Walker Actions
1. Move cursor to element center
2. Highlight element (outline + glow)
3. Speak element label
4. Wait 3 seconds
5. Move to next element

---

## 📊 Dashboard Metrics

### What to Track
- Total vendors, builders, agents
- Total products, properties
- Total uploads, voice comments
- Recent activity
- Processing status

### Voice Queries for Dashboard
```
"How many vendors?" → "You have X registered vendors"
"Product count?" → "There are X products in the catalog"
"Summary" → "X vendors, X builders, X agents, X products"
```

---

## 🔄 Training Tasks for AI Agent

### Task 1: Phone Number Recognition
Practice converting spoken numbers to digits:
- "one two three" → "123"
- "triple seven" → "777"
- "double oh" → "00"

### Task 2: Company Extraction
Practice extracting company names:
- "I'm from ABC Corp" → "ABC Corp"
- "This is XYZ Industries" → "XYZ Industries"
- "My company is called Best Builders" → "Best Builders"

### Task 3: Price Detection
Practice extracting prices:
- "twelve dollars" → 12.00
- "$8.99" → 8.99
- "fifty cents" → 0.50
- "two thousand five hundred" → 2500.00

### Task 4: Product Parsing
Practice parsing product lines:
- "Oak Flooring $12.99 SKU-100" → {name, price, sku}
- "Granite Counter - 75.00/sqft" → {name, price, unit}

### Task 5: Voice Command Response
Practice responding to commands:
- "next" → Navigate forward
- "beautify" → Enhance description
- "guide me" → Start walker
- "what's the price" → Answer about current product

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  AgenticPageWrapper (voice + walker on every page)          │
│  ├── WhoAreYouModal (role selection)                        │
│  ├── VendorFlow / BuilderFlow / AgentFlow                   │
│  ├── ProductCatalogPage (products + per-product AgenticBar) │
│  ├── RealEstatePage (properties + per-property AgenticBar)  │
│  └── Dashboard (stats + downloads search)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│  Express Server (port 1117)                                 │
│  ├── /api/upload/minio (file uploads)                       │
│  ├── /api/extract-products (5-step pipeline)                │
│  ├── /api/vectorize (embeddings)                            │
│  ├── /api/products (CRUD)                                   │
│  ├── /api/properties (CRUD)                                 │
│  ├── /api/voice-comments (save/process)                     │
│  ├── /api/beautify (text enhancement)                       │
│  ├── /api/dashboard/stats (metrics)                         │
│  └── /api/downloads (file search)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       STORAGE                                │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (database)          MinIO (files)               │
│  ├── vendors                    ├── vistaview-uploads/      │
│  ├── builders                   │   ├── vendor/             │
│  ├── agents                     │   ├── builder/            │
│  ├── products                   │   └── agent/              │
│  ├── properties                 │                           │
│  ├── file_uploads               │                           │
│  ├── voice_comments             │                           │
│  └── document_vectors           │                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist for AI Agent

- [ ] Understand all 6 user roles
- [ ] Process phone numbers from voice
- [ ] Extract company names from speech
- [ ] Detect prices in various formats
- [ ] Parse product lines from PDFs
- [ ] Handle file uploads to MinIO
- [ ] Execute 5-step extraction pipeline
- [ ] Generate and use embeddings
- [ ] Navigate walker through elements
- [ ] Respond to voice commands
- [ ] Update dashboard metrics
- [ ] Search downloads folder

---

## 🎯 Success Criteria

The AI Agent is trained when it can:
1. Complete vendor registration entirely by voice
2. Upload a PDF catalog and extract products
3. Answer questions about any product
4. Guide a user through the entire flow
5. Provide accurate dashboard statistics
6. Find and upload files from Downloads

---

*Document Version: 1.0*
*Last Updated: January 2026*
