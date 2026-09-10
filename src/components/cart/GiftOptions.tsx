import React, { useState } from 'react';
import { Gift, Check, Sparkles } from 'lucide-react';

interface GiftOptionsProps {
  giftWrapping: boolean;
  giftMessage: string;
  onToggleGiftWrapping: (enabled: boolean) => void;
  onUpdateGiftMessage: (msg: string) => void;
}

export const GiftOptions: React.FC<GiftOptionsProps> = ({
  giftWrapping,
  giftMessage,
  onToggleGiftWrapping,
  onUpdateGiftMessage,
}) => {
  const [isOpen, setIsOpen] = useState(giftWrapping);

  const handleToggle = (checked: boolean) => {
    setIsOpen(checked);
    onToggleGiftWrapping(checked);
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E8E3D8] p-5 sm:p-6 shadow-2xs font-arabic" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FCFAF7] border border-[#F0EAE1] flex items-center justify-center text-[#008F68]">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#111111]">تغليف الهدايا الملكي الفاخر</h3>
              <span className="text-[10px] font-black px-2 py-0.5 bg-[#FFC700]/15 text-[#855B00] rounded-full">
                إهداء مميز
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              صندوق مخملي أسود، شريط حريري، وبطاقة إهداء مخصصة بخط عربي أصيل (مجاناً).
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={giftWrapping}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008F68]" />
        </label>
      </div>

      {/* Gift Message Input */}
      {giftWrapping && (
        <div className="mt-4 pt-4 border-t border-[#F0EAE1] flex flex-col gap-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-black text-[#111111]">
            <label htmlFor="gift-note-input" className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC700]" />
              <span>نص بطاقة الإهداء</span>
            </label>
            <span className="text-[10px] text-neutral-400 font-mono">
              {giftMessage.length}/150 حرف
            </span>
          </div>
          <textarea
            id="gift-note-input"
            rows={3}
            maxLength={150}
            value={giftMessage}
            onChange={(e) => onUpdateGiftMessage(e.target.value)}
            placeholder="اكتب رسالتك الخاصة لمن تحب ليتم طباعتها على بطاقة الإهداء الفاخرة..."
            className="w-full bg-[#FCFAF7] border border-[#E8E3D8] rounded-2xl p-3 text-xs text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#008F68] focus:ring-1 focus:ring-[#008F68] leading-relaxed"
          />
          <div className="flex items-center gap-2 text-[11px] text-[#008F68] font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>سيتم إخفاء الفاتورة والأسعار تلقائياً من الطرد البريدي.</span>
          </div>
        </div>
      )}
    </div>
  );
};
