import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { commerceStore } from '../shared/store/commerceStore';
import { useAuth } from '../context/AuthContext';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const storeSettings = commerceStore.getStoreSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || !subject.trim()) {
      showToast('يرجى ملء كافة الحقول الإلزامية.', 'warning');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay for realistic experience
    setTimeout(() => {
      const ticket = commerceStore.addSupportTicket({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        subject,
        message
      });
      
      setTicketNumber(ticket.ticketNumber);
      setIsSubmitted(true);
      setIsSubmitting(false);
      showToast('تم إرسال استفسارك بنجاح.', 'success');
      
      // Reset form if they want to submit another
      setMessage('');
      setSubject('');
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 sm:px-6 font-arabic" dir="rtl">
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#E8E3D8] shadow-2xs text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-[#111111] tracking-tight">تم استلام طلبكم بنجاح</h2>
          <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
            نشكركم على تواصلكم مع منصة فخامة. رقم التذكرة الخاص بكم هو:
          </p>
          <div className="px-5 py-3 rounded-xl bg-[#FAF8F3] border border-[#E8E3D8] font-mono font-black text-lg tracking-wider text-[#111111]">
            {ticketNumber}
          </div>
          <p className="text-xs text-neutral-400 max-w-md leading-relaxed mt-2">
            سيقوم مستشارونا بمراجعة طلبكم والرد عليكم في أقرب وقت ممكن عبر البريد الإلكتروني أو الهاتف المسجل.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <Button variant="primary" onClick={() => setIsSubmitted(false)}>
              إرسال رسالة أخرى
            </Button>
            <Link to="/">
              <Button variant="outline">
                العودة للمعرض
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 font-arabic flex flex-col gap-12" dir="rtl">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008F68]/10 text-[#008F68] text-xs font-black">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>مركز الدعم والتواصل</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
          نحن هنا لخدمتك على مدار الساعة
        </h1>
        <p className="text-sm text-neutral-500 max-w-xl leading-relaxed">
          سواء كان لديك استفسار حول المقتنيات، أو تحتاج إلى مساعدة في طلباتك الحالية، فإن مستشاري فخامة مستعدون دائماً لتقديم أرفع مستويات الخدمة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#008F68]/10 text-[#008F68] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#111111]">رقم الدعم الموحد</h3>
              <p className="text-xs text-neutral-500 mt-1">متاح طوال أيام الأسبوع</p>
              <a href={`tel:${storeSettings.contactPhone}`} className="text-lg font-mono font-black text-[#111111] hover:text-[#008F68] transition-colors mt-2 block" dir="ltr">
                {storeSettings.contactPhone || '+966 50 000 0000'}
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC700]/20 text-amber-700 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#111111]">البريد الإلكتروني</h3>
              <p className="text-xs text-neutral-500 mt-1">للاستفسارات الرسمية وخدمات ما بعد البيع</p>
              <a href={`mailto:${storeSettings.contactEmail}`} className="text-sm font-mono font-bold text-[#111111] hover:text-[#008F68] transition-colors mt-2 block">
                {storeSettings.contactEmail || 'vip@luxestore.com'}
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#FFC700] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#111111]">المكتب الرئيسي</h3>
              <p className="text-xs text-neutral-500 leading-relaxed mt-2">
                برج المملكة، طريق الملك فهد<br />
                الرياض 12214<br />
                المملكة العربية السعودية
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-[#E8E3D8] shadow-2xs p-6 sm:p-10">
            <h2 className="text-xl font-black text-[#111111] mb-2">أرسل استفسارك</h2>
            <p className="text-xs text-neutral-500 mb-8">
              يرجى تعبئة النموذج أدناه وسيقوم أحد ممثلينا بالتواصل معك في أقرب وقت.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="الاسم الكامل"
                  placeholder="محمد العبدالله"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="رقم الهاتف (اختياري)"
                  type="tel"
                  placeholder="+966 5X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#111111]">نوع الاستفسار *</label>
                  <select
                    className="w-full px-4 py-3 bg-[#FAF8F3] border border-[#E8E3D8] rounded-xl text-sm focus:outline-none focus:border-[#008F68] focus:ring-1 focus:ring-[#008F68]"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >
                    <option value="" disabled>اختر نوع الاستفسار...</option>
                    <option value="استفسار عن منتج">استفسار عن مقتنى / منتج</option>
                    <option value="متابعة طلب">متابعة حالة طلب</option>
                    <option value="خدمة ما بعد البيع والضمان">خدمة ما بعد البيع والضمان</option>
                    <option value="مبيعات الشركات والهدايا">مبيعات الشركات وهدايا كبار الشخصيات</option>
                    <option value="شكوى أو اقتراح">شكوى أو اقتراح</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#111111]">نص الرسالة *</label>
                <textarea
                  className="w-full px-4 py-3 bg-[#FAF8F3] border border-[#E8E3D8] rounded-xl text-sm focus:outline-none focus:border-[#008F68] focus:ring-1 focus:ring-[#008F68] min-h-[150px] resize-y"
                  placeholder="كيف يمكننا مساعدتك اليوم؟"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FCFAF7] border border-[#E8E3D8] text-xs text-neutral-500 mt-2">
                <AlertCircle className="w-4 h-4 text-[#008F68] shrink-0" />
                <span>يتم التعامل مع جميع بياناتك ومراسلاتك بسرية تامة وتشفير كامل وفقاً لسياسة الخصوصية الخاصة بنا.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
                className="mt-4"
              >
                إرسال الرسالة الآن
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
