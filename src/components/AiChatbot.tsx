import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  MessageCircle, 
  ExternalLink,
  ChevronDown,
  Bot
} from 'lucide-react';
import { RamaniAvatar } from './common/RamaniAvatar';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Namaste! 🙏 Welcome to **Aavira Haute Couture**, founded by Mrs. K. Ramani in Hyderabad.\n\nI am your **AI Couture Stylist & Concierge**. I can help you with:\n- 🥻 Handcrafted Kanchipuram Silks & Bridal Lehengas\n- ✂️ Custom Bespoke Tailoring, Blouse Fittings & Measurements\n- 💎 Color palettes & styling for weddings & festive occasions\n- 📞 Direct appointments with Mrs. K. Ramani\n\nHow may I assist your style journey today?`,
  timestamp: 'Just now',
};

const QUICK_PROMPTS = [
  '🪔 Daily Wear Sarees (from Rs. 200/-)',
  '👑 Dharmavaram Silk Sarees (4 creations)',
  '✨ VenkataGiri Silk Sarees (10 creations)',
  '🏛️ VenkataGiri Vintage Sarees (6 creations)',
  '💍 Bridal Sarees (5 creations)',
  '✂️ How does custom blouse tailoring work?',
  '📞 How do I reach Mrs. K. Ramani?',
];

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Send conversation to our secure server-side Gemini API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
          userQuery: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.reply || 'Thank you for reaching out. Please connect with Mrs. K. Ramani on WhatsApp (+91 9347159353) for dedicated styling assistance.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('AI Chatbot fetch error, using local concierge logic:', err);
      // Fallback response for offline or transient network conditions
      let fallbackText = `Namaste! We are delighted to assist your couture inquiry. For immediate tailored assistance, fabric swatch reviews, or custom blouse stitching, please connect directly with our Managing Director Mrs. K. Ramani on WhatsApp at +91 9347159353 or email aavira.bo@gmail.com.`;
      
      const lower = query.toLowerCase();
      if (lower.includes('dusshera') || lower.includes('200') || lower.includes('sale') || lower.includes('offer') || lower.includes('12th october') || lower.includes('october')) {
        fallbackText = `🪔 **Aavira Grand Dusshera Festival Offer**\n\n🎉 **SALE STARTS FROM 12th OCTOBER!**\n✨ **DUSSHERA OFFER: SAREE STARTS FROM Rs. 200/- ONLY (LIMITED OFFER)**\n\nFeaturing handloom daily wear cottons, festive fancy sarees, lightweight soft silks, and auspicious celebratory drapes.\n\nBrowse the collection in our **STORE** tab or contact Mrs. K. Ramani directly on WhatsApp at +91 9347159353 for early reservations and bulk festive orders!`;
      } else if (lower.includes('bridal') || lower.includes('wedding') || lower.includes('muhurtham')) {
        fallbackText = `👑 **Aavira Bridal Sarees (5 Exclusive Creations)**\n\nOur bridal collection, including *Amari Korvai Pure Muhurtham Saree* and *Maharani Sindoor Red Saree*, features certified 3-ply pure silk, 24K electroplated gold zari, and sacred temple Gopuram borders.\n\nEvery bridal saree includes an unstitched heavy running blouse piece with bespoke maggam work tailoring options. Would you like to schedule a private fitting with Mrs. K. Ramani on WhatsApp (+91 9347159353)?`;
      } else if (lower.includes('dharmavaram')) {
        fallbackText = `👑 **Dharmavaram Silk Sarees (4 Grand Creations)**\n\nOur Dharmavaram handlooms feature iconic broad temple borders, heavy 24K electroplated gold zari brocade, and vibrant double-shuttle contrast pallus woven in the historic weaving lofts of Andhra Pradesh.`;
      } else if (lower.includes('vintage')) {
        fallbackText = `🏛️ **VenkataGiri Vintage Sarees (6 Heirloom Creations)**\n\nRare archive-grade revivals woven on traditional heritage pit looms. Features authentic Kadwa butti interlocking, 18th-century Asavali flowering vines, and heirloom double-ikat precision.`;
      } else if (lower.includes('venkatagiri')) {
        fallbackText = `✨ **VenkataGiri Silk Sarees (10 Featherlight Creations)**\n\nFeatherlight unstarched handloom silks celebrated for centuries by Nellore royalty. Famous for delicate Jamdani zari buttas, pure mulberry softness, and breezy body-contouring drapes.`;
      } else if (lower.includes('daily') || lower.includes('cotton') || lower.includes('linen') || lower.includes('mulmul') || lower.includes('kalamkari')) {
        fallbackText = `🌿 **Daily Wear Sarees (30 Sarees • ₹200/- to ₹400/- Low to High)**\n\nDaily wear saree without blouse (5.5m pure saree length), crafted for all-day breathability and effortless grace:\n\n1. **Ananya Pure Mulmul Daily Saree** (₹200/-) – 100% featherlight organic handloom cotton with miniature temple selvedge.\n2. **Malhar Linen Breeze Daily Saree** (₹210/-) – High-twist linen-cotton blend with subtle floral jaal.\n3. **Kaveri Kalamkari Cotton Daily Saree** (₹220/-) – Hand-block printed Kalamkari drape with geometric chevron.\n\nAll 30 daily wear sarees are arranged low to high from ₹200 to ₹400 in our Store page, available with Cash on Delivery (COD) & fast dispatch across India.`;
      } else if (lower.includes('tailor') || lower.includes('bespoke') || lower.includes('blouse') || lower.includes('fit') || lower.includes('maggam')) {
        fallbackText = `✂️ **Bespoke Atelier Blouse Tailoring**\n\nWe provide master blouse tailoring, zardozi embroidery, and maggam handwork for all sarees. Virtual measurement sessions over WhatsApp Video (+91 9347159353) are available for clients across India and globally (US, UK, Middle East).`;
      }

      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  // Render markdown-like simple formatting (bold, bullet points, links)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Format bold text **word**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="text-[#C5A059] font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="italic text-[#FAF6ED]">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          });

          return (
            <p key={idx} className="text-xs sm:text-[13px]">
              {formattedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-[#2A2016] to-[#1C1814] p-0.5 border-2 border-[#C5A059] shadow-xl hover:shadow-[#C5A059]/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Consult Mrs. K. Ramani • Aavira AI Stylist"
          id="floating-ai-chatbot-btn"
          aria-label="Open AI Chatbot"
        >
          <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
            <RamaniAvatar size="custom" className="w-full h-full" border="none" />
          </div>

          {/* Sparkle badge on corner */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#C5A059] to-[#8F6F30] rounded-full flex items-center justify-center text-[#1C1814] shadow-sm border border-[#1C1814]">
            <Sparkles size={9} className="stroke-[3]" />
          </div>

          {/* Online green indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#34D399] border-2 border-[#1C1814] rounded-full ring-1 ring-emerald-500/40"></span>

          {/* Hover Tooltip */}
          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1C1814] text-[#FAF6ED] text-[11px] font-medium rounded-md border border-[#C5A059]/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50">
            Ask Aavira AI Stylist
          </span>
        </button>
      )}

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div 
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[85vh] h-[550px] bg-[#1C1814] border border-[#C5A059]/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp font-sans"
          id="ai-chatbot-modal"
          role="dialog"
          aria-label="Aavira AI Couture Stylist Chatbot"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#14100C] via-[#241A12] to-[#14100C] px-4 py-3 border-b border-[#3D3023] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <RamaniAvatar size="lg" border="gold" showStatus={true} id="chatbot-header-avatar" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-serif font-medium tracking-wide text-[#FAF6ED]">
                    Mrs. K. Ramani
                  </h3>
                  <span className="text-[9px] uppercase tracking-widest bg-[#C5A059]/20 text-[#C5A059] px-1.5 py-0.5 rounded font-mono">
                    AI Stylist
                  </span>
                </div>
                <span className="text-[10px] text-[#C5A059]/90 font-light">
                  Founder & Bespoke Couture Concierge
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="text-[#B39B82] hover:text-[#FAF6ED] p-1.5 rounded-lg hover:bg-[#2F241A] transition-colors cursor-pointer"
                title="Restart conversation"
                aria-label="Restart chat"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#B39B82] hover:text-[#FAF6ED] p-1.5 rounded-lg hover:bg-[#2F241A] transition-colors cursor-pointer"
                title="Minimize chatbot"
                aria-label="Minimize chatbot"
              >
                <ChevronDown size={17} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#17130F] text-[#E8DFD5] scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <RamaniAvatar size="sm" border="gold" className="mt-0.5" />
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs sm:text-[13px] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#800020] to-[#5C0017] text-[#FAF6ED] rounded-tr-xs border border-[#C5A059]/40'
                      : 'bg-[#221B15] text-[#FAF6ED] rounded-tl-xs border border-[#3D3023]'
                  }`}
                >
                  {renderFormattedText(msg.content)}
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-[#F3EBD4]/70' : 'text-[#A89887]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center justify-start">
                <div className="relative">
                  <RamaniAvatar size="sm" border="gold" />
                  <span className="absolute inset-0 rounded-full ring-2 ring-[#C5A059] animate-ping opacity-40"></span>
                </div>
                <div className="bg-[#221B15] border border-[#3D3023] rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs text-[#C5A059] flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-[#A89887] ml-1">Mrs. K. Ramani is curating your style...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-[#1C1814] border-t border-[#2F241A] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] whitespace-nowrap bg-[#271E17] hover:bg-[#382B20] text-[#FAF6ED] hover:text-[#C5A059] px-2.5 py-1 rounded-full border border-[#3D3023] hover:border-[#C5A059]/50 transition-all cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Direct WhatsApp Concierge Bar inside chatbot */}
          <div className="px-3 py-1.5 bg-[#120F0C] border-t border-[#2A2016] flex items-center justify-between text-[11px] text-[#B39B82] shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
              Mrs. K. Ramani WhatsApp:
            </span>
            <a
              href="https://wa.me/919347159353?text=Hello%20Aavira%20Haute%20Couture,%20I%20would%20like%20to%20inquire%20about%20a%20bespoke%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#25D366] hover:text-white font-medium transition-colors"
            >
              <MessageCircle size={12} />
              <span>+91 9347159353</span>
              <ExternalLink size={10} />
            </a>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-[#14100C] border-t border-[#3D3023] flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about bridal pattu, soft silks, designer sarees, blouse stitching..."
              disabled={isLoading}
              className="flex-1 bg-[#221B15] text-[#FAF6ED] placeholder-[#8A7969] text-xs px-3 py-2.5 rounded-xl border border-[#3D3023] focus:outline-none focus:border-[#C5A059] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#C5A059] hover:bg-[#D8B46C] active:bg-[#B38C45] disabled:opacity-40 disabled:cursor-not-allowed text-[#1C1814] flex items-center justify-center transition-colors shadow-md cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
