/**
 * Gaza Cash - ERP Business Server
 * Copyright (c) 2026 Gaza Cash Team. All rights reserved.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json());

// Lazy load Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not set. AI Features will be disabled or simulated.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'gaza-cash-desktop',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Business Advisor AI (Arabic Conversational Intelligence)
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { message, history, businessState } = req.body;
    
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      // Return a friendly simulation response if key is missing so user experience is smooth
      const mockResponses = [
        `أهلاً بك في نظام **غزة كاش** الذكي. يرجى توفير مفتاح الـ API الخاص بـ Gemini في الإعدادات للاستفادة الكاملة من التحليلات الحقيقية.
        
بناءً على البيانات المرسلة إليّ لـ **"${businessState?.groupName || 'المجموعة الحالية'}"**:
- إجمالي المبيعات: \`${businessState?.totalSales || 0} شيكل/دولار\`
- عدد الأصناف بالمخزن: \`${businessState?.itemsCount || 0} صنف\`
- أصناف قاربت على النفاد: \`${businessState?.lowStockCount || 0} صنف\`

**💡 نصيحة سريعة للاستقرار المالي:** 
ننصحك بجدولة الديون الآجلة للعملاء، ومتابعة النقص في الأصناف الأساسية لضمان استمرارية البيع دون انقطاع.`,
        `مرحباً بك! كشريك مالي ذكي لمحل **"${businessState?.groupName || 'غزة كاش'}"**:
أرى أن مخزونك الحالي يحتوي على \`${businessState?.itemsCount || 0}\` صنفاً. هناك \`${businessState?.lowStockCount || 0}\` أصناف تحتاج لإعادة طلب فورية لتفادي ضياع فرص بيع مع الزبائن.
هل تود مني توليد تقرير مشتريات مقترح لهذه الأصناف الناقصة؟`,
        `تحياتي لك من مساعد **غزة كاش** المالي!
ألقيت نظرة على مبيعاتك الحالية البالغة \`${businessState?.totalSales || 0}\` ونلاحظ أن البيع الآجل يشكل جزءاً هاماً. من الضروري جداً كبح جماح سحب الآجل للعملاء ذوي الذمم الراكدة لتفادي أزمات السيولة النقدية.`
      ];
      
      const idx = Math.floor(Math.random() * mockResponses.length);
      return res.json({ response: mockResponses[idx] });
    }

    const ai = getAiClient();
    
    // Construct rich business context to feed the AI
    const systemPrompt = `أنت الخبير المالي والمستشار التجاري الذكي المدمج في نظام "غزة كاش" (Gaza Cash) لإدارة الشركات والمخازن.
مهمتك مساعدة التاجر في غزة وفلسطين لإدارة نشاطه التجاري بكفاءة قصوى، الإجابة عن استفساراته، تحليل المبيعات والمخازن، وتقديم نصائح عملية للنمو وتقليل الخسائر والتحكم بالديون والسيولة.

المعلومات الحالية للنشاط التجاري الفعلي للتاجر (المجموعة النشطة):
- اسم النشاط التجاري: ${businessState?.groupName || 'غير محدد'}
- العنوان: ${businessState?.address || 'غير محدد'}
- عدد الأصناف الإجمالي: ${businessState?.itemsCount || 0} صنف
- عدد الأصناف التي تحت خطر نفاد المخزون: ${businessState?.lowStockCount || 0} صنف
- إجمالي المبيعات المسجلة: ${businessState?.totalSales || 0}
- إجمالي المشتريات المسجلة: ${businessState?.totalPurchases || 0}
- عدد العملاء والموردين النشطين: ${businessState?.contactsCount || 0} عميل ومورد

التعليمات:
1. أجب دائماً باللغة العربية بأسلوب مهني، مشجع، محترم، وواضح جداً ومحبب للتاجر الفلسطيني.
2. استخدم تنسيق ماركداون (Markdown) الأنيق (نقاط، خط عريض، جداول عند الحاجة).
3. عند الإشارة إلى الأرقام والمؤشرات من البيانات أعلاه، حللها وقدم تعليقاً مالياً ذكياً وموجزاً ومقترحات لتحسين الأداء.
4. يرجى التركيز على إدارة السيولة، تقليل الديون الآجلة المتراكمة على الزبائن، والتحذير من نفاد المخزون للأصناف الأساسية.
5. لا تذكر أي تفاصيل فنية برمجية للتاجر، تحدث معه مباشرة كتاجر ومستشار أعمال ذكي ومجرب.`;

    const chatHistory = (history || []).map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // Generate response using modern gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...chatHistory,
        { text: `رسالة المستخدم الحالية: ${message}` }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const reply = response.text || 'لم يتمكن المحلل المالي من معالجة البيانات، يرجى المحاولة لاحقاً.';
    return res.json({ response: reply });

  } catch (error: any) {
    console.error('Error with Gemini Advisor API:', error);
    res.status(500).json({ error: 'حدث خطأ في الاتصال بمساعد غزة كاش المالي.' });
  }
});

// 2. Serve Application
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode - Use Vite middleware
    console.log('Running in Development mode with Vite Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode - Serve static files
    console.log('Running in Production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gaza Cash Server is running on http://localhost:${PORT}`);
  });
}

startServer();
