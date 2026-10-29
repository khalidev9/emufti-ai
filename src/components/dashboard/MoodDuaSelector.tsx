import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, ArrowRight, BookOpen, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface MoodDua {
  id: string;
  emoji: string;
  titleSomali: string;
  titleEnglish: string;
  ayahArabic: string;
  ayahTranslation: string;
  ayahRef: string;
  duaArabic: string;
  duaTranslation: string;
  duaRef: string;
  advice: string;
}

const MOOD_DATA: MoodDua[] = [
  {
    id: 'anxious',
    emoji: '😰',
    titleSomali: 'Welwel ama Cabsi',
    titleEnglish: 'Anxious / Overwhelmed',
    ayahArabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    ayahTranslation: 'Ogsoonow, xuska Eebbe uun bay qalbiyadu ku degaan. (Unquestionably, by the remembrance of Allah hearts are assured.)',
    ayahRef: "Surah Ar-Ra'd 13:28",
    duaArabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    duaTranslation: 'Eebbaa nagu filan, waana wakiilka ugu wanaagsan.',
    duaRef: 'Surah Ali Imran 3:173',
    advice: 'Trust completely in Allah\'s divine decree. No hardship is outside His power and compassion.',
  },
  {
    id: 'grateful',
    emoji: '🤲',
    titleSomali: 'Mahadnaq & Barwaaqo',
    titleEnglish: 'Grateful & Joyful',
    ayahArabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    ayahTranslation: 'Haddii aad mahadnaqdaan, xaqiiqdii waan idiin kordhinayaa. (If you are grateful, I will surely increase your favor.)',
    ayahRef: 'Surah Ibrahim 14:7',
    duaArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    duaTranslation: 'Mahad idilkeed waxaa iskaleh Eebbe, Barbaariyaha caalamka.',
    duaRef: 'Surah Al-Fatihah 1:2',
    advice: 'Anchor your blessings by sharing with those in need and remaining humble in devotion.',
  },
  {
    id: 'guidance',
    emoji: '🧭',
    titleSomali: 'Hanuun & Go\'aan Gaarasho',
    titleEnglish: 'Seeking Guidance / Istikharah',
    ayahArabic: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
    ayahTranslation: 'Eebbow xaggaaga nooga sii naxariis, noona hagaaji arrinkayaga hanuun.',
    ayahRef: 'Surah Al-Kahf 18:10',
    duaArabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي',
    duaTranslation: 'Ilaahayow, i hanuuni oo igu toosi wadada toosan.',
    duaRef: 'Sahih Muslim 2725',
    advice: 'Perform Salat al-Istikharah, consult righteous elders, and step forward with faith in Allah.',
  },
  {
    id: 'sad',
    emoji: '💔',
    titleSomali: 'Murugo ama Qalbi-jab',
    titleEnglish: 'Sad & Grieving',
    ayahArabic: 'إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ',
    ayahTranslation: 'Waxaan welwelkayga iyo murugadayda uun u dacwoonayaa Eebbe.',
    ayahRef: 'Surah Yusuf 12:86',
    duaArabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    duaTranslation: 'Ma jiro Ilaah kale xaq lagu caabudo adiga mooyee, waad hufantahay, waxaan ka mid noqday kuwa dulmiyay naftooda.',
    duaRef: 'Surah Al-Anbiya 21:87',
    advice: 'Crying to Allah in sujood is pure worship. Relief is closer than you realize.',
  },
  {
    id: 'hardship',
    emoji: '🌧️',
    titleSomali: 'Cidhiidhi & Tijaabo',
    titleEnglish: 'Facing Hardship',
    ayahArabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    ayahTranslation: 'Dhab ahaantii, dhibaatada waxaa weheliya fudayd. (Indeed, with hardship comes ease.)',
    ayahRef: 'Surah Ash-Sharh 94:5-6',
    duaArabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',
    duaTranslation: 'Ka noolow ee wax maamula, naxariistaada baan kaalmo kaga doonayaa.',
    duaRef: 'Sunan At-Tirmidhi 3524',
    advice: 'Two eases will never be overcome by one hardship. Keep patient and constant in Istighfar.',
  },
  {
    id: 'forgiveness',
    emoji: '🕊️',
    titleSomali: 'Dambi-dhaaf & Tawbad',
    titleEnglish: 'Seeking Forgiveness',
    ayahArabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    ayahTranslation: 'Waxaad dhahdaa: Addoomadaydiyow naftooda xad-gudbay, ha ka quusanina naxariista Eebbe.',
    ayahRef: 'Surah Az-Zumar 39:53',
    duaArabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ',
    duaTranslation: 'Eebbow ii dambi dhaaf, toobaddaydana iga aqbal, adaa toobad aqbal badane naxariis badan e.',
    duaRef: 'Sunan Abi Dawud 1516',
    advice: 'Allah delights in the repentance of His servant more than a traveler reunited with his lost camel in the desert.',
  },
];

export const MoodDuaSelector: React.FC = () => {
  const navigate = useNavigate();
  const { createNewChat } = useChat();
  const [selectedMoodId, setSelectedMoodId] = useState<string>('anxious');

  const activeMood = MOOD_DATA.find((m) => m.id === selectedMoodId) || MOOD_DATA[0];

  const handleAskAIAboutMood = async () => {
    const prompt = `Waxaan dareemayaa ${activeMood.titleSomali} (${activeMood.titleEnglish}). Maxay tahay aayadaha, ducada, iyo nasteexada shareecada Islaamku igu dhiirigelinayso xaaladdan?`;
    const newId = await createNewChat(prompt);
    navigate(`/chat/${newId}`);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-blue-200 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Ducooyinka Qalbiga & Aayadaha Xaaladaha (Spiritual Mood Guide)
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          Sideed dareemaysaa maanta? (How are you feeling?)
        </span>
      </div>

      {/* Mood Chips Selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {MOOD_DATA.map((mood) => {
          const isSelected = mood.id === selectedMoodId;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMoodId(mood.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.titleSomali}</span>
            </button>
          );
        })}
      </div>

      {/* Recommended Scripture & Dua Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border border-slate-200/90 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeMood.emoji}</span>
            <span className="text-xs font-bold text-slate-900">{activeMood.titleSomali} · {activeMood.titleEnglish}</span>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {activeMood.ayahRef}
          </span>
        </div>

        {/* Ayah */}
        <div className="space-y-1">
          <p className="text-lg sm:text-xl font-bold text-slate-900 text-right font-serif select-all leading-relaxed" dir="rtl">
            {activeMood.ayahArabic}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {activeMood.ayahTranslation}
          </p>
        </div>

        {/* Dua */}
        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-blue-800">Ducada Nabawiga ah:</span>
            <span className="text-slate-500 font-medium">{activeMood.duaRef}</span>
          </div>
          <p className="text-base font-bold text-slate-900 text-right font-serif select-all" dir="rtl">
            {activeMood.duaArabic}
          </p>
          <p className="text-xs text-slate-600">
            {activeMood.duaTranslation}
          </p>
        </div>

        {/* Spiritual Guidance & Ask AI Button */}
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 italic max-w-lg">
            ✨ {activeMood.advice}
          </p>

          <button
            type="button"
            onClick={handleAskAIAboutMood}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Waydii EMufti Faahfaahin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
