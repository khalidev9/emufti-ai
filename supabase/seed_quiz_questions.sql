--
-- EMufti AI - Authentic Islamic Quiz Questions Seed File
-- Generated: 2026-10-19T14:54:18.651Z
-- Total Validated Questions: 47
--
BEGIN;


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'QRN-BEG-001',
  'quran',
  'beginner',
  'Which Surah is known as "Umm al-Kitab" (The Mother of the Book) and must be recited in every Rak''ah of daily prayer?',
  'Waa kuwee suuradda loo yaqaanno "Ummul Kitaab" (Hooyada Kitaabka) ee waajibka ay tahay in lagu akhriyo rakcad kasta oo salaad ah?',
  'ما هي السورة التي تُعرف بـ "أم الكتاب" وتلزم قراءتها في كل ركعة من ركعات الصلاة المفروضة؟',
  '[{"id":"opt_1","text_en":"Surah Al-Baqarah","text_so":"Suuradda Al-Baqarah","text_ar":"سورة البقرة"},{"id":"opt_2","text_en":"Surah Al-Fatihah","text_so":"Suuradda Al-Faatixa","text_ar":"سورة الفاتحة"},{"id":"opt_3","text_en":"Surah Al-Ikhlas","text_so":"Suuradda Al-Ikhlaas","text_ar":"سورة الإخلاص"},{"id":"opt_4","text_en":"Surah Ya-Sin","text_so":"Suuradda Yaasiin","text_ar":"سورة يس"}]'::jsonb,
  'opt_2',
  'Surah Al-Fatihah is designated by Prophet Muhammad ﷺ as Umm al-Kitab and As-Sab'' al-Mathani. A prayer is invalid without reciting it.',
  'Suuradda Al-Faatixa waxaa loogu yeeraa Ummul Kitaab iyo Toddobada soo noqnoqda. Nabigu ﷺ wuxuu caddeeyay inaanay salaad jirin qofka aan akhrin Faatixada.',
  'سورة الفاتحة هي أم الكتاب وأم القرآن، وقد قال النبي ﷺ: "لا صلاة لمن لم يقرأ بفاتحة الكتاب".',
  'Sahih al-Bukhari 756; Sahih Muslim 394; Quran 15:87',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'QRN-BEG-002',
  'quran',
  'beginner',
  'How many Surahs (chapters) are in the Holy Quran according to the consensus of the Uthmanic Mushaf?',
  'Immisa suuradood ayaa ku jira Quraanka Kariimka ah sida ku cad heshiiska culimada iyo Mushafka Cusmaaniga ah?',
  'كم عدد سور القرآن الكريم المتواترة في المصحف العثماني بإجماع الأمة؟',
  '[{"id":"opt_1","text_en":"110 Surahs","text_so":"110 Suuradood","text_ar":"110 سور"},{"id":"opt_2","text_en":"114 Surahs","text_so":"114 Suuradood","text_ar":"114 سورة"},{"id":"opt_3","text_en":"120 Surahs","text_so":"120 Suuradood","text_ar":"120 سورة"},{"id":"opt_4","text_en":"124 Surahs","text_so":"124 Suuradood","text_ar":"124 سورة"}]'::jsonb,
  'opt_2',
  'The Holy Quran consists of exactly 114 Surahs, beginning with Surah Al-Fatihah and concluding with Surah An-Nas.',
  'Quraanka Kariimka ah wuxuu ka kooban yahay 114 suuradood, oo ku bilaabata Al-Faatixa kuna dhammaata An-Naas.',
  'يتألف القرآن الكريم من 114 سورة مباركة بالإجماع، تفتتح بسورة الفاتحة وتختتم بسورة الناس.',
  'Ijma'' of the Ummah and the Uthmanic Codex',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'QRN-BEG-003',
  'quran',
  'beginner',
  'Which Surah did the Prophet ﷺ describe as being equivalent to one-third of the Quran in virtue and meaning?',
  'Waa kuwee suuradda uu Nabigu ﷺ ku sheegay inay u dhiganto saddex meelood hal meel Quraanka dhanka fadliga iyo macnaha?',
  'ما هي السورة التي أخبر النبي ﷺ أنها تعدل ثلث القرآن الكريم في الأجر والمعنى؟',
  '[{"id":"opt_1","text_en":"Surah Al-Falaq","text_so":"Suuradda Al-Falaq","text_ar":"سورة الفلق"},{"id":"opt_2","text_en":"Surah Al-Mulk","text_so":"Suuradda Al-Mulk","text_ar":"سورة الملك"},{"id":"opt_3","text_en":"Surah Al-Ikhlas","text_so":"Suuradda Al-Ikhlaas","text_ar":"سورة الإخلاص"},{"id":"opt_4","text_en":"Surah Al-Kafirun","text_so":"Suuradda Al-Kaafiruun","text_ar":"سورة الكافرون"}]'::jsonb,
  'opt_3',
  'Surah Al-Ikhlas equals one-third of the Quran because the Quran addresses three major themes: Tawheed (creed), legal rulings, and narratives; Al-Ikhlas encapsulates pure Tawheed.',
  'Suuradda Al-Ikhlaas waxay u dhigantaa saddex meelood hal meel Quraanka maxaa yeelay waxay si gooni ah u faahfaahinaysaa Towxiidka saafi ah ee Alle weyne.',
  'سورة الإخلاص تعدل ثلث القرآن لاشتمالها التام على توحيد الله وتنزيهه عن الشريك والولد والند.',
  'Sahih al-Bukhari 5013; Sahih Muslim 811',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'QRN-INT-001',
  'quran',
  'intermediate',
  'What is the longest single verse (Ayah) in the Holy Quran, which details the rules of commercial contracts and recording debts?',
  'Waa kuwee aayadda ugu dheer guud ahaan Quraanka Kariimka ah, ee sharraxaysa qoraalka deynta iyo heshiisyada ganacsiga?',
  'ما هي أطول آية في كتاب الله تعالى، والتي فصّلت أحكام توثيق الديون والمعاملات المالية والإشهاد عليها؟',
  '[{"id":"opt_1","text_en":"Ayat al-Kursi (Surah Al-Baqarah 2:255)","text_so":"Aayadda Kursiga (Al-Baqarah 2:255)","text_ar":"آية الكرسي (البقرة 255)"},{"id":"opt_2","text_en":"Ayat ad-Dayn (Surah Al-Baqarah 2:282)","text_so":"Aayadda Deynta (Al-Baqarah 2:282)","text_ar":"آية المداينة (البقرة 282)"},{"id":"opt_3","text_en":"Ayat al-Amanah (Surah Al-Ahzab 33:72)","text_so":"Aayadda Amaanada (Al-Axzaab 33:72)","text_ar":"آية الأمانة (الأحزاب 72)"},{"id":"opt_4","text_en":"Ayat an-Nur (Surah An-Nur 24:35)","text_so":"Aayadda Nuurka (An-Nuur 24:35)","text_ar":"آية النور (النور 35)"}]'::jsonb,
  'opt_2',
  'Ayat ad-Dayn (Surah Al-Baqarah 2:282) is the longest verse in the Quran, spanning an entire page in the Madinah Mushaf, establishing legal documentation and testimony.',
  'Aayadda deynta (Al-Baqarah 2:282) waa aayadda ugu dheer Quraanka, waxayna si faahfaahsan u qeexaysaa qoraalka deymaha iyo markhaatiga ganacsiga.',
  'آية الدين هي أطول آية في القرآن الكريم، استوعبت صفحة كاملة في المصحف لتنظيم المعاملات المالية.',
  'Quran 2:282; Tafsir Ibn Kathir (1/723)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'QRN-ADV-001',
  'quran',
  'advanced',
  'Which Surah contains two full Basmalahs (Bismillah ar-Rahman ar-Rahim) within its text: one at the start and one inside the narrative?',
  'Waa kuwee suuradda ay ku dhex jirto laba Basmalah oo buuxa: mid bilowga ah iyo mid dhexdeeda ku qoran?',
  'ما هي السورة الكريمة التي وردت فيها البسملة مرتين كاملتين: مرة في مطلعها ومرة في ثنايا آياتها؟',
  '[{"id":"opt_1","text_en":"Surah At-Tawbah","text_so":"Suuradda At-Tawbah","text_ar":"سورة التوبة"},{"id":"opt_2","text_en":"Surah An-Naml (Ayah 30)","text_so":"Suuradda An-Naml (Aayadda 30)","text_ar":"سورة النمل (الآية 30)"},{"id":"opt_3","text_en":"Surah Al-Qasas","text_so":"Suuradda Al-Qasas","text_ar":"سورة القصص"},{"id":"opt_4","text_en":"Surah Maryam","text_so":"Suuradda Maryam","text_ar":"سورة مريم"}]'::jsonb,
  'opt_2',
  'Surah An-Naml contains two Basmalahs: at its opening and in verse 30 quoting Prophet Sulayman''s letter: "Innahu min Sulaymana wa innahu bismillahir-rahmanir-rahim."',
  'Suuradda An-Naml waxay leedahay laba Basmalah: midda bilowga iyo aayadda 30-aad ee xustay warqaddii Nabi Sulaymaan u diray Boqoraddii Bilqees.',
  'سورة النمل تشتمل على بسملتين، الأولى في أولها، والثانية في قوله تعالى حكاية عن كتاب سليمان عليه السلام: {إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ}.',
  'Quran 27:30; Tafsir al-Qurtubi (13/197)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'TAF-BEG-001',
  'tafsir',
  'beginner',
  'In Surah Al-Ikhlas, what is the authoritative scholarly meaning of the divine attribute "As-Samad" (ٱلصَّمَدُ)?',
  'Suuradda Al-Ikhlaas gudaheeda, maxay culimadu ku fasireen macnaha sifada rabaaniga ah ee "Al-Samad" (ٱلصَّمَدُ)?',
  'في سورة الإخلاص العظيمة، ما هو المعنى التفسيري المعتمد للاسم الجليل "الصمد" {اللَّهُ الصَّمَدُ}؟',
  '[{"id":"opt_1","text_en":"The Ever-Living and Creator of light","text_so":"Kii Nool ee abuuray nuurka","text_ar":"الحي خالق النور والظلمات"},{"id":"opt_2","text_en":"The Self-Sufficient Master upon Whom all creation depends while He needs nothing","text_so":"Sayidka buuxa ee loo baahan yahay oo uusan isagu cidna u baahnayn","text_ar":"السيد المستغني عن كل أحد، الذي تصمد وتفتقر إليه جميع الخلائق في حوائجها"},{"id":"opt_3","text_en":"The Mighty Judge of nations","text_so":"Garsooraha adag ee ummadaha","text_ar":"الحاكم العادل بين الخلائق"},{"id":"opt_4","text_en":"The Knower of the unseen future","text_so":"Kii og mustaqbalka qarsoon","text_ar":"العليم بالغيب ومآلات الأمور"}]'::jsonb,
  'opt_2',
  'Ibn Abbas narrated that As-Samad signifies the Perfect Master in His leadership, nobility, and power, toward Whom all creation turns for their needs, free from eating, drinking, or dependency.',
  'Ibnu Cabbaas wuxuu sharraxay in "As-Samad" uu yahay Sayidka ugu sarreeya ee wax kasta ay u baahan yihiin, isaguna aan cidna u baahnayn, waxba cunin, waxna cabbin.',
  'قال ابن عباس: "الصمد: السيد الذي صمدت إليه الخلائق في حوائجها، المستغني عن كل شيء والمفتقر إليه كل شيء".',
  'Tafsir at-Tabari (24/732); Tafsir Ibn Kathir (8/526)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'TAF-INT-001',
  'tafsir',
  'intermediate',
  'In Surah Al-Kawthar (108:1), what did the Prophet Muhammad ﷺ explicitly explain "Al-Kawthar" to be when asked by his Companions?',
  'Suuradda Al-Kowthar (108:1), maxuu Nabigu ﷺ si cad ugu micneeyay "Al-Kowthar" markii asxaabtu weydiiyeen?',
  'في سورة الكوثر {إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ}، ما هو التفسير النبوي الصريح للكوثر الذي بيّنه النبي ﷺ لأصحابه؟',
  '[{"id":"opt_1","text_en":"A high mountain in Makkah","text_so":"Buur dheer oo Makka ku taal","text_ar":"جبل شامخ في مكة المكرمة"},{"id":"opt_2","text_en":"A river of immense abundant good in Paradise promised by Allah to the Prophet ﷺ","text_so":"Wabi khayr badan oo ku yaal Jannada oo Eebbe u ballanqaaday Nabiga ﷺ","text_ar":"نهر عظيم في الجنة وعده الله تعالى لنبيه ﷺ، حوضه أشد بياضاً من اللبن وأحلى من العسل"},{"id":"opt_3","text_en":"A vast golden palace in the sky","text_so":"Qasri dahab ah oo samada ku yaal","text_ar":"قصر من ذهب في سماء الخلد"},{"id":"opt_4","text_en":"The victory of the Battle of Badr","text_so":"Guushii dagaalkii Beder","text_ar":"النصر في غزوة بدر الكبرى"}]'::jsonb,
  'opt_2',
  'Imam Muslim recorded from Anas ibn Malik that the Prophet ﷺ smiled and said: "Do you know what Al-Kawthar is? It is a river that my Lord has promised me in Paradise, containing immense good."',
  'Anas wuxuu wariyay in Nabigu ﷺ yiri: "Ma ogtihiin waxa uu yahay Al-Kowthar? Waa wabi uu Eebahay iigu yaboohay Jannada, oo uu ku jiro khayr aad u badan."',
  'عن أنس قال: قال رسول الله ﷺ: "أَتَدْرُونَ مَا الْكَوْثَرُ؟ فَإِنَّهُ نَهْرٌ وَعَدَنِيهِ رَبِّي عَزَّ وَجَلَّ فِي الْجَنَّةِ، عَلَيْهِ خَيْرٌ كَثِيرٌ".',
  'Sahih Muslim 400; Sunan Abi Dawud 784',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'TAF-ADV-001',
  'tafsir',
  'advanced',
  'What is the celebrated statement of Imam Ash-Shafi''i concerning the profound guidance of Surah Al-''Asr (Chapter 103)?',
  'Muxuu ahaa hadalkii caanka ahaa ee Imaam Ash-Shaafici ka yiri miisaanka iyo xigmadda weyn ee Suuradda Al-Casr?',
  'ما هي المقولة الجامعة المشهورة عن الإمام الشافعي رحمه الله في شأن بلاغة وإعجاز سورة العصر؟',
  '[{"id":"opt_1","text_en":"\"It was revealed exclusively for travelers and merchants\"","text_so":"\"Waxay ku soo degtay musaafiriinta iyo ganacsatada\"","text_ar":"\"إنها نزلت في شأن التجار والمسافرين فقط\""},{"id":"opt_2","text_en":"\"If people were to ponder this Surah alone, it would suffice them as complete guidance\"","text_so":"\"Haddii dadku ay fikiraan suuraddan kaligeed, way ku filnaan lahayd hanuun ahaan\"","text_ar":"\"لو تدبر الناس هذه السورة وحدها لكفتهم\""},{"id":"opt_3","text_en":"\"It is the most difficult Surah to memorize in the Quran\"","text_so":"\"Waa suuradda ugu adag xifdiga Quraanka\"","text_ar":"\"إنها أصعب سورة في الحفظ والضبط\""},{"id":"opt_4","text_en":"\"Its legal rulings abrogate all earlier Makkan verses\"","text_so":"\"Xukunnadeedu waxay nasakheen dhammaan aayadihii Makki\"","text_ar":"\"إن أحكامها ناسخة لكل ما سبقها من السور\""}]'::jsonb,
  'opt_2',
  'Imam Ash-Shafi''i observed that Surah Al-''Asr summarizes all conditions of human salvation: faith, righteous deeds, mutual counsel in truth, and steadfast patience.',
  'Imaam Ash-Shaafici wuxuu tilmaamay in Suuradda Al-Casr ay koobtay dhammaan shuruudihii badbaadada aadanaha: Iimaanka, camalka suubban, isku dardaaranka xaqa, iyo samirka.',
  'قال الإمام الشافعي رحمه الله: "لو ما أنزل الله حجة على خلقه إلا هذه السورة لكفتهم"، لاشتمالها على أركان النجاة الأربعة.',
  'Tafsir Ibn Kathir (8/499); Madarij as-Salikin (1/85)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HDT-BEG-001',
  'hadith',
  'beginner',
  'What is the celebrated first Hadith recorded by Imam al-Bukhari in his Sahih collection regarding internal devotion?',
  'Waa kuwee xadiiska ugu horreeya ee uu Imaam Al-Bukhaari ku furay kitaabkiisa Saxiixa ah ee ku saabsan niyadda?',
  'ما هو الحديث العظيم الذي افتتح به الإمام البخاري كتابه الصحيح، لبيان أن مدار الأعمال على الإخلاص؟',
  '[{"id":"opt_1","text_en":"\"Islam is built upon five pillars\"","text_so":"\"Islaamka waxaa lagu dhisay shan tiir\"","text_ar":"\"بني الإسلام على خمس\""},{"id":"opt_2","text_en":"\"Actions are judged only by intentions (Innama al-a''malu bin-niyyat)\"","text_so":"\"Camalladu waxay ku xiran yihiin oo kaliya niyadaha\"","text_ar":"\"إنما الأعمال بالنيات وإنما لكل امرئ ما نوى\""},{"id":"opt_3","text_en":"\"None of you truly believes until he loves for his brother what he loves for himself\"","text_so":"\"Midkiinna ma rumeeyo ilaa uu walaalkii la jeclaado waxa uu naftiisa la jecel yahay\"","text_ar":"\"لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه\""},{"id":"opt_4","text_en":"\"The religion is sincere advice (An-Nasihah)\"","text_so":"\"Diintu waa nasteexo\"","text_ar":"\"الدين النصيحة\""}]'::jsonb,
  'opt_2',
  'Imam al-Bukhari deliberately placed the Hadith of Umar ibn al-Khattab: "Actions are judged by intentions" at the start of his book to emphasize that all righteous endeavors require pure sincerity for Allah.',
  'Imaam Al-Bukhaari wuxuu ku bilaabay xadiiskii Cumar bin Khadaab: "Camalladu waxay ku xiran yihiin niyadaha" si uu u xusuusiyo ardayda iyo culimada in qowl kasta iyo ficil kasta uu u baahan yahay ikhlaas.',
  'افتتح البخاري صحيحه بحديث عمر بن الخطاب: "إنما الأعمال بالنيات" تذكيراً بأهمية الإخلاص وتجريد القصد لله تعالى في كل عمل.',
  'Sahih al-Bukhari 1; Sahih Muslim 1907',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HDT-INT-001',
  'hadith',
  'intermediate',
  'In Hadith terminology (Mustalah al-Hadith), what is a "Mutawatir" narration?',
  'Mustalaxa Xadiiska gudaheeda, maxaa loogu yeeraa xadiis "Mutawaatir" ah?',
  'في علم مصطلح الحديث، ما هو تعريف الحديث "المتواتر"؟',
  '[{"id":"opt_1","text_en":"A narration reported by only one companion in every generation","text_so":"Xadiis ay wariyeen hal saxaabi oo kaliya jiil kasta","text_ar":"حديث تفرد بروايته راوٍ واحد في كل طبقة"},{"id":"opt_2","text_en":"A report narrated by such a large multitude of trustworthy narrators at every link in the chain that collusion upon a lie is customarily impossible","text_so":"Xadiis ay wariyeen koox aad u tiro badan jiil kasta oo aan caqligu oggolayn inay been ku heshiiyaan","text_ar":"ما رواه جمع غفير عن جمع غفير في كل طبقة تحيل العادة تواطؤهم على الكذب ويكون مستندهم الحس"},{"id":"opt_3","text_en":"A hadith whose narrator chain is broken at the successor level","text_so":"Xadiis ay silsiladdiisu go''an tahay heerka taabiciinta","text_ar":"حديث سقط من إسناده راوٍ أو أكثر قبل الصحابي"},{"id":"opt_4","text_en":"A narration transmitted only during the month of Ramadan","text_so":"Xadiis la wariyay bisha Ramadaan oo kaliya","text_ar":"حديث خاص بروايات شهر رمضان"}]'::jsonb,
  'opt_2',
  'Mutawatir signifies an uninterrupted, vast transmission at every level that yields definitive, certain knowledge (yaqeen qat''i), free from doubt.',
  'Mutawaatirtu waa xadiiska ay soo wariyeen tiro aad u badan dhammaan silsiladda oo keenaya cilmi yaqiin ah oo aan shaki ku jirin.',
  'المتواتر يفيد العلم اليقيني القطعي، وهو ما ينقله جمع كبير يستحيل تواطؤهم على الكذب عن مثلهم إلى منتهاه.',
  'Muqaddimah Ibn as-Salah (p. 268); Nukhbat al-Fikar (Ibn Hajar)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HDT-ADV-001',
  'hadith',
  'advanced',
  'Which esteemed classical scholar compiled the foundational collection "Riyad as-Salihin" (Gardens of the Righteous)?',
  'Waa kuwee caalimkii weynaa ee allifay kitaabka caanka ah ee "Riyaadul Saalixiin" (Beeraha Kuwa Suubban)?',
  'من هو الإمام الجليل صاحب التصنيف المبارك الشهير "رياض الصالحين من كلام سيد المرسلين"؟',
  '[{"id":"opt_1","text_en":"Imam Ibn al-Qayyim","text_so":"Imaam Ibnu Qayyim","text_ar":"الإمام ابن قيم الجوزية"},{"id":"opt_2","text_en":"Imam Yahya ibn Sharaf an-Nawawi (Al-Nawawi)","text_so":"Imaam Yaxya bin Sharaf An-Nawawi","text_ar":"الإمام يحيى بن شرف النووي الشافعي"},{"id":"opt_3","text_en":"Imam Abu Hamid al-Ghazali","text_so":"Imaam Abu Xaamid Al-Ghasaali","text_ar":"الإمام أبو حامد الغزالي"},{"id":"opt_4","text_en":"Imam Ibn Kathir","text_so":"Imaam Ibnu Kathiir","text_ar":"الحافظ ابن كثير"}]'::jsonb,
  'opt_2',
  'Imam Abu Zakariyya Yahya ibn Sharaf an-Nawawi (d. 676 AH) authored Riyad as-Salihin, selecting authentic narrations covering morals, manners, worship, and spiritual purification.',
  'Imaam An-Nawawi wuxuu allifay Riyaadul Saalixiin isagoo ka soo xulay xadiisyada saxiixa ah ee dhanka akhlaaqda, cibaadada, iyo daahirinta quluubta.',
  'ألفه الإمام النووي رحمه الله المتوفى سنة 676 هـ، واشتمل على أحاديث صحيحة في الآداب وتزكية النفوس والأعمال الصالحة.',
  'Riyad as-Salihin; Siyar A''lam an-Nubala (24/103)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'AQD-BEG-001',
  'aqeedah',
  'beginner',
  'How many Pillars of Faith (Arkan al-Iman) are explicitly defined in the famous Hadith of Jibril?',
  'Immisa ayaa ah Tiirarka Iimaanka (Arkaanul Iimaan) sida ku cad Xadiiskii caanka ahaa ee Jibriil?',
  'كم عدد أركان الإيمان التي بيّنها رسول الله ﷺ في حديث جبريل المشهور؟',
  '[{"id":"opt_1","text_en":"Five Pillars","text_so":"Shan Tiir","text_ar":"خمسة أركان"},{"id":"opt_2","text_en":"Six Pillars","text_so":"Lix Tiir","text_ar":"ستة أركان"},{"id":"opt_3","text_en":"Seven Pillars","text_so":"Todoba Tiir","text_ar":"سبعة أركان"},{"id":"opt_4","text_en":"Four Pillars","text_so":"Afar Tiir","text_ar":"أربعة أركان"}]'::jsonb,
  'opt_2',
  'The Six Pillars of Faith are: Belief in Allah, His Angels, His Books, His Messengers, the Last Day, and Divine Decree (al-Qadar), both its good and bad.',
  'Lixda Tiir ee Iimaanku waa: Rumeysi Eebbe, Malaa''igtiisa, Kutubtiisa, Rusushiisa, Maalinta Aakhiro, iyo Qadarta khayrkeeda iyo sharqeeda.',
  'أركان الإيمان ستة: أن تؤمن بالله، وملائكته، وكتبه، ورسله، واليوم الآخر، وتؤمن بالقدر خيره وشره.',
  'Sahih Muslim 8 (Hadith Jibril); Quran 2:177, 2:285',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'AQD-INT-001',
  'aqeedah',
  'intermediate',
  'What are the three canonical divisions of Tawheed established by classical Islamic scholars from Quranic texts?',
  'Maxay yihiin saddexda qaybood ee Towxiidka ee culimada Islaamku ka soo saareen aayadaha Quraanka Kariimka ah?',
  'ما هي الأقسام الثلاثة لتوحيد الله تعالى التي استقرأها أئمة السلف من نصوص القرآن الكريم؟',
  '[{"id":"opt_1","text_en":"Tawheed of Creation, Tawheed of Life, and Tawheed of Power","text_so":"Towxiidka Abuurka, Nolosha, iyo Awoodda","text_ar":"توحيد الخلق، وتوحيد الحياة، وتوحيد القوة"},{"id":"opt_2","text_en":"Tawheed ar-Rububiyyah, Tawheed al-Uluhiyyah, and Tawheed al-Asma'' was-Sifat","text_so":"Towxiidka Rubuubiyada, Uluuhiyada, iyo Magacyada & Sifooyinka","text_ar":"توحيد الربوبية، وتوحيد الألوهية، وتوحيد الأسماء والصفات"},{"id":"opt_3","text_en":"Tawheed of Faith, Tawheed of History, and Tawheed of Knowledge","text_so":"Towxiidka Iimaanka, Taariikhda, iyo Cilmiga","text_ar":"توحيد الإيمان، وتوحيد التاريخ، وتوحيد العلم"},{"id":"opt_4","text_en":"Tawheed of Earth, Tawheed of Sky, and Tawheed of Oceans","text_so":"Towxiidka Dhulka, Cirka, iyo Badaha","text_ar":"توحيد الأرض، وتوحيد السماء، وتوحيد البحار"}]'::jsonb,
  'opt_2',
  'Tawheed is categorized into Rububiyyah (Allah''s lordship and actions), Uluhiyyah (singling Allah out in all worship), and Asma'' was-Sifat (affirming His divine names and perfect attributes without distortion or resemblance).',
  'Towxiidka waxaa loo qaybiyaa: Rubuubiyad (in Eebbe kaligii abuuraha yahay), Uluuhiyad (in cibaadada oo dhan Eebbe kaliya la siiyo), iyo Asmaa was-Sifaat (magacyada iyo sifooyinka Eebbe ee suubban).',
  'توحيد الربوبية: إفراد الله بأفعاله كالخلق والرزق، وتوحيد الألوهية: إفراده بأفعال العباد كالعبادة والدعاء، وتوحيد الأسماء والصفات: إثبات ما أثبته لنفسه بلا تمثيل ولا تعطيل.',
  'Quran 19:65, 42:11, 7:54; Majmu'' al-Fatawa (Ibn Taymiyyah 3/7)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'AQD-ADV-001',
  'aqeedah',
  'advanced',
  'In orthodox Islamic theology, what are the four sequential levels (Maratib) of belief in Divine Decree (Al-Qadar)?',
  'Caqiidada toosan ee Islaamka, maxay yihiin 4-ta martabo ee rumeysiga Qadarta Eebbe?',
  'في عقيدة أهل السنة والجماعة، ما هي مراتب الإيمان بالقدر الأربع الواجب الإيمان بها؟',
  '[{"id":"opt_1","text_en":"Intention, Utterance, Physical Action, and Habit","text_so":"Niyadda, Hadalka, Camalka, iyo Caadada","text_ar":"النية، والقول، والعمل، والتعود"},{"id":"opt_2","text_en":"Knowledge (Al-''Ilm), Writing (Al-Kitabah), Will (Al-Mashi''ah), and Creation (Al-Khalq)","text_so":"Cilmiga, Qoraalka, Doonista (Mashii''ada), iyo Abuurka","text_ar":"العلم، والكتابة، والمشيئة، والخلق"},{"id":"opt_3","text_en":"Birth, Youth, Adulthood, and Passing","text_so":"Dhalashada, Dhallinyaronimada, Waayeelnimada, iyo Geerida","text_ar":"الميلاد، والشباب، والكهولة، والوفاة"},{"id":"opt_4","text_en":"Supplication, Striving, Patience, and Contentment","text_so":"Ducada, Dadaalka, Samirka, iyo Qanaacada","text_ar":"الدعاء، والسعي، والصبر، والرضا"}]'::jsonb,
  'opt_2',
  'Belief in Qadar requires affirming that Allah knew all things eternally (Al-''Ilm), wrote them in the Preserved Tablet (Al-Kitabah), that whatever He wills occurs and whatever He does not will never occurs (Al-Mashi''ah), and that He is the sole Creator of all beings and their actions (Al-Khalq).',
  'Iimaanka Qadartu wuxuu ku dhisan yahay 4 heer: Cilmiga Eebbe ee weligiis ah, Qoraalka Lawxul Maxfuud, Mashii''ada (doonista Eebbe ee wax kasta dhaqangelisa), iyo Abuurka Eebbe ee koonka iyo camallada oo dhan.',
  'مراتب القدر الأربع المجمع عليها: العلم الشامل، والكتابة في اللوح المحفوظ، والمشيئة النافذة، والخلق والإيجاد لكل ما سوى الله.',
  'Quran 22:70, 37:96, 81:29; Al-Aqeedah Al-Wasitiyyah (Ibn Taymiyyah)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'FQH-BEG-001',
  'fiqh',
  'beginner',
  'What are the five essential normative rulings (Al-Ahkam at-Taklifiyyah) that govern all human actions in Islamic law?',
  'Maxay yihiin shanta xukun ee shareecada Islaamku ku xukunto dhammaan ficillada qofka muslimka ah (Al-Axkaam at-Takliifiyyah)?',
  'ما هي الأحكام التكليفية الخمسة التي تنقسم إليها جميع أفعال المكلفين في الفقه الإسلامي؟',
  '[{"id":"opt_1","text_en":"Truth, Falsehood, Justice, Oppression, and Peace","text_so":"Run, Been, Caddaalad, Dulmi, iyo Nabad","text_ar":"الصدق، والكذب، والعدل، والظلم، والسلام"},{"id":"opt_2","text_en":"Wajib (Obligatory), Mustahabb (Recommended), Mubah (Permissible), Makruh (Disliked), and Haram (Forbidden)","text_so":"Waajib, Mustaxab, Mubaax, Makruuh, iyo Xaaraan","text_ar":"الواجب، والمستحب (المندوب)، والمباح، والمكروه، والمحرم"},{"id":"opt_3","text_en":"Ancient, Medieval, Modern, Contemporary, and Future","text_so":"Hore, Dhexe, Cusub, Casri, iyo Mustaqbal","text_ar":"القديم، والوسيط، والحديث، والمعاصر، والمستقبل"},{"id":"opt_4","text_en":"Individual, Family, Neighborhood, City, and State","text_so":"Shakhsi, Qoys, Xaafad, Magaalo, iyo Dawlad","text_ar":"الفردي، والأسري، والمجتمعي، والمدني، والدولي"}]'::jsonb,
  'opt_2',
  'In Usul al-Fiqh, human actions are categorized under 5 rulings: Wajib (rewarded if done, sinful if neglected), Mustahabb (rewarded if done, not punished if left), Mubah (neutral), Makruh (rewarded if avoided, not punished if done), and Haram (punished if done, rewarded if left for Allah).',
  'Axkaamta shareecada waa 5: Waajib (la abaalmariyo haddii la sameeyo, la ciqaabo haddii la dhaafo), Mustaxab (la jecel yahay), Mubaax (bannaan), Makruuh (la neceb yahay), iyo Xaaraan (reeban oo dambi ah).',
  'الأحكام التكليفية خمسة بإجماع الأصوليين: الواجب، والمندوب، والمباح، والمكروه، والمحرم.',
  'Al-Waraqat (Imam al-Haramayn al-Juwayni); Rawdat an-Nazir (Ibn Qudamah)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'FQH-INT-001',
  'fiqh',
  'intermediate',
  'What are the four primary agreed-upon sources of Islamic jurisprudence (Usul al-Fiqh) utilized by the major Sunni Madhhabs?',
  'Maxay yihiin 4-ta ilood ee aasaasiga ah ee fiqiga Islaamka ee dhammaan madhabaha Sunnadu ku heshiiyeen?',
  'ما هي المصادر والأدلة الأربعة الأصلية المتفق عليها في استنباط الأحكام الشرعية لدى جماهير الفقهاء؟',
  '[{"id":"opt_1","text_en":"Custom, Philosophy, Greek Logic, and Roman Codes","text_so":"Caadada, Falsafada, Caqliga Giriigga, iyo Shuruucda Roomaanka","text_ar":"العرف، والفلسفة، والمنطق اليوناني، والقوانين الرومانية"},{"id":"opt_2","text_en":"The Quran, the Sunnah, Ijma'' (Consensus), and Qiyas (Analogical Reasoning)","text_so":"Qur''aanka, Sunnada, Ijmaaca (Heshiiska Culimada), iyo Qiyaaska","text_ar":"القرآن الكريم، والسنة النبوية المطهرة، والإجماع، والقياس الشرعي"},{"id":"opt_3","text_en":"Dreams, Astronomy, Poetry, and Tribal Heritage","text_so":"Riyooyinka, Xiddigiska, Gabayada, iyo Dhaqanka Qabiilka","text_ar":"الرؤى، وعلم الفلك، والأشعار، والموروثات القبلية"},{"id":"opt_4","text_en":"State Decrees, Public Polls, Court History, and Treaties","text_so":"Go''aannada Dawladda, Codadka Dadweynaha, iyo Maxkamadaha","text_ar":"المراسيم الحكومية، واستطلاعات الرأي، والمعاهدات الدولية"}]'::jsonb,
  'opt_2',
  'The four universally recognized primary proofs of Islamic law across all four schools of jurisprudence are the Holy Quran, the authentic Sunnah, Ijma'' (consensus of qualified jurists), and sound Qiyas.',
  'Afar-ta daliil ee asalka ah ee sharciga Islaamku ka soo baxo waa: Quraanka Kariimka, Sunnada Nabiga ﷺ, Ijmaaca culimada, iyo Qiyaaska sharciga ah.',
  'الأدلة الشرعية المتفق عليها عند جمهور علماء الأمة أربعة: الكتاب، والسنة، والإجماع، والقياس.',
  'Al-Mustasfa (Al-Ghazali 1/137); Al-Bahr al-Muhit (Az-Zarkashi 1/33)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'FQH-ADV-001',
  'fiqh',
  'advanced',
  'In Islamic legal theory, what distinguishes a "Fard ''Ayn" (individual obligation) from a "Fard Kifayah" (communal obligation)?',
  'Xagga qaanuunka fiqiga, maxaa u dhexeeya "Faral Cayn" iyo "Faral Kifaayah"?',
  'في أصول الفقه، ما هو الفرق الدقيق بين "فرض العين" و"فرض الكفاية"؟',
  '[{"id":"opt_1","text_en":"Fard ''Ayn is only for scholars, while Fard Kifayah is for the public","text_so":"Faral Caynku culimada oo kaliya ayuu ku waajibaa, Kifaayana dadweynaha","text_ar":"فرض العين خاص بالعلماء وفرض الكفاية لعامة المسلمين"},{"id":"opt_2","text_en":"Fard ''Ayn is binding on every single accountable individual, whereas Fard Kifayah is required from the community such that if sufficient people perform it, the sin is lifted from the rest","text_so":"Faral Caynku qof kasta oo qaangaar ah ayuu si gooni ah ugu waajibaa, Faral Kifaayana haddii qaar ka mid ah bulshada ay gutaan, dambigu dadka kale wuu ka dhacayaa","text_ar":"فرض العين يلزم كل مكلف بعينه كالصلوات الخمس، بينما فرض الكفاية إذا قام به من يكفي سقط الإثم عن الباقين كصلاة الجنازة"},{"id":"opt_3","text_en":"Fard ''Ayn applies only on Fridays, while Fard Kifayah applies on other days","text_so":"Faral Caynku jimcaha kaliya ayuu khuseeyaa","text_ar":"فرض العين يختص بيوم الجمعة، وفرض الكفاية بباقي الأيام"},{"id":"opt_4","text_en":"Fard ''Ayn carries financial penalties, while Fard Kifayah does not","text_so":"Faral Caynka lacag ayaa lagu bixiyaa haddii la dhaafo","text_ar":"فرض العين يترتب عليه غرامات مالية فقط"}]'::jsonb,
  'opt_2',
  'Fard ''Ayn (like five daily prayers) is mandatory upon every Muslim individually. Fard Kifayah (like Janazah prayer or specialized medicine) is an obligation on the collective body; if undertaken adequately by some, the obligation is satisfied for all.',
  'Faral Cayn (sida 5-ta salaadood) qof walba ayaa laga rabaa. Faral Kifaayah (sida salaadda Janaasada) haddii qaar ka mid ah bulshadu ay gutaan, kuwa kale dambi kuma laha.',
  'فرض العين مطلوب من كل مكلف بذاته، وفرض الكفاية مطلوب حصوله بغض النظر عن الفاعل، فإذا قام به البعض سقط الحرج عن الأمة.',
  'Al-Majmu'' Sharh al-Muhadhdhab (An-Nawawi 1/24); Usul al-Fiqh (Al-Khallaf)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'PUR-BEG-001',
  'purification_prayer',
  'beginner',
  'How many daily obligatory (Fard) prayers are prescribed for every adult, sane Muslim in a day and night?',
  'Immisa salaadood oo waajib (Faral) ah ayaa ku waajib ah qof kasta oo muslim ah maalin iyo habeen kasta?',
  'كم عدد الصلوات المفروضة التي أوجبها الله تعالى على كل مسلم ومسلمة في اليوم والليلة؟',
  '[{"id":"opt_1","text_en":"3 Prayers","text_so":"3 Salaadood","text_ar":"ثلاث صلوات"},{"id":"opt_2","text_en":"5 Prayers","text_so":"5 Salaadood","text_ar":"خمس صلوات"},{"id":"opt_3","text_en":"7 Prayers","text_so":"7 Salaadood","text_ar":"سبع صلوات"},{"id":"opt_4","text_en":"10 Prayers","text_so":"10 Salaadood","text_ar":"عشر صلوات"}]'::jsonb,
  'opt_2',
  'Allah ordained five daily obligatory prayers upon the night of Al-Isra wal-Mi''raj: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
  'Eebbe wuxuu habeenkii Israaga iyo Micraajka waajibiyay 5 salaadood maalin iyo habeen kasta: Subax, Duhur, Casar, Maqrib, iyo Cishe.',
  'فرض الله تعالى خمس صلوات في اليوم والليلة ليلة الإسراء والمعراج: الفجر والظهر والعصر والمغرب والعشاء.',
  'Sahih al-Bukhari 349; Sahih Muslim 162',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'PUR-INT-001',
  'purification_prayer',
  'intermediate',
  'According to the explicit text of Surah Al-Ma''idah (5:6), what are the four mandatory bodily areas that must be washed or wiped in Wudu (ablution)?',
  'Sida ku cad aayadda 6-aad ee Suuradda Al-Maa''idah, maxay yihiin 4-ta xubnood ee waajibka ah in la dhaqo ama la masaxo weysada?',
  'بنص الآية الكريمة في سورة المائدة {يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ}، ما هي الأعضاء الأربعة المفروض غسلها أو مسحها في الوضوء؟',
  '[{"id":"opt_1","text_en":"Chest, shoulders, knees, and back","text_so":"Laabta, garabbada, jilbaha, iyo dhabarka","text_ar":"الصدر والكتفان والركبتان والظهر"},{"id":"opt_2","text_en":"Washing the face, washing the arms up to the elbows, wiping the head, and washing the feet up to the ankles","text_so":"Dhaqista wejiga, dhaqista gacmaha ilaa xusullada, masaxidda madaxa, iyo dhaqista lugaha ilaa canqowyada","text_ar":"غسل الوجه، وغسل اليدين إلى المرفقين، ومسح الرأس، وغسل الرجلين إلى الكعبين"},{"id":"opt_3","text_en":"Ears, neck, stomach, and thighs","text_so":"Dhagaha, qoorta, caloosha, iyo bowdyaha","text_ar":"الأذنان والعنق والبطن والفخذان"},{"id":"opt_4","text_en":"Only the palms and forehead","text_so":"Kacmaha iyo wejiga kaliya","text_ar":"الكفان والجبين فقط"}]'::jsonb,
  'opt_2',
  'Surah Al-Ma''idah 5:6 states: "Wash your faces and your forearms to the elbows and wipe over your heads and wash your feet to the ankles." These constitute the Quranic pillars of Wudu.',
  'Aayadda 6-aad ee Suuradda Al-Maa''idah waxay si cad u qeexaysaa: Dhaqa wejiyadiinna, gacmihiinna ilaa xusullada, madaxiinnana masaxa, lugahiinnana dhaqa ilaa canqowyada.',
  'قال تعالى: {فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ}، وهذه أركان الوضوء المنصوص عليها قطعا.',
  'Quran 5:6; Al-Majmu'' (1/148)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'PUR-ADV-001',
  'purification_prayer',
  'advanced',
  'When a praying person is in doubt about whether they have prayed three or four Rak''ahs, what is the established prophetic instruction?',
  'Haddii qofka tukanaya uu shaki galo inuu tukaday saddex rakcadood ama afar, maxay tahay tilmaantii Nabiga ﷺ ee lagu xallinayay shakigaas?',
  'إذا شك المصلي في صلاته فلم يدرِ كم صلى: أثلاثاً أم أربعاً، فما هو التوجيه النبوي الصحيح لحسم هذا الشك؟',
  '[{"id":"opt_1","text_en":"Stop the prayer immediately and restart from the Takbir","text_so":"Inuu salaadda joojiyo oo dib uga soo bilaabo takbiirta","text_ar":"أن يقطع الصلاة فوراً ويعيدها من أولها"},{"id":"opt_2","text_en":"Cast aside the doubt, build upon what is certain (the lesser number: three), complete the prayer, and perform two prostrations of forgetfulness (Sujud as-Sahw)","text_so":"Inuu shakiga tuuro, ku dhiso wixii yaqiin ah (tirada yar: saddex), salaadda dhammaystiro, dabadeedna sujuudo laba sujuudood oo saxiw ah","text_ar":"أن يطرح الشك ويبني على ما استيقن (وهو الأقل: ثلاث)، ثم يتم صلاته ويسجد سجدتين للسهو قبل السلام أو بعده"},{"id":"opt_3","text_en":"Assume the higher number (four) and do nothing further","text_so":"Inuu qiyaasto tirada weyn oo uusan waxba samayn","text_ar":"أن يبني على الأكثر (أربع) ولا يسجد للسهو"},{"id":"opt_4","text_en":"Ask someone standing nearby during the prayer","text_so":"Inuu weydiiyo qof agtiisa taagan inta uu tukanayo","text_ar":"أن يسأل من بجانبه وهو في الصلاة"}]'::jsonb,
  'opt_2',
  'The Prophet ﷺ said: "If any of you has doubts in his prayer and does not know whether he prayed three or four, let him cast aside doubt and build upon what is certain (the minimum), then perform two prostrations before salam."',
  'Nabigu ﷺ wuxuu yiri: "Haddii midkiinna uu salaadda ku shakiyo oo uusan ogayn inuu tukaday 3 ama 4, ha tuuro shakiga hana ku dhiso waxa yaqiinta ah (tirada yar), dabadeedna ha sujuudo laba sujuudood intaanu salaam bixin."',
  'قال رسول الله ﷺ: "إذا شك أحدكم في صلاته فلم يدر كم صلى: أثلاثاً أم أربعاً؟ فليطرح الشك وليبن على ما استيقن، ثم يسجد سجدتين قبل أن يسلم".',
  'Sahih Muslim 571; Sunan Abi Dawud 1024',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'FST-BEG-001',
  'fasting_ramadan',
  'beginner',
  'During which month of the Islamic lunar calendar is fasting (Sawm) obligatory upon every healthy, resident, accountable Muslim?',
  'Bishayee oo ka mid ah bilaha hijriga ah ayaa soonku waajib ku yahay qof kasta oo muslim ah oo awooda, jooga, qaangaar ah?',
  'في أي شهر من شهور السنة الهجرية فُرِض صيام شهر كامل على كل مسلم مكلف قادر مقيم؟',
  '[{"id":"opt_1","text_en":"Rajab","text_so":"Rajab","text_ar":"شهر رجب"},{"id":"opt_2","text_en":"Sha''ban","text_so":"Shacbaan","text_ar":"شهر شعبان"},{"id":"opt_3","text_en":"Ramadan","text_so":"Ramadaan","text_ar":"شهر رمضان المبارك"},{"id":"opt_4","text_en":"Shawwal","text_so":"Shawaal","text_ar":"شهر شوال"}]'::jsonb,
  'opt_3',
  'Fasting the entire month of Ramadan is the fourth pillar of Islam, prescribed in Surah Al-Baqarah 2:183-185.',
  'Soonka bisha barakaysan ee Ramadaan waa tiirka 4-aad ee Islaamka, waxaana lagu waajibiyay aayadaha 183-185 ee Suuradda Al-Baqarah.',
  'صيام رمضان ركن من أركان الإسلام الخمسة بنص القرآن: {شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ}.',
  'Quran 2:183-185; Sahih al-Bukhari 8',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'FST-INT-001',
  'fasting_ramadan',
  'intermediate',
  'What is the blessed night in the last ten nights of Ramadan described in the Quran as being "better than a thousand months"?',
  'Waa kuwee habeenka barakaysan ee tobanka dambe ee Ramadaan ee Quraanka lagu sheegay inuu "ka khayr badan yahay kun bilood"?',
  'ما هي الليلة المباركة العظيمة في العشر الأواخر من رمضان التي وصفها الله تعالى بأنها {خَيْرٌ مِّنْ أَلْفِ شَهْرٍ}؟',
  '[{"id":"opt_1","text_en":"Laylatul Bara''ah","text_so":"Habeenka Baraa''ada","text_ar":"ليلة البراءة"},{"id":"opt_2","text_en":"Laylatul Qadr (The Night of Decree)","text_so":"Laylatul Qadri (Habeenka Qadarta)","text_ar":"ليلة القدر المباركة"},{"id":"opt_3","text_en":"Laylatul Mi''raj","text_so":"Habeenka Micraajka","text_ar":"ليلة الإسراء والمعراج"},{"id":"opt_4","text_en":"The Eve of Eid al-Fitr","text_so":"Habeenka Ciidul Fidriga","text_ar":"ليلة عيد الفطر"}]'::jsonb,
  'opt_2',
  'Surah Al-Qadr reveals: "The Night of Decree is better than a thousand months." Worship performed on this night exceeds worship of 83 years and 4 months.',
  'Suuradda Al-Qadr waxay xustay in Habeenka Qadartu uu ka khayr badan yahay kun bilood oo u dhiganta in ka badan 83 sano oo cibaado ah.',
  'ليلة القدر هي الليلة العظيمة التي أنزل فيها القرآن، والعمل الصالح فيها خير من العمل في ألف شهر ليس فيها ليلة القدر.',
  'Quran 97:1-5; Sahih al-Bukhari 2014',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'FST-ADV-001',
  'fasting_ramadan',
  'advanced',
  'What is the legal ruling and required compensation (Kaffarah) for an accountable person who deliberately breaks their fast during Ramadan through marital intercourse?',
  'Muxuu yahay xukunka sharciga ah iyo kafaarada qofka qaangaarka ah ee si badheedh ah galmo ugu af-fura maalinta bisha Ramadaan?',
  'ما هو الحكم الشرعي والكفارة المغلظة الواجبة على من أفسد صيام نهار رمضان عامداً بالجماع؟',
  '[{"id":"opt_1","text_en":"Giving 10 days of voluntary fasts after Eid","text_so":"Soonka 10 maalmood oo sunno ah ciidda ka dib","text_ar":"صيام عشرة أيام تطوعاً بعد العيد"},{"id":"opt_2","text_en":"Making up the day (Qada) and performing severe expiation: freeing a slave, or fasting two consecutive lunar months, or feeding sixty needy people","text_so":"Qaleeynta maalintaas iyo kafaaro culus: qoor xoreyn, haddii kale 2 bilood oo isku xigta oo soon ah, haddii kale 60 qof oo miskiin ah oo la quudiyo","text_ar":"قضاء ذلك اليوم مع الكفارة المغلظة المرتبة: عتق رقبة، فإن لم يجد فصيام شهرين متتابعين، فإن لم يستطع فإطعام ستين مسكيناً"},{"id":"opt_3","text_en":"Repentance alone without making up the day","text_so":"Towbad oo kaliya oo aan qaleyn lahayn","text_ar":"التوبة فقط دون قضاء ولا كفارة"},{"id":"opt_4","text_en":"Paying twenty gold coins to the state treasury","text_so":"Bixinta labaatan qadaadiic dahab ah","text_ar":"دفع عشرين ديناراً ذهبياً لبيت المال"}]'::jsonb,
  'opt_2',
  'The authentic prophetic Sunnah specifies that deliberately breaking Ramadan fast via intercourse incurs making up that day along with the severe Kaffarah: freeing a believer, or fasting two consecutive months, or feeding sixty poor persons.',
  'Xadiiska Saxiixa ah ee Abu Hurayra wariyay wuxuu qeexay in galmada maalinta Ramadaan ay waajibinayso qaleynta maalintaas iyo kafaarada culus ee 2 bilood oo isku xigta ama 60 miskiin quudintooda.',
  'ثبت في الصحيحين في قصة الأعرابي أن كفارة الجماع في نهار رمضان عتق رقبة، فإن لم يجد فصيام شهرين متتابعين، فإن لم يستطع فإطعام ستين مسكيناً مع قضاء اليوم.',
  'Sahih al-Bukhari 1936; Sahih Muslim 1111',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ZKT-BEG-001',
  'zakat_charity',
  'beginner',
  'What is the standard annual rate of Zakat payable on liquid monetary wealth and eligible commercial goods that exceed the Nisab for a full lunar year?',
  'Immisa ayaa ah boqolkiiba heerka sakada sanadlaha ah ee laga bixiyo lacagta iyo ganacsiga markay nisaabka gaaraan oo sanad u wareego?',
  'ما هو المقدار الواجب إخراجه شرعاً كزكاة سنوية في الأموال النقدية وعروض التجارة إذا بلغت النصاب وحال عليها الحول؟',
  '[{"id":"opt_1","text_en":"1% (One percent)","text_so":"1% (Boqolkiiba kow)","text_ar":"1% (واحد بالمائة)"},{"id":"opt_2","text_en":"2.5% (Two and a half percent / One-fortieth)","text_so":"2.5% (Boqolkiiba laba iyo bar / Afartan meelood meel)","text_ar":"2.5% (اثنان ونصف بالمائة / ربع العشر)"},{"id":"opt_3","text_en":"5% (Five percent)","text_so":"5% (Boqolkiiba shan)","text_ar":"5% (خمسة بالمائة)"},{"id":"opt_4","text_en":"10% (Ten percent)","text_so":"10% (Boqolkiiba toban)","text_ar":"10% (عشرة بالمائة)"}]'::jsonb,
  'opt_2',
  'The standard rate of Zakat on wealth (gold, silver, cash currency, and business inventory) is 2.5% (or 1/40th), provided it meets the Nisab threshold and has been held for one full Hawl (lunar year).',
  'Heerka sakada lacagta, dahabka, iyo ganacsiga waa 2.5% (ama 1/40) marka ay gaaraan nisaabka oo sanad qamari ah u buuxsamo.',
  'القدر الواجب إخراجه في زكاة النقدين وعروض التجارة هو ربع العشر (2.5%) بإجماع علماء المسلمين.',
  'Sahih al-Bukhari 1454; Sunan Abi Dawud 1572',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ZKT-INT-001',
  'zakat_charity',
  'intermediate',
  'How many distinct eligible recipient categories for Zakat distribution are designated by Allah in Surah At-Tawbah (9:60)?',
  'Immisa qaybood oo xaq u leh qeybinta sakada ayaa Eebbe ku qeexay Suuradda At-Tawbah aayadda 60-aad?',
  'كم عدد الأصناف والمصارف الشرعية الثمانية المستحقة للزكاة المفروضة التي حصرها الله تعالى في سورة التوبة آية 60؟',
  '[{"id":"opt_1","text_en":"Five categories","text_so":"Shan qaybood","text_ar":"خمسة أصناف"},{"id":"opt_2","text_en":"Eight categories","text_so":"Siddeed qaybood","text_ar":"ثمانية أصناف"},{"id":"opt_3","text_en":"Ten categories","text_so":"Toban qaybood","text_ar":"عشرة أصناف"},{"id":"opt_4","text_en":"Twelve categories","text_so":"Laba iyo toban qaybood","text_ar":"اثنا عشر صنفاً"}]'::jsonb,
  'opt_2',
  'Surah At-Tawbah 9:60 establishes eight specific categories: the poor (fuqara), the needy (masakeen), administrators of Zakat, those whose hearts are to be reconciled, freeing captives/slaves, those in debt, in the cause of Allah, and the stranded traveler.',
  'Suuradda At-Tawbah 9:60 waxay xustay 8 qaybood: Faqiirka, Miskiinka, Shaqaalaha sakada, Kuwa qalbigooda la dhowrayo, Qoor xoreynta, Kuwa deyntu gashay, Jidka Eebbe, iyo Qofka jidka ku go''ay.',
  'مصارف الزكاة ثمانية بنص القرآن: {إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ}.',
  'Quran 9:60; Tafsir Ibn Kathir (4/165)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ZKT-ADV-001',
  'zakat_charity',
  'advanced',
  'What is the classical Nisab threshold for gold in traditional Islamic fiqh, measured in historical Mithqals and modern grams?',
  'Immisa ayaa ah nisaabka dahabka ee fiqiga Islaamka lagu cabbiro xagga miisaanka qadiimiga ah (Mithqaal) iyo garaamyada casriga ah?',
  'ما هو نصاب الذهب الشرعي المعتبر في الفقه الإسلامي مقدراً بالمثاقيل والجرامات المعاصرة؟',
  '[{"id":"opt_1","text_en":"10 Mithqals (~42.5 grams)","text_so":"10 Mithqaal (~42.5 garaam)","text_ar":"10 مثاقيل (نحو 42.5 جراماً)"},{"id":"opt_2","text_en":"20 Mithqals (approximately 85 grams of pure gold)","text_so":"20 Mithqaal (qiyaastii 85 garaam oo dahab saafi ah)","text_ar":"20 مثقالاً (ما يعادل 85 جراماً من الذهب الخالص عيار 24)"},{"id":"opt_3","text_en":"50 Mithqals (~200 grams)","text_so":"50 Mithqaal (~200 garaam)","text_ar":"50 مثقالاً (نحو 200 جرام)"},{"id":"opt_4","text_en":"100 Mithqals (~400 grams)","text_so":"100 Mithqaal (~400 garaam)","text_ar":"100 مثقال (نحو 400 جرام)"}]'::jsonb,
  'opt_2',
  'The prophetic Sunnah established the gold Nisab at 20 Dinar/Mithqal. Contemporary Islamic fiqh academies uniformly equate this to approximately 85 grams of 24-karat gold.',
  'Sunnada Nabigu waxay dejisay nisaabka dahabka 20 Mithqaal, taas oo culimada casriga ah iyo majmacyada fiqigu ku qiyaaseen 85 garaam oo dahab saafi ah.',
  'نصاب الذهب الشرعي عشرون ديناراً/مثقالاً بحديث: "وليس عليك شيء حتى يكون لك عشرون ديناراً"، ويساوي 85 جراماً من الذهب الخالص.',
  'Sunan Abi Dawud 1573; Majma'' al-Fiqh al-Islami (Resolution 42)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HAJ-BEG-001',
  'hajj_umrah',
  'beginner',
  'On which Islamic date does the central rite of Standing at Arafah (Wuquf bi-''Arafah) take place?',
  'Taariikhdee bisha Dul-Xijjah ayay dhacdaa taagnida buurta Carafo (Wuquufka Carafo)?',
  'في أي يوم من أيام شهر ذي الحجة يؤدي الحجاج الركن الأعظم بالوقوف بصعيد عرفات الطاهر؟',
  '[{"id":"opt_1","text_en":"1st of Dhul-Hijjah","text_so":"1-da Dul-Xijjah","text_ar":"اليوم الأول من ذي الحجة"},{"id":"opt_2","text_en":"8th of Dhul-Hijjah (Yawm at-Tarwiyah)","text_so":"8-da Dul-Xijjah (Yawmu Tarwiyah)","text_ar":"يوم التروية (الثامن من ذي الحجة)"},{"id":"opt_3","text_en":"9th of Dhul-Hijjah (Yawm ''Arafah)","text_so":"9-ka Dul-Xijjah (Maalinta Carafo)","text_ar":"يوم عرفة (التاسع من شهر ذي الحجة)"},{"id":"opt_4","text_en":"10th of Dhul-Hijjah (Yawm an-Nahr)","text_so":"10-ka Dul-Xijjah (Maalinta Ciidda)","text_ar":"يوم النحر (العاشر من ذي الحجة)"}]'::jsonb,
  'opt_3',
  'The Prophet Muhammad ﷺ declared: "Al-Hajju ''Arafah" (Hajj is Arafah). The standing on the plains of Arafah occurs on the 9th day of Dhul-Hijjah from noon until sunset.',
  'Nabigu ﷺ wuxuu yiri: "Xajku waa Carafo". Taagnida bananka Carafo waxay dhacdaa 9-ka bisha Dul-Xijjah laga bilaabo duhurka ilaa qorrax dhaca.',
  'قال رسول الله ﷺ: "الحج عرفة"، ووقته يبدأ من زوال شمس يوم التاسع من ذي الحجة.',
  'Jami'' at-Tirmidhi 889; Sunan Abi Dawud 1949',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HAJ-INT-001',
  'hajj_umrah',
  'intermediate',
  'What are the four non-negotiable Pillars (Arkan) of Hajj according to the majority of Islamic jurists, without which Hajj is void?',
  'Maxay yihiin 4-ta tiir ee aasaasiga ah ee Xajka (Arkaanul Xajj) oo haddii mid la dhaafo uusan Xajku ansaxayn?',
  'ما هي الأركان الأربعة الكبرى للحج عند جمهور الفقهاء التي لا يصح الحج إلا بأدائها جميعاً ولا تجبر بدم؟',
  '[{"id":"opt_1","text_en":"Shaving head, staying in Madinah, drinking Zamzam, and fasting 3 days","text_so":"Xiirashada madaxa, joogitaanka Madiina, cabidda Zamzam, iyo soonka 3 maalmood","text_ar":"حلق الرأس، وزيارة المدينة، وشرب زمزم، وصيام ثلاثة أيام"},{"id":"opt_2","text_en":"Ihram (intention), Wuquf at Arafah, Tawaf al-Ifadah, and Sa''i between Safa and Marwah","text_so":"Ixraamka (Niyadda), Taagnida Carafo, Dawaafka Ifaada, iyo Saciga Safa iyo Marwa","text_ar":"الإحرام (النية)، والوقوف بعرفة، وطواف الإفاضة، والسعي بين الصفا والمروة"},{"id":"opt_3","text_en":"Buying gifts, sacrificing 5 sheep, visiting Cave Hira, and climbing Mount Uhud","text_so":"Hadyadaha, qallidda 5 neef, booqashada godka Xiraa, iyo fuulidda buurta Uxud","text_ar":"شراء الهدايا، وذبح خمسة شياه، وزيارة غار حراء، وصعود جبل أحد"},{"id":"opt_4","text_en":"Entering Makkah before Shawwal and praying 40 prayers in Mina","text_so":"Galidda Makka ka hor Shawaal iyo 40 salaadood oo Mina lagu tukado","text_ar":"دخول مكة قبل شوال، وأداء أربعين صلاة في منى"}]'::jsonb,
  'opt_2',
  'The four essential pillars of Hajj are Ihram, Standing at Arafah, Tawaf al-Ifadah, and Sa''i. If any pillar is omitted, the pilgrimage cannot be compensated by animal sacrifice and remains incomplete.',
  'Afar-ta tiir ee Xajka waa: Ixraamka, Taagnida Carafo, Dawaafka Ifaadah, iyo Saciga Safa iyo Marwa. Haddii mid ka dhaafo xajku ma ansaxayo dhiigna kuma saxmi karo.',
  'أركان الحج الأربعة عند الجمهور: الإحرام، والوقوف بعرفة، وطواف الإفاضة، والسعي بين الصفا والمروة.',
  'Bidayat al-Mujtahid (Ibn Rushd 1/334); Al-Majmu'' (8/82)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HAJ-ADV-001',
  'hajj_umrah',
  'advanced',
  'What is the designated Miqat (geographic boundary for assuming Ihram) for pilgrims coming from or passing through Al-Madinah Al-Munawwarah?',
  'Waa kuwee Miqaatka (goobta xadka juqraafi ee laga xidho Ixraamka) dadka ka imanaya ama soo maraya Madiina Al-Munawwarah?',
  'ما هو الميقات المكاني الذي وقته النبي ﷺ لأهل المدينة المنورة ومن مر بها من الحجاج والمعتمرين؟',
  '[{"id":"opt_1","text_en":"Al-Juhfah (near Rabigh)","text_so":"Al-Juxfah (u dhow Raabigh)","text_ar":"الجحفة"},{"id":"opt_2","text_en":"Dhul-Hulayfah (known today as Abyar ''Ali)","text_so":"Dul-Xulayfah (oo maanta loo yaqaan Abyaar Cali)","text_ar":"ذو الحليفة (المعروف اليوم بأبيار علي)"},{"id":"opt_3","text_en":"Yalamlam (As-Sa''diyyah)","text_so":"Yalamlam","text_ar":"يلملم"},{"id":"opt_4","text_en":"Qarn al-Manazil (As-Sayl al-Kabir)","text_so":"Qarnul Manaazil","text_ar":"قرن المنازل"}]'::jsonb,
  'opt_2',
  'Ibn Abbas narrated that the Messenger of Allah ﷺ designated Dhul-Hulayfah for the people of Madinah. It is the furthest Miqat from Makkah (approximately 410 km).',
  'Nabigu ﷺ wuxuu dadka Madiina ka imanaya u asteeyay Dul-Xulayfah (Abyaar Cali), waana miqaatka ugu fog Makka.',
  'عن ابن عباس رضي الله عنهما قال: "وقت رسول الله ﷺ لأهل المدينة ذا الحليفة، ولأهل الشام الجحفة، ولأهل نجد قرن المنازل، ولأهل اليمن يلملم".',
  'Sahih al-Bukhari 1524; Sahih Muslim 1181',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'SRH-BEG-001',
  'seerah',
  'beginner',
  'In which historic cave outside Makkah was the Prophet Muhammad ﷺ worshipping when he received the first revelation of the Quran from Angel Jibril?',
  'Godkee ku yaal banaanka Makka ayuu Nabigu ﷺ ku cibaadaysanayay markii ay ugu timid waxyigii ugu horreeyay ee Malaa''ig Jibriil siday?',
  'في أي غار مبارك بجبل النور كان النبي ﷺ يتعبد ويتحنث حين نزل عليه أمين الوحي جبريل عليه السلام بأول آيات القرآن؟',
  '[{"id":"opt_1","text_en":"Cave of Thawr (Ghar Thawr)","text_so":"Godka Thowr","text_ar":"غار ثور"},{"id":"opt_2","text_en":"Cave of Hira (Ghar Hira on Jabal an-Nur)","text_so":"Godka Xiraa (Buurta Nuur)","text_ar":"غار حراء بجبل النور"},{"id":"opt_3","text_en":"Cave of Uhud","text_so":"Godka Uxud","text_ar":"غار أحد"},{"id":"opt_4","text_en":"Cave of Safa","text_so":"Godka Safa","text_ar":"غار الصفا"}]'::jsonb,
  'opt_2',
  'Prophet Muhammad ﷺ engaged in solitary worship in the Cave of Hira on Jabal an-Nur when Angel Jibril descended with Surah Al-''Alaq: "Iqra bismi Rabbika alladhi khalaq."',
  'Nabiga ﷺ wuxuu ku cibaadaysanayay Godka Xiraa ee ku yaal Buurta Nuur markii Jibriil u keenay aayadaha ugu horreeya ee Suuradda Al-Calaq ("Akhri").',
  'كان النبي ﷺ يتحنث في غار حراء، وهو غار لطيف في قمة جبل النور، حين نزل عليه جبريل بآيات سورة العلق الأولى: {اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ}.',
  'Sahih al-Bukhari 3; Ar-Raheeq Al-Makhtum (p. 64)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'SRH-INT-001',
  'seerah',
  'intermediate',
  'In which year of the Hijrah did the decisive first major engagement, the Battle of Badr (Ghazwat Badr al-Kubra), take place during the month of Ramadan?',
  'Sannadkee hijriga ayuu dhacay dagaalkii weynaa ee Beder (Badrul Kubraa) bishii barakaysnayd ee Ramadaan?',
  'في أي سنة من الهجرة النبوية المباركة وقعت غزوة بدر الكبرى، يوم الفرقان، في شهر رمضان المبارك؟',
  '[{"id":"opt_1","text_en":"1st Year of Hijrah (1 AH)","text_so":"Sannadkii 1-aad ee Hijrada","text_ar":"السنة الأولى للهجرة"},{"id":"opt_2","text_en":"2nd Year of Hijrah (2 AH - 17th of Ramadan)","text_so":"Sannadkii 2-aad ee Hijrada (17-kii Ramadaan)","text_ar":"السنة الثانية للهجرة (17 رمضان)"},{"id":"opt_3","text_en":"5th Year of Hijrah (5 AH)","text_so":"Sannadkii 5-aad ee Hijrada","text_ar":"السنة الخامسة للهجرة"},{"id":"opt_4","text_en":"8th Year of Hijrah (8 AH)","text_so":"Sannadkii 8-aad ee Hijrada","text_ar":"السنة الثامنة للهجرة"}]'::jsonb,
  'opt_2',
  'The Battle of Badr occurred on Friday, the 17th of Ramadan in the 2nd year of the Hijrah. Allah granted an astonishing victory to 313 ill-equipped believers over 1,000 Qurayshi warriors.',
  'Dagaalkii Beder wuxuu dhacay Jimce, 17-kii Ramadaan sannadkii 2-aad ee Hijrada, markaas oo Eebbe guul weyn siiyay 313 qof oo mu''miniin ah.',
  'وقعت غزوة بدر الكبرى في 17 رمضان من السنة الثانية للهجرة، وسماها القرآن "يوم الفرقان يوم التقى الجمعان".',
  'Quran 8:41; Sahih al-Bukhari 3953; Zad al-Ma''ad (3/154)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'SRH-ADV-001',
  'seerah',
  'advanced',
  'What was the solemn mutual oath undertaken by the Companions beneath the tree at Al-Hudaybiyyah (6 AH) to stand faithfully by the Prophet ﷺ?',
  'Muxuu ahaa heshiiskii iyo ballantii sharafta lahayd ee asxaabtu kula galeen geedka hoostiisa Nabiga ﷺ xilligii Xudaybiyah (Baycatu Ridwaan)?',
  'ما هو اسم البيعة التاريخية المباركة التي بايع فيها الصحابة رضي الله عنهم النبي ﷺ تحت الشجرة بالحديبية على الثبات وعدم الفرار؟',
  '[{"id":"opt_1","text_en":"Bay''at al-''Aqabah al-Ula","text_so":"Baycatul Caqaba ee kowaad","text_ar":"بيعة العقبة الأولى"},{"id":"opt_2","text_en":"Bay''at ar-Ridwan (Pledge of Pleasure, ratified in Surah Al-Fath)","text_so":"Baycatu Ridwaan (Ballantii Raallinimada ee Suuradda Al-Fatxi)","text_ar":"بيعة الرضوان التي أنزل الله فيها: {لَقَدْ رَضِيَ اللَّهُ عَنِ الْمُؤْمِنِينَ إِذْ يُبَايِعُونَكَ تَحْتَ الشَّجَرَةِ}"},{"id":"opt_3","text_en":"Hilf al-Fudul","text_so":"Xilful Fudul","text_ar":"حلف الفضول"},{"id":"opt_4","text_en":"Bay''at an-Nisa","text_so":"Baycatu Nisaa","text_ar":"بيعة النساء"}]'::jsonb,
  'opt_2',
  'Bay''at ar-Ridwan occurred in 6 AH when approximately 1,400 companions pledged to die for the faith after rumors that Uthman ibn Affan was murdered. Allah revealed: "Allah was pleased with the believers when they pledged allegiance under the tree" (48:18).',
  'Baycatu Ridwaan waxay dhacday sannadkii 6-aad ee Hijrada markii ku dhawaad 1,400 saxaabi ay Nabiga ﷺ kula ballameen inay diinta u dhimanayaan, Eebbana wuxuu ku caddeeyay raallinimadiisa aayadda 18 ee Suuradda Al-Fatxi.',
  'بيعة الرضوان بايع فيها نحو 1400 صحابي إثر إشاعة مقتل عثمان بن عفان، فرضي الله عنهم بنص القرآن الكريم.',
  'Quran 48:18; Sahih al-Bukhari 4169; Sahih Muslim 1856',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HST-BEG-001',
  'history_companions',
  'beginner',
  'Who was the first Rightly-Guided Caliph (Al-Khalifah ar-Rashid) to lead the Muslim Ummah following the passing of the Prophet ﷺ?',
  'Yuu ahaa Khaliifkii ugu horreeyay ee Khulafadii Raashidiinta ee hoggaamiyay ummadda geeridii Nabiga ﷺ ka dib?',
  'من هو أول الخلفاء الراشدين رضي الله عنهم وأفضل الأمة بعد نبيها بإجماع الصحابة والتابعين؟',
  '[{"id":"opt_1","text_en":"Umar ibn al-Khattab","text_so":"Cumar bin Khadaab","text_ar":"عمر بن الخطاب رضي الله عنه"},{"id":"opt_2","text_en":"Abu Bakr as-Siddiq","text_so":"Abu Bakar As-Siddiiq","text_ar":"أبو بكر الصديق رضي الله عنه"},{"id":"opt_3","text_en":"Uthman ibn Affan","text_so":"Cusmaan bin Cafaan","text_ar":"عثمان بن عفان رضي الله عنه"},{"id":"opt_4","text_en":"Ali ibn Abi Talib","text_so":"Cali bin Abi Dhaalib","text_ar":"علي بن أبي طالب رضي الله عنه"}]'::jsonb,
  'opt_2',
  'Abu Bakr as-Siddiq was unanimously chosen as the first Caliph at Saqifat Bani Sa''idah, preserving the unity of Islam and leading the campaign against apostasy.',
  'Abu Bakar As-Siddiiq wuxuu ahaa khaliifkii 1-aad ee lagu doortay Saqiifadii Banii Saacidah, isagoo difaacay diinta iyo midnimada ummadda.',
  'أبو بكر الصديق هو أول الخلفاء الراشدين، وصاحب رسول الله ﷺ في الغار، وأول من آمن به من الرجال.',
  'Sahih al-Bukhari 3667; Al-Bidayah wan-Nihayah (Ibn Kathir 5/241)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HST-INT-001',
  'history_companions',
  'intermediate',
  'Under whose caliphate was the Holy Quran officially compiled into standardized master codices (Al-Mushaf al-Imam) and distributed to major Islamic metropolitan centers?',
  'Khaliifkee xilligii uu talada hayay ayaa Quraanka Kariimka ah loo qoray qaab halbeeg ah oo rasmi ah (Mushafka Cusmaaniga ah) loona diray magaalooyinka waaweyn?',
  'في عهد أي من الخلفاء الراشدين جُمع القرآن الكريم في مصحف واحد إمام، ونُسخت منه المصاحف وأُرسلت إلى الأمصار؟',
  '[{"id":"opt_1","text_en":"Umar ibn al-Khattab","text_so":"Cumar bin Khadaab","text_ar":"عمر بن الخطاب رضي الله عنه"},{"id":"opt_2","text_en":"Uthman ibn Affan (Dhul-Nurayn)","text_so":"Cusmaan bin Cafaan (Dul-Nuurayn)","text_ar":"عثمان بن عفان رضي الله عنه"},{"id":"opt_3","text_en":"Ali ibn Abi Talib","text_so":"Cali bin Abi Dhaalib","text_ar":"علي بن أبي طالب رضي الله عنه"},{"id":"opt_4","text_en":"Mu''awiyah ibn Abi Sufyan","text_so":"Mucaawiya bin Abi Sufyaan","text_ar":"معاوية بن أبي سفيان رضي الله عنه"}]'::jsonb,
  'opt_2',
  'Uthman ibn Affan commissioned a committee led by Zayd ibn Thabit to produce master standard copies of the Quran in the Quraishi dialect around 25 AH, eliminating recitation disputes across the expanding empire.',
  'Cusmaan bin Cafaan wuxuu magacaabay guddi uu madax u yahay Zayd bin Thaabit si loo qoro Mushafka Cusmaaniga ah ee mideeyay ummadda.',
  'جمع عثمان بن عفان الأمة على مصحف واحد بحرف قريش حسماً للاختلاف في القراءات، وعُرف بالمصحف العثماني.',
  'Sahih al-Bukhari 4987; Al-Itqan fi ''Ulum al-Qur''an (As-Suyuti 1/211)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'HST-ADV-001',
  'history_companions',
  'advanced',
  'Which brilliant Muslim military commander was designated by Prophet Muhammad ﷺ as "Sayfullah al-Maslul" (The Drawn Sword of Allah)?',
  'Waa kuwee hoggaamiyihii ciidanka Islaamka ee caanka ahaa ee uu Nabigu ﷺ ugu magacdaray "Sayfullaah Al-Masluul" (Seefta Eebbe ee galka laga saaray)?',
  'من هو القائد العسكري المسلم الفذ الذي لقبه رسول الله ﷺ بـ "سيف الله المسلول" بعد معركة مؤتة؟',
  '[{"id":"opt_1","text_en":"Sa''d ibn Abi Waqqas","text_so":"Sacdi bin Abi Waqaas","text_ar":"سعد بن أبي وقاص رضي الله عنه"},{"id":"opt_2","text_en":"Khalid ibn al-Walid","text_so":"Khaalid bin Walid","text_ar":"خالد بن الوليد رضي الله عنه"},{"id":"opt_3","text_en":"Abu Ubaydah ibn al-Jarrah","text_so":"Abu Cubaydah bin Al-Jarraax","text_ar":"أبو عبيدة بن الجراح رضي الله عنه"},{"id":"opt_4","text_en":"Amr ibn al-''As","text_so":"Camar bin Al-Caas","text_ar":"عمرو بن العاص رضي الله عنه"}]'::jsonb,
  'opt_2',
  'Following his strategic triumph in saving the Muslim army at Mu''tah (8 AH), the Prophet ﷺ praised him: "Then the banner was taken by a sword from the swords of Allah, Khalid ibn al-Walid."',
  'Dagaalkii Mu''tah ka dib markii uu Khaalid bin Walid badbaadiyay ciidanka Islaamka, Nabigu ﷺ wuxuu ku ammaanay inuu yahay Seef ka mid ah seeffaha Eebbe.',
  'قال رسول الله ﷺ ناعياً قادة مؤتة: "حَتَّى أَخَذَ الرَّايَةَ سَيْفٌ مِنْ سُيُوفِ اللَّهِ، حَتَّى فَتَحَ اللَّهُ عَلَيْهِمْ"، يعني خالد بن الوليد.',
  'Sahih al-Bukhari 3757, 4262',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ADK-BEG-001',
  'adhkar_duas_manners',
  'beginner',
  'What is the standard prophetic greeting of peace in Islam?',
  'Waa kuwee salaanta asalka ah ee nabadeed ee Nabigeenna ﷺ noo jideeyay inaan isku salaanno?',
  'ما هي تحية الإسلام المباركة التي شرعها الله تعالى ورسوله ﷺ لإفشاء السلام بين المسلمين؟',
  '[{"id":"opt_1","text_en":"Sabah al-Khayr","text_so":"Subax wanaagsan","text_ar":"صباح الخير"},{"id":"opt_2","text_en":"As-Salamu ''Alaykum wa Rahmatullahi wa Barakatuh","text_so":"Assalaamu Calaykum Waraxmatullaahi Wabarakaatuh","text_ar":"السلام عليكم ورحمة الله وبركاته"},{"id":"opt_3","text_en":"Ahlan wa Sahlan","text_so":"Ku soo dhawoow","text_ar":"أهلاً وسهلاً"},{"id":"opt_4","text_en":"Marhaban","text_so":"Marxabbaa","text_ar":"مرحباً بكم"}]'::jsonb,
  'opt_2',
  'The Prophet ﷺ taught the greeting of peace with thirty rewards for the complete phrasing: "As-Salamu ''Alaykum wa Rahmatullahi wa Barakatuh."',
  'Nabigu ﷺ wuxuu baray asxaabta salaanta buuxda ee xambaarsan 30-ka xasano: "Assalaamu Calaykum Waraxmatullaahi Wabarakaatuh."',
  'ثبت في سنن أبي داود والترمذي أن رجلاً قال: السلام عليكم ورحمة الله وبركاته، فقال النبي ﷺ: "ثلاثون"، أي ثلاثون حسنة.',
  'Sunan Abi Dawud 5195; Jami'' at-Tirmidhi 2689',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ADK-INT-001',
  'adhkar_duas_manners',
  'intermediate',
  'What is the prophetic supplication recited at the conclusion of a gathering (Kaffarat al-Majlis) to expiate minor shortcomings?',
  'Waa kuwee ducada Nabiga ﷺ ee lagu xidho fadhiga (Kafaaratul Majlis) si Eebbe u dhaafo dunuubta yar yar ee fadhigaas ku dhacday?',
  'ما هو دعاء كفارة المجلس المأثور عن النبي ﷺ الذي يمحو ما كان في المجلس من لغو وتقصير؟',
  '[{"id":"opt_1","text_en":"\"Alhamdulillah rabbil ''alamin\"","text_so":"\"Alxamdulillaahi Rabbil Caalamiin\"","text_ar":"\"الحمد لله رب العالمين\""},{"id":"opt_2","text_en":"\"Subhanak-Allahumma wa bihamdika, ash-hadu an la ilaha illa Anta, astaghfiruka wa atubu ilayk\"","text_so":"\"Subxaanakallaahumma wabixamdika, ash-hadu an laa ilaaha illaa anta, astaghfiruka wa atuubu ilayk\"","text_ar":"\"سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ\""},{"id":"opt_3","text_en":"\"Bismillahi tawakkaltu ''alallah\"","text_so":"\"Bismillaahi tawakkaltu calallaah\"","text_ar":"\"بسم الله توكلت على الله\""},{"id":"opt_4","text_en":"\"La hawla wa la quwwata illa billah\"","text_so":"\"Laa xowla walaa quwwata illaa billaah\"","text_ar":"\"لا حول ولا قوة إلا بالله\""}]'::jsonb,
  'opt_2',
  'The Prophet ﷺ stated: "Whoever sits in a gathering wherein there is excessive chatter and says before standing: ''Subhanak-Allahumma wa bihamdika...'', Allah forgives what occurred in that gathering."',
  'Nabigu ﷺ wuxuu sheegay in qofkii fadhiya meel ay hadal badatay oo akhriya ducadan ka hor intaanu kicin, Eebbe u dhaafi doono wixii fadhigaas ka dhacay.',
  'قال رسول الله ﷺ: "من جلس في مجلس فكثر فيه لغطه فقال قبل أن يقوم: سبحانك اللهم وبحمدك... إلا غفر له ما كان في مجلسه ذلك".',
  'Jami'' at-Tirmidhi 3433; Sahih al-Jami'' (6192)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ADK-ADV-001',
  'adhkar_duas_manners',
  'advanced',
  'What is the celebrated opening of "Sayyid al-Istighfar" (The Master Supplication for Forgiveness) as taught in Sahih al-Bukhari?',
  'Sidee ayuu ku bilaabmaa Sayidul Istighfaar (Ducada ugu sarreysa Dambi-dhaaf-weydiga) ee ku qoran Saxiixul Bukhaari?',
  'ما هي الكلمات الافتتاحية العظيمة لدعاء "سيد الاستغفار" الذي رواه البخاري في صحيحه؟',
  '[{"id":"opt_1","text_en":"\"Astaghfirullaha wa atubu ilayh\"","text_so":"\"Astaghfirullaaha wa atuubu ilayh\"","text_ar":"\"أستغفر الله وأتوب إليه\""},{"id":"opt_2","text_en":"\"Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana ''abduka...\"","text_so":"\"Allaahumma Anta Rabbii laa ilaaha illaa Anta, khalaqtanii wa ana cabduka...\"","text_ar":"\"اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ...\""},{"id":"opt_3","text_en":"\"Rabbi ighfirli wa tub ''alayya\"","text_so":"\"Rabbi ighfir lii wa tub calayya\"","text_ar":"\"رب اغفر لي وتب عليَّ\""},{"id":"opt_4","text_en":"\"Allahumma innaka ''afuwwun tuhibbul ''afwa fa''fu ''anni\"","text_so":"\"Allaahumma innaka cafwwun tuhibbul cafwa facfu cannii\"","text_ar":"\"اللهم إنك عفو تحب العفو فاعف عني\""}]'::jsonb,
  'opt_2',
  'Prophet Muhammad ﷺ described this supplication as Sayyid al-Istighfar: "Whoever recites it during the day with conviction and dies that day before evening is among the people of Paradise."',
  'Nabigu ﷺ wuxuu ducadan ku magacaabay Sayidul Istighfaar: "Qofkii maalinkii akhriya isagoo yaqiinsan oo maalintaas dhinta qorrax dhaca ka hor wuxuu ka mid yahay reer Jannada."',
  'قال رسول الله ﷺ: "سيد الاستغفار: اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك... من قالها موقناً بها فمات من يومه فهو من أهل الجنة".',
  'Sahih al-Bukhari 6306',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ETH-BEG-001',
  'ethics_daily_life',
  'beginner',
  'What is the paramount moral duty toward parents in Islamic ethics termed in the Quran and Hadith?',
  'Muxuu yahay waajibka ugu weyn ee akhlaaqda Islaamku saartay ubadka xagga waalidiinta (Waalid-dhowridda)?',
  'ما هو المصطلح الشرعي المعبر عن أوجب الواجبات الأخلاقية للإحسان إلى الوالدين وطاعتهما في غير معصية؟',
  '[{"id":"opt_1","text_en":"Silat al-Arham","text_so":"Xiriirinta qaraabada","text_ar":"صلة الأرحام"},{"id":"opt_2","text_en":"Birr al-Walidayn (Devotion and Excellence to Parents)","text_so":"Baarrinimada Waalidiinta (Birrul Waalidayn)","text_ar":"بر الوالدين والإحسان إليهما"},{"id":"opt_3","text_en":"Husn al-Jiwar","text_so":"Daris-wanaagga","text_ar":"حسن الجوار"},{"id":"opt_4","text_en":"Al-Ihsan bil-Yateem","text_so":"U gargaaridda agoonta","text_ar":"كفالة اليتيم"}]'::jsonb,
  'opt_2',
  'Allah paired worship of Him with Birr al-Walidayn in multiple verses: "And your Lord has decreed that you not worship except Him, and to parents, good treatment" (Quran 17:23).',
  'Eebbe wuxuu cibaadadiisa ku lamaaniyay baarrinimada waalidiinta: "Eebahaana wuxuu xukumay inaadan caabudin isaga mooyee oo aad waalidiinta u samafashaan" (Al-Isra 17:23).',
  'قرن الله حقه بالبر بالوالدين: {وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا}، وهو من أحب الأعمال إلى الله.',
  'Quran 17:23-24; Sahih al-Bukhari 5971',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ETH-INT-001',
  'ethics_daily_life',
  'intermediate',
  'How did the Prophet Muhammad ﷺ define "Gheebah" (Backbiting) when clarifying it to his Companions?',
  'Sidee ayuu Nabigu ﷺ u qeexay "Xanta" (Qaybada) markii uu asxaabta u faahfaahinayay?',
  'كيف عرّف النبي ﷺ "الغيبة" المحرمة حين سأله الصحابة الكرام عنها؟',
  '[{"id":"opt_1","text_en":"Saying something praising your brother in his presence","text_so":"Inaad walaalkaa ammaanto isagoo jooga","text_ar":"مدح أخيك في وجهه أمام الناس"},{"id":"opt_2","text_en":"Mentioning concerning your brother that which he dislikes hearing, even if it is true","text_so":"Inaad walaalkaa ku sheegto wax uu neceb yahay in laga sheego, xataa hadday dhab tahay","text_ar":"ذكرك أخاك بما يكره، فإن كان فيه ما تقول فقد اغتبته، وإن لم يكن فيه فقد بهته"},{"id":"opt_3","text_en":"Disagreeing with someone on commercial prices","text_so":"Inaad qof kaga aragti duwanaato qiimaha suuqa","text_ar":"الاختلاف معه في أسعار السلع التجارية"},{"id":"opt_4","text_en":"Advising someone in private regarding their error","text_so":"Inaad qof si qarsoodi ah ugu nasteexeyso","text_ar":"مناصحته سراً فيما أخطأ فيه"}]'::jsonb,
  'opt_2',
  'In Sahih Muslim, the Prophet ﷺ defined backbiting as mentioning your brother with what he dislikes. If what you say is in him, you have backbitten him; if it is not in him, you have slandered him (Buhtan).',
  'Nabigu ﷺ wuxuu sheegay: "Xantu waa inaad walaalkaa ku xusto wax uu neceb yahay". Haddii waxaad sheegtay ay ku jiraan waad xamatay, haddii aysan ku jirinna waad been-abuuratay.',
  'قال رسول الله ﷺ: "أَتَدْرُونَ مَا الْغِيبَةُ؟ قَالُوا: اللَّهُ وَرَسُولُهُ أَعْلَمُ، قَالَ: ذِكْرُكَ أَخَاكَ بِمَا يَكْرَهُ".',
  'Sahih Muslim 2589; Quran 49:12',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ETH-ADV-001',
  'ethics_daily_life',
  'advanced',
  'In spiritual ethics (Tazkiyah), what is the crucial distinction between praiseworthy "Ghibtah" (enviable aspiration) and condemned "Hasad" (destructive jealousy)?',
  'Culuumta Daahirinta Qalbiga, maxay tahay farqiga saxda ah ee u dhexeeya "Qibdada" la ammaano iyo "Xasidka" xaaraanta ah?',
  'في علم تزكية النفوس والأخلاق الشرعية، ما هو الفارق الدقيق الفاصل بين "الغبطة" المحمودة و"الحسد" المذموم المحرم؟',
  '[{"id":"opt_1","text_en":"Ghibtah relates solely to physical athletic competition, while Hasad relates to religious knowledge","text_so":"Qibdadu waxay ku kooban tahay tartanka ciyaaraha, Xasidkuna cilmiga","text_ar":"الغبطة تتعلق بالمنافسات البدنية، والحسد يتعلق بالعلم الشرعي"},{"id":"opt_2","text_en":"Hasad is wishing that the blessing be stripped from another person, whereas Ghibtah is wishing for the same good blessing for oneself without desiring its loss from the other","text_so":"Xasidku waa inaad jeclaato in nicmaddu ka suusho qofka kale, Qibdaduna waa inaad naftaada la doonto khayrkaas bilaa in qofka laga qaado","text_ar":"الحسد تمني زوال النعمة عن المنعَم عليه، بينما الغبطة تمني حصول مثل تلك النعمة للنفس دون زوالها عن صاحبها"},{"id":"opt_3","text_en":"Ghibtah is permissible only in matters of commerce and business profit","text_so":"Qibdadu waxay bannaan tahay oo kaliya ganacsiga iyo faa''iidada adduunka","text_ar":"الغبطة لا تجوز إلا في التجارة وجمع الأرباح المالية الدنيوية"},{"id":"opt_4","text_en":"Hasad is expressed verbally, while Ghibtah is harbored silently in the heart","text_so":"Xasidka afka ayaa laga sheegaa, Qibdadana qalbiga","text_ar":"الحسد يكون باللسان فقط، والغبطة تكون عملاً قلبياً خفياً"}]'::jsonb,
  'opt_2',
  'Hasad is inherently malicious as it resents Allah''s distribution of favor and wishes its destruction upon a fellow believer. Ghibtah (honorable aspiration) is celebrated in the Hadith: "There is no [permissible] jealousy except in two cases: a person given wealth who spends it in truth, and a person given wisdom who teaches it."',
  'Xasidku waa cudur qalbi oo xun kaas oo qofku ku nacayo nimcada Alle siiyay walaalkii uuna doonayo inay ka baaba''do. Qibdaduna waa inaad jeclaato inaad adiguna khayrkaas hesho adoon walaalkaa xumaan la jeclayn.',
  'الحسد المذموم هو كراهة النعمة للغير وتمني زوالها عنه، أما الغبطة المحمودة فهي تمني مثل الخير دون كراهته لأخيه أو تمني زواله، كما في حديث: "لا حسد إلا في اثنتين".',
  'Sahih al-Bukhari 73; Sahih Muslim 816; Fath al-Bari (Ibn Hajar 1/167)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ARB-BEG-001',
  'arabic_terminology',
  'beginner',
  'What is the comprehensive meaning of the essential Islamic concept "Taqwa" (تَقْوَى)?',
  'Muxuu yahay macnaha guud ee eray-bixinta muhiimka ah ee Islaamka ee "Taqwa" (تَقْوَى)?',
  'ما هو المعنى الشرعي الجامع لمصطلح "التقوى" الذي أمر الله به عباده في مواضع لا تحصى من القرآن؟',
  '[{"id":"opt_1","text_en":"Fasting continuously throughout the year","text_so":"Soonka xiriirka ah ee sanadka oo dhan","text_ar":"صيام الدهر كله دون إفطار"},{"id":"opt_2","text_en":"Piety, God-consciousness, and placing a protective shield between oneself and Allah''s displeasure by obeying His commands and avoiding prohibitions","text_so":"Cabsida Eebbe, dhowrsanaanta, iyo in qofku naftiisa iyo carada Alle u yeelo gaashaan isagoo samaynaya amarradiisa kana fogaanaya reebitaankiisa","text_ar":"اتقاء سخط الله وعذابه بامتثال أوامره واجتناب نواهيه، وأن تجعل بينك وبين عذاب الله وقاية"},{"id":"opt_3","text_en":"Physical seclusion in a cave away from all human society","text_so":"In dadka laga dhuunto oo god la galo","text_ar":"الانعزال التام عن مجتمعات المسلمين"},{"id":"opt_4","text_en":"Reciting Arabic poetry without grammar errors","text_so":"Akhriska gabayada Carabiga ee aan khaldanayn","text_ar":"إتقان بحور الشعر العربي القديم"}]'::jsonb,
  'opt_2',
  'Taqwa is derived from Wiqayah (protective barrier). Talq ibn Habib defined it as: "Acting in obedience to Allah upon light from Allah, hoping for His reward; and leaving disobedience upon light from Allah, fearing His punishment."',
  'Taqwadu waxay ka timid Wiqaayah (gaashaan). Dalq bin Xabiib wuxuu ku qeexay: "Inaad Eebbe ku addeecdo nuur ka yimid xaggiisa adigoo naxariistiisa rajeynaya, kana tagto macsidiisa adigoo ciqaabtiisa ka cabsanaya".',
  'قال طلق بن حبيب: "التقوى أن تعمل بطاعة الله على نور من الله ترجو ثواب الله، وأن تترك معصية الله على نور من الله تخاف عقاب الله".',
  'Quran 2:197, 49:13; Jami'' al-''Ulum wal-Hikam (Ibn Rajab p. 190)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ARB-INT-001',
  'arabic_terminology',
  'intermediate',
  'What is the critical distinction in Islamic theology between "Tawakkul" (تَوَكُّل) and "Tawaakul" (تَوَاكُل)?',
  'Maxay tahay farqiga weyn ee u dhexeeya "Tawakkul" (Tawaakalka saxda ah) iyo "Tawaakul" (Isku-dhiibidda khaldan)?',
  'ما هو الفارق الجوهري في الشريعة الإسلامية بين "التوكل" المحمود المأمور به و"التواكل" المذموم؟',
  '[{"id":"opt_1","text_en":"Tawakkul applies in winter while Tawaakul applies in summer","text_so":"Tawakkulku wuxuu khuseeyaa jiilaalka, Tawaakulna xagaaga","text_ar":"التوكل يكون في الشتاء والتواكل في الصيف"},{"id":"opt_2","text_en":"Tawakkul is trusting Allah while actively undertaking appropriate lawful causes, whereas Tawaakul is claiming reliance while abandoning the required efforts","text_so":"Tawakkulku waa inaad Alle talasaarato adigoo sababihii sharciga ahaa cuskaday, Tawaakulna waa inaad sababihii iyo dadaalkii ka tagto oo aad tiraahdo Alle ayaan talasaartay","text_ar":"التوكل هو صدق اعتماد القلب على الله مع الأخذ بالأسباب المشروعة، والتواكل هو ادعاء الاعتماد مع تعطيل الأسباب والكسل"},{"id":"opt_3","text_en":"Tawakkul is performed with the tongue while Tawaakul is performed in prayer","text_so":"Tawakkulku afka ayaa laga yiraahdaa","text_ar":"التوكل قول باللسان والتواكل عمل في الصلاة"},{"id":"opt_4","text_en":"Tawaakul is a pillar of Hajj while Tawakkul is for fasting","text_so":"Tawaakulku waa tiir xajka ka mid ah","text_ar":"التواكل ركن في الحج والتوكل للصيام"}]'::jsonb,
  'opt_2',
  'The Prophet ﷺ encapsulated true Tawakkul when an Arab asked whether to tie his camel or leave it: "Tie it, and rely upon Allah." Neglecting lawful causes is Tawaakul, which contradicts the Sunnah.',
  'Nabigu ﷺ wuxuu caddeeyay Tawakkalka saxda ah markii ninkii reer miyiga ahaa weydiiyay inuu geela xidho ama iska daayo: "Xidho, dabadeedna Alle talasaaro". In sababaha laga tago waa Tawaakul khalad ah.',
  'قال رسول الله ﷺ للأعرابي الذي سأله أيترك ناقته ويتوكل: "اعْقِلْهَا وَتَوَكَّلْ". فالأخذ بالأسباب من تمام التوكل على الله.',
  'Jami'' at-Tirmidhi 2517; Madarij as-Salikin (2/115)',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'ARB-ADV-001',
  'arabic_terminology',
  'advanced',
  'What is the rigorous definition of "Bid''ah" (بدعة) in the context of Islamic Shariah as established by Imam Ash-Shatibi?',
  'Sida uu qeexay Imaam Ash-Shaadhibi kitaabkiisa Al-Ictisaam, maxay tahay qeexitaanka sharciga ah ee "Bidcada" (بدعة)?',
  'ما هو الضابط الشرعي المحكم للبدعة المذمومة في الدين كما حرره الإمام الشاطبي في كتابه "الاعتصام"؟',
  '[{"id":"opt_1","text_en":"Using modern technological inventions like smartphones or printing presses","text_so":"Adeegsiga tignoolajiyada casriga ah sida telefoonnada iyo daabacadaha","text_ar":"استعمال المخترعات الدنيوية الحديثة كالطابعات والسيارات"},{"id":"opt_2","text_en":"An invented, novel way in religious practice that resembles the Shariah, intended to excessively worship Allah beyond what He legislated","text_so":"Waddo la soo saaray oo ku cusub diinta oo u eg shareecada, oo looga dan leeyahay cibaado dheeraad ah oo Eebbe uusan jidayn","text_ar":"طريقة في الدين مخترعة، تضاهي الشرعية، يُقصد بالسلوك عليها المبالغة في التعبد لله تعالى مما لم يشرعه"},{"id":"opt_3","text_en":"Cooking cuisines from non-Arab cultures","text_so":"Karinta cuntooyinka aan Carabta ahayn","text_ar":"صنع الأطعمة والأشربة غير العربية"},{"id":"opt_4","text_en":"Any action that was not performed in the first year of Hijrah","text_so":"Ficil kasta oo aan la samayn sannadkii 1-aad ee Hijrada","text_ar":"أي عمل لم يفعله الصحابة في السنة الأولى للهجرة"}]'::jsonb,
  'opt_2',
  'Imam Ash-Shatibi formulated the definitive definition: Bid''ah applies strictly to religious innovations claimed as acts of divine worship without Quranic or prophetic authority. Worldly technological advancements are not Bid''ah.',
  'Imaam Ash-Shaadhibi wuxuu caddeeyay in bidcadu tahay wax cusub oo lagu daro cibaadada diinta oo aan daliil sharci ah loo haysan. Horumarka adduunyada iyo tignoolajiyadu ma aha bidco.',
  'حرر الشاطبي في "الاعتصام" أن البدعة خاصة بأمور الدين والعبادات المخترعة، أما العادات وأمور الدنيا الدنيوية فالباب فيها على الإباحة والأصل.',
  'Al-I''tisam (Ash-Shatibi 1/37); Sahih Muslim 867',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'GEN-BEG-001',
  'general',
  'beginner',
  'How many sacred months (Al-Ash-hur al-Hurum) are there in the Islamic Hijri calendar, as established in Surah At-Tawbah (9:36)?',
  'Immisa bilood oo xurmo leh (Al-Ash-hurul Xurum) ayaa ku jira sanadka taariikhda Hijriga sida ku cad Suuradda At-Tawbah 9:36?',
  'كم عدد الأشهر الحرم في السنة الهجرية القمرية بنص القرآن الكريم في سورة التوبة {إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا}؟',
  '[{"id":"opt_1","text_en":"Two months","text_so":"Laba bilood","text_ar":"شهران"},{"id":"opt_2","text_en":"Four months (Rajab, Dhul-Qi''dah, Dhul-Hijjah, and Muharram)","text_so":"Afar bilood (Rajab, Dul-Qicdah, Dul-Xijjah, iyo Muxarram)","text_ar":"أربعة أشهر حرم (رجب، وذو القعدة، وذو الحجة، والمحرم)"},{"id":"opt_3","text_en":"Six months","text_so":"Lix bilood","text_ar":"ستة أشهر"},{"id":"opt_4","text_en":"Eight months","text_so":"Siddeed bilood","text_ar":"ثمانية أشهر"}]'::jsonb,
  'opt_2',
  'The Prophet ﷺ declared in his Farewell Sermon: "The year has twelve months, four of which are sacred: three consecutive: Dhul-Qi''dah, Dhul-Hijjah, and Muharram, and Rajab of Mudar."',
  'Nabigu ﷺ wuxuu Khudbaddii Sagootiska ku caddeeyay: "Sannadku waa 12 bilood, afar ka mid ahna waa kuwo xurmo leh: saddex isku xigta oo kala ah Dul-Qicdah, Dul-Xijjah, iyo Muxarram, iyo Rajab".',
  'بين النبي ﷺ الأشهر الحرم الأربعة: "ثَلاَثٌ مُتَوَالِيَاتٌ: ذُو الْقَعْدَةِ، وَذُو الْحِجَّةِ، وَالْمُحَرَّمُ، وَرَجَبُ مُضَرَ الَّذِي بَيْنَ جُمَادَى وَشَعْبَانَ".',
  'Quran 9:36; Sahih al-Bukhari 3197; Sahih Muslim 1679',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'GEN-INT-001',
  'general',
  'intermediate',
  'What are the three holiest sanctuaries in Islam to which journeys may be specifically undertaken for prayer and worship according to the Hadith?',
  'Maxay yihiin saddexda masaajid ee ugu sharafta badan Islaamka ee safar gaar ah loo geli karo cibaadadooda sida xadiisku sheegay?',
  'ما هي المساجد الثلاثة المعظمة في الإسلام التي خُصت بشد الرحال إليها للصلاة والعبادة ومضاعفة الأجر؟',
  '[{"id":"opt_1","text_en":"Masjid al-Haram, Masjid Quba, and the Umayyad Mosque","text_so":"Masaajidka Xaramka, Masaajidka Qubaa, iyo Masaajidka Umawiyiinta","text_ar":"المسجد الحرام، ومسجد قباء، والمسجد الأموي"},{"id":"opt_2","text_en":"Masjid al-Haram (Makkah), Al-Masjid an-Nabawi (Madinah), and Al-Masjid al-Aqsa (Jerusalem)","text_so":"Masaajidka Xaramka (Makka), Masaajidka Nabiga (Madiina), iyo Masaajidka Al-Aqsa (Qudus)","text_ar":"المسجد الحرام بمكة المكرمة، والمسجد النبوي بالمدينة المنورة، والمسجد الأقصى المبارك بالقدس"},{"id":"opt_3","text_en":"Masjid al-Qiblatayn, Blue Mosque, and Kairouan Mosque","text_so":"Masaajidka Qiblatayn, Masaajidka Buluugga ah, iyo Kairouan","text_ar":"مسجد القبلتين، والمسجد الأزرق، وجامع القيروان"},{"id":"opt_4","text_en":"Masjid al-Azhar, Cordoba Mosque, and Al-Zaytuna Mosque","text_so":"Masaajidka Al-Azhar, Qurduba, iyo Al-Zaytuna","text_ar":"جامع الأزهر، وجامع قرطبة، وجامع الزيتونة"}]'::jsonb,
  'opt_2',
  'The Prophet ﷺ stated: "Do not undertake special journeys except to three mosques: Al-Masjid al-Haram, this mosque of mine (Al-Masjid an-Nabawi), and Al-Masjid al-Aqsa."',
  'Nabigu ﷺ wuxuu yiri: "Safarka cibaado looma qaato seddex masaajid mooyee: Masaajidka Xaramka, Masaajidkaygan (Masaajidka Nabiga), iyo Masaajidka Al-Aqsa".',
  'قال رسول الله ﷺ: "لاَ تُشَدُّ الرِّحَالُ إِلاَّ إِلَى ثَلاَثَةِ مَسَاجِدَ: المَسْجِدِ الحَرَامِ، وَمَسْجِدِ الرَّسُولِ ﷺ، وَمَسْجِدِ الأَقْصَى".',
  'Sahih al-Bukhari 1189; Sahih Muslim 1397',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());


INSERT INTO public.quiz_questions (
  question_id, category, difficulty, question_en, question_so, question_ar,
  options, correct_option_id, explanation_en, explanation_so, explanation_ar,
  source_citation, review_status, is_verified, is_active
) VALUES (
  'GEN-ADV-001',
  'general',
  'advanced',
  'According to Surah Ali ''Imran (3:96), what was the very first house of divine worship established for humankind on earth?',
  'Sida ku xusan aayadda 96-aad ee Suuradda Aali Cimraan, guri noocee ah ayaa ahaa kii ugu horreeyay ee dadka loo dhisay cibaadada Eebbe?',
  'ما هو أول بيت وُضع للناس على وجه الأرض لعبادة الله تعالى وحده بنص القرآن الكريم في سورة آل عمران؟',
  '[{"id":"opt_1","text_en":"Al-Masjid al-Aqsa in Jerusalem","text_so":"Masaajidka Al-Aqsa ee Qudus","text_ar":"المسجد الأقصى المبارك بالقدس"},{"id":"opt_2","text_en":"The Ancient House (Al-Bayt al-Haram / The Ka''bah at Bakkah/Makkah)","text_so":"Guriga Qadiimiga ah (Al-Baytul Xaraam / Kacbada ku taal Bakkah/Makka)","text_ar":"البيت الحرام (الكعبة المشرفة ببكة المباركة)"},{"id":"opt_3","text_en":"The Sanctuary of Mount Sinai","text_so":"Goobta barakaysan ee Buur Siinaay","text_ar":"موضع جبل الطور بسيناء"},{"id":"opt_4","text_en":"Masjid Quba","text_so":"Masaajidka Qubaa","text_ar":"مسجد قباء بالمدينة"}]'::jsonb,
  'opt_2',
  'Allah states in Surah Ali ''Imran 3:96: "Indeed, the first House [of worship] established for mankind was that at Bakkah - blessed and a guidance for the worlds." In Sahih Muslim, Abu Dharr asked the Prophet ﷺ which mosque was built first; he answered: "Al-Masjid al-Haram."',
  'Eebbe wuxuu yiri: "Gurigii ugu horreeyay ee dadka loo yeelay cibaadada waa kan Bakkah (Makka) ku yaal ee barakaysan" (Aali Cimraan 3:96). Xadiiskana Abu Dhar wuxuu wariyay in Kacbadu ahayd masaajidkii ugu horreeyay.',
  'قال تعالى: {إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ مُبَارَكًا وَهُدًى لِّلْعَالَمِينَ}، وثبت في الصحيحين أنه بني قبل المسجد الأقصى بأربعين عاماً.',
  'Quran 3:96; Sahih al-Bukhari 3366; Sahih Muslim 520',
  'verified',
  TRUE,
  TRUE
)
ON CONFLICT (question_id) DO UPDATE SET
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  question_en = EXCLUDED.question_en,
  question_so = EXCLUDED.question_so,
  question_ar = EXCLUDED.question_ar,
  options = EXCLUDED.options,
  correct_option_id = EXCLUDED.correct_option_id,
  explanation_en = EXCLUDED.explanation_en,
  explanation_so = EXCLUDED.explanation_so,
  explanation_ar = EXCLUDED.explanation_ar,
  source_citation = EXCLUDED.source_citation,
  review_status = EXCLUDED.review_status,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());

COMMIT;