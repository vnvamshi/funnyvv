// ═══════════════════════════════════════════════════════════════════════════════
// WALK & CLICK - Visual Pointer Navigation
// Pointer walks to elements and clicks them
// ═══════════════════════════════════════════════════════════════════════════════

import { voiceBrain } from './VoiceBrain';

let pointer: HTMLDivElement | null = null;
let trail: HTMLDivElement[] = [];

// Create the visual pointer
function createPointer(): HTMLDivElement {
  if (pointer) return pointer;
  
  pointer = document.createElement('div');
  pointer.id = 'vv-pointer';
  pointer.innerHTML = '👆';
  pointer.style.cssText = `
    position: fixed;
    z-index: 999999;
    pointer-events: none;
    font-size: 40px;
    transform: translate(-50%, -50%);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    display: none;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  `;
  document.body.appendChild(pointer);
  
  // Add highlight style
  const style = document.createElement('style');
  style.id = 'vv-walk-styles';
  style.textContent = `
    .vv-highlight {
      outline: 4px solid #B8860B !important;
      outline-offset: 4px !important;
      box-shadow: 0 0 30px rgba(184,134,11,0.5) !important;
      transition: all 0.3s ease !important;
    }
    .vv-trail {
      position: fixed;
      width: 12px;
      height: 12px;
      background: rgba(184,134,11,0.4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999998;
      animation: vv-trail-fade 0.6s forwards;
    }
    @keyframes vv-trail-fade {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.3); }
    }
    @keyframes vv-pointer-bob {
      0%, 100% { transform: translate(-50%, -50%) translateY(0); }
      50% { transform: translate(-50%, -50%) translateY(-8px); }
    }
  `;
  document.head.appendChild(style);
  
  return pointer;
}

// Create trail dot
function createTrailDot(x: number, y: number): void {
  const dot = document.createElement('div');
  dot.className = 'vv-trail';
  dot.style.left = x + 'px';
  dot.style.top = y + 'px';
  document.body.appendChild(dot);
  trail.push(dot);
  
  setTimeout(() => {
    dot.remove();
    trail = trail.filter(d => d !== dot);
  }, 600);
}

// Find element by keywords
function findElement(target: string): HTMLElement | null {
  const targetLower = target.toLowerCase();
  
  // Keyword to selector mapping
  const mappings: [string[], string[]][] = [
    [['sign in', 'signin', 'login'], ['[data-testid="signin-btn"]', 'button:contains("Sign In")', '.signin-btn', 'button.signin']],
    [['vendor', "i'm a vendor", 'im a vendor'], ['[data-testid="vendor-btn"]', 'button:contains("Vendor")', '.vendor-btn']],
    [['customer', "i'm a customer"], ['[data-testid="customer-btn"]', 'button:contains("Customer")']],
    [['back', 'go back', 'previous'], ['[data-testid="back-btn"]', 'button:contains("Back")', 'button:contains("←")', '.back-btn']],
    [['close', 'cancel', 'exit'], ['[data-testid="close-btn"]', 'button:contains("Close")', 'button:contains("×")', 'button:contains("✕")', '.close-btn']],
    [['next', 'continue', 'proceed'], ['[data-testid="next-btn"]', 'button:contains("Next")', 'button:contains("Continue")', 'button:contains("→")']],
    [['send', 'submit'], ['[data-testid="send-btn"]', 'button:contains("Send")', 'button[type="submit"]']],
    [['home'], ['a[href="/"]', 'a:contains("Home")', '.home-link']],
    [['products', 'catalog'], ['a[href*="product"]', 'a:contains("Products")', '.products-link']],
    [['about'], ['a[href*="about"]', 'a:contains("About")']],
  ];
  
  // Check mappings first
  for (const [keywords, selectors] of mappings) {
    if (keywords.some(k => targetLower.includes(k))) {
      for (const selector of selectors) {
        try {
          // Handle :contains pseudo-selector manually
          if (selector.includes(':contains(')) {
            const match = selector.match(/(.+):contains\("(.+)"\)/);
            if (match) {
              const [, baseSelector, text] = match;
              const elements = document.querySelectorAll(baseSelector || '*');
              for (const el of elements) {
                if ((el.textContent || '').toLowerCase().includes(text.toLowerCase())) {
                  return el as HTMLElement;
                }
              }
            }
          } else {
            const el = document.querySelector(selector);
            if (el) return el as HTMLElement;
          }
        } catch (e) {
          // Invalid selector, continue
        }
      }
    }
  }
  
  // Fallback: search all clickable elements
  const clickables = document.querySelectorAll('button, a, [role="button"], [onclick], .clickable');
  for (const el of clickables) {
    const text = (el.textContent || '').toLowerCase();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    if (text.includes(targetLower) || ariaLabel.includes(targetLower)) {
      return el as HTMLElement;
    }
  }
  
  return null;
}

// Animate pointer to element
async function walkTo(element: HTMLElement): Promise<void> {
  const rect = element.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;
  
  const p = createPointer();
  
  // Get current position or start from center
  const currentX = parseFloat(p.style.left) || window.innerWidth / 2;
  const currentY = parseFloat(p.style.top) || window.innerHeight / 2;
  
  // Show pointer
  p.style.display = 'block';
  p.style.left = currentX + 'px';
  p.style.top = currentY + 'px';
  
  // Create trail effect
  const steps = 10;
  for (let i = 0; i < steps; i++) {
    setTimeout(() => {
      const progress = i / steps;
      const x = currentX + (targetX - currentX) * progress;
      const y = currentY + (targetY - currentY) * progress;
      createTrailDot(x, y);
    }, i * 50);
  }
  
  // Move pointer
  await new Promise(r => setTimeout(r, 50));
  p.style.left = targetX + 'px';
  p.style.top = targetY + 'px';
  
  // Wait for animation
  await new Promise(r => setTimeout(r, 600));
  
  // Add bobbing animation
  p.style.animation = 'vv-pointer-bob 0.5s ease-in-out 2';
}

// Click element with highlight
async function clickElement(element: HTMLElement): Promise<void> {
  // Add highlight
  element.classList.add('vv-highlight');
  
  // Wait a moment so user sees it
  await new Promise(r => setTimeout(r, 400));
  
  // Click
  element.click();
  
  // Remove highlight after delay
  await new Promise(r => setTimeout(r, 600));
  element.classList.remove('vv-highlight');
  
  // Hide pointer
  if (pointer) {
    pointer.style.display = 'none';
    pointer.style.animation = '';
  }
}

// Main navigation handler
export async function handleNavigation(action: string, target?: string): Promise<boolean> {
  console.log('[WalkAndClick]', action, target);
  
  if (action === 'click' && target) {
    const element = findElement(target);
    if (element) {
      await walkTo(element);
      await clickElement(element);
      return true;
    } else {
      console.log('[WalkAndClick] Element not found:', target);
      voiceBrain.speak(`I couldn't find ${target} on this page.`);
      return false;
    }
  }
  
  return false;
}

// Navigation commands processor
function processNavigationCommand(cmd: string): boolean {
  const lower = cmd.toLowerCase();
  
  const navPatterns: [RegExp, string][] = [
    [/sign\s*in|log\s*in/, 'signin'],
    [/vendor|i'm a vendor|im a vendor/, 'vendor'],
    [/customer|i'm a customer/, 'customer'],
    [/back|go back|previous/, 'back'],
    [/close|cancel|exit|dismiss/, 'close'],
    [/next|continue|proceed|forward/, 'next'],
    [/send|submit/, 'send'],
    [/home|main/, 'home'],
    [/products?|catalog/, 'products'],
    [/about/, 'about'],
  ];
  
  for (const [pattern, target] of navPatterns) {
    if (pattern.test(lower)) {
      handleNavigation('click', target);
      return true;
    }
  }
  
  return false;
}

// Initialize Walk & Click
export function initWalkAndClick(): void {
  // Register with VoiceBrain
  voiceBrain.onCommand((cmd: string) => {
    processNavigationCommand(cmd);
  });
  
  console.log('[WalkAndClick] ✅ Initialized');
}

export default { handleNavigation, initWalkAndClick };
