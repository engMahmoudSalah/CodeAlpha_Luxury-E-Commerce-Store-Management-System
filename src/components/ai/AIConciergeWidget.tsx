import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, MessageSquareCode, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIConciergeWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested starting prompts
  const suggestions = [
    {
      label: '🎁 اقتراح هدية فاخرة',
      prompt: 'أبحث عن هدية ملكية فاخرة ومميزة لشخص عزيز، بميزانية راقية. ماذا تقترح علي؟'
    },
    {
      label: '⚜️ العضوية الملكية والولاء',
      prompt: 'كيف يمكنني الانضمام لفئات العضوية الملكية في متجر فخامة؟ وما هي مميزات فئة النخبة؟'
    },
    {
      label: '📦 الشحن والتغليف الذهبي',
      prompt: 'أريد معرفة تفاصيل التغليف المخملي الملكي، وهل تتوفر كروت إهداء مع الطلبات؟'
    }
  ];

  // Set initial greeting
  useEffect(() => {
    const greetingText = user 
      ? `أهلاً بك عميلنا المبجل، ${user.name || 'يا فندم'}. يسعدني ويشرفني خدمتك اليوم في كونسيرج فخامة الملكي. كيف يمكنني مساعدة ذوقكم الرفيع في اختيار أرقى المقتنيات والتحف؟`
      : 'أهلاً بك ضيفنا الكريم في كونسيرج فخامة الملكي. يسعدني مساعدتك في استكشاف مقتنياتنا الملكية النادرة واقتراح أفضل الهدايا الفاخرة التي تليق بكم. كيف يمكنني خدمتك اليوم؟';
    
    setMessages([
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: greetingText,
        timestamp: new Date()
      }
    ]);

    // Show a subtle invitation notification after a few seconds
    const timer = setTimeout(() => {
      if (!isOpen) {
        if (window.innerWidth >= 640) setShowNotification(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [user]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowNotification(false);

    try {
      // Build full context of discussion
      const historyPayload = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/gemini/concierge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: historyPayload,
          userEmail: user?.email || '',
          userName: user?.name || ''
        })
      });

      const json = await response.json();

      if (json.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: json.data.reply,
            timestamp: new Date()
          }
        ]);
      } else {
        const errMsg = json.error?.message || 'عذراً يا فندم، واجهت صعوبة في معالجة طلبك حالياً. يرجى المحاولة مرة أخرى.';
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-error`,
            role: 'assistant',
            content: errMsg,
            timestamp: new Date()
          }
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-network-error`,
          role: 'assistant',
          content: 'عذراً يا فندم، تعذر الاتصال بخادم الكونسيرج الملكي الآن. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const greetingText = user 
      ? `أهلاً بك مجدداً عميلنا المبجل، ${user.name || 'يا فندم'}. تم تجديد جلسة الكونسيرج. كيف يسعدني مساعدتك الآن؟`
      : 'أهلاً بك مجدداً ضيفنا الكريم. تم تجديد جلسة الكونسيرج الملكي. كيف يمكنني خدمتك الآن؟';
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: greetingText,
        timestamp: new Date()
      }
    ]);
  };

  // Safe client-side markdown formatter for simple bold and links
  const formatMessage = (text: string) => {
    // 1. Double break representation
    const paragraphs = text.split('\n');
    
    return paragraphs.map((para, pIdx) => {
      if (!para.trim()) return <div key={pIdx} className="h-2" />;
      
      // Match bold markdown **text** and links [label](url)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      
      let elements: React.ReactNode[] = [];
      let lastIndex = 0;
      
      // We can do a manual loop parsing to match both bold and links elegantly
      // For simplicity, we can split by parts
      const parts = para.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
      
      const parsedParts = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-extrabold text-[#9A7F56]">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            const [_, label, url] = match;
            return (
              <a 
                key={index} 
                href={url} 
                className="text-[#C5A880] hover:text-[#9A7F56] font-bold underline underline-offset-4 decoration-[#C5A880]/40 hover:decoration-[#9A7F56]"
                onClick={(e) => {
                  // If it's a SPA route, we let React Router handle it (we can use standard navigating if needed)
                  if (url.startsWith('/')) {
                    // Let browser route, or handle SPA
                  }
                }}
              >
                {label}
              </a>
            );
          }
        }
        return part;
      });

      return (
        <p key={pIdx} className="leading-relaxed text-sm md:text-base mb-1.5 text-stone-800">
          {parsedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 select-none" dir="rtl">
        <AnimatePresence>
          {showNotification && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-[#1C1917] border border-[#C5A880]/30 text-stone-100 rounded-2xl shadow-xl p-4 max-w-xs md:max-w-sm mb-1 text-right flex flex-col gap-2 pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-[#C5A880]/20 p-1.5 rounded-lg border border-[#C5A880]/30">
                    <Sparkles className="w-4 h-4 text-[#C5A880] animate-pulse" />
                  </div>
                  <span className="font-bold text-xs text-[#C5A880] tracking-wide">الكونسيرج الملكي</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotification(false);
                  }}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-medium">
                مرحباً بك يا فندم! هل تحتاج للمساعدة في اختيار مقتنى فاخر أو هدية مميزة؟ أنا هنا لخدمتك.
              </p>
              <button
                onClick={() => {
                  setIsOpen(true);
                  setShowNotification(false);
                }}
                className="text-right text-xs text-[#C5A880] hover:text-[#e4ccaa] font-bold flex items-center gap-1 transition-all mt-1 cursor-pointer"
              >
                تحدث معي الآن <ArrowLeft className="w-3 h-3 rotate-180" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="fakhama-ai-trigger"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowNotification(false);
          }}
          className="relative bg-gradient-to-tr from-[#1C1917] to-[#2E2A24] text-[#C5A880] hover:text-[#E4CCAA] w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl border border-[#C5A880]/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50"
        >
          {/* Pulsing Outer Glow */}
          <span className="absolute inset-0 rounded-full bg-[#C5A880]/10 animate-ping opacity-70" />
          
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <Sparkles className="w-6 h-6 text-[#C5A880]" />
          )}
        </motion.button>
      </div>

      {/* Main Dialog / Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 left-6 md:left-auto md:w-[420px] max-w-full h-[600px] bg-white border border-[#E4CCAA]/40 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden font-alexandria"
            dir="rtl"
          >
            {/* Royal Header */}
            <div className="bg-gradient-to-r from-[#1C1917] to-[#2B2721] text-stone-100 p-4 border-b border-[#C5A880]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 text-[#C5A880] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#C5A880] text-sm md:text-base flex items-center gap-1.5">
                    مساعد فخامة الذكي
                    <span className="bg-[#C5A880]/20 text-[#C5A880] text-[10px] px-2 py-0.5 rounded-full border border-[#C5A880]/30 font-bold">
                      الكونسيرج الملكي
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-400 font-medium">مستشارك الخاص للمقتنيات الفاخرة والهدايا</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  title="تجديد الجلسة"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#C5A880] hover:bg-[#C5A880]/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Pane */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F6] space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                      msg.role === 'user' 
                        ? 'bg-[#EFECE6] text-stone-800 border-[#D8D4C7] rounded-tr-none' 
                        : 'bg-white text-stone-800 border-[#E5E2D9] rounded-tl-none'
                    }`}
                  >
                    {/* Role indicator header */}
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-stone-400">
                      {msg.role === 'user' ? (
                        <span>أنت</span>
                      ) : (
                        <span className="text-[#9A7F56] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#C5A880]" /> كونسيرج فخامة
                        </span>
                      )}
                    </div>

                    {/* Formatted body */}
                    <div className="prose prose-sm max-w-none font-medium">
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-white text-stone-800 border border-[#E5E2D9] rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-stone-400">
                      <span className="text-[#9A7F56] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#C5A880] animate-spin" /> كونسيرج فخامة يكتب الآن...
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2 px-1">
                      <span className="w-2 h-2 bg-[#C5A880] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-[#C5A880] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-[#C5A880] rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (Shown if only greeting or short dialogue exists) */}
            {messages.length <= 2 && !isLoading && (
              <div className="bg-[#FAF9F6] px-4 pb-3 pt-1 border-t border-stone-100 flex flex-col gap-1.5">
                <span className="text-[10px] text-stone-400 font-extrabold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#C5A880]" /> أسئلة مقترحة لبدء الحوار:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="text-[11px] text-[#866B43] hover:text-stone-900 bg-[#C5A880]/10 hover:bg-[#C5A880]/20 border border-[#C5A880]/30 hover:border-[#C5A880]/50 rounded-xl px-2.5 py-1.5 font-bold transition-all text-right cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form Footer */}
            <div className="p-3 bg-white border-t border-stone-100">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب استفسارك هنا بكل أدب يا فندم..."
                  disabled={isLoading}
                  className="flex-1 bg-stone-50 border border-stone-200 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold placeholder-stone-400 outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-tr from-[#1C1917] to-[#2E2A24] hover:from-[#2E2A24] hover:to-[#1C1917] text-[#C5A880] disabled:bg-stone-100 disabled:text-stone-300 disabled:border-stone-200 disabled:scale-100 border border-[#C5A880]/30 w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md cursor-pointer transition-all disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </motion.button>
              </form>
              <div className="text-[10px] text-center text-stone-400 mt-2 font-medium">
                مدعوم بالذكاء الاصطناعي من متجر فخامة • إجابات فورية ومعتمدة على الكتالوج الحقيقي
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
