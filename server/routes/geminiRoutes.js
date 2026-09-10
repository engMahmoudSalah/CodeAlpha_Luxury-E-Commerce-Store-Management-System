import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getAllProducts } from '../services/productService.js';

const router = Router();

// Lazy-initialization function for GoogleGenAI to prevent startup crash if GEMINI_API_KEY is not set
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required but missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

router.post('/concierge', async (req, res, next) => {
  try {
    const { messages, userEmail, userName } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'messages parameter is required and must be an array.' }
      });
    }

    // Safely initialize the client (lazy loaded)
    let ai;
    try {
      ai = getGeminiClient();
    } catch (err) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'GEMINI_NOT_CONFIGURED',
          message: 'مساعد فخامة الذكي غير متاح حالياً لأن مفتاح الربط للـ API غير مهيأ في الإعدادات.'
        }
      });
    }

    // Fetch products to give context to Gemini
    const dbProducts = getAllProducts();
    const productContextString = dbProducts.map(p => 
      `- الاسم: ${p.name}\n  القسم: ${p.category}\n  الوصف: ${p.description}\n  السعر: ${p.price} ر.س\n  الرابط: /products/${p.id}\n  المخزون: ${p.stock} قطع`
    ).join('\n\n');

    // System instruction for Fakhama Personal Concierge
    const systemInstruction = `أنت "مساعد فخامة الملكي الذكي" (Fakhama Royal Concierge) - مستشار التسوق والمساعد الشخصي للنخبة وكبار الشخصيات في متجر "فخامة" الراقي.
تتحدث باللغة العربية الفصحى الراقية واللبقة، وبأسلوب يعكس الفخامة والأناقة والتقدير البالغ للعملاء (مثل استخدام كلمات: "يا فندم"، "عميلنا المبجل"، "ذوقكم الرفيع"، "يسعدني خدمتك").

معلومات المتجر:
- الاسم: متجر فخامة (Fakhama Store).
- المزايا: الشحن السريع المؤمن مجاناً لجميع الطلبات فوق 500 ريال، والضمان الذهبي لمدة سنتين على كافة المنتجات (استبدال وصيانة فورية)، والاسترجاع الميسر خلال 14 يوماً.
- التغليف الملكي: يتم تغليف المقتنيات يدوياً بعبوات مخملية فاخرة مجاناً مع كرت إهداء شخصي مخصص.
- المحفظة الملكية ونقاط الولاء: كل 10 ريالات تمنح العميل نقطة ولاء واحدة. يمكن للعملاء الدفع باستخدام رصيد المحفظة الخاص بهم مباشرة في صفحة الدفع.
- فئات العضوية الملكية: الفئة القياسية (Standard)، الفضية (Silver) عند الصرف > 3000 ريال، الذهبية (Gold) > 8000 ريال، والنخبة الملكية (VIP Royal) > 15000 ريال مع خدمات كونسيرج خاصة وهدايا حصرية.

اسم العميل الحالي المتحدث إليك: ${userName || 'ضيفنا الكريم'}
بريده الإلكتروني: ${userEmail || 'غير مسجل حالياً'}

الكتالوج والمقتنيات المتوفرة في المتجر حالياً (استخدم هذه القائمة الحقيقية حصراً لمساعدة العميل واقتراح المنتجات المناسبة له، وقدم روابط المنتجات بالطريقة الموضحة أدناه):
${productContextString}

تعليمات هامة:
1. لا تقم أبداً باختراع منتجات غير موجودة في القائمة أعلاه.
2. عندما تذكر أي منتج من الكتالوج، يفضل أن تذكر رابطه بصيغة [اسم المنتج](/products/رقم_المعرف) ليسهل على العميل النقر عليه والانتقال مباشرة لصفحة المقتنى (مثال: [ساعة فخامة الملكية](/products/1)).
3. أجب عن تساؤلات العميل حول الشحن، تتبع الطلبات، المحفظة ونقاط الولاء الفاخرة بشكل واضح وجذاب وبأسلوب تراثي فاخر مفعم بالأدب واللباقة العربية الأصيلة.`;

    // Map messages payload to Gemini API style
    // The @google/genai SDK expects contents array or a chat. 
    // We can use a direct generateContent or chat. 
    // Let's map the incoming messages to standard Content parts.
    // For safety, let's map the last few messages to keep token count low and conversation fluid.
    const contents = messages.map(msg => {
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || '';

    return res.status(200).json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
