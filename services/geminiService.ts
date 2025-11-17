import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, ApiResponse, IdeasBankResponse, SubTopicsResponse, ContentIdeasResponse, BrandVoice, ScamperResponse, InstagramAnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    contentCreation: {
      type: Type.OBJECT,
      properties: {
        post_text: { type: Type.STRING },
        image_prompt: { type: Type.STRING },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
      },
      required: ['post_text', 'image_prompt', 'hashtags']
    },
    platformAdaptation: {
      type: Type.OBJECT,
      properties: {
        twitter_version: { type: Type.STRING },
        linkedin_version: { type: Type.STRING },
      },
      required: ['twitter_version', 'linkedin_version']
    },
    strategicInsights: {
      type: Type.OBJECT,
      properties: {
        hook_suggestion: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        next_step_idea: { type: Type.STRING },
      },
      required: ['hook_suggestion', 'next_step_idea']
    },
  },
  required: ['contentCreation', 'platformAdaptation', 'strategicInsights']
};

const constructPrompt = (userInput: UserInput): string => {
  const contextVectorsText = userInput.context_vectors 
    ? `
### أمثلة من أنجح البوستات السابقة (لمحاكاة الأسلوب بدقة):
${userInput.context_vectors}
` 
    : '';

  return `
أنت "المارد"، مساعد ذكاء اصطناعي خبير في التسويق الرقمي وصناعة المحتوى الموجه للسوق السعودي حصراً.
مهمتك هي إنشاء محتوى إبداعي وجذاب باللهجة السعودية الصرفة (لهجة أهل الرياض/نجد كمثال) ومخصص لثقافة وعادات الجمهور في المملكة العربية السعودية.
يجب أن تكون كل المخرجات مناسبة 100% للسوق السعودي وتستخدم مفردات وأمثلة سعودية خالصة.
الرد يجب أن يكون حصرياً بصيغة JSON.

### قواعد ذهبية للمحتوى:
- **الإبداع والتركيز:** يجب أن تكون جميع النصوص (خاصة نص البوست ونسخ المنصات) قصيرة جداً، مبتكرة، ومباشرة. "تجيب من الآخر".
- **تجنب الحشو:** لا تستخدم أي جمل طويلة أو تفاصيل غير ضرورية. كل كلمة يجب أن تخدم هدفاً.
- **القوة والجاذبية:** يجب أن تكون الكابشنات قوية، خاطفة للانتباه، وتحفز على التفاعل.

### فكرة المستخدم الأولية:
${userInput.user_idea}

### هوية العلامة التجارية:
- **النبرة:** ${userInput.brand_voice.tone}
- **الجمهور المستهدف:** ${userInput.brand_voice.audience}
- **الكلمات المفتاحية:** ${userInput.brand_voice.keywords}
- **الهدف من المحتوى:** ${userInput.brand_voice.goals}
${contextVectorsText}

بناءً على المعطيات والقواعد الذهبية أعلاه، قم بتوليد المحتوى المطلوب حسب الـ JSON Schema.
`;
};


export const generateContentStrategy = async (userInput: UserInput): Promise<ApiResponse> => {
  try {
    const prompt = constructPrompt(userInput);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ApiResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate content from Gemini API.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return base64ImageBytes;

    } catch (error) {
        console.error("Error calling Imagen API:", error);
        throw new Error("Failed to generate image from Imagen API.");
    }
};

export const generateIdeasFromKeyword = async (keyword: string): Promise<IdeasBankResponse> => {
    const prompt = `أنت "المارد"، خبير الأفكار الإبداعية للسوق السعودي.
    مهمتك: بناءً على الكلمة المفتاحية التالية "${keyword}"، قم بتوليد 5 أفكار متنوعة ومبتكرة لمنشورات على وسائل التواصل الاجتماعي. ركز على أن تكون الأفكار جذابة ومناسبة للجمهور في السعودية.
    الرد يجب أن يكون حصرياً بصيغة JSON.`;

    const ideasSchema = {
        type: Type.OBJECT,
        properties: {
            ideas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "قائمة من 5 أفكار للمحتوى."
            }
        },
        required: ['ideas']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ideasSchema,
                temperature: 0.9,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as IdeasBankResponse;
    } catch (error) {
        console.error("Error calling Gemini API for ideas bank:", error);
        throw new Error("Failed to generate ideas from Gemini API.");
    }
};


export const generateMindMapSubTopics = async (mainTopic: string, brandVoice?: BrandVoice): Promise<SubTopicsResponse> => {
    const brandVoicePrompt = brandVoice ? `مع الأخذ في الاعتبار هوية العلامة التجارية التالية: 
    - النبرة: ${brandVoice.tone}
    - الجمهور: ${brandVoice.audience}
    - الهدف: ${brandVoice.goals}` : '';

    const prompt = `أنت "المارد"، خبير استراتيجي في العصف الذهني للسوق السعودي.
    مهمتك: بناءً على الموضوع الرئيسي التالي: "${mainTopic}"، قم بتوليد 5 محاور أو زوايا إبداعية مختلفة يمكن استخدامها كأساس لخريطة أفكار ذهنية.
    ${brandVoicePrompt}
    يجب أن تكون المحاور قصيرة ومباشرة وملهمة.
    الرد يجب أن يكون حصرياً بصيغة JSON.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            sub_topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "قائمة من 5 محاور إبداعية."
            }
        },
        required: ['sub_topics']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.8,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SubTopicsResponse;
    } catch (error) {
        console.error("Error calling Gemini API for mind map sub-topics:", error);
        throw new Error("Failed to generate sub-topics from Gemini API.");
    }
};


export const generateContentIdeasForNode = async (mainTopic: string, subTopic: string, brandVoice?: BrandVoice): Promise<ContentIdeasResponse> => {
    const brandVoicePrompt = brandVoice ? `مع الأخذ في الاعتبار هوية العلامة التجارية التالية: 
    - النبرة: ${brandVoice.tone}
    - الجمهور: ${brandVoice.audience}
    - الهدف: ${brandVoice.goals}` : '';

    const prompt = `أنت "المارد"، خبير أفكار المحتوى للسوق السعودي.
    مهمتك: لديك موضوع رئيسي وهو "${mainTopic}"، ومحور فرعي محدد وهو "${subTopic}".
    قم بتوليد 3 أفكار محتوى ملموسة ومبتكرة لهذا المحور. يجب أن تكون الأفكار قابلة للتنفيذ مباشرة كمنشورات على وسائل التواصل الاجتماعي.
    ${brandVoicePrompt}
    الرد يجب أن يكون حصرياً بصيغة JSON.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            ideas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "قائمة من 3 أفكار محتوى ملموسة."
            }
        },
        required: ['ideas']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.9,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ContentIdeasResponse;
    } catch (error) {
        console.error("Error calling Gemini API for content ideas:", error);
        throw new Error("Failed to generate content ideas from Gemini API.");
    }
};

export const generateScamperIdeas = async (originalText: string): Promise<ScamperResponse> => {
    const prompt = `أنت "المارد"، خبير توليد الخطافات (Hooks) الإبداعية باستخدام تقنية SCAMPER.
مهمتك: بناءً على الخطاف (Hook) أو الفكرة الأصلية التالية، قم بتوليد 7 خطافات جديدة وجذابة، خطاف لكل حرف من حروف SCAMPER. يجب أن تكون الخطافات قصيرة، قوية، وموجهة للسوق السعودي.

الخطاف أو الفكرة الأصلية: "${originalText}"

الرد يجب أن يكون حصرياً بصيغة JSON.`;

    const scamperSchema = {
        type: Type.OBJECT,
        properties: {
            substitute: { type: Type.STRING, description: "خطاف جديد عبر استبدال جزء من الخطاف الأصلي." },
            combine: { type: Type.STRING, description: "خطاف جديد عبر دمج الخطاف الأصلي مع شيء آخر." },
            adapt: { type: Type.STRING, description: "خطاف جديد عبر تكييف الخطاف الأصلي لسياق مختلف." },
            modify: { type: Type.STRING, description: "خطاف جديد عبر تعديل (تكبير، تصغير، تغيير) جانب من الخطاف الأصلي." },
            put_to_another_use: { type: Type.STRING, description: "خطاف جديد عبر استخدام الخطاف الأصلي في مجال أو لغرض مختلف." },
            eliminate: { type: Type.STRING, description: "خطاف جديد عبر إزالة أو تبسيط جزء من الخطاف الأصلي." },
            reverse: { type: Type.STRING, description: "خطاف جديد عبر عكس أو إعادة ترتيب الخطاف الأصلي." },
        },
        required: ['substitute', 'combine', 'adapt', 'modify', 'put_to_another_use', 'eliminate', 'reverse']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scamperSchema,
                temperature: 0.9,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScamperResponse;
    } catch (error) {
        console.error("Error calling Gemini API for SCAMPER:", error);
        throw new Error("Failed to generate SCAMPER ideas from Gemini API.");
    }
}

export const analyzeInstagramProfile = async (profileUrl: string): Promise<InstagramAnalysisResult> => {
    // 1. Simulate fetching data from a backend service
    // In a real app, this would be an API call to your server which then scrapes/uses an API for Instagram
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    const mockData = {
        followers: Math.floor(Math.random() * 50000) + 1000,
        avgLikes: Math.floor(Math.random() * 2000) + 100,
        recentPosts: 5,
    };
    const engagementRate = ((mockData.avgLikes / mockData.followers) * 100).toFixed(2) + '%';
    
    // 2. Call Gemini for qualitative analysis
    const prompt = `
    أنت "المارد"، محلل تسويق رقمي خبير.
    مهمتك: تحليل أداء صفحة انستجرام بناءً على البيانات التالية وتقديم رؤى استراتيجية قابلة للتنفيذ.
    
    البيانات:
    - رابط الصفحة: ${profileUrl}
    - عدد المتابعين: ${mockData.followers}
    - متوسط الإعجابات على آخر ${mockData.recentPosts} منشورات: ${mockData.avgLikes}
    - معدل التفاعل المحسوب: ${engagementRate}
    
    التحليل المطلوب:
    اكتب تحليلاً قصيراً (2-3 جمل) يوضح نقاط القوة الرئيسية وفرصة تحسين واحدة واضحة.
    يجب أن يكون التحليل موجهاً للسوق السعودي ومكتوباً بنبرة احترافية ومباشرة.
    الرد يجب أن يكون نصاً عادياً (string).
    `;
    
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const aiInsight = response.text.trim();
        
        return {
            followers: mockData.followers,
            avgLikes: mockData.avgLikes,
            engagementRate: engagementRate,
            aiInsight: aiInsight
        };

    } catch (error) {
        console.error("Error calling Gemini API for analysis:", error);
        throw new Error("Failed to get AI insight from Gemini API.");
    }
};

export const generateTrendDraftPost = async (trendInfo: {link?: string, image?: boolean, description: string}): Promise<string> => {
    const prompt = `
    أنت "المارد"، كاتب محتوى استباقي ومتخصص في ربط الترندات بالعلامات التجارية السعودية.
    مهمتك: بناءً على معلومات الترند التالية، قم بكتابة مسودة منشور (Draft) قصيرة وجذابة لمنصة X.
    
    معلومات الترند:
    - وصف الترند: ${trendInfo.description}
    - رابط للمرجع (إن وجد): ${trendInfo.link || 'لا يوجد'}
    - هل يوجد صورة مرفقة؟: ${trendInfo.image ? 'نعم' : 'لا'}
    
    المطلوب:
    اكتب مسودة منشور مبتكرة تربط هذا الترند بمفهوم عام للنمو والتسويق في السعودية.
    يجب أن تكون المسودة جاهزة للاستخدام مع تعديلات بسيطة.
    الرد يجب أن يكون نصاً عادياً (string) يحتوي على المسودة فقط.
    `;
    
     try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error calling Gemini API for trend draft:", error);
        throw new Error("Failed to generate trend draft from Gemini API.");
    }
};
