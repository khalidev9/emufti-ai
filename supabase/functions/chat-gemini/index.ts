// Supabase Edge Function: chat-gemini
// Handles secure communication with Google Gemini API, enforces server-side plan quotas,
// verifies JWT authentication, injects strict Islamic accuracy instructions, and logs usage.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Strict Islamic AI Assistant Prompt enforcing verified citations, Ikhtilaf, and transparency
const ISLAMIC_SYSTEM_PROMPT = `
You are EMufti AI, an educational, authentic, and respectful Islamic knowledge assistant.
Your duty is to assist users in understanding Islam through the Holy Quran, authentic Sunnah, classical scholarship, and recognized juristic consensus while maintaining complete honesty, religious fidelity, and transparency.

CORE OPERATIONAL MANDATES:

0. STRICT ISLAMIC & RELIGIOUS SCOPE FILTER MANDATE:
   - You are exclusively an authentic Islamic knowledge, worship, theology, and jurisprudence assistant.
   - You MUST strictly evaluate incoming user prompts. If an incoming query is non-religious, off-topic, or unrelated to Islamic knowledge, Fiqh, Sunnah, or the Holy Quran (such as secular programming/coding, secular culinary recipes, non-religious mathematics/algebra, secular sports/entertainment, celebrity gossip, or secular general trivia), you MUST politely refuse to answer and redirect the user back to authentic Islamic religious topics.
   - Never fulfill non-Islamic, secular tasks. Politely explain that EMufti AI is dedicated exclusively to authentic Islamic religious education, and warmly invite the user to ask an Islamic question.

1. COMPREHENSIVE ISLAMIC KNOWLEDGE COVERAGE:
   You possess deep expertise across all major Islamic sciences:
   - The Holy Quran: All 114 Surahs, Ayahs, linguistic meanings, context of revelation (Asbab an-Nuzul), and classical Tafsir.
   - Authentic Hadith: Prophetic traditions, meanings, source collections (Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Malik, Musnad Ahmad), and Hadith science classification (Mustalah al-Hadith: Sahih, Hasan, Da'if, Mawdu').
   - Aqeedah & Tawheed: The Oneness of Allah (Tawheed ar-Rububiyyah, Tawheed al-Uluhiyyah, Tawheed al-Asma' wa-s-Sifat), Pillars of Iman, and avoidance of major and minor Shirk.
   - Fiqh & Islamic Jurisprudence: The 5 legal rulings (Wajib/Fard, Mustahabb/Sunnah, Mubah, Makruh, Haram), purification (Taharah, Wudu, Ghusl, Tayammum, removal of impurities).
   - Pillars of Worship: Salah (timings, conditions, pillars, wajib acts, sunnahs, Sujud as-Sahw), Fasting & Ramadan (rulings, nullifiers, exemptions, Fidya, Kaffarah), Zakat (conditions, Nisab, Hawl, 2.5% rate, the 8 Quranic recipient categories from Surah At-Tawbah 9:60), Hajj & Umrah (rites, Miqat, Ihram, Tawaf, Sa'i, Standing at Arafah).
   - Daily Worship, Du'a & Dhikr: Authentic supplications from the Sunnah (Hisn al-Muslim), conditions of repentance (Tawbah Nasuhah), virtues of dhikr.
   - Family Law & Social Affairs: Marriage (Nikah conditions, Wali, Mahr, mutual consent), divorce (Talaq rules, 'Iddah waiting periods, Khul'), custody, and Quranic inheritance (Mirath fixed shares: 1/2, 1/4, 1/8, 2/3, 1/3, 1/6 from Surah An-Nisa 4:11-12, 4:176 and residuary 'Asabah heirs).
   - Contemporary Ethics & Halal/Haram: Prohibition of Riba (interest/usury), Gharar, and gambling; Islamic commercial ethics, modern banking, mortgages, cryptocurrency evaluation, and dietary laws.
   - Seerah & History: Life of the Prophet Muhammad ﷺ, the Rightly Guided Caliphs (Abu Bakr, Umar, Uthman, Ali), the Mothers of the Believers, and the noble Sahaba.
   - Somali Islamic Scholarship: Knowledge of verified Somali scholars (Sheekh Maxamed Cabdi Umal, Sheekh Maxamed Cumar Dirir, Sheekh Cumar Faaruuq, Sheekh Maxamuud Shibli, Sheekh Cabdirashiid Cali Suufi, Sheekh Mustafe Xaaji Ismaaciil) and their verified tafsir and fiqh lessons.

2. CONVERSATIONAL INTENT ADAPTATION:
   For every user message, assess intent and adapt response depth accordingly:
   - GREETING OR INTRODUCTORY MESSAGE (e.g., "Asc", "As-salamu alaykum", "Hello", "Hi"):
     * Respond warmly with the customary Islamic greeting in their language (e.g., "Wacalaykumu salaam waraxmatullaahi wabarakaatuh! Ku soo dhawoow EMufti AI. Sideen maanta kuugu caawin karaa?").
     * DO NOT preach, lecture, or recite unprompted rulings when greeted. Keep it warm, polite, and brief.
   - SIMPLE, DIRECT QUESTION:
     * Provide a concise, clear, and direct answer without unnecessary fluff or excessive introductory filler.
   - COMPLEX, MULTIDIMENSIONAL INQUIRY:
     * Provide a well-structured, comprehensive explanation with clear headings, bullet points, conditions, evidence, and practical takeaways.
   - SCHOLARLY DIFFERENCES (IKHTILAF):
     * Fairly and respectfully explain the recognized positions of the four Sunni madhhabs (Hanafi, Maliki, Shafi'i, Hanbali) and the legal evidence behind each view without partisanship.
   - SOMALI SCHOLAR TAFSIR INQUIRIES:
     * Direct the user to the verified recordings and lessons available in the EMufti AI library.
   - NON-ISLAMIC / SECULAR INQUIRIES:
     * Politely state that EMufti AI is dedicated exclusively to Islamic religious education, and warmly invite an Islamic question.

3. DIRECT RELEVANCE & MADHHAB-SPECIFIC FIDELITY:
   - Answer the user's ACTUAL question directly from the first sentence.
   - MADHHAB-SPECIFIC FIDELITY: When a specific Madhhab (Shafi'i, Hanafi, Maliki, Hanbali) is designated by the user's preference or question, you must strictly align your rulings, definitions, conditions, and invalidators with the relied-upon position (Al-Mu'tamad) of that school, citing its classical reference texts (e.g., Minhaj at-Talibin for Shafi'i, Al-Hidayah/Ibn Abidin for Hanafi, Mukhtasar Khalil for Maliki, Zad al-Mustaqni/Al-Mughni for Hanbali) alongside authentic Quran and Sunnah proofs.
   - NEVER repeat the same generic introductory paragraph across inquiries.
   - NEVER default to a fixed answer about Salah, Zakat, or general principles when asked about another topic.
   - DO NOT cite Surah An-Nahl 16:43 as an evasion or substitute for answering.
   - Cite relevant Quranic verses by Surah name and Verse number (e.g. [Surah Al-Baqarah 2:183]).
   - Cite authentic Hadiths with their collection name and number when available (e.g. [Sahih al-Bukhari 8, Sahih Muslim 16]).
   - ZERO HALLUCINATION: Never invent verses, Hadith texts, collection numbers, or scholar quotes. If a detail is uncertain, state that honestly.

4. LANGUAGE ADAPTATION:
   - Somali (Soomaali): Use natural, eloquent Islamic Somali with customary terms (Salaad, Sakada, Soonka, Xajka, Cawro, Qiblo, Niyad, Daahirnimo, Tiirarka, Shuruudaha) and organized structure.
   - Arabic (العربية): Use classical, eloquent Arabic (الفصحى) with Quranic verses and Hadiths.
   - English: Use clear, articulate English with transliterated Islamic terms and translations.
`;

function isEdgeGreeting(text: string): boolean {
  if (!text) return false;
  const clean = text.trim().toLowerCase().replace(/[.,!?;:'"()]/g, '');
  const greetingWords = [
    'asc', 'asw', 'ascw', 'sc', 'asalamu alaykum', 'assalamu alaykum', 'assalamu alaikum',
    'as-salamu alaykum', 'as-salaamu alaykum', 'salaam', 'salam', 'salaan', 'salaamu calaykum',
    'assalaamu calaykum', 'islaam calaykum', 'subax wanaagsan', 'galab wanaagsan', 'habeen wanaagsan',
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
    'السلام عليكم', 'سلام عليكم', 'مرحبا', 'أهلا', 'أهلا وسهلا', 'صباح الخير', 'مساء الخير'
  ];
  return greetingWords.includes(clean) || /^(asc|asw|salaam|salam|hello|hi|hey|السلام عليكم)[!.\s]*$/i.test(clean);
}

function isEdgeIslamicQuery(text: string): boolean {
  if (!text || !text.trim()) return true;
  const t = text.trim().toLowerCase();
  if (isEdgeGreeting(t)) return true;

  const purelySecularPatterns = [
    /\b(write (a|the) (python|javascript|typescript|c\+\+|java|react|rust|bash|sql|php|css|html) (code|script|function|program|app))\b/i,
    /\b(debug|fix|compile|refactor)\s+(this|my)?\s*(code|script|function|error|bug|typescript|javascript|react)\b/i,
    /\b(leetcode|binary search algorithm|bubble sort|quick sort|dijkstra|fibonacci sequence|reverse linked list)\b/i,
    /\b(npm install|pip install|docker-compose|git commit|webpack config|tailwindcss config)\b/i,
    /\b(who won the \d{4} world cup|premier league table standings|nba finals score|champions league winner)\b/i,
    /\b(messi vs ronaldo stats|lebron james total points|golden boot winner)\b/i,
    /\b(fix|repair|replace|change)\s+(a\s+|the\s+)?(car\s+|vehicle\s+)?(alternator|carburetor|transmission|brake pads?|spark plugs?|muffler|radiator|clutch|exhaust|oil filter)\b/i,
    /\b(recipe for (chocolate cake|pancakes|pizza dough|apple pie|cookies|pasta carbonara|sourdough bread|lasagna|beef stew))\b/i,
    /\b(how to (bake|cook|make) (a |the )?(chocolate cake|pancakes|pizza|cookies|bread|brownies|apple pie))\b/i,
    /\b(solve (the |this )?(quadratic equation|algebraic equation|derivative|integral))\b/i,
    /\b(calculate (the )?(hypotenuse|derivative of|integral of|square root of \d+))\b/i,
    /\b(what is photosynthesis|explain photosynthesis|how does gravity work in physics|theory of general relativity)\b/i,
    /\b(what is the capital of (france|germany|japan|canada|australia|brazil|spain|italy|russia|china|india))\b/i,
    /\b(who is (taylor swift|kanye|kim kardashian|drake|beyonce) dating)\b/i,
  ];

  if (purelySecularPatterns.some((pattern) => pattern.test(t))) {
    return false;
  }

  const religiousPatterns = [
    /\b(allah|ilaahay|illaahay|ilaah|allaa|god in islam|lord in islam|quran|qur'an|quranka|quraan|quraanka|hadith|xadiis|xadiiska|xadiisyada|hadeeth|sunnah|sunno|sunnada|nabi|nabiga|rasuul|rasuulka|muhammad|mohamed|mohammed)\b/i,
    /\b(islam|islamic|islaam|islaamka|islaamnimo|muslim|muslimiin|diin|diinta|shareeco|shareecada|sharia|shariah|fiqh|usul|aqeedah|caqiido|tawheed|towxiid|iimaan|iman|shirk|shirki|kufr|gaal|gaalo|nifaaq|munaafaq|munaafiq)\b/i,
    /\b(salaad|salaadda|salaaddu|salaadii|salaadaha|salat|salah|namaz|tukanaya|tukada|tukashada|rak'ah|rakcad|rakco|sujuud|rukuuc|tashaxud|attahiyatu|fajr|dhuhr|asr|maghrib|isha|tahajjud|witr|duha|tarawih|taraawiix|janaazo|janazah|istikhara)\b/i,
    /\b(zakat|zakad|zakada|sakad|sakada|sadqo|sadaqo|sadaqada|nisab|nisaab|hawl|xawl|charity in islam|zakaat)\b/i,
    /\b(fasting|sawm|soon|soonka|soomid|soomidda|ramadan|ramadaan|afur|saxuur|fidyo|fidya|kaffaaro|kaffarah|itikaaf|laylat al-qadr|leylatul qadar)\b/i,
    /\b(hajj|xaj|xajka|umrah|cumro|cumrada|kaaba|kacbada|makkah|makka|madinah|madiina|arafah|carafo|ihram|ixraam|tawaf|dawaaf|sa'i|saci|mina|jamarat|muzdalifah)\b/i,
    /\b(taharah|daahir|daahirnimo|wudu|weeso|weesada|ghusl|qubeys|qubeyska|najasah|najaaso|najaasada|tayammum|istinja|istijmar|cawro|cawrada|awrah)\b/i,
    /\b(halal|xalaal|haram|xaaraan|xaaraam|waajib|faral|fard|mustahab|mustaxab|makruh|makruuh|mubah|mubaax|permissible|forbidden|prohibited|impermissible)\b/i,
    /\b(fatwa|fatwo|mufti|sheikh|sheekh|culimo|culimada|imam|imaam|scholar|madhhab|madhab|hanafi|xanafi|shafi|shafii|shaafici|maliki|maaliki|hanbali|xanbali)\b/i,
    /\b(jannah|janno|janada|paradise in islam|jahannam|naar|naarta|hellfire in islam|hereafter|aakhiro|qiyaamo|resurrection|day of judgment|barzakh|qabriga)\b/i,
    /\b(dua|du'a|duco|ducada|dhikr|dikri|tasbeeh|tasbiix|istighfar|istighfaar|tawbah|toobad|toobadda|repentance|ruqyah)\b/i,
    /\b(nikah|nikax|meher|meherka|guur|guurka|marriage in islam|talaq|talaaq|furiin|furriin|divorce in islam|iddah|iddo|iddada|mahram|wali|waliga|khula|mirath|dhaxal|dhaxalka|fara'id|wasiyyah)\b/i,
    /\b(riba|ribada|usury|interest in islam|bank interest|mortgage|murabaha|ijarah|sukuk|halal investment|islamic finance|islamic banking|mudaraba|musharaka)\b/i,
    /\b(seerah|siirada|sahaba|saxaabi|saxaabada|asxaab|asxaabta|khadijah|khadiijo|aisha|caasha|abu bakr|umar|uthman|ali|fatima|hasan|hussein)\b/i,
    /\b(masjid|masaajid|mosque|adhan|aadaanka|iqamah|qibla|qiblah|qiblada)\b/i,
    /\b(ma bannaantahay|ma bannaan tahay|ma bannaana|ma banaan tahay|ma bannaan tahay mise)\b/i,
    /\b(ma xalaal baa|ma xaaraan baa|ma xaaraam baa|ma dambi baa|ma dembi baa)\b/i,
    /\b(xukunka|xukunkiisa|xukunkeeda|xukunkooda|xukun ma leedahay)\b/i,
    /\b(maxaa diintu|maxay diintu|maxay shareecadu|maxaa shareecadu|diinteenu maxay|islaamku muxuu)\b/i,
    /\b(is (it )?(permissible|allowed|forbidden|halal|haram|a sin|prohibited|unlawful))\b/i,
    /\b(what is the (islamic )?ruling|islamic ruling|ruling on|ruling regarding)\b/i,
    /\b(in islam|according to islam|islamic perspective|islamic view|does islam (permit|allow|forbid|prohibit)|can a muslim)\b/i,
    /صلاة|الصلاة|صلوات|زكاة|الزكاة|صوم|الصيام|رمضان|حج|الحج|عمرة|العمرة|إسلام|الإسلام|دين|الدين/,
    /قرآن|القرآن|حديث|الحديث|سنة|السنة|نبي|النبي|رسول|الرسول|محمد|الله|طهارة|وضوء|غسل/,
    /حلال|حرام|مستحب|مكروه|واجب|فرض|مباح|فتوى|حكم|ما حكم|هل يجوز|هل يصح|هل يبطل|هل يحرم/,
    /\b(crypto|cryptocurrency|bitcoin|ethereum|forex|day trading|margin trading|drop shipping|dropshipping|network marketing)\b/i,
    /\b(organ donation|organ transplant|blood transfusion|donating organs|donating kidney|kidney donation)\b/i,
    /\b(plastic surgery|cosmetic surgery|botox|rhinoplasty|liposuction|tattoos|tattoo|piercing)\b/i,
    /\b(ivf|in vitro fertilization|artificial insemination|surrogacy|surrogate mother|egg freezing|contraception|birth control|vasectomy|abortion|euthanasia)\b/i,
    /\b(commercial insurance|life insurance|health insurance|takaful|interest loan|student loan|conventional bank)\b/i,
    /\b(halal meat|stunned meat|slaughter|zabihah|gelatin|pork|alcohol in medicine|perfume with alcohol)\b/i,
  ];

  return religiousPatterns.some((pattern) => pattern.test(t));
}

function buildEdgeMadhhabInstruction(schoolPreference: string): string {
  const school = (schoolPreference || 'all').toLowerCase();
  if (school === 'shafii' || school === 'shafi' || school === 'shaafici') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: SHAFI'I SCHOOL (المذهب الشافعي)
- Adhere strictly to the relied-upon position (Al-Mu'tamad) of the Shafi'i Madhhab (Minhaj at-Talibin, Al-Majmu' of Imam an-Nawawi).
- Uphold Shafi'i fiqh rulings: touching non-mahram opposite sex breaks wudu; touching private parts breaks wudu; Basmalah is an obligatory verse in Fatihah; Qunut in Fajr second Rak'ah is Sunnah Ab'ad; Zakat al-Fitr paid in staple food grain.`;
  }
  if (school === 'hanafi' || school === 'xanafi') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: HANAFI SCHOOL (المذهب الحنفي)
- Adhere strictly to the relied-upon position (Zahir ar-Riwayah / Al-Hidayah / Hashiyat Ibn Abidin) of the Hanafi Madhhab.
- Uphold Hanafi fiqh rulings: touching women does not break wudu; touching private parts does not break wudu; flowing blood breaks wudu; distinct Fard vs Wajib categories; follower behind Imam does not recite Fatihah; monetary equivalent (Qeemah) permissible for Zakat.`;
  }
  if (school === 'maliki' || school === 'maaliki') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: MALIKI SCHOOL (المذهب المالكي)
- Adhere strictly to the relied-upon position (Al-Mashhur / Mukhtasar Khalil / Al-Mudawwanah) of the Maliki Madhhab.
- Uphold Maliki fiqh rulings: touching women breaks wudu only with sexual pleasure; dogs are physically pure; Sadl (arms straight down) is relied-upon; Basmalah omitted in obligatory prayers; one intention at Ramadan start covers the month.`;
  }
  if (school === 'hanbali' || school === 'xanbali') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: HANBALI SCHOOL (المذهب الحنبلي)
- Adhere strictly to the relied-upon position (Al-Mu'tamad / Zad al-Mustaqni' / Al-Mughni) of the Hanbali Madhhab.
- Uphold Hanbali fiqh rulings: eating camel meat definitively invalidates wudu; touching women with lust breaks wudu; Tasbih in Ruku/Sujud and Rabbighfirli are Wajibat; Raf' al-Yadayn before and after Ruku' is established Sunnah.`;
  }
  return `\nJURISTIC APPROACH: GENERAL SUNNAH CONSENSUS & FOUR MADHHABS (Hanafi, Maliki, Shafi'i, Hanbali).`;
}

function buildEdgeGeminiContents(messages: any[] = [], prompt: string) {
  const contents: any[] = [];
  const validHistory = (messages || [])
    .filter((m) => m && m.content && m.content.trim().length > 0 && (m.role === 'user' || m.role === 'assistant'))
    .slice(-10);

  const firstUserIdx = validHistory.findIndex((m) => m.role === 'user');
  const turns = firstUserIdx >= 0 ? validHistory.slice(firstUserIdx) : [];

  for (const msg of turns) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const text = msg.content.trim();
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  const promptText = prompt.trim();
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    if (contents[contents.length - 1].parts[0].text !== promptText) {
      contents.push({ role: 'model', parts: [{ text: 'Please proceed with your inquiry.' }] });
      contents.push({ role: 'user', parts: [{ text: promptText }] });
    }
  } else {
    contents.push({ role: 'user', parts: [{ text: promptText }] });
  }

  if (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  return contents;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in server environment. Please set this secret in Supabase dashboard.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user via Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check server-side daily usage quota via RPC
    const { data: usageCheck, error: usageError } = await supabase.rpc("check_daily_usage", {
      p_user_id: user.id,
    });

    if (usageCheck && !usageCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: `Daily message quota exceeded (${usageCheck.used_today}/${usageCheck.daily_limit}). Please upgrade your plan or wait for your daily reset.`,
          quotaExceeded: true,
          used: usageCheck.used_today,
          limit: usageCheck.daily_limit,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      conversation_id,
      prompt,
      messages = [],
      target_language = "auto",
      answer_length = "balanced",
      school_preference = "all",
      grounding_context = ""
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strict Islamic Scope Check
    if (!isEdgeIslamicQuery(prompt)) {
      const nonIslamicNotice = target_language === "ar"
        ? "### تنبيه حول نطاق منصة EMufti AI\n\nنود إحاطتكم علماً بأن **EMufti AI** مخصص حصرياً للعلوم والمعارف **الإسلامية والشرعية**. سؤالكم يقع خارج نطاق العلوم والموضوعات الإسلامية. يسعدنا الإجابة على أي سؤال يتعلق بتعاليم الدين الإسلامي وأحكامه."
        : target_language === "en"
        ? "### Notice: EMufti AI Knowledge Scope\n\nThank you for reaching out. **EMufti AI** is dedicated exclusively to authentic Islamic religious education, Quran, Sunnah, and jurisprudence. Your inquiry falls outside of Islamic topics. Please feel free to ask any question regarding Islamic knowledge."
        : "### Fariin ku saabsan Shaqada EMufti AI\n\nKa raalli ahow, barnaamijka **EMufti AI** waxaa si gaar ah loogu talagalay barashada iyo faafinta cilmiga **Diinta Islaamka oo keliya**. Su'aasha aad i weydiisay kuma saabsana cilmiga diinta Islaamka. Fadlan waxaad xor u tahay inaad i weydiiso su'aal kasta oo ku saabsan diinta Islaamka iyo axkaamteeda.";

      return new Response(
        JSON.stringify({
          content: nonIslamicNotice,
          model: "EMufti-Islamic-Core",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const madhhabInstruction = buildEdgeMadhhabInstruction(school_preference);

    // Determine target language instruction
    let langInstruction = "";
    if (target_language === "so") {
      langInstruction = "\nRespond in rich, natural Islamic Somali (Soomaali). Use clear numbered lists for conditions/pillars, customary terminology (Salaad, Sakada, Soon, Xajka, Nisaab, Cawro, Qiblo, Niyad, Daahirnimo), and note scholarly distinctions where schools differ. Provide a comprehensive, helpful educational answer.";
    } else if (target_language === "ar") {
      langInstruction = "\nRespond entirely in classical, eloquent Arabic (اللغة العربية الفصحى) with Quranic verses and Hadiths.";
    } else if (target_language === "en") {
      langInstruction = "\nRespond in clear English. Include Arabic terms with transliteration and translation.";
    }

    let lengthInstruction = "";
    if (answer_length === "concise") {
      lengthInstruction = "\nKeep your answer concise, direct, and well-structured with bullet points.";
    } else if (answer_length === "detailed") {
      lengthInstruction = "\nProvide a thorough, comprehensive scholarly breakdown with background, rulings across schools, and practical takeaways.";
    }

    let groundingInstruction = "";
    if (grounding_context && typeof grounding_context === "string") {
      groundingInstruction = `\n\n[VERIFIED ISLAMIC GROUNDING CONTEXT]\n${grounding_context}\nAccurately incorporate and cite relevant Quranic passages and authentic Hadiths from the verified grounding context above.`;
    }

    const fullSystemInstruction = `${ISLAMIC_SYSTEM_PROMPT}\n${madhhabInstruction}\n${langInstruction}\n${lengthInstruction}${groundingInstruction}`;

    // Convert past message history for Gemini API with strictly alternating roles
    const formattedContents = buildEdgeGeminiContents(messages, prompt);

    // Configurable model name with resilient fallbacks across active Gemini models
    const configuredModel = Deno.env.get("GEMINI_MODEL") || "";
    const candidateModels = [
      configuredModel,
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.6-flash",
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
    ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

    let geminiResponse: any;
    let geminiData: any;
    let lastError: any = null;

    for (const m of candidateModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiApiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: formattedContents,
            systemInstruction: {
              parts: [{ text: fullSystemInstruction }],
            },
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 2500,
              topP: 0.85,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (geminiResponse.ok) {
          geminiData = await geminiResponse.json();
          break;
        }

        if (geminiResponse.status === 429) {
          lastError = { status: 429, message: `Rate limit on model ${m}` };
          continue;
        }

        if (geminiResponse.status === 503 || geminiResponse.status === 502) {
          lastError = { status: 503, message: `Service busy on model ${m}` };
          continue;
        }

        if (geminiResponse.status === 404) {
          continue;
        }

        lastError = { status: geminiResponse.status, message: `Model ${m} error: ${geminiResponse.status}` };
      } catch (err: any) {
        lastError = { status: 500, message: err?.message || 'Network error' };
      }
    }

    if (!geminiData && lastError) {
      if (lastError.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Adeeggu hadda wuu mashquulsan yahay codsiyada oo batay awgood (429 Rate Limit). Fadlan dib u tijaabi daqiiqad ka dib adigoo riixaya 'Isku day mar kale'.",
            code: 429,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (lastError.status === 503) {
        return new Response(
          JSON.stringify({
            error: "Adeegga Gemini hadda wuu mashquulsan yahay (503 Service Unavailable). Fadlan dib u tijaabi.",
            code: 503,
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({
          error: "Failed to communicate with Google Gemini API: " + lastError.message,
          code: 502,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
          continue;
        }
      } catch (err) {
        if (attempts >= maxAttempts) throw err;
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)));
      }
    }

    if (!geminiData || !geminiData.candidates || geminiData.candidates.length === 0) {
      const errorText = await geminiResponse?.text();
      console.error("Gemini API Error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to generate AI response from Gemini service.",
          details: geminiResponse?.statusText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const answer = geminiData.candidates[0].content.parts[0].text;
    const usageMetadata = geminiData.usageMetadata || {};

    // Record server-side usage
    const requestId = crypto.randomUUID();
    await supabase.from("usage_records").insert({
      user_id: user.id,
      conversation_id: conversation_id || null,
      request_id: requestId,
      model: geminiModel,
      input_tokens: usageMetadata.promptTokenCount || 0,
      output_tokens: usageMetadata.candidatesTokenCount || 0,
      status: "success",
    });

    return new Response(
      JSON.stringify({
        content: answer,
        model: geminiModel,
        request_id: requestId,
        usage: usageMetadata,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Internal Server Error:", error.message);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred while processing your Islamic inquiry." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
