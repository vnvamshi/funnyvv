import React, { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW MR. V ASSISTANT v10.0 - COMPLETE FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

const TEAL = '#003B32';
const TEAL_LIGHT = '#065f46';
const GOLD = '#B8860B';
const GOLD_LIGHT = '#F5EC9B';
const API = 'http://localhost:1117/api';

// Types
type VoiceMode = 'interactive' | 'talkative' | 'text';
type SignInRole = 'customer' | 'buyer' | 'investor' | 'agent' | 'builder' | 'vendor' | null;
type FlowStep = 'role' | 'phone' | 'otp' | 'name' | 'company' | 'taxid' | 'specialization' | 'done';

interface Stats {
  interactions: number;
  patterns: number;
  confidence: number;
  crawls: number;
  voiceCommands: number;
  memories: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function MrVAssistant() {
  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('interactive');
  
  // Display state
  const [teleprompter, setTeleprompter] = useState('Click "Ask Anything" to start!');
  const [userTranscript, setUserTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  
  // Stats
  const [stats, setStats] = useState<Stats>({
    interactions: 2558, patterns: 77, confidence: 92.5,
    crawls: 47, voiceCommands: 1890, memories: 53
  });
  
  // Walking cursor
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isWalking, setIsWalking] = useState(false);
  const [walkingTo, setWalkingTo] = useState('');
  
  // Sign-in flow state
  const [showSignIn, setShowSignIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SignInRole>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>('role');
  const [formData, setFormData] = useState({
    phone: '', countryCode: '+1', otp: '', firstName: '', lastName: '',
    company: '', taxId: '', specializations: '', email: ''
  });
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isListeningRef = useRef(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    initSpeechRecognition(); // Using global VoiceContext instead
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => { clearInterval(interval); cleanup(); };
  }, []);

  const cleanup = () => {
    stopListening();
    synthRef.current?.cancel();
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/ai/training/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          interactions: data.totals?.total_interactions || stats.interactions,
          patterns: data.patternsCount || data.totals?.learned_patterns || stats.patterns,
          confidence: data.totals?.accuracy_score || stats.confidence,
          crawls: data.totals?.web_crawls || stats.crawls,
          voiceCommands: data.totals?.voice_commands || stats.voiceCommands,
          memories: data.totals?.memories_count || stats.memories
        });
      }
    } catch (e) { /* Backend not available */ }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const initSpeechRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      setUserTranscript(transcript);

      const lower = transcript.toLowerCase();
      
      // PAUSE COMMANDS - Check first, interrupt immediately
      if (lower.match(/^(hey|wait|stop|pause|hold on|one second|hold up)$/i)) {
        interrupt();
        return;
      }

      // RESUME COMMANDS
      if (lower.match(/^(continue|go on|resume|okay|proceed|go ahead)$/i) && isPaused) {
        resumeConversation();
        return;
      }

      // Process final results
      if (result.isFinal && !isPaused && voiceMode !== 'text') {
        processCommand(transcript);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current && voiceMode !== 'text') {
        setTimeout(() => { try { recognition.start(); } catch (e) {} }, 100);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && isListeningRef.current) {
        setTimeout(() => { try { recognition.start(); } catch (e) {} }, 500);
      }
    };

    recognitionRef.current = recognition;
  };

  const startListening = () => {
    if (voiceMode === 'text') return;
    isListeningRef.current = true;
    setIsListening(true);
    try { recognitionRef.current?.start(); } catch (e) {}
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    try { recognitionRef.current?.stop(); } catch (e) {}
  };

  const interrupt = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
    setIsPaused(true);
    setTeleprompter("I'm listening... say 'continue' when you're ready, or ask me anything!");
    startListening();
  };

  const resumeConversation = () => {
    setIsPaused(false);
    speak("Alright, I'm back! What would you like to do?");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT TO SPEECH - American accent, slightly slower
  // ═══════════════════════════════════════════════════════════════════════════
  
  const speak = useCallback((text: string, onDone?: () => void) => {
    if (voiceMode === 'text') {
      setTeleprompter(text);
      onDone?.();
      return;
    }

    if (!synthRef.current) {
      setTeleprompter(text);
      onDone?.();
      return;
    }

    synthRef.current.cancel();
    setTeleprompter(text);
    setIsSpeaking(true);
    stopListening();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get American English voice
    const voices = synthRef.current.getVoices();
    const americanVoice = voices.find(v => 
      v.lang === 'en-US' && (
        v.name.includes('Samantha') ||
        v.name.includes('Alex') ||
        v.name.includes('Google US') ||
        v.name.includes('Microsoft David') ||
        v.name.includes('Microsoft Zira')
      )
    ) || voices.find(v => v.lang === 'en-US');
    
    if (americanVoice) utterance.voice = americanVoice;

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      setTimeout(() => {
        if (!isPaused && voiceMode === 'interactive') startListening();
        onDone?.();
      }, 400);
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [isPaused, voiceMode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // WALKING CURSOR ANIMATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const walkTo = useCallback((selector: string, elementName: string, callback?: () => void) => {
    // Try multiple selectors
    const selectors = selector.split(',').map(s => s.trim());
    let element: HTMLElement | null = null;
    
    for (const sel of selectors) {
      element = document.querySelector(sel) as HTMLElement;
      if (element) break;
    }
    
    // Also try by text content
    if (!element) {
      const allLinks = document.querySelectorAll('a, button');
      allLinks.forEach((el) => {
        if ((el as HTMLElement).innerText.toLowerCase().includes(elementName.toLowerCase())) {
          element = el as HTMLElement;
        }
      });
    }

    if (!element) {
      console.log('Element not found:', selector, elementName);
      callback?.();
      return;
    }

    setWalkingTo(elementName);
    const rect = element.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    // Start from current position or bottom-right
    const startX = cursorPos.x > 0 ? cursorPos.x : window.innerWidth - 80;
    const startY = cursorPos.y > 0 ? cursorPos.y : window.innerHeight - 80;

    setIsWalking(true);
    setCursorPos({ x: startX, y: startY });
    
    const duration = 1800; // Slower, more visible walk
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3);

      setCursorPos({
        x: startX + (targetX - startX) * eased,
        y: startY + (targetY - startY) * eased
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Arrived - highlight and click
        setIsWalking(false);
        setWalkingTo('');
        
        element!.style.transition = 'box-shadow 0.3s, transform 0.3s';
        element!.style.boxShadow = `0 0 0 4px ${GOLD}, 0 0 20px ${GOLD}`;
        element!.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
          element!.style.boxShadow = '';
          element!.style.transform = '';
          element!.click();
          callback?.();
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  }, [cursorPos]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMAND PROCESSING
  // ═══════════════════════════════════════════════════════════════════════════
  
  const processCommand = async (text: string) => {
    const lower = text.toLowerCase();
    
    // Update stats
    setStats(prev => ({ ...prev, interactions: prev.interactions + 1, voiceCommands: prev.voiceCommands + 1 }));

    // ─────────────────────────────────────────────────────────────────────────
    // NAVIGATION COMMANDS
    // ─────────────────────────────────────────────────────────────────────────
    
    if (lower.match(/about\s*(us)?|team|who (are|is)/)) {
      speak("Let me walk you to About Us!", () => {
        walkTo('a[href*="about"], nav a:first-child, .about-link', 'About', () => {
          speak("Here's information about our amazing team at VistaView!");
        });
      });
      return;
    }

    if (lower.match(/how.*(work|does)|process/)) {
      speak("Walking to How It Works!", () => {
        walkTo('a[href*="how"], nav a:nth-child(2), .how-link', 'How it works', () => {
          speak("This shows you how VistaView works - from discovery to transaction!");
        });
      });
      return;
    }

    if (lower.match(/partner/)) {
      speak("Let me show you our partners!", () => {
        walkTo('a[href*="partner"], nav a:nth-child(3)', 'Partners');
      });
      return;
    }

    if (lower.match(/lend|lending/)) {
      speak("Walking to Lend with us!", () => {
        walkTo('a[href*="lend"], nav a:nth-child(4)', 'Lend');
      });
      return;
    }

    if (lower.match(/real\s*estate|propert|home|house/)) {
      speak("Walking to Real Estate section!", () => {
        walkTo('[data-section="real-estate"], a[href*="real-estate"], .real-estate-icon, [class*="real"]', 'Real Estate', () => {
          setTimeout(() => {
            window.location.href = '/v3/real-estate';
          }, 300);
        });
      });
      return;
    }

    if (lower.match(/product|catalog|furniture|shop/)) {
      speak("Let me take you to the Product Catalogue!", () => {
        walkTo('[data-section="product"], a[href*="product"], .product-icon, [class*="product"]', 'Product', () => {
          setTimeout(() => {
            window.location.href = '/v3/product-catalog';
          }, 300);
        });
      });
      return;
    }

    if (lower.match(/interior|design/)) {
      speak("Walking to Interior Design!", () => {
        walkTo('[data-section="interior"], a[href*="interior"], .interior-icon', 'Interior', () => {
          setTimeout(() => {
            window.location.href = '/v3/interior-design';
          }, 300);
        });
      });
      return;
    }

    if (lower.match(/service|contractor|professional/)) {
      speak("Let me show you our Services!", () => {
        walkTo('[data-section="service"], a[href*="service"], .services-icon', 'Services', () => {
          setTimeout(() => {
            window.location.href = '/v3/services';
          }, 300);
        });
      });
      return;
    }

    if (lower.match(/go\s*back|back|home|landing|main/)) {
      speak("Going back to home page!", () => {
        window.location.href = '/';
      });
      return;
    }

    if (lower.match(/close|exit|never\s*mind|cancel/)) {
      if (false && showSignIn) { // DISABLED - using WhoAreYouModal instead
        setShowSignIn(false);
        setSelectedRole(null);
        setFlowStep('role');
        speak("No problem! Let me know if you need anything else.");
      } else {
        speak("Closing the assistant. Click Ask Anything when you need me!");
        setTimeout(() => setIsOpen(false), 1500);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SIGN IN FLOW
    // ─────────────────────────────────────────────────────────────────────────
    
    if (lower.match(/sign\s*(in|up)|register|login|create\s*account/)) {
      speak("Walking to Sign In!", () => {
        walkTo('a[href*="sign"], button[class*="sign"], .sign-in-btn', 'Sign In', () => {
          setShowSignIn(true);
          setFlowStep('role');
          setTimeout(() => {
            speak("Who are you? Are you a Customer, Home Buyer, Investor, Real Estate Agent, Builder, or Vendor?");
          }, 500);
        });
      });
      return;
    }

    // Role selection within sign-in
    if (showSignIn && flowStep === 'role') {
      if (lower.match(/customer|browse|just looking/)) {
        selectRole('customer');
        return;
      }
      if (lower.match(/buyer|buy|purchase|looking for home/)) {
        selectRole('buyer');
        return;
      }
      if (lower.match(/investor|invest|investment/)) {
        selectRole('investor');
        return;
      }
      if (lower.match(/agent|realtor|real estate agent/)) {
        selectRole('agent');
        return;
      }
      if (lower.match(/builder|construct|develop/)) {
        selectRole('builder');
        return;
      }
      if (lower.match(/vendor|seller|supply|product/)) {
        selectRole('vendor');
        return;
      }
    }

    // Phone number capture
    if (showSignIn && flowStep === 'phone') {
      const phoneMatch = text.match(/\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        const phone = phoneMatch[0].replace(/[-.\s]/g, '');
        setFormData(prev => ({ ...prev, phone }));
        speak(`Got it! I'm sending an OTP to ${phone.split('').join(' ')}. Please enter the 6-digit code. For demo, use 1 2 3 4 5 6.`);
        setFlowStep('otp');
        return;
      }
    }

    // OTP verification
    if (showSignIn && flowStep === 'otp') {
      const otpMatch = text.match(/\d{6}|(\d\s*){6}/);
      if (otpMatch) {
        const otp = otpMatch[0].replace(/\s/g, '');
        if (otp === '123456') {
          setFormData(prev => ({ ...prev, otp }));
          speak("OTP verified! Now, please tell me your name. What should I call you?");
          setFlowStep('name');
        } else {
          speak("That OTP doesn't match. Please try again. For demo, use 1 2 3 4 5 6.");
        }
        return;
      }
    }

    // Name capture
    if (showSignIn && flowStep === 'name') {
      const words = text.split(' ').filter(w => w.length > 1);
      if (words.length >= 1) {
        const firstName = words[0];
        const lastName = words.slice(1).join(' ') || '';
        setFormData(prev => ({ ...prev, firstName, lastName }));
        
        if (selectedRole === 'vendor') {
          speak(`Nice to meet you, ${firstName}! What's your company name?`);
          setFlowStep('company');
        } else if (selectedRole === 'builder') {
          speak(`Welcome, ${firstName}! What's your construction company name?`);
          setFlowStep('company');
        } else {
          completeSignUp(firstName);
        }
        return;
      }
    }

    // Company name
    if (showSignIn && flowStep === 'company') {
      setFormData(prev => ({ ...prev, company: text }));
      speak(`Great! ${text} sounds like a wonderful company. Now I need your Tax ID or EIN for verification.`);
      setFlowStep('taxid');
      return;
    }

    // Tax ID
    if (showSignIn && flowStep === 'taxid') {
      setFormData(prev => ({ ...prev, taxId: text }));
      if (selectedRole === 'vendor') {
        speak("Perfect! Finally, tell me about your specializations. What products or services do you offer?");
        setFlowStep('specialization');
      } else {
        completeSignUp(formData.firstName);
      }
      return;
    }

    // Specializations
    if (showSignIn && flowStep === 'specialization') {
      setFormData(prev => ({ ...prev, specializations: text }));
      completeSignUp(formData.firstName);
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATUS & INFO COMMANDS
    // ─────────────────────────────────────────────────────────────────────────
    
    if (lower.match(/status|learn|train|smart|progress|how much/)) {
      speak(`Great question! I've had ${stats.interactions.toLocaleString()} interactions and learned ${stats.patterns} patterns from websites like Zillow, Redfin, IKEA, and Wayfair. I've completed ${stats.crawls} web crawls, and my confidence level is at ${stats.confidence.toFixed(1)} percent. I'm always learning to serve you better!`);
      return;
    }

    if (lower.match(/what can you|help|capabilities|what do you do/)) {
      speak("I can help you explore real estate listings, browse our product catalog, find interior designers, connect with service providers, and help you sign up as a customer, buyer, investor, agent, builder, or vendor. Just tell me what you need!");
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GREETINGS
    // ─────────────────────────────────────────────────────────────────────────
    
    if (lower.match(/^(hi|hello|hey there|good morning|good afternoon|good evening|howdy)$/)) {
      speak("Welcome to VistaView! I'm Mr. V, your intelligent AI assistant. I'm here to help you navigate the world's number one real estate intelligence platform. How can I help you today?");
      return;
    }

    if (lower.match(/how are you|how('re| are) you doing/)) {
      speak("I'm doing fantastic, thank you for asking! I've been learning and improving every day. What can I help you with?");
      return;
    }

    if (lower.match(/thank|thanks/)) {
      speak("You're very welcome! Is there anything else I can help you with?");
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEFAULT - Try backend or generic response
    // ─────────────────────────────────────────────────────────────────────────
    
    try {
      const res = await fetch(`${API}/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command_text: text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          speak(data.response);
          return;
        }
      }
    } catch (e) { /* Backend not available */ }

    speak(`I heard "${text}". I can help you with real estate, products, interior design, services, or signing up. What would you like to explore?`);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SIGN-IN FLOW HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const selectRole = (role: SignInRole) => {
    setSelectedRole(role);
    const roleMessages: Record<string, string> = {
      customer: "Welcome, valued customer! Let me set up your profile. First, I'll need your phone number for verification.",
      buyer: "Excellent! Looking to buy a home? Let me help you get started. What's your phone number?",
      investor: "Welcome, investor! Let's set up your profile to access exclusive investment opportunities. What's your phone number?",
      agent: "Hello, fellow real estate professional! Let me set up your agent profile. What's your phone number?",
      builder: "Welcome, builder! Let me create your professional profile. What's your phone number?",
      vendor: "Hey there, vendor! Let me set up your profile so you can showcase your products on VistaView. What's your phone number?"
    };
    speak(roleMessages[role!] || "Let me set up your profile. What's your phone number?");
    setFlowStep('phone');
  };

  const completeSignUp = (name: string) => {
    setFlowStep('done');
    
    let description = `Welcome aboard, ${name}!`;
    if (selectedRole === 'vendor') {
      description = `Congratulations ${name}! Your vendor profile for ${formData.company} has been created. You specialize in ${formData.specializations}. You can now list your products on VistaView and reach millions of home buyers and designers!`;
    } else if (selectedRole === 'builder') {
      description = `Welcome ${name}! Your builder profile for ${formData.company} is now active. You can now showcase your projects and connect with potential clients on VistaView!`;
    } else if (selectedRole === 'buyer') {
      description = `Welcome ${name}! Your home buyer profile is ready. You can now save your favorite properties, get AI-powered recommendations, and connect with top agents!`;
    } else if (selectedRole === 'investor') {
      description = `Welcome ${name}! Your investor profile is now active. You'll have access to exclusive investment opportunities and market analytics!`;
    } else if (selectedRole === 'agent') {
      description = `Welcome ${name}! Your real estate agent profile is ready. You can now connect with buyers and list properties on VistaView!`;
    } else {
      description = `Welcome ${name}! Your VistaView account is all set up. You can now explore real estate, browse products, and access all our features!`;
    }

    speak(description, () => {
      setTimeout(() => {
        setShowSignIn(false);
        setSelectedRole(null);
        setFlowStep('role');
        setFormData({ phone: '', countryCode: '+1', otp: '', firstName: '', lastName: '', company: '', taxId: '', specializations: '', email: '' });
      }, 2000);
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT INPUT HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      setUserTranscript(textInput);
      processCommand(textInput);
      setTextInput('');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OPEN ASSISTANT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const openAssistant = () => {
    setIsOpen(true);
    setTimeout(() => {
      speak("Welcome to VistaView! I'm Mr. V, your intelligent AI assistant. I'm here to help you navigate the world's number one real estate intelligence platform. What would you like to explore today?");
    }, 300);
    if (voiceMode === 'interactive') startListening();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════════════════════
  
  const panelStyle: React.CSSProperties = {
    background: `linear-gradient(145deg, ${TEAL}f5, ${TEAL_LIGHT}f5)`,
    color: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: 22,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 12,
    transition: 'all 0.2s'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: 14,
    outline: 'none'
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - CLOSED STATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (!isOpen) {
    return (
      <>
        {/* AI Stats Panel - Left */}
        <div style={{ ...panelStyle, position: 'fixed', left: 10, top: 110, zIndex: 99997, padding: '14px', width: 160, fontSize: 11 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
            🧠 AI Learning
          </div>
          <div style={{ marginBottom: 5 }}>💬 {stats.interactions.toLocaleString()} interactions</div>
          <div style={{ marginBottom: 5 }}>🎯 {stats.patterns} patterns</div>
          <div style={{ marginBottom: 5 }}>🌐 {stats.crawls} web crawls</div>
          <div style={{ marginBottom: 5 }}>📈 {stats.confidence.toFixed(1)}% confidence</div>
          <a href="http://localhost:1117/dashboard" target="_blank" rel="noreferrer"
            style={{ display: 'block', marginTop: 10, color: GOLD_LIGHT, fontSize: 10, textDecoration: 'none' }}>
            📊 Open Dashboard →
          </a>
        </div>

        {/* Ask Anything Button */}
        <div onClick={openAssistant}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 99999,
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
            borderRadius: 30, padding: '16px 24px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', boxShadow: '0 4px 25px rgba(144, 94, 38, 0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <span style={{ fontWeight: 'bold', fontSize: 15, color: '#000' }}>Ask Anything</span>
        </div>

        {/* Walking Cursor */}
        {isWalking && <WalkingCursor x={cursorPos.x} y={cursorPos.y} label={walkingTo} />}
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - SIGN IN MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (false && showSignIn) { // DISABLED - using WhoAreYouModal instead
    return (
      <>
        {/* Backdrop */}
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Sign In Panel */}
          <div style={{ ...panelStyle, width: '90%', maxWidth: 500, padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                {flowStep === 'role' ? '👤 Who Are You?' : 
                 flowStep === 'done' ? '🎉 Welcome!' :
                 `${selectedRole?.charAt(0).toUpperCase()}${selectedRole?.slice(1)} Sign Up`}
              </h2>
              <button onClick={() => { setShowSignIn(false); setSelectedRole(null); setFlowStep('role'); speak("No problem!"); }}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>

            {/* Teleprompter in modal */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ color: GOLD_LIGHT, fontSize: 11, marginBottom: 4 }}>🗣️ MR. V:</div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{teleprompter}</div>
            </div>

            {/* Role Selection */}
            {flowStep === 'role' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { role: 'customer', icon: '👤', label: 'Customer' },
                  { role: 'buyer', icon: '🏠', label: 'Home Buyer' },
                  { role: 'investor', icon: '💰', label: 'Investor' },
                  { role: 'agent', icon: '🏢', label: 'Real Estate Agent' },
                  { role: 'builder', icon: '🏗️', label: 'Builder' },
                  { role: 'vendor', icon: '📦', label: 'Vendor' }
                ].map(({ role, icon, label }) => (
                  <button key={role} onClick={() => selectRole(role as SignInRole)}
                    style={{
                      ...buttonStyle, padding: '16px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', color: '#fff'
                    }}>
                    <span style={{ fontSize: 28 }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Phone Input */}
            {flowStep === 'phone' && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <select value={formData.countryCode} onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                    style={{ ...inputStyle, width: 100 }}>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  <input type="tel" placeholder="Phone Number" value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }} />
                </div>
                <button onClick={() => {
                  if (formData.phone.length >= 10) {
                    speak(`Sending OTP to ${formData.phone}. Please enter the 6-digit code.`);
                    setFlowStep('otp');
                  }
                }} style={{ ...buttonStyle, width: '100%', background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                  Send OTP
                </button>
              </div>
            )}

            {/* OTP Input */}
            {flowStep === 'otp' && (
              <div>
                <input type="text" placeholder="Enter 6-digit OTP (Demo: 123456)" maxLength={6}
                  value={formData.otp} onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: 24, letterSpacing: 8, marginBottom: 12 }} />
                <button onClick={() => {
                  if (formData.otp === '123456') {
                    speak("OTP verified! What's your name?");
                    setFlowStep('name');
                  } else {
                    speak("Invalid OTP. Try 1 2 3 4 5 6.");
                  }
                }} style={{ ...buttonStyle, width: '100%', background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                  Verify OTP
                </button>
              </div>
            )}

            {/* Name Input */}
            {flowStep === 'name' && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <input type="text" placeholder="First Name" value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }} />
                  <input type="text" placeholder="Last Name" value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }} />
                </div>
                <button onClick={() => {
                  if (formData.firstName) {
                    if (selectedRole === 'vendor' || selectedRole === 'builder') {
                      speak(`Nice to meet you, ${formData.firstName}! What's your company name?`);
                      setFlowStep('company');
                    } else {
                      completeSignUp(formData.firstName);
                    }
                  }
                }} style={{ ...buttonStyle, width: '100%', background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                  Continue
                </button>
              </div>
            )}

            {/* Company Input */}
            {flowStep === 'company' && (
              <div>
                <input type="text" placeholder="Company Name" value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  style={{ ...inputStyle, marginBottom: 12 }} />
                <button onClick={() => {
                  if (formData.company) {
                    speak(`${formData.company} - great! Now I need your Tax ID or EIN.`);
                    setFlowStep('taxid');
                  }
                }} style={{ ...buttonStyle, width: '100%', background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                  Continue
                </button>
              </div>
            )}

            {/* Tax ID Input */}
            {flowStep === 'taxid' && (
              <div>
                <input type="text" placeholder="Tax ID / EIN" value={formData.taxId}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                  style={{ ...inputStyle, marginBottom: 12 }} />
                <button onClick={() => {
                  if (formData.taxId) {
                    if (selectedRole === 'vendor') {
                      speak("What are your specializations? What products do you offer?");
                      setFlowStep('specialization');
                    } else {
                      completeSignUp(formData.firstName);
                    }
                  }
                }} style={{ ...buttonStyle, width: '100%', background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                  Continue
                </button>
              </div>
            )}

            {/* Specializations Input */}
            {flowStep === 'specialization' && (
              <div>
                <textarea placeholder="Your specializations (e.g., Furniture, Lighting, Appliances...)"
                  value={formData.specializations}
                  onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical', marginBottom: 12 }} />
                <button onClick={() => {
                  if (formData.specializations) completeSignUp(formData.firstName);
                }} style={{ ...buttonStyle, width: '100%', background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                  Complete Registration
                </button>
              </div>
            )}

            {/* Done */}
            {flowStep === 'done' && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
                <p style={{ fontSize: 16, marginBottom: 20 }}>Your profile has been created!</p>
                <button onClick={() => { setShowSignIn(false); setSelectedRole(null); setFlowStep('role'); }}
                  style={{ ...buttonStyle, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                  Start Exploring
                </button>
              </div>
            )}

            {/* Voice Mode in Modal */}
            {flowStep !== 'done' && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                {isListening && <span style={{ color: '#22c55e', fontSize: 12 }}>🎤 Listening...</span>}
              </div>
            )}
          </div>
        </div>

        {/* Walking Cursor */}
        {isWalking && <WalkingCursor x={cursorPos.x} y={cursorPos.y} label={walkingTo} />}
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER - OPEN STATE (Main Chat Panel)
  // ═══════════════════════════════════════════════════════════════════════════
  
  return (
    <>
      {/* AI Stats Panel - Left */}
      <div style={{ ...panelStyle, position: 'fixed', left: 10, top: 110, zIndex: 99997, padding: '14px', width: 160, fontSize: 11 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
          🧠 AI Learning
        </div>
        <div style={{ marginBottom: 5 }}>💬 {stats.interactions.toLocaleString()} interactions</div>
        <div style={{ marginBottom: 5 }}>🎯 {stats.patterns} patterns</div>
        <div style={{ marginBottom: 5 }}>🌐 {stats.crawls} web crawls</div>
        <div style={{ marginBottom: 5 }}>📈 {stats.confidence.toFixed(1)}% confidence</div>
        <a href="http://localhost:1117/dashboard" target="_blank" rel="noreferrer"
          style={{ display: 'block', marginTop: 10, color: GOLD_LIGHT, fontSize: 10, textDecoration: 'none' }}>
          📊 Open Dashboard →
        </a>
      </div>

      {/* Mr. V Chat Panel - Right */}
      <div style={{ ...panelStyle, position: 'fixed', right: 10, top: 110, zIndex: 99998, padding: '16px', width: 310 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: isPaused ? '#f59e0b' : isSpeaking ? GOLD : isListening ? '#22c55e' : 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            transition: 'background 0.3s'
          }}>
            {isPaused ? '⏸️' : isSpeaking ? '🗣️' : isListening ? '👂' : '🤖'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>Mr. V</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {isPaused ? "Paused" : isSpeaking ? 'Speaking...' : isListening ? '🎤 Listening' : 'Ready'}
            </div>
          </div>
          <button onClick={() => { setIsOpen(false); cleanup(); }}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>×</button>
        </div>

        {/* Voice Mode Selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(['interactive', 'talkative', 'text'] as VoiceMode[]).map(mode => (
            <button key={mode} onClick={() => {
              setVoiceMode(mode);
              if (mode === 'text') stopListening();
              else if (mode === 'interactive') startListening();
            }}
              style={{
                ...buttonStyle, flex: 1, padding: '8px',
                background: voiceMode === mode ? GOLD : 'rgba(255,255,255,0.15)',
                color: voiceMode === mode ? '#000' : '#fff',
                fontSize: 10
              }}>
              {mode === 'interactive' ? '🎤 Interactive' : mode === 'talkative' ? '🗣️ Talkative' : '⌨️ Text'}
            </button>
          ))}
        </div>

        {/* Teleprompter */}
        <div style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 14, marginBottom: 12,
          maxHeight: 100, overflowY: 'auto'
        }}>
          <div style={{ color: GOLD_LIGHT, fontSize: 11, marginBottom: 5, fontWeight: 'bold' }}>🗣️ MR. V:</div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{teleprompter}</div>
        </div>

        {/* User Transcript */}
        {userTranscript && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ color: '#22c55e', fontSize: 11, marginBottom: 4, fontWeight: 'bold' }}>🎤 YOU:</div>
            <div style={{ fontSize: 13 }}>{userTranscript}</div>
          </div>
        )}

        {/* Text Input (for text mode) */}
        {voiceMode === 'text' && (
          <form onSubmit={handleTextSubmit} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your message..."
                style={{ ...inputStyle, flex: 1 }} />
              <button type="submit" style={{ ...buttonStyle, background: GOLD, color: '#000' }}>Send</button>
            </div>
          </form>
        )}

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => isPaused ? resumeConversation() : interrupt()}
            style={{ ...buttonStyle, flex: 1, background: isPaused ? '#f59e0b' : 'rgba(255,255,255,0.15)', color: '#fff' }}>
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          {voiceMode !== 'text' && (
            <button onClick={() => isListening ? stopListening() : startListening()}
              style={{ ...buttonStyle, flex: 1, background: isListening ? '#22c55e' : GOLD, color: isListening ? '#fff' : '#000' }}>
              🎤 {isListening ? 'On' : 'Off'}
            </button>
          )}
        </div>

        {/* Help text */}
        <div style={{ marginTop: 12, fontSize: 10, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
          Say: "Hey" to pause • "About us" • "Real estate" • "Sign in" • "Go back"
        </div>
      </div>

      {/* Walking Cursor */}
      {isWalking && <WalkingCursor x={cursorPos.x} y={cursorPos.y} label={walkingTo} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WALKING CURSOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function WalkingCursor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <>
      <div style={{
        position: 'fixed', left: x - 25, top: y - 25,
        width: 50, height: 50, pointerEvents: 'none', zIndex: 999999
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: `0 4px 25px rgba(184, 134, 11, 0.7)`,
          animation: 'walkBounce 0.4s infinite'
        }}>
          🚶
        </div>
        {label && (
          <div style={{
            position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
            background: TEAL, color: '#fff', padding: '4px 10px', borderRadius: 12,
            fontSize: 11, whiteSpace: 'nowrap', fontWeight: 'bold'
          }}>
            → {label}
          </div>
        )}
      </div>
      <style>{`
        @keyframes walkBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
    </>
  );
}
