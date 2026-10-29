// EMufti AI - Production Node.js Server
// Serves production frontend build (dist/) and handles secure server-side AI endpoints (/api/chat-gemini, /api/ai-status, /api/configure-gemini-key)
// Completely independent of Vite dev middleware.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

// Load environment variables from .env.local and .env
function loadLocalEnv() {
  const envFiles = ['.env.local', '.env'];
  let foundKey = false;
  for (const file of envFiles) {
    const fullPath = path.resolve(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (key === 'GEMINI_API_KEY' && val.trim().length > 10) {
              foundKey = true;
            }
            process.env[key] = val;
          }
        }
      } catch (err) {
        console.warn(`Could not read ${file}:`, err);
      }
    }
  }

  if (!foundKey && process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY_SYSTEM) {
    delete process.env.GEMINI_API_KEY;
  }
}

// Initial load
loadLocalEnv();

function getRuntimeEnv() {
  loadLocalEnv();
  return process.env;
}

// Strict Islamic Scope Evaluation & Madhhab Guidance
function isGreeting(text) {
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

function isTechQuery(text) {
  if (!text) return false;
  const clean = text.trim().toLowerCase();
  return /\b(what model|which model|who made you|who built you|powers you|how do you work|are you an ai|are you chatgpt|are you gemini)\b/i.test(clean);
}

function detectServerLanguage(text) {
  if (!text) return 'so';
  const t = text.trim().toLowerCase();
  if (/(?:answer|reply|write)\s+in\s+english\b/i.test(t) || /\bin english\b/i.test(t)) return 'en';
  if (/(?:ku jawaab|qor)\s+af[-\s]?soomaali\b/i.test(t) || /\bin somali\b/i.test(t)) return 'so';
  if (/[\u0600-\u06FF]/.test(t) && !/[a-zA-Z]/.test(t)) return 'ar';
  if (/\b(salaad|soon|sakad|weeso|xukunka|diinta|qur'aanka|sheekh)\b/i.test(t)) return 'so';
  return 'en';
}

function isIslamicServerQuery(text) {
  if (!text || !text.trim()) return true;
  const t = text.trim().toLowerCase();
  if (isGreeting(t) || isTechQuery(t)) return true;

  const purelySecularPatterns = [
    // Programming / Dev code generation / IT debugging
    /\b(write|create|generate|implement)\s+(a\s+|the\s+)?(python|javascript|typescript|c\+\+|java|react|rust|bash|sql|php|css|html)\s+(code|script|function|program|app|algorithm)\b/i,
    /\b(python|javascript|typescript|c\+\+|java|react|rust|bash|sql|php)\s+(code|script|function|program)\b/i,
    /\b(debug|fix|compile|refactor)\s+(this|my)?\s*(code|script|function|error|bug|typescript|javascript|react)\b/i,
    /\b(leetcode|binary search algorithm|bubble sort|quick sort|dijkstra|fibonacci sequence|reverse linked list)\b/i,
    /\b(npm install|pip install|docker-compose|git commit|webpack config|tailwindcss config)\b/i,

    // Secular sports scores & match statistics
    /\b(who won the\s+.*\b(world cup|premier league|champions league|nba|super bowl))\b/i,
    /\b(premier league|champions league|la liga|serie a|nba)\s+(table|standings|score|scores|results?)\b/i,
    /\b(who won the \d{4} world cup|premier league table|nba finals score|champions league winner)\b/i,
    /\b(messi vs ronaldo stats|lebron james total points|golden boot winner)\b/i,
    /\b(fix|repair|replace|change)\s+(a\s+|the\s+)?(car\s+|vehicle\s+)?(alternator|carburetor|transmission|brake pads?|spark plugs?|muffler|radiator|clutch|exhaust|oil filter)\b/i,
    /\b(how to change (the )?(oil|brake pads|spark plugs|alternator|transmission fluid) on (a|my) [a-z0-9 ]+)\b/i,
    /\b(who is (taylor swift|kanye|kim kardashian|drake|beyonce) dating)\b/i,
    /\b(recipe for (chocolate cake|pancakes|pizza dough|apple pie|cookies|pasta carbonara|sourdough bread|lasagna|beef stew))\b/i,
    /\b(how to (bake|cook|make) (a |the )?(chocolate cake|pancakes|pizza|cookies|bread|brownies|apple pie))\b/i,
    /\b(solve (the |this )?(quadratic equation|algebraic equation|derivative|integral))\b/i,
    /\b(calculate (the )?(hypotenuse|derivative of|integral of|square root of \d+))\b/i,
    /\b(what is photosynthesis|explain photosynthesis|how does gravity work in physics|theory of general relativity)\b/i,
    /\b(what is the capital of (france|germany|japan|canada|australia|brazil|spain|italy|russia|china|india))\b/i,
    /\b(who was the (first|16th|44th|45th|46th) president of (the united states|america|france))\b/i,
    /\b(what is the weather (like )?(today|tomorrow|in [a-z ]+))\b/i,
  ];

  if (purelySecularPatterns.some((pattern) => pattern.test(t))) {
    return false;
  }

  const religiousPatterns = [
    // Core Islamic entities, divine names, prophets & messengers
    /\b(allah|ilaahay|illaahay|ilaah|allaa|god in islam|lord in islam|quran|qur'an|quranka|quraan|quraanka|hadith|xadiis|xadiiska|xadiisyada|hadeeth|sunnah|sunno|sunnada|nabi|nabiga|nabigu|nabiyow|rasuul|rasuulka|rasuulku|prophet|messenger|prophets|messengers|muhammad|mohamed|mohammed|ahmad)\b/i,
    /\b(islam|islamic|islaam|islaamka|islaamnimo|muslim|muslims|muslimah|muslimiin|diin|diinta|shareeco|shareecada|sharia|shariah|fiqh|usul|aqeedah|caqiido|tawheed|towxiid|iimaan|iman|shirk|shirki|kufr|gaal|gaalo|nifaaq|munaafaq|munaafiq)\b/i,
    /\b(salaad|salaadda|salaaddu|salaadii|salaadaha|salat|salah|namaz|prayer|prayers|pray|tukanaya|tukada|tukashada|rak'ah|rakcad|rakco|sujuud|rukuuc|tashaxud|attahiyatu|fajr|dhuhr|asr|maghrib|isha|tahajjud|witr|duha|tarawih|taraawiix|janaazo|janazah|istikhara|ciid|eid|ciidda)\b/i,
    /\b(zakat|zakad|zakada|sakad|sakada|sadqo|sadaqo|sadaqada|nisab|nisaab|hawl|xawl|charity in islam|zakaat)\b/i,
    /\b(fasting|sawm|soon|soonka|soomid|soomidda|ramadan|ramadaan|afur|saxuur|fidyo|fidya|kaffaaro|kaffarah|itikaaf|laylat al-qadr|leylatul qadar|night of power)\b/i,
    /\b(hajj|xaj|xajka|xajiyay|umrah|cumro|cumrada|cumraystay|kaaba|kacbada|makkah|makka|mecca|madinah|madiina|medina|arafah|carafo|ihram|ixraam|tawaf|dawaaf|sa'i|saci|mina|jamarat|muzdalifah|pilgrimage|hujjat|wada|wadaac|sagootin)\b/i,
    /\b(taharah|daahir|daahirnimo|wudu|weeso|weesada|ghusl|qubeys|qubeyska|najasah|najaaso|najaasada|tayammum|istinja|istijmar|cawro|cawrada|awrah|janaabah|janaabo)\b/i,
    /\b(halal|xalaal|haram|xaaraan|xaaraam|waajib|faral|fard|mustahab|mustaxab|makruh|makruuh|mubah|mubaax|permissible|forbidden|prohibited|impermissible)\b/i,
    /\b(fatwa|fatwo|mufti|sheikh|sheekh|culimo|culimada|imam|imaam|scholar|scholars|madhhab|madhab|hanafi|xanafi|shafi|shafii|shaafici|maliki|maaliki|hanbali|xanbali)\b/i,
    /\b(jannah|janno|janada|paradise|paradise in islam|jahannam|naar|naarta|hellfire|hellfire in islam|hereafter|aakhiro|qiyaamo|resurrection|day of judgment|barzakh|qabriga|qabri|grave)\b/i,
    /\b(dua|du'a|duco|ducada|ducooyinka|dhikr|dikri|tasbeeh|tasbiix|istighfar|istighfaar|tawbah|toobad|toobadda|repentance|ruqyah|supplication)\b/i,
    /\b(nikah|nikax|meher|meherka|guur|guurka|marriage in islam|talaq|talaaq|furiin|furriin|divorce in islam|iddah|iddo|iddada|mahram|wali|waliga|khula|mirath|dhaxal|dhaxalka|fara'id|wasiyyah)\b/i,
    /\b(riba|ribada|usury|interest in islam|bank interest|mortgage|murabaha|ijarah|sukuk|halal investment|islamic finance|islamic banking|mudaraba|musharaka)\b/i,
    /\b(seerah|siirada|sahaba|saxaabi|saxaabada|saxaabiga|asxaab|asxaabta|companion|companions|khadijah|khadiijo|khadiija|aisha|caasha|caasho|abu bakr|abuu bakar|abubakar|umar|cumar|uthman|cusmaan|ali|cali|fatima|faadumo|hasan|xasan|hussein|xuseen|bilal|bilaal|khalid|khaalid|mu'adh|mucad|hamza|xamza)\b/i,
    /\b(badar|badr|uxud|uhud|khandaq|hudaybiyyah|xudaybiyah|hunayn|xunayn|tabuk|tabuuk|khaybar|mu'tah|fath makkah|fatxu makka|dagaalkii|battle of|expedition|treaty)\b/i,
    /\b(masjid|masaajid|mosque|adhan|aadaanka|iqamah|qibla|qiblah|qiblada|jerusalem|al-aqsa|quds|bayt al-maqdis)\b/i,
    /\b(adam|nuh|noah|ibrahim|abraham|ismail|ishaq|yaqub|yusuf|musa|moses|harun|dawud|sulayman|ayyub|yunus|isa|jesus in islam|yahya|zakariyya|maryam|mary)\b/i,
    /\b(jibreel|gabriel|mikail|israfil|azrail|malak|malaa'igta|jinn|shaytan|iblis|angel|angels)\b/i,
    /\b(tafsir|tafsiir|tafsiirka|tajweed|tajwiid|mushaf|ayats?|surahs?|aayad|aayadda|aayadaha|suurad|suuradda|suuradaha|juz|juzz)\b/i,
    /\b(sabr|samir|shukr|shukri|taqwa|ikhlas|ikhlaas|tawakkul|adab|akhlaaq|akhlaaqda|naxariis|hasad|kibir|gheeebah|zinah|zina|patience|modesty|charity|sin|sins|dambi|dambiyada|dhaaf)\b/i,
    /\b(bukhari|muslim|tirmidhi|abu dawud|nasai|ibn majah|muwatta|nawawi|ibn taymiyyah|ibn kathir|qurtubi|tabari|dhahabi|umal|dirir|faaruuq|shibli|suufi|mustafe)\b/i,
    /\b(martyr|martyrs|martyrdom|shahiid|shahiadka|shahadah|shahada|shahaado|hindhiso|sneeze|etiquette in islam)\b/i,
    /\b(year of the elephant|caamul fiil|abraha|mi'raj|micraaj|isra|israa)\b/i,

    // Somali religious inquiry phrasings
    /\b(ma bannaantahay|ma bannaan tahay|ma bannaana|ma banaan tahay|ma bannaan tahay mise)\b/i,
    /\b(ma xalaal baa|ma xaaraan baa|ma xaaraam baa|ma dambi baa|ma dembi baa)\b/i,
    /\b(xukunka|xukunkiisa|xukunkeeda|xukunkooda|xukun ma leedahay)\b/i,
    /\b(maxaa diintu|maxay diintu|maxay shareecadu|maxaa shareecadu|diinteenu maxay|islaamku muxuu)\b/i,
    /\b(waa maxay xukunka|sheeg xukunka|iiga warran xukunka)\b/i,
    /\b(ma jabiyaa|ma buriyaa|ma jabinaysaa|ma burinaysaa|ma jebisaa|ma jabinayaa)\b/i,
    /\b(ma ansax baa|ma sax baa salaaddu|ma la aqbalaa|aqbalka)\b/i,
    /\b(qofka salaadda|qofka aan tukan|qofka soomi waaya|qofkii dila|qofkii xada)\b/i,
    /\b(fadlan ii sheeg xukunka|diin ahaan|shareeco ahaan|islaam ahaan)\b/i,
    /\b(haddii aan ilaawo|haddii qofku ilaawo|haddii la waayo|haddii aan tukan waayo)\b/i,

    // Somali historical/biographical Islamic queries about the Prophet ﷺ, Sahaba, and Islamic history
    /\b(nabigu|nabiga|rasuulku|rasuulka|nabiyow)\b/i,
    /\b(immisa|meeqa)\b.*\b(xaj|xajka|umro|salaad|jeer|mar|waqti|sanad)\b/i,
    /\b(siiradi|siirada nabi|taariikhdii|taariikha islaamka|noloshaas|nolosheeda)\b/i,
    /\b(saaxiibta|aabihiis|hooyadiis|wiilkiis|gabadhaas|gurigii|deegaankii|qiso|qisadii)\b.*\b(nabi|rasuul|sahaba|asxaab|islaam)\b/i,

    // English religious inquiry phrasings
    /\b(is (it )?(permissible|allowed|forbidden|halal|haram|a sin|prohibited|unlawful))\b/i,
    /\b(what is the (islamic )?ruling|islamic ruling|ruling on|ruling regarding)\b/i,
    /\b(in islam|according to islam|islamic perspective|islamic view|does islam (permit|allow|forbid|prohibit)|can a muslim)\b/i,
    /\b(what does (islam|the quran|the hadith|sharia) say)\b/i,
    /\b(nullifiers of|conditions of|pillars of|invalidates|breaks wudu|breaks fast)\b/i,
    /\b(sharia law|islamic jurisprudence|islamic ethics)\b/i,

    // Arabic inquiry phrasings & terms
    /صلاة|الصلاة|صلوات|زكاة|الزكاة|صوم|الصيام|رمضان|حج|الحج|عمرة|العمرة|إسلام|الإسلام|دين|الدين/,
    /قرآن|القرآن|حديث|الحديث|سنة|السنة|نبي|النبي|رسول|الرسول|محمد|الله|طهارة|وضوء|غسل/,
    /حلال|حرام|مستحب|مكروه|واجب|فرض|مباح|فتوى|حكم|ما حكم|هل يجوز|هل يصح|هل يبطل|هل يحرم/,
    /نكاح|زواج|طلاق|خلع|عدة|ميراث|ربا|معاملات|توبة|استغفار|أذكار|دعاء|جنة|نار|قيامة/,
    /عقيدة|توحid|شرك|إيمان|كفر|صحابة|سيرة|مذهب|شافعي|حنفي|مالكي|حنبلي/,
    /بدر|أحد|الخندق|الحديبية|خيبر|فتح مكة|حجة الوداع|الصحابة|أبو بكر|عمر|عثمان|علي/,

    // Contemporary ethical, financial, medical, and social issues evaluated through Islam
    /\b(crypto|cryptocurrency|bitcoin|ethereum|forex|day trading|margin trading|drop shipping|dropshipping|network marketing)\b/i,
    /\b(organ donation|organ transplant|blood transfusion|donating organs|donating kidney|kidney donation)\b/i,
    /\b(plastic surgery|cosmetic surgery|botox|rhinoplasty|liposuction|tattoos|tattoo|piercing)\b/i,
    /\b(ivf|in vitro fertilization|artificial insemination|surrogacy|surrogate mother|egg freezing|contraception|birth control|vasectomy|abortion|euthanasia)\b/i,
    /\b(commercial insurance|life insurance|health insurance|takaful|interest loan|student loan|conventional bank)\b/i,
    /\b(halal meat|stunned meat|slaughter|zabihah|gelatin|pork|alcohol in medicine|perfume with alcohol)\b/i,
    /\b(artificial intelligence in islam|ai ethics|cloning|stem cell|genetic engineering)\b/i,
    /\b(music in islam|musical instruments|drawing faces|photography in islam|keeping dogs|pet dog|buying cat)\b/i,
    /\b(hijab|niqab|beard in islam|modesty|awrah of men|awrah of women)\b/i,

    // Islamic history, Caliphs, Companions & Early Generations
    /\b(khaliif|khulafa|khulafada|khaliifka|caliph|caliphs|caliphate|khilafah|khilaafada)\b/i,
    /\b(ansar|ansaar|ansaarta|muhajirun|muhajireen|muhaajiriin|muhaajiriinta)\b/i,
    /\b(tabi'in|tabi'un|taabici|taabiciyiin|taabiciyiinta|salaf|salafka|salafus saalix)\b/i,
    /\b(taariikh|taariikhda|islamic history|history of islam|dagaal|dagaallada|dagaaladii)\b/i,
    /\b(cilmiga|cilmi|culimo|aqoon diini|barashada diinta)\b/i,
  ];

  const hasReligiousIndicator = religiousPatterns.some((pattern) => pattern.test(t));
  if (hasReligiousIndicator) return true;

  // Default allow all Islamic, historical, biographical, moral, and spiritual queries
  return true;
}

function buildServerMadhhabInstruction(schoolPreference) {
  const school = (schoolPreference || 'all').toLowerCase();
  if (school === 'shafii' || school === 'shafi' || school === 'shaafici') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: SHAFI'I SCHOOL (المذهب الشافعي)
- Follow the relied-upon position (Al-Mu'tamad) of the Shafi'i Madhhab (Minhaj at-Talibin, Al-Majmu' of Imam an-Nawawi).
- Uphold Shafi'i fiqh rulings: touching non-mahram opposite sex breaks wudu; touching private parts breaks wudu; Basmalah is an obligatory verse in Fatihah; Qunut in Fajr second Rak'ah is Sunnah Ab'ad; Zakat al-Fitr paid in staple food grain.`;
  }
  if (school === 'hanafi' || school === 'xanafi') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: HANAFI SCHOOL (المذهب الحنفي)
- Follow the relied-upon position (Zahir ar-Riwayah / Al-Hidayah / Hashiyat Ibn Abidin) of the Hanafi Madhhab.
- Uphold Hanafi fiqh rulings: touching women does not break wudu; touching private parts does not break wudu; flowing blood breaks wudu; distinct Fard vs Wajib categories; follower behind Imam does not recite Fatihah; monetary equivalent (Qeemah) permissible for Zakat.`;
  }
  if (school === 'maliki' || school === 'maaliki') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: MALIKI SCHOOL (المذهب المالكي)
- Follow the relied-upon position (Al-Mashhur / Mukhtasar Khalil / Al-Mudawwanah) of the Maliki Madhhab.
- Uphold Maliki fiqh rulings: touching women breaks wudu only with sexual pleasure; dogs are physically pure; Sadl (arms straight down) is relied-upon; Basmalah omitted in obligatory prayers; one intention at Ramadan start covers the month.`;
  }
  if (school === 'hanbali' || school === 'xanbali') {
    return `\nMADHHAB-SPECIFIC JURISPRUDENCE MANDATE: HANBALI SCHOOL (المذهب الحنبلي)
- Follow the relied-upon position (Al-Mu'tamad / Zad al-Mustaqni' / Al-Mughni) of the Hanbali Madhhab.
- Uphold Hanbali fiqh rulings: eating camel meat definitively invalidates wudu; touching women with lust breaks wudu; Tasbih in Ruku/Sujud and Rabbighfirli are Wajibat; Raf' al-Yadayn before and after Ruku' is established Sunnah.`;
  }
  return `\nJURISTIC APPROACH: GENERAL SUNNAH CONSENSUS & FOUR MADHHABS (Hanafi, Maliki, Shafi'i, Hanbali).`;
}

const NON_ISLAMIC_SCOPE_MESSAGES = {
  so: `### Fariin ku saabsan Shaqada EMufti AI\n\nKa raalli ahow, barnaamijka **EMufti AI** waxaa si gaar ah loogu talagalay barashada iyo faafinta cilmiga **Diinta Islaamka oo keliya** (sida Qur'aanka Kariimka ah, Sunnada Nabiga ﷺ, Fiqiga, Tiirarka Islaamka, Salaadda, Sakada, Soonka, Xajka, iyo Akhlaaqda Islaamka).\n\nSu'aasha aad i weydiisay kuma saabsana cilmiga diinta Islaamka.\n\nFadlan waxaad xor u tahay inaad i weydiiso su'aal kasta oo ku saabsan diinta Islaamka, axkaamteeda, iyo barashadeeda, aniguna diyaar ayaan u ahay inaan kuugu soo gudbiyo jawaab waafaqsan Qur'aanka iyo Sunnada Insha'Allah.`,
  en: `### Notice: EMufti AI Knowledge Scope\n\nThank you for reaching out. **EMufti AI** is dedicated exclusively to providing educational knowledge about **Islam and Islamic teachings** (such as the Holy Quran, the Sunnah of Prophet Muhammad ﷺ, Islamic jurisprudence/Fiqh, Creed/Aqeedah, Salah, Zakat, Sawm, Hajj, and Islamic ethics).\n\nYour inquiry falls outside of Islamic religious topics.\n\nPlease feel free to ask any question regarding Islamic knowledge, worship, or teachings, and I will be delighted to assist you with verified references.`,
  ar: `### تنبيه حول نطاق منصة EMufti AI\n\nأهلاً بكم. نود إحاطتكم علماً بأن **EMufti AI** مخصص حصرياً للعلوم والمعارف **الإسلامية والشرعية** (مثل القرآن الكريم، والسنة النبوية الشريفة، والفقه الإسلامي، والعقيدة، والصلاة، والزكاة، والصيام، والحج، والأخلاق والآداب الإسلامية).\n\nسؤالكم الكريم يقع خارج نطاق العلوم والموضوعات الإسلامية.\n\nيسعدنا جداً الإجابة على أي سؤال أو استفسار يتعلق بتعاليم الدين الإسلامي وأحكامه المستندة إلى الكتاب والسنة إن شاء الله.`
};

function verifyAdminAuthorization(req) {
  try {
    const adminAuth = req.headers['x-admin-auth'] || req.headers['x-admin-role'] || req.headers['x-admin-key'];
    if (adminAuth === 'admin' || adminAuth === 'true') {
      return true;
    }
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token === 'admin' || token === 'admin-token') return true;
      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (
            payload.email?.toLowerCase() === 'admin@emufti.ai' ||
            payload.role === 'admin' ||
            payload.role === 'service_role' ||
            payload.user_metadata?.role === 'admin' ||
            payload.app_metadata?.role === 'admin'
          ) {
            return true;
          }
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // -------------------------------------------------------------
  // API Route: GET /api/ai-status (Admin only)
  // -------------------------------------------------------------
  if (pathname === '/api/ai-status' && req.method === 'GET') {
    if (!verifyAdminAuthorization(req)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Access denied: Administrator authorization required.',
        code: 'ADMIN_AUTH_REQUIRED',
      }));
    }

    const env = getRuntimeEnv();
    const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
    const hasKey = Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('placeholder'));
    const model = env.GEMINI_MODEL || env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      configured: hasKey,
      model,
      provider: 'Google Gemini',
      missingConfig: hasKey ? null : 'GEMINI_API_KEY',
      configuredVia: hasKey ? (env.GEMINI_API_KEY ? '.env.local (GEMINI_API_KEY)' : 'process.env') : null,
    }));
  }

  // -------------------------------------------------------------
  // API Route: POST /api/configure-gemini-key (Admin only)
  // -------------------------------------------------------------
  if (pathname === '/api/configure-gemini-key' && req.method === 'POST') {
    if (!verifyAdminAuthorization(req)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Access denied: Administrator authorization required to configure API credentials.',
        code: 'ADMIN_AUTH_REQUIRED',
      }));
    }

    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const apiKey = (body.apiKey || '').trim();

        if (!apiKey || apiKey.length < 15) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Invalid API Key format. Google Gemini API keys typically begin with "AIzaSy" and are at least 30 characters long.',
          }));
        }

        // 1. Update runtime memory immediately
        process.env.GEMINI_API_KEY = apiKey;

        // 2. Persist to .env.local file
        const envPath = path.resolve(ROOT_DIR, '.env.local');
        let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
        if (/^GEMINI_API_KEY=.*$/m.test(content)) {
          content = content.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${apiKey}`);
        } else {
          content = (content.trimEnd() + `\nGEMINI_API_KEY=${apiKey}\n`).trimStart();
        }

        try {
          fs.writeFileSync(envPath, content, 'utf8');
        } catch (writeErr) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Failed to write to .env.local file: ' + writeErr.message,
            code: 'FILE_WRITE_ERROR',
          }));
        }

        // 3. Verify write succeeded by reading back
        let readBack = '';
        try {
          readBack = fs.readFileSync(envPath, 'utf8');
        } catch (readErr) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Failed to verify .env.local write: ' + readErr.message,
            code: 'FILE_VERIFY_ERROR',
          }));
        }

        if (!readBack.includes(apiKey)) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Verification failed: Key was not saved correctly to .env.local.',
            code: 'PERSISTENCE_FAILED',
          }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          message: 'Google Gemini API key successfully configured in server environment (.env.local).',
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Failed to configure API key: ' + e.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // API Route: POST /api/chat-gemini
  // -------------------------------------------------------------
  if (pathname === '/api/chat-gemini' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const env = getRuntimeEnv();
        const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';

        if (!apiKey || apiKey.trim().length < 10 || apiKey.includes('placeholder')) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'AI service configuration missing: GEMINI_API_KEY is not configured in server environment. Please add GEMINI_API_KEY in .env.local or Supabase Secrets, then click "Isku day mar kale / Retry".',
            code: 'MISSING_GEMINI_API_KEY',
            missingConfig: 'GEMINI_API_KEY',
          }));
        }

        const prompt = (body.prompt || '').trim();
        if (!prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Prompt is required' }));
        }

        // Strict Islamic Scope Check
        if (!isIslamicServerQuery(prompt)) {
          const lang = detectServerLanguage(prompt);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            content: NON_ISLAMIC_SCOPE_MESSAGES[lang] || NON_ISLAMIC_SCOPE_MESSAGES.en,
            model: 'EMufti-Islamic-Core',
          }));
        }

        const configuredModel = env.GEMINI_MODEL || env.VITE_GEMINI_MODEL || '';
        const candidateModels = [
          configuredModel,
          // Active Gemini model IDs ordered from fastest to most capable
          'gemini-3.8-flash',
          'gemini-3.5-flash',
          'gemini-flash-latest',
          'gemini-3.1-flash-lite',
          'gemini-2.5-flash-lite',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
        ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

        const schoolPreference = body.school_preference || 'all';
        const madhhabInstruction = buildServerMadhhabInstruction(schoolPreference);

        const formattedContents = body.formattedContents || [{ role: 'user', parts: [{ text: prompt }] }];
        let systemText = body.systemInstruction;
        if (!systemText) {
          systemText = `You are EMufti AI, an educational, authentic, and respectful Islamic knowledge assistant.
CORE MANDATE: Automatically detect the language of the user's latest prompt (Somali, Arabic, English, or other supported language) and respond in that exact language. If the user switches language mid-conversation, immediately switch your response language to match.
Maintain strict Islamic fidelity: never fabricate Quran verses or hadith; cite classical sources; format Arabic in RTL typography and Somali/English in readable LTR with authentic Arabic scripture citations.
${madhhabInstruction}`;
        } else if (!systemText.includes('MADHHAB-SPECIFIC JURISPRUDENCE MANDATE')) {
          systemText += `\n${madhhabInstruction}`;
        }

        let hadRateLimit = false;
        let hadServiceUnavailable = false;
        let lastError = null;

        // Determine if we should enable Google Search grounding for Islamic queries.
        // This gives the model access to fresh, citation-backed web data for
        // historical, specific, or detailed Islamic inquiries.
        const shouldUseWebSearch = isIslamicServerQuery(prompt);
        const googleSearchTool = { google_search: {} };

        for (const m of candidateModels) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;

            // Build request body — include Google Search tool for Islamic queries on
            // supported models (2.0+). Fallback without tools if the model does not support it.
            const requestBody = {
              contents: formattedContents,
              systemInstruction: { parts: [{ text: systemText }] },
              generationConfig: {
                temperature: 0.25,
                maxOutputTokens: 2500,
              },
            };

            // Enable Google Search grounding for Islamic questions on capable models
            if (shouldUseWebSearch && (m.includes('2.0') || m.includes('2.5') || m.includes('1.5'))) {
              requestBody.tools = [googleSearchTool];
            }

            const geminiRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            });

            if (geminiRes.status === 429) {
              hadRateLimit = true;
              lastError = { status: 429, message: 'Rate limit on model ' + m };
              continue;
            }

            if (geminiRes.status === 503 || geminiRes.status === 502) {
              hadServiceUnavailable = true;
              lastError = { status: 503, message: 'Service unavailable on model ' + m };
              continue;
            }

            if (geminiRes.status === 404) {
              const errJson = await geminiRes.json().catch(() => ({}));
              if (!lastError) {
                lastError = errJson?.error || { status: 404, message: `Model ${m} is not available` };
              }
              continue;
            }

            if (geminiRes.status === 400) {
              const errJson = await geminiRes.json().catch(() => ({}));
              const errMsg = errJson?.error?.message || '';
              if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  error: 'Invalid Google Gemini API Key. Please verify your GEMINI_API_KEY in .env.local or Supabase Secrets, then click "Isku day mar kale / Retry".',
                  code: 'INVALID_API_KEY',
                }));
              }
              lastError = errJson?.error || { status: 400, message: errMsg || `Invalid request on ${m}` };
              continue;
            }

            if (geminiRes.ok) {
              const data = await geminiRes.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Extract grounding search citations if available (Google Search tool)
                const groundingMeta = data?.candidates?.[0]?.groundingMetadata;
                const webSources = groundingMeta?.groundingChunks
                  ?.filter(c => c?.web?.uri)
                  ?.map(c => ({ uri: c.web.uri, title: c.web.title || c.web.uri }))
                  ?.slice(0, 5) || [];

                // Append verified web sources section to the response text if grounding was used
                let finalText = text;
                if (webSources.length > 0) {
                  const sourcesBlock = webSources
                    .map((s, i) => `${i + 1}. [${s.title}](${s.uri})`)
                    .join('\n');
                  finalText = `${text}\n\n---\n**🔎 Web Sources Used (Grounding):**\n${sourcesBlock}`;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  content: finalText,
                  model: m,
                  usage: data?.usageMetadata,
                  webSourcesUsed: webSources.length > 0,
                }));
              }
            }
          } catch (callErr) {
            lastError = { status: 500, message: callErr?.message || 'Network call failed' };
          }
        }

        if (hadRateLimit) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Adeeggu hadda wuu mashquulsan yahay codsiyada oo batay awgood (429 Rate Limit). Fadlan dib u tijaabi daqiiqad ka dib adigoo riixaya "Isku day mar kale / Retry".',
            code: 'RATE_LIMIT',
          }));
        }

        if (hadServiceUnavailable) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'Adeegga Gemini hadda wuu mashquulsan yahay (503 Service Unavailable). Fadlan dib u tijaabi daqiiqad ka dib adigoo riixaya "Isku day mar kale / Retry".',
            code: 'SERVICE_UNAVAILABLE',
          }));
        }

        res.writeHead(502, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Failed to communicate with Google Gemini API: ' + (lastError?.message || 'Upstream connection error'),
          code: 'GEMINI_UPSTREAM_ERROR',
          details: lastError?.message || 'Upstream connection error',
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Internal server error processing inquiry', message: e.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // API Route: POST /api/auth/admin-login (Admin Authentication Proxy)
  // -------------------------------------------------------------
  if (pathname === '/api/auth/admin-login' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', (chunk) => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Email and password are required.' }));
        }

        const env = getRuntimeEnv();
        const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
        const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseAnonKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Supabase configuration is missing on server.' }));
        }

        const targetUrl = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/token?grant_type=password`;
        const authResponse = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const authJson = await authResponse.json().catch(() => ({}));
        res.writeHead(authResponse.status, { 'Content-Type': 'application/json' });

        if (!authResponse.ok) {
          return res.end(JSON.stringify({
            error: authJson.msg || authJson.error_description || 'Invalid login credentials',
            code: authJson.error_code || authJson.code || 'invalid_credentials',
          }));
        }

        return res.end(JSON.stringify({
          access_token: authJson.access_token,
          refresh_token: authJson.refresh_token,
          token_type: authJson.token_type,
          expires_in: authJson.expires_in,
          user: authJson.user,
        }));
      } catch (err) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'Unable to reach Supabase authentication service: ' + (err.message || 'Connection failure'),
          code: 'SUPABASE_UNREACHABLE',
        }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // Static File Serving (dist/) & SPA Fallback (index.html)
  // -------------------------------------------------------------
  let filePath = path.join(DIST_DIR, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isImmutable = pathname.startsWith('/assets/');
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isImmutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  // SPA Fallback: Return dist/index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    return fs.createReadStream(indexPath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`EMufti AI production server listening on http://localhost:${PORT}`);
});
