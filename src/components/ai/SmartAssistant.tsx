// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW SMART AI ASSISTANT
// GPT-powered chat + Digital Avatar + Voice + Product Recommendations
// Goal: $30K/month through smart conversions
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSuggestion[];
  timestamp: Date;
}

interface ProductSuggestion {
  name: string;
  category: string;
  priceRange: string;
  retailers: string[];
  searchUrl: string;
  image?: string;
}

interface SmartAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

// AI Response Generator (simulated - connect to OpenAI in production)
const generateAIResponse = async (
  userMessage: string,
  conversationHistory: Message[]
): Promise<{ text: string; products?: ProductSuggestion[] }> => {
  const lowerMsg = userMessage.toLowerCase();

  // Product intent detection
  const furnitureKeywords = ['sofa', 'couch', 'bed', 'table', 'chair', 'desk', 'lamp', 'rug', 'shelf', 'cabinet', 'dresser', 'mattress', 'ottoman', 'bookcase', 'nightstand'];
  const budgetMatch = lowerMsg.match(/under\s*\$?(\d+)|budget\s*\$?(\d+)|less\s*than\s*\$?(\d+)|(\d+)\s*dollars?/);
  const styleKeywords = ['modern', 'mid century', 'contemporary', 'traditional', 'minimalist', 'scandinavian', 'industrial', 'bohemian', 'rustic', 'farmhouse'];

  let detectedFurniture = furnitureKeywords.find(k => lowerMsg.includes(k));
  let detectedBudget = budgetMatch ? parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3] || budgetMatch[4]) : null;
  let detectedStyle = styleKeywords.find(s => lowerMsg.includes(s));

  // Greeting
  if (lowerMsg.match(/^(hi|hello|hey|good morning|good evening)/)) {
    return {
      text: "Hey there! 👋 I'm your furniture shopping assistant. I can help you find the perfect furniture at the best prices across 100+ retailers worldwide!\n\nWhat are you looking for today? Tell me about:\n• The type of furniture\n• Your budget\n• Your style preference",
    };
  }

  // Help
  if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
    return {
      text: "I'm here to help you find amazing furniture deals! Here's what I can do:\n\n🔍 **Search** - Find any furniture across 100+ stores\n💰 **Compare Prices** - See who has the best deal\n🎨 **Style Advice** - Get recommendations based on your taste\n🔔 **Price Alerts** - Get notified when prices drop\n🌍 **Global Shopping** - US, India, UK, Europe, and more!\n\nJust tell me what you're looking for!",
    };
  }

  // Furniture search with recommendations
  if (detectedFurniture) {
    const priceRange = detectedBudget ? `Under $${detectedBudget}` : '$200 - $2000';
    const styleText = detectedStyle ? `${detectedStyle} style ` : '';

    const products: ProductSuggestion[] = [
      {
        name: `${styleText}${detectedFurniture}`.trim(),
        category: detectedFurniture,
        priceRange: priceRange,
        retailers: ['Amazon', 'Wayfair', 'IKEA', 'Target', 'West Elm'],
        searchUrl: `/compare?q=${encodeURIComponent(`${styleText}${detectedFurniture}`.trim())}`,
      },
      {
        name: `Best Rated ${detectedFurniture}`,
        category: detectedFurniture,
        priceRange: priceRange,
        retailers: ['Overstock', 'Pottery Barn', 'CB2'],
        searchUrl: `/compare?q=${encodeURIComponent(`best ${detectedFurniture}`)}`,
      },
      {
        name: `Budget ${detectedFurniture}`,
        category: detectedFurniture,
        priceRange: 'Under $300',
        retailers: ['IKEA', 'Target', 'Walmart', 'Amazon'],
        searchUrl: `/compare?q=${encodeURIComponent(`affordable ${detectedFurniture}`)}`,
      }
    ];

    let response = `Great choice! I found some amazing ${styleText}${detectedFurniture} options for you`;
    if (detectedBudget) {
      response += ` under $${detectedBudget}`;
    }
    response += `! 🛋️\n\nHere are my top recommendations across 100+ retailers:\n\n`;
    response += `**Click any option below to compare prices instantly!**`;

    return { text: response, products };
  }

  // Budget question
  if (lowerMsg.includes('budget') || lowerMsg.includes('cheap') || lowerMsg.includes('affordable')) {
    return {
      text: "I love helping people find great deals! 💰\n\nFor budget-friendly furniture, I recommend:\n\n• **IKEA** - Best for modern, affordable pieces\n• **Target** - Great quality at mid-range prices\n• **Walmart** - Lowest prices, decent quality\n• **Amazon** - Wide range, check reviews carefully\n\nWhat type of furniture are you looking for? I'll find the best deals!",
    };
  }

  // Style question
  if (detectedStyle) {
    return {
      text: `Ah, ${detectedStyle} style - excellent taste! 🎨\n\nFor ${detectedStyle} furniture, I recommend checking:\n\n• **West Elm** - Curated ${detectedStyle} collections\n• **Article** - Direct-to-consumer, great prices\n• **CB2** - Modern and trendy\n• **Wayfair** - Huge selection to filter\n\nWhat specific piece are you looking for? Sofa, bed, dining table?`,
    };
  }

  // Comparison question
  if (lowerMsg.includes('vs') || lowerMsg.includes('versus') || lowerMsg.includes('compare') || lowerMsg.includes('better')) {
    return {
      text: "I can definitely help you compare! 📊\n\nJust tell me:\n1. What product you're comparing\n2. Which stores or specific products\n\nFor example: \"Compare sofas from IKEA vs Wayfair\" or \"Which is better for beds - Amazon or Overstock?\"\n\nI'll give you the full breakdown!",
    };
  }

  // Default response
  return {
    text: "I'd love to help you find the perfect furniture! 🏠\n\nCould you tell me:\n• What type of furniture? (sofa, bed, table, etc.)\n• Your budget range?\n• Any style preference? (modern, traditional, etc.)\n\nThe more details, the better recommendations I can give you!",
  };
};

const SmartAssistant: React.FC<SmartAssistantProps> = ({ isOpen, onClose, initialMessage }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hi! I'm Vista, your AI furniture shopping assistant! 🛋️\n\nI can help you find the perfect furniture at the best prices across 100+ retailers worldwide.\n\nWhat are you looking for today?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      const response = await generateAIResponse(text, messages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        products: response.products,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I had a brief hiccup! Could you try that again?",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleProductClick = (searchUrl: string) => {
    navigate(searchUrl);
    onClose();
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        sendMessage(text);
      };

      recognition.start();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      {/* Chat Window */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[600px] border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🛋️</span>
            </div>
            <div>
              <h3 className="font-semibold">Vista AI Assistant</h3>
              <p className="text-xs text-teal-100">Powered by GPT • 100+ Retailers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>

                {/* Product Suggestions */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.products.map((product, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleProductClick(product.searchUrl)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-teal-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 group-hover:text-teal-600 capitalize">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500">{product.priceRange}</p>
                          </div>
                          <span className="text-teal-500 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.retailers.slice(0, 4).map((r, i) => (
                            <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                              {r}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
          {['Find me a sofa', 'Best deals today', 'Modern bedroom', 'Under $500'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="px-3 py-1 bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-teal-700 rounded-full text-xs whitespace-nowrap transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about furniture..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={startVoiceInput}
              className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartAssistant;
