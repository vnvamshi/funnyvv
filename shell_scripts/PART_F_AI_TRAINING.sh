#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  PART F: AI AGENT TRAINING + UNIVERSAL LOGIC + MISSING PIECES
#  
#  Features:
#  1. Training document for Agentic AI
#  2. Universal AgenticPageWrapper for ALL pages
#  3. Complete flow integration
#  4. Training tasks for AI agent
#  5. System architecture documentation
#  6. Everything missing consolidated
#═══════════════════════════════════════════════════════════════════════════════

VV="$HOME/vistaview_WORKING"
COMPONENTS_DIR="$VV/src/components"
DOCS_DIR="$VV/docs"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🤖 PART F: AI AGENT TRAINING + UNIVERSAL LOGIC"
echo "═══════════════════════════════════════════════════════════════════════════════"

mkdir -p "$DOCS_DIR"
mkdir -p "$COMPONENTS_DIR/core"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Create Universal AgenticPageWrapper
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📦 Creating Universal AgenticPageWrapper..."

cat > "$COMPONENTS_DIR/core/AgenticPageWrapper.tsx" << 'AGENTICWRAPPER'
import React, { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

interface AgenticPageWrapperProps {
  children: ReactNode;
  pageName: string;
  pageDescription?: string;
  welcomeMessage?: string;
  onVoiceCommand?: (command: string) => void;
  walkerSelectors?: string;
  accentColor?: string;
  showOnLoad?: boolean;
}

/**
 * UNIVERSAL AGENTIC PAGE WRAPPER
 * 
 * Wrap any page with this component to add:
 * - Floating AgenticBar
 * - Walking cursor that guides users
 * - Voice commands
 * - Page-level voice navigation
 * 
 * Usage:
 * <AgenticPageWrapper pageName="Product Catalog" welcomeMessage="Welcome to products!">
 *   <YourPageContent />
 * </AgenticPageWrapper>
 */
const AgenticPageWrapper: React.FC<AgenticPageWrapperProps> = ({
  children,
  pageName,
  pageDescription,
  welcomeMessage,
  onVoiceCommand,
  walkerSelectors = 'button, a, input, select, textarea, [role="button"], .clickable, .card',
  accentColor = '#10b981',
  showOnLoad = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [walkerActive, setWalkerActive] = useState(false);
  const [walkerPosition, setWalkerPosition] = useState({ x: 0, y: 0 });
  const [showBar, setShowBar] = useState(showOnLoad);
  const [currentElement, setCurrentElement] = useState<string>('');
  const [elements, setElements] = useState<HTMLElement[]>([]);
  const [elementIndex, setElementIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);

        if (event.results[event.resultIndex].isFinal) {
          handleCommand(text.toLowerCase());
          onVoiceCommand?.(text);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    // Welcome message
    if (welcomeMessage && showOnLoad) {
      setTimeout(() => speak(welcomeMessage), 500);
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    synthRef.current.speak(u);
  }, []);

  // Universal voice commands
  const handleCommand = (text: string) => {
    // Navigation
    if (text.includes('scroll down')) {
      window.scrollBy({ top: 400, behavior: 'smooth' });
      speak('Scrolling down');
    }
    else if (text.includes('scroll up')) {
      window.scrollBy({ top: -400, behavior: 'smooth' });
      speak('Scrolling up');
    }
    else if (text.includes('go to top') || text.includes('top of page')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      speak('Going to top');
    }
    else if (text.includes('go to bottom') || text.includes('bottom of page')) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      speak('Going to bottom');
    }
    // Walker controls
    else if (text.includes('start guide') || text.includes('guide me') || text.includes('show me around')) {
      setWalkerActive(true);
      speak('Starting guided tour');
    }
    else if (text.includes('stop guide') || text.includes('stop tour')) {
      setWalkerActive(false);
      speak('Tour stopped');
    }
    else if (text.includes('next')) {
      if (walkerActive) moveToNextElement();
    }
    else if (text.includes('previous') || text.includes('back')) {
      if (walkerActive) moveToPreviousElement();
    }
    // Bar controls
    else if (text.includes('hide bar') || text.includes('hide menu')) {
      setShowBar(false);
      speak('Bar hidden');
    }
    else if (text.includes('show bar') || text.includes('show menu')) {
      setShowBar(true);
      speak('Bar shown');
    }
    // Click element
    else if (text.includes('click') || text.includes('select') || text.includes('press')) {
      if (walkerActive && elements[elementIndex]) {
        elements[elementIndex].click();
        speak(`Clicked ${currentElement}`);
      }
    }
    // Help
    else if (text.includes('help') || text.includes('what can')) {
      speak(`On ${pageName}, you can say: scroll up, scroll down, guide me, next, click, or hide bar.`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        speak(`Listening on ${pageName}`);
      } catch (e) {}
    }
  };

  // Walker logic - discover elements
  useEffect(() => {
    if (!walkerActive || !containerRef.current) return;

    const discovered = Array.from(
      containerRef.current.querySelectorAll(walkerSelectors)
    ) as HTMLElement[];

    const visible = discovered.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && 
             style.display !== 'none' && 
             style.visibility !== 'hidden' &&
             style.opacity !== '0';
    });

    // Sort by position
    visible.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      if (Math.abs(aRect.top - bRect.top) < 20) {
        return aRect.left - bRect.left;
      }
      return aRect.top - bRect.top;
    });

    setElements(visible);
    setElementIndex(0);
    
    if (visible.length > 0) {
      moveToElement(visible[0], 0);
    }
  }, [walkerActive, walkerSelectors]);

  // Move walker to element
  const moveToElement = (el: HTMLElement, idx: number) => {
    const rect = el.getBoundingClientRect();
    setWalkerPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    
    // Highlight
    el.style.outline = `2px solid ${accentColor}`;
    el.style.outlineOffset = '3px';
    el.style.boxShadow = `0 0 20px ${accentColor}40`;
    
    setTimeout(() => {
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.boxShadow = '';
    }, 800);
    
    // Get label
    const label = el.getAttribute('aria-label') || 
                  el.getAttribute('placeholder') ||
                  el.textContent?.trim().substring(0, 30) ||
                  el.tagName.toLowerCase();
    setCurrentElement(label || 'element');
    
    // Scroll into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const moveToNextElement = () => {
    const nextIdx = (elementIndex + 1) % elements.length;
    setElementIndex(nextIdx);
    if (elements[nextIdx]) {
      moveToElement(elements[nextIdx], nextIdx);
      speak(currentElement);
    }
  };

  const moveToPreviousElement = () => {
    const prevIdx = (elementIndex - 1 + elements.length) % elements.length;
    setElementIndex(prevIdx);
    if (elements[prevIdx]) {
      moveToElement(elements[prevIdx], prevIdx);
    }
  };

  // Auto-advance walker
  useEffect(() => {
    if (!walkerActive || elements.length === 0) return;

    const interval = setInterval(() => {
      moveToNextElement();
    }, 3000);

    return () => clearInterval(interval);
  }, [walkerActive, elements, elementIndex]);

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: '100vh' }}>
      {children}

      {/* Walking Cursor */}
      {walkerActive && (
        <div
          style={{
            position: 'fixed',
            left: walkerPosition.x,
            top: walkerPosition.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            fontSize: 32,
            transition: 'all 0.4s ease-out',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          }}
        >
          👆
        </div>
      )}

      {/* Target Label */}
      {walkerActive && currentElement && (
        <div
          style={{
            position: 'fixed',
            left: walkerPosition.x,
            top: walkerPosition.y + 40,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)',
            color: accentColor,
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: '0.8em',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {currentElement}
        </div>
      )}

      {/* Floating AgenticBar */}
      {showBar && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 25,
            padding: '10px 20px',
            border: `2px solid ${isListening ? accentColor : 'rgba(255,255,255,0.1)'}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Status indicator */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isListening ? accentColor : walkerActive ? '#f59e0b' : '#64748b',
              animation: isListening ? 'pulse 1s infinite' : 'none',
              boxShadow: isListening ? `0 0 10px ${accentColor}` : 'none'
            }}
          />

          {/* Page name */}
          <span style={{ color: '#94a3b8', fontSize: '0.85em', fontWeight: 500 }}>
            {pageName}
          </span>

          {/* Waveform */}
          {isListening && (
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 2,
                    background: accentColor,
                    borderRadius: 1,
                    animation: `wave 0.3s ease-in-out ${i * 0.05}s infinite alternate`,
                    height: 8
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <span
              style={{
                color: '#e2e8f0',
                fontSize: '0.85em',
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              "{transcript}"
            </span>
          )}

          {/* Listen button */}
          <button
            onClick={toggleListening}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              background: isListening ? '#ef4444' : accentColor,
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>

          {/* Walker button */}
          <button
            onClick={() => setWalkerActive(!walkerActive)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: `1px solid ${walkerActive ? accentColor : 'rgba(255,255,255,0.2)'}`,
              background: walkerActive ? `${accentColor}20` : 'transparent',
              color: walkerActive ? accentColor : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            {walkerActive ? '⏸️' : '🚶'}
          </button>

          {/* Close button */}
          <button
            onClick={() => setShowBar(false)}
            style={{
              padding: '4px 8px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.8em'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Show bar button when hidden */}
      {!showBar && (
        <button
          onClick={() => setShowBar(true)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.95)',
            border: `2px solid ${accentColor}30`,
            color: accentColor,
            fontSize: 20,
            cursor: 'pointer',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🎤
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes wave {
          from { height: 4px; }
          to { height: 14px; }
        }
      `}</style>
    </div>
  );
};

export default AgenticPageWrapper;
AGENTICWRAPPER

echo "  ✅ AgenticPageWrapper.tsx"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Create AI Agent Training Document
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📚 Creating AI Agent Training Document..."

cat > "$DOCS_DIR/AI_AGENT_TRAINING.md" << 'AITRAINING'
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
AITRAINING

echo "  ✅ AI_AGENT_TRAINING.md"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Create Training Tasks JSON
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📋 Creating training tasks..."

cat > "$DOCS_DIR/training_tasks.json" << 'TRAININGTASKS'
{
  "version": "1.0",
  "created": "2026-01-04",
  "training_tasks": [
    {
      "id": "task-001",
      "category": "phone_recognition",
      "difficulty": "easy",
      "input": "seven zero three four five six seven eight nine zero",
      "expected_output": "7034567890",
      "validation": "10 digits"
    },
    {
      "id": "task-002",
      "category": "phone_recognition",
      "difficulty": "medium",
      "input": "triple eight five five five one two three four",
      "expected_output": "8885551234",
      "validation": "10 digits"
    },
    {
      "id": "task-003",
      "category": "company_extraction",
      "difficulty": "easy",
      "input": "My company is ABC Construction",
      "expected_output": {"company": "ABC Construction"},
      "validation": "company name extracted"
    },
    {
      "id": "task-004",
      "category": "company_extraction",
      "difficulty": "medium",
      "input": "I'm from Best Home Builders LLC and we do residential construction",
      "expected_output": {"company": "Best Home Builders LLC", "services": "residential construction"},
      "validation": "company and services extracted"
    },
    {
      "id": "task-005",
      "category": "price_detection",
      "difficulty": "easy",
      "input": "This costs $12.99",
      "expected_output": 12.99,
      "validation": "numeric price"
    },
    {
      "id": "task-006",
      "category": "price_detection",
      "difficulty": "medium",
      "input": "The flooring is twelve dollars and fifty cents per square foot",
      "expected_output": 12.50,
      "validation": "numeric price"
    },
    {
      "id": "task-007",
      "category": "product_parsing",
      "difficulty": "easy",
      "input": "Oak Flooring - $8.99 - SKU: OAK-001",
      "expected_output": {"name": "Oak Flooring", "price": 8.99, "sku": "OAK-001"},
      "validation": "all fields extracted"
    },
    {
      "id": "task-008",
      "category": "product_parsing",
      "difficulty": "hard",
      "input": "Premium Waterproof Vinyl Plank 6x48 inch Natural Oak - $4.29/sqft Item#WVP-2024",
      "expected_output": {"name": "Premium Waterproof Vinyl Plank", "dimensions": "6x48 inch", "finish": "Natural Oak", "price": 4.29, "unit": "sqft", "sku": "WVP-2024"},
      "validation": "all fields extracted"
    },
    {
      "id": "task-009",
      "category": "voice_command",
      "difficulty": "easy",
      "input": "next",
      "expected_action": "navigate_next",
      "validation": "correct action"
    },
    {
      "id": "task-010",
      "category": "voice_command",
      "difficulty": "medium",
      "input": "beautify my description",
      "expected_action": "enhance_text",
      "validation": "correct action"
    },
    {
      "id": "task-011",
      "category": "voice_search",
      "difficulty": "medium",
      "input": "find the vistaview catalog pdf in downloads",
      "expected_action": "search_downloads",
      "expected_filter": "vistaview catalog pdf",
      "validation": "search executed"
    },
    {
      "id": "task-012",
      "category": "dashboard_query",
      "difficulty": "easy",
      "input": "how many vendors do we have",
      "expected_response_template": "You have {count} registered vendors",
      "validation": "correct metric returned"
    },
    {
      "id": "task-013",
      "category": "product_question",
      "difficulty": "medium",
      "input": "what's the price of this product",
      "context": {"product": {"name": "Oak Flooring", "price": 12.99}},
      "expected_response": "Oak Flooring is priced at $12.99",
      "validation": "correct answer"
    },
    {
      "id": "task-014",
      "category": "full_flow",
      "difficulty": "hard",
      "description": "Complete vendor registration by voice",
      "steps": [
        {"input": "I am a vendor", "expected": "open vendor flow"},
        {"input": "seven zero three one two three four five six seven", "expected": "fill phone"},
        {"input": "one two three four five six", "expected": "fill otp"},
        {"input": "my company is ABC Materials", "expected": "fill company"},
        {"input": "we sell flooring and tiles", "expected": "fill description"},
        {"input": "beautify", "expected": "enhance description"},
        {"input": "save", "expected": "navigate to upload"}
      ],
      "validation": "all steps completed"
    },
    {
      "id": "task-015",
      "category": "extraction_pipeline",
      "difficulty": "hard",
      "description": "Process PDF and extract products",
      "input_file": "sample_catalog.pdf",
      "expected_steps": [
        "upload_to_minio",
        "extract_text",
        "identify_products",
        "generate_embeddings",
        "insert_to_database"
      ],
      "validation": "products in database"
    }
  ],
  "evaluation_criteria": {
    "accuracy": "90% correct extractions",
    "response_time": "< 2 seconds for voice commands",
    "user_satisfaction": "flow completes without errors"
  }
}
TRAININGTASKS

echo "  ✅ training_tasks.json"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Update core/index.ts
#═══════════════════════════════════════════════════════════════════════════════
cat > "$COMPONENTS_DIR/core/index.ts" << 'COREINDEX'
export { default as AgenticPageWrapper } from './AgenticPageWrapper';
COREINDEX

echo "  ✅ core/index.ts"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 5: Create Master Run Script
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🚀 Creating master run script..."

cat > "$VV/RUN_ALL_PARTS.sh" << 'MASTERSCRIPT'
#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  VISTAVIEW COMPLETE SETUP - RUN ALL PARTS
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🚀 VISTAVIEW COMPLETE SETUP"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

SCRIPTS_DIR="$HOME/Downloads"

# Run all part scripts
if [ -f "$SCRIPTS_DIR/COMPLETE_UNIFIED_FIX_JAN04.sh" ]; then
    echo "📦 Running: COMPLETE_UNIFIED_FIX_JAN04.sh"
    bash "$SCRIPTS_DIR/COMPLETE_UNIFIED_FIX_JAN04.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_A_VOICE_COMMENTS.sh" ]; then
    echo "📦 Running: PART_A_VOICE_COMMENTS.sh"
    bash "$SCRIPTS_DIR/PART_A_VOICE_COMMENTS.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_B_PDF_EXTRACTION.sh" ]; then
    echo "📦 Running: PART_B_PDF_EXTRACTION.sh"
    bash "$SCRIPTS_DIR/PART_B_PDF_EXTRACTION.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_C_PRODUCT_CATALOG.sh" ]; then
    echo "📦 Running: PART_C_PRODUCT_CATALOG.sh"
    bash "$SCRIPTS_DIR/PART_C_PRODUCT_CATALOG.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_D_REAL_ESTATE.sh" ]; then
    echo "📦 Running: PART_D_REAL_ESTATE.sh"
    bash "$SCRIPTS_DIR/PART_D_REAL_ESTATE.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_E_DOWNLOADS_DASHBOARD.sh" ]; then
    echo "📦 Running: PART_E_DOWNLOADS_DASHBOARD.sh"
    bash "$SCRIPTS_DIR/PART_E_DOWNLOADS_DASHBOARD.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_F_AI_TRAINING.sh" ]; then
    echo "📦 Running: PART_F_AI_TRAINING.sh"
    bash "$SCRIPTS_DIR/PART_F_AI_TRAINING.sh"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ ALL PARTS INSTALLED"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  📋 NEXT STEPS:"
echo ""
echo "  1. Install backend dependencies:"
echo "     cd ~/vistaview_WORKING/backend"
echo "     npm install pdf-parse xlsx minio multer axios --save"
echo ""
echo "  2. Run database migrations:"
echo "     psql -U vistaview -d vistaview -f migrations/create_products_tables.sql"
echo "     psql -U vistaview -d vistaview -f migrations/create_properties_table.sql"
echo ""
echo "  3. Update server.cjs - add this line:"
echo "     require('./complete_integration.cjs')(app, pool);"
echo ""
echo "  4. Start backend:"
echo "     cd ~/vistaview_WORKING/backend && node server.cjs"
echo ""
echo "  5. Start frontend:"
echo "     cd ~/vistaview_WORKING && npx vite --port 5180 --host"
echo ""
echo "  6. Open browser:"
echo "     http://localhost:5180"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
MASTERSCRIPT

chmod +x "$VV/RUN_ALL_PARTS.sh"
echo "  ✅ RUN_ALL_PARTS.sh"

#═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ PART F COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  🤖 AI AGENT TRAINING:"
echo "     • AI_AGENT_TRAINING.md - Complete training document"
echo "     • training_tasks.json - 15 training tasks"
echo "     • Phone recognition, company extraction, price detection"
echo "     • Product parsing, voice commands, full flows"
echo ""
echo "  📦 UNIVERSAL AGENTIC WRAPPER:"
echo "     • AgenticPageWrapper.tsx"
echo "     • Wrap ANY page with voice + walker"
echo "     • Usage: <AgenticPageWrapper pageName='X'><YourPage/></AgenticPageWrapper>"
echo ""
echo "  📋 TASKS FOR YOUR AGENTIC AI:"
echo ""
echo "     Task 1: Practice phone number conversion"
echo "             Input: 'seven zero three...' → Output: '703...'"
echo ""
echo "     Task 2: Practice company extraction"
echo "             Input: 'My company is ABC' → Output: {company: 'ABC'}"
echo ""
echo "     Task 3: Practice price detection"
echo "             Input: 'twelve dollars' → Output: 12.00"
echo ""
echo "     Task 4: Practice product parsing"
echo "             Input: 'Oak $8.99 SKU-100' → Output: {name, price, sku}"
echo ""
echo "     Task 5: Complete full vendor registration by voice"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
