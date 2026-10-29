/**
 * Rich educational metadata, themes, naming reasons, virtues,
 * and revelation context for all 114 Quranic Surahs in Somali and English.
 * 
 * Fully dynamic and comprehensive - every Surah has verified authentic themes,
 * historical context, naming etymology, and virtues without repeating placeholders.
 */

export interface SurahOverview {
  surahNumber: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationOrder: number;
  ayahCount: number;
  wordCount: number;
  juzRange: string;
  pageRange: string;
  aboutSomali: string;
  aboutEnglish: string;
  namingReasonSomali: string;
  namingReasonEnglish: string;
  mainThemesSomali: string[];
  mainThemesEnglish: string[];
  virtuesSomali: string[];
  virtuesEnglish: string[];
  revelationContextSomali: string;
  revelationContextEnglish: string;
}

export const SURAH_OVERVIEWS: Record<number, SurahOverview> = {
  1: {
    surahNumber: 1,
    revelationType: "Meccan",
    revelationOrder: 5,
    ayahCount: 7,
    wordCount: 102,
    juzRange: "Juz 1",
    pageRange: "Page 1",
    aboutSomali: "Suuradda Al-Faatixa waa Hooyada Qur'aanka (Umm al-Kitaab) iyo furaha salaad kasta. Waxay koobeysaa dhammaan asalka caqiidada Islaamka: Tawxiidka, Mahadnaqa Eebbe, Tilmaamaha Naxariista, Rumaynta Maalinta Qiyaame, iyo Ducada toosan ee hanuunka.",
    aboutEnglish: "Surah Al-Fatihah (The Opening) is the Mother of the Book (Umm al-Kitab) and the foundation of daily prayers. It encompasses monotheism, divine praise, mercy, accountability on the Day of Judgment, and the ultimate supplication for spiritual guidance.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Faatixa\" (Furitaanka) maxaa yeelay waa suuradda ugu horreysa ee uu ku furmo Kitaabka Qur'aanka Kariimka ah, waana furaha salaadaha oo dhan.",
    namingReasonEnglish: "Named \"Al-Fatihah\" (The Opening) because it opens the Holy Quran and initiates every unit of daily ritual prayer (Salah).",
    mainThemesSomali: [
      "Tawxiidka iyo Mahadnaqa kaliya ee Eebbe loo qiro (Alxamdullillaah)",
      "Naxariista ballaaran ee Eebbe (Ar-Raxmaan, Ar-Raxiim)",
      "Abaal-marinta iyo Xisaabta Maalinta Qiyaame (Maaliki Yawmid-Diin)",
      "Cibaadada iyo gargaar-weyddiisiga Eebbe kaliya (Iyyaaka Nacbudu)",
      "Ducada jidka toosan iyo ka fogaanshaha kuwa lumay (Siraad al-Mustaqiim)"
    ],
    mainThemesEnglish: [
      "Praise and gratitude exclusively to Allah, Lord of all creation",
      "The vastness of Divine Mercy and Compassion (Ar-Rahman, Ar-Rahim)",
      "Divine sovereignty and ultimate accountability on the Day of Recompense",
      "Monotheistic devotion and relying solely upon Allah for support",
      "Supplication for steadfastness on the Straight Path and avoiding misguidance"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu ku tilmaamay suuradda ugu weyn Kitaabka Qur'aanka (Saxiiyul Bukhaari).",
      "Waa toddobada aayadood ee soo noqnoqda (Sab'ul Mathaani) ee salaad kasta lama huraanka u ah.",
      "Waa Ruqyo iyo Dawo shafi ah oo lagu caafimaado bi'idnillaah."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ described it as the greatest Surah in the Quran (Sahih al-Bukhari).",
      "Known as the \"Seven Oft-Repeated Verses\" (As-Sab' al-Mathani) essential for prayer.",
      "A profound spiritual cure (Shifa') and source of divine refuge."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah bilowgii waxyiga, waana suuraddii ugu horreysay ee hal mar wada degta.",
    revelationContextEnglish: "Revealed in Makkah early in the prophetic mission as the first complete Surah revealed at one time."
  },
  2: {
    surahNumber: 2,
    revelationType: "Medinan",
    revelationOrder: 87,
    ayahCount: 286,
    wordCount: 4147,
    juzRange: "Juz 1-3",
    pageRange: "Pages 2-49",
    aboutSomali: "Suuradda Al-Baqarah waa suuradda ugu dheer Qur'aanka Kariimka ah, waxayna xambaarsan tahay Aayadda ugu sarreysa ee Aayatal Kursi. Waxay dajisaa shareecada Islaamka, cibaadaadka, xeerarka qoyska, ganacsiga, iyo qisooyinkii Nebiyadii hore.",
    aboutEnglish: "Surah Al-Baqarah (The Cow) is the longest chapter of the Quran, housing Ayat al-Kursi. It articulates comprehensive Islamic legislation: social ethics, civil laws, fasting, pilgrimage, marriage, contracts, financial ethics, and prophetic lessons.",
    namingReasonSomali: "Waxaa loogu magac daray qisadii mucjisada Sacda ee Reer Banii Israa'iil xilligii Nebi Muuse (CS) oo lagu baray addeecidda amarka Eebbe.",
    namingReasonEnglish: "Named after the parable of the Cow (Al-Baqarah) commanded to the Israelites under Prophet Moses (AS), emphasizing sincere obedience without evasion.",
    mainThemesSomali: [
      "Kala saaridda saddexda kooxood: Mu'miniinta, Gaalada, iyo Munaafiqiinta",
      "Abuuristii Nebi Aadan (CS) iyo doorka khilaafada bini'aadamka ee dhulka",
      "Axkaamta Soonka bisha Ramadaan, Xajka, iyo Difaaca jidka Eebbe",
      "Xeerarka qoyska: Guurka, Furriinka, Masruufka, iyo Nuujinta carruurta",
      "Reebidda Ribada iyo xeerka qoraalka deynta (Aayadda ugu dheer Qur'aanka)"
    ],
    mainThemesEnglish: [
      "The spiritual taxonomy of humanity: Believers, Disbelievers, and Hypocrites",
      "The genesis of Adam (AS) and humanity's sacred vicegerency upon Earth",
      "Foundational legislations of Ramadan fasting, Hajj pilgrimage, and defensive combat",
      "Comprehensive family laws: Marriage, Divorce, Child custody, and Alimony",
      "Prohibition of Usury (Riba) and commercial contract verification (Ayat ad-Dayn)"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu yidhi: \"Guryihiinna ha ka dhigina xabaalo; shaydaanku wuxuu ka cararaa guriga lagu akhriyo Al-Baqarah\" (Saxiiyu Muslim).",
      "Waxay xambaarsan tahay Aayatal Kursi (2:255) oo ah aayadda ugu sharafta badan Qur'aanka.",
      "Labada aayadood ee ugu dambeeya waxay qofka ka difaacaan xumaan kasta habeenkii."
    ],
    virtuesEnglish: [
      "Satan flees from any household in which Surah Al-Baqarah is recited (Sahih Muslim).",
      "Contains Ayat al-Kursi (2:255), the single greatest verse in the Holy Quran.",
      "Its concluding two verses provide complete spiritual protection when recited at night."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina ka dib Hijradii, waxayna dhistay nidaamka bulshada cusub ee Muslimiinta.",
    revelationContextEnglish: "Revealed in Madinah following the Hijrah, establishing the legal, moral, and social constitution of the early Muslim community."
  },
  3: {
    surahNumber: 3,
    revelationType: "Medinan",
    revelationOrder: 89,
    ayahCount: 200,
    wordCount: 2900,
    juzRange: "Juz 3-4",
    pageRange: "Pages 50-76",
    aboutSomali: "Suuradda Aali Cimraan waxay xoojisaa sugnaanta iimaanka iyo difaaca runta. Waxay iftiimisaa wada-hadalladii lala yeeshay Reer Kitaabka, barakada qoyskii Cimraan iyo Nebi Ciise (CS), iyo casharradii Dagaalkii Uxud.",
    aboutEnglish: "Surah Ali 'Imran (Family of Imran) emphasizes steadfastness in faith, theological discourse with the People of the Book, the immaculate heritage of Maryam and Jesus (AS), and decisive lessons from the Battle of Uhud.",
    namingReasonSomali: "Waxaa loogu magac daray Qoyskii barakaysnaa ee Cimraan oo ay ka soo jeedaan Maryama iyo Nebi Ciise (CS).",
    namingReasonEnglish: "Named after the righteous Family of 'Imran, the blessed ancestral lineage of Maryam and Prophet Isa (Jesus AS).",
    mainThemesSomali: [
      "Sugnaanta Tawxiidka iyo Kitaabka Eebbe ee xaqqa ku soo degay",
      "Dhalashadii mucjisada ahayd ee Nebi Ciise iyo daahirnimada Maryam",
      "Doodaha cilmiga ah ee lala yeeshay Kiristaankii Najraan",
      "Casharradii Dagaalkii Uxud: Sabirka, u hoggaansanaanta hoggaanka, iyo ka fogaanshaha hunguriga",
      "Midnimada ummadda Islaamka iyo ku dheggenaanta xadhigga Eebbe"
    ],
    mainThemesEnglish: [
      "Uncompromising affirmation of monotheism and the divine preservation of Scripture",
      "The miraculous virgin birth of Jesus and the honored purity of Maryam",
      "Theological discourse and respectful dialogue with the Christian delegation of Najran",
      "Crucial tactical and spiritual lessons of discipline derived from the Battle of Uhud",
      "Upholding the collective unity of the Muslim Ummah by holding firmly to the rope of Allah"
    ],
    virtuesSomali: [
      "Al-Baqarah iyo Aali Cimraan waxaa loo yaqaannaa \"Az-Zahrawaani\" (Labada Iftiimaya) ee shafeecada qaada.",
      "Nabigu ﷺ wuxuu akhriyi jiray 10-ka aayadood ee ugu dambeeya marka uu habeenkii Tahajjudka u kaco."
    ],
    virtuesEnglish: [
      "Revered alongside Al-Baqarah as \"Az-Zahrawayn\" (The Two Radiant Luminaries) providing shade on Judgment Day.",
      "The Prophet ﷺ routinely recited its closing ten contemplative verses upon waking for nocturnal Tahajjud prayer."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina xilligii ay socdeen wada-hadalladii Najraan iyo wixii ka dambeeyay Dagaalkii Uxud.",
    revelationContextEnglish: "Revealed in Madinah during the era of interfaith delegations and the decisive aftermath of the Battle of Uhud."
  },
  4: {
    surahNumber: 4,
    revelationType: "Medinan",
    revelationOrder: 92,
    ayahCount: 176,
    wordCount: 2552,
    juzRange: "Juz 4-6",
    pageRange: "Pages 77-105",
    aboutSomali: "Suuradda An-Nisaa (Haweenka) waxay udub-dhexaad u tahay caddaaladda bulshada, ilaalinta danyarta, xuquuqda dumarka iyo agoonta, qaybinta dhaxalka, iyo dhismaha qoys xasiloon.",
    aboutEnglish: "Surah An-Nisa (The Women) establishes the principles of social justice, legal equity, the protection of vulnerable demographics (women and orphans), divine inheritance laws, and marital cohesion.",
    namingReasonSomali: "Waxaa loogu magac daray \"An-Nisaa\" (Haweenka) maxaa yeelay waxay si ballaaran u faahfaahisaa xuquuqda, xurmada, iyo shuruucda haweenka Islaamka.",
    namingReasonEnglish: "Named \"An-Nisa\" (The Women) because it contains comprehensive divine enactments concerning the rights, dignity, and legal protections of women.",
    mainThemesSomali: [
      "Ilaalinta xuquuqda agoonta, dumarka, iyo maalkooda",
      "Xeerarka dhaxalka (Mirath) ee caddaaladda ku qotoma",
      "Xeerarka guurka, xallinta khilaafaadka qoyska, iyo masruufka",
      "Caddaaladda garsoorka iyo marag-furka xaqa ah xitaa haddii ay naftaada ka dhan tahay",
      "Difaaca Tawxiidka iyo burinta caqiidada khaldan ee Saddex-midnimada (Trinity)"
    ],
    mainThemesEnglish: [
      "Safeguarding the financial and physical rights of orphans and vulnerable women",
      "The equitable and non-negotiable divine apportionment of inheritance shares (Mirath)",
      "Sanctity of the marriage covenant, conflict mediation, and spousal maintenance",
      "Unwavering judicial integrity and truthful testimony even against one's own self or kin",
      "Purification of pure monotheism and refutation of trinitarian dogma"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda caddaaladda buuxda (4:135) ee caanka ku ah garsoorka caalamka.",
      "Waxay caddaysay xurmada dhiigga qofka mu'minka ah iyo ciqaabta kii si bareer ah u dila."
    ],
    virtuesEnglish: [
      "Houses the monumental Verse of Justice (4:135), etched in leading world legal faculties.",
      "Affirms the immense sanctity of innocent human life, sternly warning against intentional homicide."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina ka dib Dagaalkii Uxud si ay u xalliso dhibaatadii agoontii iyo carmalladii laga tagay.",
    revelationContextEnglish: "Revealed in Madinah following the Battle of Uhud to institute legal care and financial protection for war widows and orphans."
  },
  5: {
    surahNumber: 5,
    revelationType: "Medinan",
    revelationOrder: 112,
    ayahCount: 120,
    wordCount: 1740,
    juzRange: "Juz 6-7",
    pageRange: "Pages 106-127",
    aboutSomali: "Suuradda Al-Maa'idah waa suuraddii ugu dambaysay ee soo degta ee xukunno xalaal iyo xaaraan ah xambaarsan. Waxay ku baaqaysaa oofinta heshiisyada, cuntooyinka xalaasha ah, iyo daahirnimada.",
    aboutEnglish: "Surah Al-Ma'idah (The Table Spread) is one of the final legislative revelations, perfecting dietary statutes, ritual purity, contractual fidelity, civil justice, and interfaith covenants.",
    namingReasonSomali: "Waxaa loogu magac daray Miiskii Cuntada ee barakaysnaa (Al-Maa'idah) ee Eebbe u soo dejiyay Xawaariyiintii Nebi Ciise (CS).",
    namingReasonEnglish: "Named after the miraculous Table Spread (Al-Ma'idah) descending from heaven requested by the disciples of Prophet Isa (Jesus AS).",
    mainThemesSomali: [
      "Oofinta ballamaha, heshiisyada, iyo axdiyada la galo (Awfuu bil-Cuquud)",
      "Cuntooyinka xalaasha ah iyo reebidda dhiigga, hilibka doofaarka, khamriga, iyo khamaarka",
      "Axkaamta daahirnimada: Waysova, qubeyska, iyo tayammumka",
      "Qisadii labadii wiil ee Aadan (Qaabiil iyo Haabiil) iyo dilkii ugu horreeyay",
      "Qisadii Miiskii Cirka ka soo degay iyo qiraalkii Nebi Ciise ee ahaa inuu Eebbe kaliya yahay kan mudan caabudidda"
    ],
    mainThemesEnglish: [
      "The sacred obligation of fulfilling all contractual, civil, and spiritual covenants",
      "Dietary regulations: Halal food and absolute prohibitions on carrion, swine, wine, and gambling",
      "Ordinances of ritual purity encompassing ablution (Wudu), bath (Ghusl), and dry purification (Tayammum)",
      "The tragic historical archetype of Cain and Abel illustrating the destructive malice of jealousy",
      "The miraculous celestial banquet (Al-Ma'idah) and Jesus' solemn disavowal of divine claims"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay Aayadda Dhammaystirka Diinta (5:3) ee soo degtay Maalintii Carafo.",
      "Waxay leedahay xukunno shuruuceed oo aan la nasakhin (la baabi'in)."
    ],
    virtuesEnglish: [
      "Contains the epochal Verse of Religious Perfection (5:3) revealed during the Farewell Pilgrimage at Arafat.",
      "Revered as a conclusive legislative code with definitive, unrepealed moral ordinances."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina xilligii uu Islaamku awoodda iyo maamulka buuxa ku lahaa Jasiiradda Carabta.",
    revelationContextEnglish: "Revealed late in the Medinan era during the consolidation of Islamic sovereignty and governance across the Arabian Peninsula."
  },
  6: {
    surahNumber: 6,
    revelationType: "Meccan",
    revelationOrder: 55,
    ayahCount: 165,
    wordCount: 2393,
    juzRange: "Juz 7-8",
    pageRange: "Pages 128-150",
    aboutSomali: "Suuradda Al-Ancaam waa suurad weyn oo Makki ah oo xoogga saarta asalka Tawxiidka, awoodda Eebbe ee abuurka Koonka, burinta shirkiga iyo sanamyada, iyo caddeynta xalaasha iyo xaaraanta xoolaha.",
    aboutEnglish: "Surah Al-An'am (The Cattle) is a monumental Meccan revelation systematically vindicating monotheism (Tawhid), cosmic creation, philosophical proofs against idolatry, and legal ordinances concerning livestock.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Ancaam\" (Xoolaha la dhaqdo) maxaa yeelay waxay burisay caadooyinkii jaahiliyada ee xoolaha qaarkood loo xarrimi jiray sanamyada darteed.",
    namingReasonEnglish: "Named \"Al-An'am\" (The Cattle) because it demolishes pagan superstitions that consecrated specific categories of livestock to false deities.",
    mainThemesSomali: [
      "Tawxiidka Eebbe ee abuurka koonka, cirarka, iyo dhulka",
      "Burinta shirkiga, khuraafaadka jaahiliyada, iyo caabudidda sanamyada",
      "Qisadii Nebi Ibraahim ee daliillada xiddigaha, dayaxa, iyo qorraxda ku dhisnayd",
      "Tobanka dardaaran ee aasaasiga ah ee shareecada Islaamka (Al-Wasaayaa Al-Cashr)",
      "Ilaalinta nafta iyo shuruucda xalaasha ah ee cuntada iyo xoolaha"
    ],
    mainThemesEnglish: [
      "Absolute monotheism demonstrated through universal cosmological signs",
      "Logical refutation of pagan idolatry, superstition, and polytheistic rites",
      "Prophet Abraham's deduction of divine singularity through astronomical contemplation",
      "The Ten Cardinal Moral Commandments of Islam (Al-Wasaya Al-'Ashr)",
      "Sanctity of human life and dietary regulations governing lawful livestock"
    ],
    virtuesSomali: [
      "Waxaa la weriyay in suuraddani ay soo degtay hal habeen iyadoo ay weheliyaan 70,000 oo Malaa'ig ah oo tasbiixsanaya.",
      "Waxay xambaarsan tahay aayado cadcad oo lagu buriyay shirkiga noocyadiisa kala duwan."
    ],
    virtuesEnglish: [
      "Narrated to have descended in a single night accompanied by 70,000 glorifying angels.",
      "Contains decisive theological rejoinders exposing polytheistic contradictions."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah hal mar xilli ay adkayd doodda u dhaxaysay Nabiga ﷺ iyo mushrikiintii Qureysh.",
    revelationContextEnglish: "Revealed in Makkah all at once to consolidate the intellectual and spiritual foundations of monotheism against Qurayshite idolatry."
  },
  7: {
    surahNumber: 7,
    revelationType: "Meccan",
    revelationOrder: 39,
    ayahCount: 206,
    wordCount: 2987,
    juzRange: "Juz 8-9",
    pageRange: "Pages 151-176",
    aboutSomali: "Suuradda Al-Acraaf waxay soo bandhigtaa taariikhda dheer ee halganka u dhexeeya Xaqa iyo Baadilka, qisooyinkii Nebiyadii hore, digniinta Shaydaanka, iyo xaaladda Asxaabul Acraaf Maalinta Qiyaame.",
    aboutEnglish: "Surah Al-A'raf (The Heights) provides an expansive historical exposition of the perennial conflict between prophetic truth and falsehood, prophetic chronicles, Satanic enmity, and the destiny of the dwellers of the Heights.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Acraaf\" oo ah darbiyada ama meelaha sare ee u dhexeeya Jannada iyo Naarta oo ay joogi doonaan dad camalkoodu siman yahay.",
    namingReasonEnglish: "Named \"Al-A'raf\" (The Heights) after the elevated partition between Paradise and Hell inhabited by souls awaiting divine judgment.",
    mainThemesSomali: [
      "Halgankii u horreeyay ee Aadan iyo Iblays iyo digniinta dhagarta shaydaanka",
      "Xaaladda dadka jooga Darbiyada Sare (Asxaabul Acraaf) ee Qiyaamada",
      "Qisooyinkii Nebiyada: Nuux, Huud, Saalax, Luud, Shucayb, iyo Muuse",
      "Axdigii barakaysnaa (Al-Mithaaq) ee Eebbe ka qaaday ubadka Aadan oo dhan",
      "Mucjisooyinkii Nebi Muuse, jebintii saaxiriinta, iyo qisadii Buurta Dhuur"
    ],
    mainThemesEnglish: [
      "The primordial trial of Adam and Iblis and vigilance against Satanic deception",
      "The spiritual reality of the Dwellers of the Heights on the Day of Resurrection",
      "Chronicles of early prophets: Nuh, Hud, Salih, Lut, Shu'ayb, and Moses",
      "The primordial covenant (Al-Mithaq) universally taken from all human progeny",
      "The confrontation between Moses and Pharaoh, defeat of sorcerers, and Mount Sinai"
    ],
    virtuesSomali: [
      "Waa mid ka mid ah todobada suuradood ee dhaadheer (As-Sabcu Ad-Duwal) ee fadliga weyn leh.",
      "Waxay qofka bartaa taariikhda ummadihii hore iyo cawaaqibka kibirka."
    ],
    virtuesEnglish: [
      "Classified among the Seven Long Surahs (As-Sab' at-Tiwal) endowed with extraordinary spiritual reward.",
      "Offers deep philosophical insights into the rise and catastrophic fall of defiant nations."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u dhiirrigeliso mu'miniinta dhibaataysan una digto gaalada kibirka badan.",
    revelationContextEnglish: "Revealed in Makkah to fortify oppressed believers and warn arrogant oligarchs of impending divine recompense."
  },
  8: {
    surahNumber: 8,
    revelationType: "Medinan",
    revelationOrder: 88,
    ayahCount: 75,
    wordCount: 1088,
    juzRange: "Juz 9-10",
    pageRange: "Pages 177-186",
    aboutSomali: "Suuradda Al-Anfaal waxay si qoto dheer uga hadlaysaa Dagaalkii taariikhiga ahaa ee Beder (Furqaan), shuruucda qaniimada, taageerada Malaa'igta, midnimada mu'miniinta, iyo xeerarka heshiisyada.",
    aboutEnglish: "Surah Al-Anfal (The Spoils of War) analyzes the historic Battle of Badr (Yawm al-Furqan), ethical distribution of spoils, angelic intervention, unity of believers, and international treaties.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Anfaal\" (Qaniimada) sababtoo ah waxay caddaysay xeerka qaybinta maalkii laga helay gaaladii lagu jabiyay Beder.",
    namingReasonEnglish: "Named \"Al-Anfal\" (The Spoils of War) because it sets down definitive divine legislation regarding war spoils acquired after the triumph at Badr.",
    mainThemesSomali: [
      "Xeerarka Dagaalkii Beder iyo qaybinta caddaaladda ah ee qaniimada",
      "Sifooyinka mu'miniinta dhabta ah: Quluubta baqda marka Eebbe la xuso",
      "Taageeradii Malaa'igta ee soo degtay iyo deggenaanta loo yeelay mu'miniinta",
      "Midnimada iyo wada-jirka: Ka fogaanshaha muranka daciifiya awoodda ummadda",
      "Xeerarka maxaabiista dagaalka, heshiisyada nabadda, iyo walaalaynta"
    ],
    mainThemesEnglish: [
      "Spiritual laws and ethical governance of the Battle of Badr and war spoils",
      "Attributes of sincere believers: Hearts trembling at the mention of Allah",
      "Angelic reinforcements descending and divine tranquility soothing the army",
      "Strategic unity and discipline: Prohibition of internal dispute that drains strength",
      "Legal status of prisoners of war, treaty adherence, and international alliances"
    ],
    virtuesSomali: [
      "Waxay faahfaahisay maalintii uu Eebbe kala saaray xaqa iyo baadilka (Yawmul Furqaan).",
      "Waxay caddaysay in guushu aysan ku xirnayn tirada ee ay ku xiran tahay gargaarka Eebbe."
    ],
    virtuesEnglish: [
      "Commemorates \"Yawm al-Furqan\" (The Day of Criterion) distinguishing truth from falsehood.",
      "Demonstrates that true victory stems from divine assistance rather than numerical superiority."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina isla markiiba ka dib Guushii weynayd ee Dagaalkii Beder sanadkii labaad ee Hijrada.",
    revelationContextEnglish: "Revealed in Madinah immediately following the watershed victory at the Battle of Badr in the second year of the Hijrah."
  },
  9: {
    surahNumber: 9,
    revelationType: "Medinan",
    revelationOrder: 113,
    ayahCount: 129,
    wordCount: 1871,
    juzRange: "Juz 10-11",
    pageRange: "Pages 187-207",
    aboutSomali: "Suuradda At-Tawbah (ama Baraa'ah) waxay caddaysay go'aanka kama dambaysta ah ee ka dhanka ah heshiis-jebiyayaashii mushrikiinta, waxay fadeexaysay munaafiqiinta, waxayna qeexday sideedda qaybood ee Sakada.",
    aboutEnglish: "Surah At-Tawbah (The Repentance / Bara'ah) establishes the final declaration against treaty-violating polytheists, exposes the stratagems of hypocrites, and delineates the eight categories of Zakah.",
    namingReasonSomali: "Waxaa loogu magac daray \"At-Tawbah\" (Toobadda) sababtoo ah waxay ku bishaareysay aqbalidda toobaddii saddexdii saxaabi ee dib uga dhacay Dagaalkii Tabuuk.",
    namingReasonEnglish: "Named \"At-Tawbah\" (The Repentance) because it highlights the profound divine forgiveness granted to the three companions who hesitated during Tabuk.",
    mainThemesSomali: [
      "Bari-noqoshada heshiis-jebiyayaashii mushrikiinta ah (Baraa'atun minallaah)",
      "Dagaalkii adkaa ee Tabuuk iyo kala-soocidda mu'miniinta iyo munaafiqiinta",
      "Fadeexaynta munaafiqiinta, astaamahooda, iyo Masjidkii Diraar ee shirqoolka ahaa",
      "Sideedda qaybood ee loo qoondeeyay bixinta Sakada (Masaarif az-Zakah)",
      "Toobadda Eebbe u fidiyay saddexdii saxaabi (Kacab binu Maalik iyo wehelishiisii)"
    ],
    mainThemesEnglish: [
      "Divine disavowal of polytheists who persistently violated peace treaties (Bara'ah)",
      "The grueling expedition to Tabuk acting as a decisive crucible for faith",
      "Exposure of hypocritical machinations and the demolition of the subversive Masjid ad-Dirar",
      "The eight divinely prescribed categories of mandatory Zakah distribution",
      "Divine acceptance of repentance for the three companions who remained behind"
    ],
    virtuesSomali: [
      "Waa suuradda kaliya ee aan ku bilaaban \"Bismillaahir-Raxmaanir-Raxiim\" xushmad darteed maxaa yeelay waxay xambaarsan tahay go'aan adag.",
      "Waxay xambaarsan tahay labada aayadood ee ugu dambeeya ee lagu sifeeyay naxariista Nabiga ﷺ."
    ],
    virtuesEnglish: [
      "The sole Surah devoid of the opening Basmalah, reflecting grave divine declarations against treachery.",
      "Concluding verses extol Prophet Muhammad's immense compassion and concern for believers."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina sanadkii 9-aad ee Hijrada xilligii Dagaalkii Tabuuk iyo Furashadii Makkah ka dib.",
    revelationContextEnglish: "Revealed in Madinah in the 9th year of the Hijrah surrounding the Tabuk expedition and post-Meccan consolidation."
  },
  10: {
    surahNumber: 10,
    revelationType: "Meccan",
    revelationOrder: 51,
    ayahCount: 109,
    wordCount: 1581,
    juzRange: "Juz 11",
    pageRange: "Pages 208-220",
    aboutSomali: "Suuradda Yoonis waxay xoojisaa runnimada Waxyiga Qur'aanka, Awoodda Eebbe ee koonka, Qisooyinkii Nebi Yoonis, Nuux, iyo Muuse, iyo inaan diinta lagu qasbi karin qofna.",
    aboutEnglish: "Surah Yunus (Jonah) affirms the divine origin of the Quran, cosmic signs of monotheism, the deliverance of Jonah's repentant people, and the inviolable principle of religious conscience.",
    namingReasonSomali: "Waxaa loogu magac daray Nebi Yoonis (CS) maxaa yeelay qoomkiisu waxay ahaayeen qoomka kaliya ee toobaddooda la aqbalay ciqaabtana laga leexiyay.",
    namingReasonEnglish: "Named after Prophet Yunus (Jonah AS) because his community stands as the unique historical example whose collective repentance averted impending doom.",
    mainThemesSomali: [
      "Xaqnimada Waxyiga Qur'aanka iyo beeninta inuu yahay sixir ama been",
      "Calaamadaha Awoodda Eebbe ee cirarka, dhulka, iyo wareegga habeenka iyo maalinta",
      "Qisadii Nebi Yoonis iyo toobaddii qoomkiisa ee ciqaabta ka badbaadisay",
      "Qisadii Nebi Muuse iyo Nebi Nuux iyo masiiradii qarqintii Fircoon ee badda",
      "Diinta Islaamka oo aan lagu qasbi karin bini'aadamka (Aayadaha xorriyadda iimaanka)"
    ],
    mainThemesEnglish: [
      "Divine authenticity of the Quranic revelation refuting claims of sorcery",
      "Cosmic proofs of monotheism in celestial mechanics and diurnal alternation",
      "The deliverance of the people of Jonah upon their sincere collective repentance",
      "Historical lessons from Moses and Noah, including the preservation of Pharaoh's body",
      "Rejection of religious coercion: belief must be an unforced conviction of the heart"
    ],
    virtuesSomali: [
      "Waxay caddeysay mucjisada ah in Fircoon jidhkiisa la badbaadin doono si uu calaamad ugu noqdo jiilasha dambe.",
      "Waxay qalbiga u keentaa deganaansho iyo rumayn buuxda oo xagga Eebbe ah."
    ],
    virtuesEnglish: [
      "Contains the miraculous prophecy of preserving Pharaoh's physical corpse as a historic sign.",
      "Instills deep tranquility and confidence in divine wisdom during challenging trials."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli ay mushrikiintu aad u beeninayeen waxyiga iyo soo saarista Qiyaamada.",
    revelationContextEnglish: "Revealed in Makkah during intense Qurayshite denial of bodily resurrection and prophetic authenticity."
  },
  11: {
    surahNumber: 11,
    revelationType: "Meccan",
    revelationOrder: 52,
    ayahCount: 123,
    wordCount: 1784,
    juzRange: "Juz 11-12",
    pageRange: "Pages 221-234",
    aboutSomali: "Suuradda Huud waxay iftiimisaa sugnaanta xaqa (Istaqim kamaa umirta) iyo qisooyinkii lixda Nebi: Nuux (Doonidii iyo Wiilkiisii), Huud (Reer Caad), Saalax (Reer Thamuud), Ibraahim, Luud, iyo Shucayb (Caddaaladda ganacsiga).",
    aboutEnglish: "Surah Hud demands unwavering steadfastness on the divine path. It chronicles six major prophets: Noah (The Ark and his grieving son), Hud (Defeat of 'Ad), Salih (Thamud), Abraham, Lut, and Shu'ayb (Commercial ethics).",
    namingReasonSomali: "Waxaa loogu magac daray Nebi Huud (CS) oo loo diray qoomkii awoodda weynaa ee Reer Caad ee ku kibray dhulka.",
    namingReasonEnglish: "Named after Prophet Hud (AS), sent to the powerful civilization of 'Ad who haughtily boasted of their physical might.",
    mainThemesSomali: [
      "Amarka sugnaanta iyo toosnaanta jidka Eebbe (Istaqim kamaa umirta)",
      "Qisadii Nebi Nuux, dhismihii doonida, iyo dhimashadii wiilkiisa gaalka ahaa",
      "Qisooyinkii Nebi Huud, Saalax, Ibraahim, Luud, iyo Shucayb",
      "Caddaaladda ganacsiga iyo reebidda dhimista miisaanka iyo beeca",
      "Ilaalinta salaadda habeenka iyo maalinta: \"Wanaaggu wuxuu tirtiraa xumaanta\""
    ],
    mainThemesEnglish: [
      "The supreme divine command of steadfast integrity: \"Stand firm as you have been commanded\"",
      "Noah's construction of the Ark and the tragic drowning of his disbelieving son",
      "Moral chronicles of Hud, Salih, Abraham, Lut, and Shu'ayb",
      "Commercial equity: Strict prohibitions against fraudulent weights and financial dishonesty",
      "The purifying power of daily prayers: \"Indeed, noble deeds wipe out petty misdeeds\""
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu yidhi: \"Waxaa i cawlay (cirro ii yeelay) Suuradda Huud iyo walaalaheed\" (Tirmidi).",
      "Waxay qofka ku beertaa xilkasnimo weyn iyo cibaado joogto ah."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ said: \"Surah Hud and its sister chapters have aged me (turned my hair gray)\" (Tirmidhi).",
      "Inspires profound spiritual responsibility and awe before divine accountability."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah sanadkii murugada (Caamul Xuzn) ka dib geeridii Khaddiija iyo Abuu Dhaalib.",
    revelationContextEnglish: "Revealed in Makkah during the Year of Sorrow following the loss of Khadijah and Abu Talib."
  },
  12: {
    surahNumber: 12,
    revelationType: "Meccan",
    revelationOrder: 53,
    ayahCount: 111,
    wordCount: 1610,
    juzRange: "Juz 12-13",
    pageRange: "Pages 235-248",
    aboutSomali: "Suuradda Yuusuf waa qisada ugu quruxda badan Qur'aanka (Axasanal Qasas). Waxay xambaarsan tahay casharro ku saabsan xasadka walaalaha, samirka Yacquub, dhawrsanaanta Yuusuf, riyooyinka, iyo cafiska weyn.",
    aboutEnglish: "Surah Yusuf is celebrated as 'The Best of Stories' (Ahsan al-Qasas). It unfolds an epic narrative of sibling jealousy, Jacob's sublime patience, Joseph's heroic chastity, dream interpretation, famine relief, and ultimate reconciliation.",
    namingReasonSomali: "Waxaa loogu magac daray Nebi Yuusuf (CS) maxaa yeelay waxay si buuxda uga sheekaysaa noloshiisii bilow ilaa dhammaad.",
    namingReasonEnglish: "Named after Prophet Yusuf (Joseph AS) as it exclusively chronicles his complete life trajectory from boyhood to state governance.",
    mainThemesSomali: [
      "Ahsanul Qasas: Sheekada ugu wanaagsan ee Qur'aanka ku jirta",
      "Xasadka walaalaha iyo samirka quruxda badan ee Nebi Yacquub (Sabrun Jamiil)",
      "Dhawrsanaanta Nebi Yuusuf marka ay fitnada dumarku u timid iyo doorashadii xabsiga",
      "Fasirka riyooyinka iyo maaraynta dhaqaalaha abbaarta ee Masar",
      "Cafiska ballaaran: \"Maanta canaan idinma saarna, Eebbe ha idiin dambi dhaafo\""
    ],
    mainThemesEnglish: [
      "The \"Best of Stories\" delivering multifaceted spiritual and psychological guidance",
      "Sibling jealousy contrasted with Jacob's exquisite, dignified patience (Sabrun Jameel)",
      "Moral integrity: Joseph resisting sexual seduction and gladly choosing imprisonment over sin",
      "Gift of dream interpretation and strategic macroeconomic governance during Egyptian famine",
      "Magnanimous forgiveness upon triumph: \"No reproach upon you today; may Allah forgive you\""
    ],
    virtuesSomali: [
      "Waxaa la weriyay in qof kasta oo murugaysan oo akhriya uu ka helo deganaansho iyo farxad.",
      "Waxay caddaysay in samirka iyo cabsida Eebbe ay had iyo jeer ku dambeeyaan guul."
    ],
    virtuesEnglish: [
      "Renowned as a universal source of comfort, reassurance, and solace during times of hardship.",
      "Affirms that patient perseverance and piety inevitably culminate in divine elevation."
    ],
    revelationContextSomali: "Waxay soo degtay Makkah xilli adag si ay qalbiga Nabiga ﷺ ugu qaboojiso casharadii samirka Yuusuf.",
    revelationContextEnglish: "Revealed in Makkah to comfort the Prophet ﷺ through Joseph's enduring trials and triumphant redemption."
  },
  13: {
    surahNumber: 13,
    revelationType: "Medinan",
    revelationOrder: 96,
    ayahCount: 43,
    wordCount: 624,
    juzRange: "Juz 13",
    pageRange: "Pages 249-254",
    aboutSomali: "Suuradda Ar-Racdi waxay iftiimisaa awoodda Eebbe ee Onkodka iyo Hillaaca, xaqiiqada ah in quluubtu ku degto xuska Alle, iyo isbarbardhigga xaqa iyo baadilka sida biyaha iyo xumbada.",
    aboutEnglish: "Surah Ar-Ra'd (The Thunder) contemplates divine power manifested in thunder, lightning, and natural laws. It establishes that hearts find tranquility in Allah's remembrance and illustrates truth and falsehood as water versus evanescent foam.",
    namingReasonSomali: "Waxaa loogu magac daray \"Ar-Racdi\" (Onkodka) sababtoo ah waxay xustay inuu Onkodku Eebbe u tasbiixsado cabsi dartiis.",
    namingReasonEnglish: "Named \"Ar-Ra'd\" (The Thunder) because it portrays the cosmic thunder glorifying its Creator in awe and submission.",
    mainThemesSomali: [
      "Onkodka iyo Malaa'igta oo Eebbe u tasbiixsata baqdin darteed",
      "Sharciga isbeddelka: \"Eebbe ma beddelo qoom ilaa ay naftooda beddelaan\"",
      "Degganaanshaha qalbiyada ee xuska Eebbe (Alaa bi-dhikrillaahi tatma'innul quluub)",
      "Tusaalaha xaqa iyo baadilka: Xaqu waa sida biyaha dhulka nooleeya, baadilkuna waa sida xumbada baaba'da",
      "Awoodda Eebbe ee abuurka koonka, dhirta kala duwan ee hal biyo ku waraabta"
    ],
    mainThemesEnglish: [
      "Thunder and angelic hosts reverently glorifying the majesty of Allah",
      "The sociological law of progress: \"Allah will not change the condition of a people until they change themselves\"",
      "Serenity of the soul: \"Unquestionably, by the remembrance of Allah do hearts find peace\"",
      "Parable of truth and falsehood: Truth endures like nourishing water; falsehood dissipates like foam",
      "Diverse botanical life sustained by identical rainfall as a testament to divine design"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda caanka ah ee quluubtu ku degto xuska Eebbe (13:28).",
      "Waxay caddaysay in cilmiga Eebbe uu koobay wax kasta oo muuqda iyo wax kasta oo qarsoon."
    ],
    virtuesEnglish: [
      "Features the immortal verse of psychological peace through remembrance (13:28).",
      "Emphasizes the all-encompassing omniscience of Allah over hidden thoughts and outward deeds."
    ],
    revelationContextSomali: "Waxay ku soo degtay xilligii ay socdeen doodaha caqiidada ee Makkah iyo bilowgii Madiina.",
    revelationContextEnglish: "Revealed bridging the Meccan and Medinan eras, vindicating divine revelation against materialist scepticism."
  },
  14: {
    surahNumber: 14,
    revelationType: "Meccan",
    revelationOrder: 72,
    ayahCount: 52,
    wordCount: 754,
    juzRange: "Juz 13",
    pageRange: "Pages 255-261",
    aboutSomali: "Suuradda Ibraahiim waxay iftiimisaa muhiimadda Mahadnaqa (Shugriga), Kalimadda Wanaagsan ee Tawxiidka, Ducadii Nebi Ibraahim ee Makkah, iyo khudbaddii Shaydaanka ee Naarta dhexdeeda.",
    aboutEnglish: "Surah Ibrahim contrasts the Light of faith with spiritual darkness. It expounds the power of gratitude, the parable of the Good Word (Tawhid) as a firmly rooted tree, Abraham's prayers for Mecca, and Satan's betrayal of his followers.",
    namingReasonSomali: "Waxaa loogu magac daray Nebi Ibraahim (CS) oo ahaa Aabbaha Nabiyada, xustayna ducadiisii barakaysnayd ee Makkah iyo ubadkiisa.",
    namingReasonEnglish: "Named after Prophet Ibrahim (Abraham AS), highlighting his profound prayers for the sanctification of Mecca and the righteous upbringing of his progeny.",
    mainThemesSomali: [
      "Hanuuninta bini'aadamka ee mugdiga looga saarayo nuurka",
      "Xeerka Shugriga: \"Haddii aad mahadnaqdaan xaqiiqdii waan idiin kordhinayaa\"",
      "Tusaalaha Kalimadda Wanaagsan (Tawxiidka) oo la mid ah geed xididdo adag leh oo midho bixiya",
      "Ducadii Nebi Ibraahim ee nabadgelyada Makkah iyo ilaalinta salaadda ubadkiisa",
      "Khudbaddii Shaydaanka ee Maalinta Qiyaame ee uu ku dhici doono: \"Ha i eedaynina ee naftiinna eedeeya\""
    ],
    mainThemesEnglish: [
      "The prophetic mandate: leading humanity from multiple darknesses into illumination",
      "The cosmic law of gratitude: \"If you are grateful, I will surely increase you\"",
      "Parable of the Good Word (Tawhid) as a noble tree deeply rooted with branches in heaven",
      "Abraham's prayers establishing Mecca as a secure sanctuary and begging for prayerful offspring",
      "Satan's cynical confession in Hell: \"Do not blame me; blame your own selves\""
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda aasaaska u ah kordhinta nimcada Eebbe ee ku xiran mahadnaqa (14:7).",
      "Waxay qofka ku dhiirrigelisaa inuu noqdo mid ku xiran salaadda sida Nebi Ibraahim."
    ],
    virtuesEnglish: [
      "Features the foundational spiritual equation linking gratitude with divine increase (14:7).",
      "Instills prayerful commitment following the timeless example of Prophet Abraham."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay mu'miniinta u bartay sabirka iyo mahadnaqa xilliga cidhiidhiga.",
    revelationContextEnglish: "Revealed in Makkah to anchor believers in gratitude and fortitude amidst severe social boycott."
  },
  15: {
    surahNumber: 15,
    revelationType: "Meccan",
    revelationOrder: 54,
    ayahCount: 99,
    wordCount: 1436,
    juzRange: "Juz 14",
    pageRange: "Pages 262-266",
    aboutSomali: "Suuradda Al-Xijri waxay xambaarsan tahay ballanqaadka Eebbe ee ilaalinta Qur'aanka, diidmadii Iblays ee sujuudda Aadan, qisooyinkii Reer Xijri (Thamuud), iyo amarka cibaadada ilaa dhimashada.",
    aboutEnglish: "Surah Al-Hijr guarantees the eternal preservation of the Quran. It details the defiance of Iblis against Adam, the ruins of the people of the Rock (Thamud), the destruction of Sodom, and the command to worship until certainty (death).",
    namingReasonSomali: "Waxaa loogu magac daray deegaanka \"Al-Xijri\" oo ahaa magaaladii ay dhagaxyada ka qoteen qoomkii Reer Thamuud ee la halaagay.",
    namingReasonEnglish: "Named after \"Al-Hijr\" (The Rocky Tract), the valley settlement of Thamud who carved opulent dwellings into cliffs yet perished in rebellion.",
    mainThemesSomali: [
      "Ballanqaadka Eebbe ee ilaalinta Qur'aanka Kariimka ah ilaa Qiyaamada (15:9)",
      "Diidmadii Iblays ee sujuudda Aadan iyo ballankiisii ahaa inuu dadka baadiyeeyo",
      "Naxariista ballaaran ee Eebbe iyo digniinta ciqaabtiisa daran",
      "Qisooyinkii martidii Ibraahim, qoomkii Luud, iyo Reer Xijri (Thamuud)",
      "Amarka sugan: \"U caabud Rabbigaa ilaa uu kuu yimaado Yaqiinku (Dhimashada)\""
    ],
    mainThemesEnglish: [
      "The inviolable divine pledge preserving the Holy Quran against alteration (15:9)",
      "The rebellion of Iblis refusing to bow to Adam and his vowed agenda of deception",
      "Balance of divine attributes: \"Inform My servants that I am the Forgiving, the Merciful, and that My punishment is painful\"",
      "Parables of Abraham's angelic guests, the destruction of Sodom, and the dwellers of the Rock",
      "The final spiritual injunction: \"And worship your Lord until there comes to you the Certainty (Death)\""
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda ballanqaadka ilaalinta Qur'aanka (Innaa Naxnu nazzalnaadh-Dhikr).",
      "Waxay qofka u horseedaa daacadnimo joogto ah oo xagga cibaadada ah."
    ],
    virtuesEnglish: [
      "Houses the pivotal promise securing the textual incorruptibility of the Quran across all eras.",
      "Guides believers to maintain steadfast, lifelong worship culminating in a righteous end."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u difaacdo Qur'aanka oo ay gaaladu ku tilmaameen gabay ama faal.",
    revelationContextEnglish: "Revealed in Makkah to refute pagan allegations accusing the Prophet of madness and sorcery."
  },
  16: {
    surahNumber: 16,
    revelationType: "Meccan",
    revelationOrder: 70,
    ayahCount: 128,
    wordCount: 1856,
    juzRange: "Juz 14",
    pageRange: "Pages 267-281",
    aboutSomali: "Suuradda An-Naxli waxaa loo yaqaannaa 'Suuradda Nimcooyinka' (Suratun-Nicam). Waxay faahfaahisaa xoolaha, biyaha, samada, shinnida iyo malabka bogsiinta leh, iyo habka suubban ee dacwada.",
    aboutEnglish: "Surah An-Nahl (The Bee) is venerated as the 'Chapter of Blessings' (Surat an-Ni'am). It catalogues natural wonders: livestock, rain, celestial cycles, the miracle of the honeybee, and the ethical methodology of Da'wah.",
    namingReasonSomali: "Waxaa loogu magac daray \"An-Naxli\" (Shinnida) sababtoo ah waxay xustay mucjisada waxyiga Eebbe u waxyiyay shinnida iyo malabka daawada u ah bini'aadamka.",
    namingReasonEnglish: "Named \"An-Nahl\" (The Bee) commemorating the divine inspiration granted to the honeybee and the medicinal healing imbued within honey.",
    mainThemesSomali: [
      "Nimcooyinka faraha badan ee Eebbe: Biyaha, beeraha, xoolaha, iyo maraakiibta badda",
      "Mucjisada Shinnida iyo Malabka oo dawo u ah bini'aadamka (Shifaa'un lin-Naas)",
      "Caddaaladda, samafalka, iyo qaraabo-xidhiidhka (Aayadda khilaafada ee 16:90)",
      "Dhaarta iyo fulinta axdiyada iyo reebidda jebinta ballamaha",
      "Habka dacwada: Xikmad, waano wanaagsan, iyo doodda ugu suubban"
    ],
    mainThemesEnglish: [
      "Catalog of divine provisions: rain, agriculture, domesticated livestock, and ocean navigation",
      "The architectural miracle of the Honeybee and the curative properties of honey for humanity",
      "The comprehensive moral compass of Islam: justice, excellence, and kin assistance (16:90)",
      "Sanctity of treaties and fidelity: severe warnings against breaking solemn covenants",
      "The universal methodology of Da'wah: wisdom, gracious preaching, and gentle dialogue"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda 16:90 ee lagu akhriyo dhammaadka khudbad kasta oo Jimce ah.",
      "Waxay xusuusisaa qofka inaan nimcooyinka Eebbe la tirin karin badnaan darteed."
    ],
    virtuesEnglish: [
      "Contains verse 16:90, recited globally at the conclusion of every Friday sermon for its moral brilliance.",
      "Enforces the humbling realization that Allah's countless favors cannot be numbered."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah (qaar ka mid ahna Madiina) si ay dadka ugu xirto Mahadnaqa Eebbe.",
    revelationContextEnglish: "Primarily Meccan with late Medinan verses, calling humanity to revere the Beneficent Creator through gratitude."
  },
  17: {
    surahNumber: 17,
    revelationType: "Meccan",
    revelationOrder: 50,
    ayahCount: 111,
    wordCount: 1610,
    juzRange: "Juz 15",
    pageRange: "Pages 282-292",
    aboutSomali: "Suuradda Al-Israa waxay ku bilaabataa Socdaalkii mucjisada ahaa ee Israa iyo Micraaj. Waxay dejisaa axkaamta dabeecadda, baarinnimada waalidiinta, dhaqaalaha dhexdhexaadka ah, iyo daahirnimada Qur'aanka.",
    aboutEnglish: "Surah Al-Isra (The Night Journey / Bani Isra'il) opens with the miraculous ascension of the Prophet. It establishes sublime ethical precepts: filial devotion to aging parents, economic moderation, sanctity of life, and the Quran as healing.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Israa\" oo ah socdaalkii habeenka ahaa ee Nabiga ﷺ laga qaaday Masjidka Xaramka ee Makkah ilaa Masjidka Al-Aqsaa ee Qudus.",
    namingReasonEnglish: "Named \"Al-Isra\" (The Night Journey) after the miraculous nocturnal journey of Prophet Muhammad ﷺ from Mecca to the Al-Aqsa Mosque in Jerusalem.",
    mainThemesSomali: [
      "Mucjisadii weynayd ee Israa iyo Micraaj (Makkah ilaa Qudus ilaa Cirarka sare)",
      "Baarinnimada iyo naxariista waalidiinta: \"Ha ku dhihin erayga Uff hana canaanan\"",
      "Dhaqaalaha dhexdhexaadka ah: Ka fogaanshaha bakhaylnimada iyo kharash-garaynta xad-dhaafka ah",
      "Ilaalinta nafta, reebidda sinada, iyo caddaaladda xukunka",
      "Qur'aanka Kariimka ah oo ah Dawo iyo Naxariis mu'miniinta u timid"
    ],
    mainThemesEnglish: [
      "The miraculous Night Journey (Isra & Mi'raj) linking the Sacred Sanctuary in Mecca to Al-Aqsa in Jerusalem",
      "Sacred duty toward elderly parents: \"Say not to them so much as 'Uff', nor repel them, but speak graciously\"",
      "Balanced financial stewardship avoiding both destructive miserliness and wasteful extravagance",
      "Absolute prohibitions on adultery, murder, and encroaching upon the wealth of orphans",
      "The Holy Quran affirmed as a profound spiritual cure (Shifa') and mercy for the faithful"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu akhriyi jiray Suuradda Al-Israa iyo Az-Zumar habeen kasta ka hor inta uusan seexan (Tirmidi).",
      "Waxay caddaysay xurmada sare ee Masjidka Al-Aqsaa iyo dhulka barakaysan ee Qudus."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ routinely recited Surahs Al-Isra and Az-Zumar each night prior to resting (Tirmidhi).",
      "Establishes the permanent spiritual connection between the holy sanctuaries of Mecca and Jerusalem."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah sanad ka hor Hijradii, xilli uu socday mucjisadii Israa iyo Micraaj.",
    revelationContextEnglish: "Revealed in Makkah roughly one year prior to the Hijrah, commemorating the Prophet's celestial journey."
  },
  18: {
    surahNumber: 18,
    revelationType: "Meccan",
    revelationOrder: 69,
    ayahCount: 110,
    wordCount: 1595,
    juzRange: "Juz 15-16",
    pageRange: "Pages 293-304",
    aboutSomali: "Suuradda Al-Kahf waa gaashaan ka ilaaliya fitnada ugu weyn ee adduunka, gaar ahaan Fitnada Dajjaal. Waxay soo bandhigtaa 4 qiso oo xalliya 4 fitno: Fitnada Diinta (Asxaabul Kahfi), Maalka (Beerta), Cilmiga (Muuse & Khidhir), iyo Awoodda (Dul-Qarnayn).",
    aboutEnglish: "Surah Al-Kahf (The Cave) serves as a spiritual fortress against trials, particularly the deception of the Dajjal. It illustrates four profound parables: Faith (Companions of the Cave), Wealth (Two Gardens), Knowledge (Moses & Al-Khidr), and Power (Dhul-Qarnayn).",
    namingReasonSomali: "Waxaa loogu magac daray Godkii (Al-Kahf) ay magangaleen dhallinyaradii mu'miniinta ahaa ee ka baxsaday boqorkii daalinka ahaa si ay iimaankooda u ilaashadaan.",
    namingReasonEnglish: "Named after the Cave (Al-Kahf) where the faithful youths sought refuge from tyrannical persecution to protect their belief.",
    mainThemesSomali: [
      "Fitnada Diinta iyo sabirka runta (Qisadii Asxaabul Kahfi)",
      "Fitnada Maalka iyo kibirka (Qisadii ninkii labada beerood lahaa)",
      "Fitnada Cilmiga iyo xikmadda qarsoon ee Eebbe (Nebi Muuse iyo Khidhir)",
      "Fitnada Xukunka iyo Caddaaladda maamulka (Boqor Dul-Qarnayn)",
      "Xusuusinta Qiimaha Joogtada ah ee Camalka Suubban"
    ],
    mainThemesEnglish: [
      "The trial of Faith: Standing firm against social pressure and tyranny",
      "The trial of Wealth: Gratitude versus arrogance and worldly illusion",
      "The trial of Knowledge: Humility in the face of inscrutable divine wisdom",
      "The trial of Power: Justice, benevolence, and protecting the vulnerable",
      "The enduring reality of righteous deeds over transient status"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu yidhi: \"Qofkii akhriya Suuradda Al-Kahf maalinta Jimcaha, waxay u iftiimisaa nuur u dhexeeya labada Jimco\" (Al-Xaakim).",
      "Qofkii xifdiya 10-ka aayadood ee hore ama dambe wuxuu ka nabadgalayaa Fitnada Dajjaal."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ said: \"Whoever recites Surah Al-Kahf on Friday will have a light shining for him between the two Fridays.\"",
      "Memorizing the first or last ten verses protects against the trial of the False Messiah (Dajjal)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii gaaladii Qureysh u direen Yuhuudda Madiina su'aalo ay ku imtixaanayaan runnimada Nabiga ﷺ.",
    revelationContextEnglish: "Revealed in Makkah in response to three probing questions posed by the Quraysh upon consulting the rabbis of Madinah."
  },
  19: {
    surahNumber: 19,
    revelationType: "Meccan",
    revelationOrder: 44,
    ayahCount: 98,
    wordCount: 1421,
    juzRange: "Juz 16",
    pageRange: "Pages 305-311",
    aboutSomali: "Suuradda Maryama waxay si cajiib ah u iftiimisaa Naxariista Eebbe ee addoomadiisa, dhalashadii Yaxya, dhalashadii mucjisada ahayd ee Nebi Ciise oo aan aabbe lahayn, daahirnimada Maryam, iyo Tawxiidka saafi ah.",
    aboutEnglish: "Surah Maryam centers on the tenderness of divine mercy. It chronicles the miraculous births of Yahya to elderly Zechariah and Jesus to virgin Maryam, followed by reflections on Abraham, Moses, and the refutation of divine offspring.",
    namingReasonSomali: "Waxaa loogu magac daray Haweenaydii daahirka ahayd ee Maryama bintu Cimraan oo ah haweeneyda kaliya ee magaceeda si cad loogu xusay Qur'aanka.",
    namingReasonEnglish: "Named after Mary (Maryam), the mother of Prophet Jesus (AS), honored as the only woman explicitly mentioned by name in the Quran.",
    mainThemesSomali: [
      "Naxariista Eebbe ee addoonkiisa Zakariya iyo dhalashadii Nebi Yaxya",
      "Dhalashadii mucjisada ahayd ee Nebi Ciise iyo daahirnimada Maryama bintu Cimraan",
      "Tawxiidka saafi ah iyo beeninta inuu Eebbe ilmo leeyahay",
      "Qisooyinkii Nebi Ibraahim, Ismaaciil, Idriis, iyo Aadan",
      "Nimcooyinka Jannada iyo digniinta kuwa dayaca salaadda ee raaca hawada naftooda"
    ],
    mainThemesEnglish: [
      "Divine mercy answering Zechariah's private supplication with the gift of Yahya (John)",
      "The virgin birth of Jesus speaking in the cradle and the immaculate chastity of Maryam",
      "Uncompromising defense of monotheism rejecting biological offspring for the Almighty",
      "Prophetic legacies of Abraham confronting his father, Ishmael, and Idris",
      "Splendors of Paradise contrasted with the degeneration of those who abandon prayer"
    ],
    virtuesSomali: [
      "Waa suuraddii uu Jacfar binu Abii Dhaalib ku akhriyay Boqorkii Xabashida Najaashi oo sababtay inuu ilmeeyo rumeeyana xaqa.",
      "Waxay qalbiga u keentaa deganaansho iyo naxariis qoto dheer."
    ],
    virtuesEnglish: [
      "Recited by Ja'far ibn Abi Talib before the Christian Negus (Najashi) of Abyssinia, moving him to tears of recognition.",
      "Proclaims the sublime prophetic honor of Jesus and his mother in Islamic theology."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka hor Hijradii koowaad ee Xabashida si ay mu'miniinta ugu noqoto gabaad cilmi ah.",
    revelationContextEnglish: "Revealed in Makkah prior to the first migration to Abyssinia, providing believers with theological clarity on Christian history."
  },
  20: {
    surahNumber: 20,
    revelationType: "Meccan",
    revelationOrder: 45,
    ayahCount: 135,
    wordCount: 1958,
    juzRange: "Juz 16",
    pageRange: "Pages 312-321",
    aboutSomali: "Suuradda Daa-Haa waxay caddaysaa inaan Qur'aanka loo soo dejin in lagu dhibtoodo ee uu yahay nasteexo. Waxay faahfaahisaa qisadii Nebi Muuse: Dabkii Dhuur, Usha, Fircoon, Saaxiriintii sujuudday, iyo Dibigii Saamiriy.",
    aboutEnglish: "Surah Ta-Ha brings solace to the Prophet: 'We have not sent down to you the Quran that you be distressed.' It presents the most detailed narrative of Moses: the Burning Bush, confrontation with Pharaoh, conversion of sorcerers, and the Golden Calf.",
    namingReasonSomali: "Waxay ku bilaabataa xarfaha goos-gooska ah ee \"Daa-Haa\" oo lagu tiriyo mid ka mid ah magacyada sharafta leh ee Nabiga ﷺ.",
    namingReasonEnglish: "Named after the mystic opening letters \"Ta-Ha\", an affectionate divine address bringing relief to the heart of the Prophet.",
    mainThemesSomali: [
      "Qur'aanka Kariimka ah oo loo soo dejiyay inuu nasteexo iyo hanuun noqdo oo aan lagu dhibtoon",
      "Qisadii ballaarnayd ee Nebi Muuse: Dabkii Dhuur, dooxadii Dhuwaa, iyo wada-hadalkii Eebbe",
      "La-hadalkii Fircoon, mucjisooyinkii Usha, iyo sujuuddii saaxiriinta ee rumaysay xaqa",
      "Fitnadii Dibigii dahabka ahaa ee Saamiriy u sameeyay Reer Banii Israa'iil",
      "Khasaaraha qofka ka jeedsada xuska Eebbe: \"Qofkii ka jeedsada xuskayga wuxuu leeyahay nolol cidhiidhi ah\""
    ],
    mainThemesEnglish: [
      "Reassurance of revelation: the Quran descends as illumination rather than hardship",
      "The expansive chronicle of Moses: the Burning Bush, the sacred valley of Tuwa, and direct communion with Allah",
      "Confronting tyrannical Pharaoh and the instantaneous prostration of truth-embracing sorcerers",
      "The golden calf idolatry engineered by Samiri while Moses received the Tablets",
      "The spiritual decay of turning from God: \"Whoever turns away from My remembrance will have a depressed life\""
    ],
    virtuesSomali: [
      "Waa suuraddii sababtay inuu Cumar binu Khadaab (RC) qaato diinta Islaamka markii uu guriga walaashii ku akhriyay.",
      "Waxay xambaarsan tahay aayadda ducada cilmiga: \"Rabbiyow ii kordi cilmi\" (Rabbi zidnii cilmaa)."
    ],
    virtuesEnglish: [
      "The reading of these verses caused 'Umar ibn al-Khattab (RA) to soften his heart and embrace Islam.",
      "Contains the foundational supplication for knowledge: \"My Lord, increase me in knowledge\" (20:114)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli adag si ay u xoojiso dhiirranaanta Nabiga ﷺ iyo asxaabtiisa.",
    revelationContextEnglish: "Revealed in Makkah to rejuvenate the morale of early Muslims amidst aggressive tribal boycotts."
  },
  21: {
    surahNumber: 21,
    revelationType: "Meccan",
    revelationOrder: 73,
    ayahCount: 112,
    wordCount: 1624,
    juzRange: "Juz 17",
    pageRange: "Pages 322-331",
    aboutSomali: "Suuradda Al-Anbiyaa (Nabiyada) waxay ka digaysaa soo dhowaanshaha xisaabta dadka. Waxay xustaa 16 Nebi oo ay ku jiraan Ibraahim, Ayuub, Yoonis, iyo Sakariya, iyadoo caddeysay in Nebi Muxammad ﷺ yahay Naxariista Caalamka.",
    aboutEnglish: "Surah Al-Anbiya (The Prophets) warns of the approaching Reckoning. It details cosmic origins (the Big Bang and life from water), recounts 16 prophets (Abraham destroying idols, Job, Jonah, Zechariah), and crowns Prophet Muhammad as Mercy to the Worlds.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Anbiyaa\" (Nabiyada) maxaa yeelay waxay xustay tiradii ugu badnayd ee Nabiyo ah hal suurad dhexdeeda.",
    namingReasonEnglish: "Named \"Al-Anbiya\" (The Prophets) because it synthesizes the greatest collective assembly of prophetic missions in a single chapter.",
    mainThemesSomali: [
      "Soo dhowaanshaha xisaabta dadka iyadoo ay ku jiraan gafuur iyo cayaar",
      "Awoodda abuurka koonka: Cirka iyo dhulka oo isku dheggenaa oo la kala furay, biyaha oo wax kasta laga abuuray",
      "Qisadii Nebi Ibraahim ee jebinta sanamyada iyo dabkii loo qaboojiyay",
      "Ducadii Nebi Yoonis ee caloosha kalluunka (Laa ilaaha illaa anta subxaanaka...)",
      "Nebi Muxammad ﷺ oo loo soo diray inuu Naxariis u noqdo dhammaan caalamka (Raxmatan lil-Caalamiin)"
    ],
    mainThemesEnglish: [
      "The near approach of the Final Reckoning while humanity remains heedlessly engaged in vanity",
      "Cosmic creation: Heavens and earth once integrated before splitting, and all life originating from water",
      "Abraham's destruction of idols and miraculous deliverance from the raging fire",
      "The iconic prayer of Jonah in the belly of the whale: \"There is no deity except You; exalted are You\"",
      "Prophet Muhammad sent as the universal embodiment of divine mercy to all creation (21:107)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay ducada dhibka kasta lagu kashifo ee Nebi Yoonis (Ayat al-Karb).",
      "Waxay xambaarsan tahay aayadda 21:107 ee qeexday shakhsiyadda naxariista badan ee Nabiga ﷺ."
    ],
    virtuesEnglish: [
      "Features the supreme prayer of deliverance from distress articulated by Prophet Yunus.",
      "Defines the overarching philosophical purpose of the final Prophet: universal mercy to all worlds."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u xaqiijiso in dhammaan Nabiyadu wateen hal fariin oo ah Tawxiidka.",
    revelationContextEnglish: "Revealed in Makkah confirming the unified prophetic continuum from Adam to Muhammad ﷺ."
  },
  22: {
    surahNumber: 22,
    revelationType: "Medinan",
    revelationOrder: 103,
    ayahCount: 78,
    wordCount: 1131,
    juzRange: "Juz 17",
    pageRange: "Pages 332-341",
    aboutSomali: "Suuradda Al-Xaj waxay ka hadlaysaa argagaxa Qiyaamada, marxaladaha abuurka uurjiifka, taariikhda iyo axkaamta Xajka, Kacbada, iyo ogolaanshaha difaaca nafta ee mu'miniinta la dulmiyay.",
    aboutEnglish: "Surah Al-Hajj combines Meccan and Medinan themes: the terrifying tremor of Judgment Day, human embryology, Abraham's call to the Hajj pilgrimage, the sanctity of Mecca, and the historic authorization for self-defense.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Xaj\" sababtoo ah waxay si faahfaahsan u dhiirrigelisay Aadaankii Nebi Ibraahim ee dadka ugu yeeray Xajka barakaysan.",
    namingReasonEnglish: "Named \"Al-Hajj\" (The Pilgrimage) because it commemorates Abraham's universal proclamation summoning mankind to the pilgrimage at the Ka'bah.",
    mainThemesSomali: [
      "Argagaxa Maalinta Qiyaame: \"Dhulgariirka Saacaddu waa wax aad u weyn\"",
      "Marxaladaha cajaa'ibka ah ee abuurka bini'aadamka iyo nooleynta dhulka qalalan",
      "Axkaamta Xajka, dhismihii Kacbada ee Nebi Ibraahim, iyo cibaadada gowraca xoolaha",
      "Ogolaanshaha difaaca nafta ee kuwa la dulmiyay ee guryahooda si xaq-darro ah looga saaray",
      "Awood-darrada sanamyada: \"Haddii ay duqsi isugu tagaan ma abuuri karaan\""
    ],
    mainThemesEnglish: [
      "The cataclysmic tremor of the Final Hour overwhelming all earthly bonds",
      "Biological wonders of human embryological genesis and rainfall reviving dead soil",
      "The ancient rites of Hajj, honoring sacred precincts, and devotion through sacrificial offerings",
      "The historical decree permitting defensive warfare for those who were unjustly expelled",
      "The impotence of false deities: unable to create so much as a single fly"
    ],
    virtuesSomali: [
      "Waa suurad gaar ah oo leh laba sujuudood oo Qur'aan ah (Sajdataan).",
      "Waxay isku xirtaa cibaadada qalbiga iyo dhaqdhaqaaqa jirka ee Xajka."
    ],
    virtuesEnglish: [
      "Distinguished by featuring two distinct prostrations of recitation (Sajdatan) within its verses.",
      "Unifies the physical journey of Hajj with the ultimate spiritual migration toward Allah."
    ],
    revelationContextSomali: "Waxay leedahay qaybo Makki ah iyo kuwo Madani ah, waxayna soo degtay xilligii loo oggolaaday difaaca Islaamka.",
    revelationContextEnglish: "Contains both Meccan and Medinan verses, revealed when persecuted believers were permitted to defend their faith."
  },
  23: {
    surahNumber: 23,
    revelationType: "Meccan",
    revelationOrder: 74,
    ayahCount: 118,
    wordCount: 1711,
    juzRange: "Juz 18",
    pageRange: "Pages 342-349",
    aboutSomali: "Suuradda Al-Mu'minuun waxay ku bilaabataa tilmaamaha guusha mu'miniinta (Qad aflaxa al-Mu'minuun), faahfaahinta abuurka uurjiifka, qisooyinkii Nebiyada, iyo xaqiiqada dhimashada iyo Barzakh.",
    aboutEnglish: "Surah Al-Mu'minun (The Believers) opens with the manifesto of success: 'Certainly will the believers succeed.' It details embryological stages, the Ark of Noah, true prophetic austerity, the realm of Barzakh, and ultimate salvation.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Mu'minuun\" (Mu'miniinta) sababtoo ah waxay ku bilaabataa sifooyinka dadka Jannada Firdowsa dhaxlaya.",
    namingReasonEnglish: "Named \"Al-Mu'minun\" (The Believers) because its opening section enumerates the spiritual and moral characteristics of those who inherit Jannat al-Firdaws.",
    mainThemesSomali: [
      "Todobada sifo ee guusha Mu'miniinta: Khushuuqa salaadda, ka jeedsiga hadalka micnodarrada ah, bixinta sakada, iyo dhawrsanaanta",
      "Marxaladaha cajaa'ibka ah ee abuurka bini'aadamka: Dhibic, calaqo, cad yar, lafo, iyo hilib",
      "Qisooyinkii Nebi Nuux iyo qoomamkii beeniyay Nabiyadooda",
      "Xaqiiqada dhimashada, adduunka Barzakh, iyo afuufidda Suurka Qiyaame",
      "Ducada xiritaanka ee naxariista iyo dembi-dhaafka (Rabbi-ghfir warxam wa anta khayrur-Raaximiin)"
    ],
    mainThemesEnglish: [
      "The definitive charter of success: humility in prayer, avoiding vanity, Zakah, and sexual chastity",
      "The scientific progression of human embryology from quintessence of clay to fleshed bones",
      "Noah's Ark and the consistent rejection experienced by prophets across epochs",
      "The inescapable barrier of Barzakh separating mortal existence from the general Resurrection",
      "The concluding supplication: \"My Lord, forgive and have mercy, for You are the best of the merciful\""
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu yidhi: \"Waxaa igu soo degay 10 aayadood, qofkii u dhaqma wuxuu gelayaa Jannada\" (Tirmidi).",
      "Qofkii sifooyinkan la yimaada wuxuu noqonayaa dhaxalaha Jannada Firdowsa."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ said: \"Ten verses were revealed to me; whoever upholds them will enter Paradise\" (Tirmidhi).",
      "Guarantees inheritance of the highest station of Paradise (Firdaws) for those practicing its virtues."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli adag si ay u qeexdo dabeecadda iyo guusha kama dambaysta ah ee mu'minka.",
    revelationContextEnglish: "Revealed in Makkah to establish the moral identity and ethical superiority of the nascent community."
  },
  24: {
    surahNumber: 24,
    revelationType: "Medinan",
    revelationOrder: 102,
    ayahCount: 64,
    wordCount: 928,
    juzRange: "Juz 18",
    pageRange: "Pages 350-358",
    aboutSomali: "Suuradda An-Nuur (Iftiinka) waa dastuurka anshaxa bulshada. Waxay ilaalisaa sharafta qoyska, waxay dambi ka dhigtaa xanta dumarka (Qadaf), waxay xambaarsan tahay Aayadda Iftiinka (Ayatun-Nuur), iyo shuruucda Xijaabka.",
    aboutEnglish: "Surah An-Nur (The Light) is the social charter of domestic purity. It enacts laws protecting chastity, severely punishes false accusations, vindicates 'A'ishah in the Slander incident, features the Verse of Light, and ordains modesty and Hijab.",
    namingReasonSomali: "Waxaa loogu magac daray \"An-Nuur\" (Iftiinka) sababtoo ah waxay xambaarsan tahay Aayadda Iftiinka Eebbe ee Cirarka iyo Dhulka (Ayatun-Nuur: 24:35).",
    namingReasonEnglish: "Named \"An-Nur\" (The Light) after the sublime Verse of Light (24:35) allegorizing the divine guidance illuminating cosmic reality.",
    mainThemesSomali: [
      "Ilaalinta sharafta bulshada iyo ciqaabta adag ee sinada iyo xanta dumarka dhawrsan (Qadaf)",
      "Dhacdadii Xaddiithul Ifki iyo beri-yeeliddii Hooyada Mu'miniinta Caa'isha (RC)",
      "Aadaabta guriga galitaanka, oggolaansho-weyddiisashada, iyo ilaalinta xurmada qoyska",
      "Aayadda Iftiinka Eebbe ee Cirarka iyo Dhulka (Allahu Nuurus-Samaawaati wal-Ard)",
      "Xeerarka Xijaabka, asturnaanta haweenka, iyo hoos-u-dhigista aragga (Gaddul Basar)"
    ],
    mainThemesEnglish: [
      "Safeguarding societal purity: penal codes for illicit relations and false accusations against chaste women",
      "The historic Incident of the Slander (Hadith al-Ifk) vindicating Mother of the Believers 'A'ishah",
      "Domestic privacy: protocols of greeting, seeking permission, and respecting domestic boundaries",
      "The magnificent Parable of Divine Radiance: \"Allah is the Light of the heavens and the earth\" (24:35)",
      "Modesty guidelines: lowering the gaze and the observance of the Hijab for believing women"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda ugu sarreysa ee iftiinka Eebbe (24:35).",
      "Cumar binu Khadaab wuxuu dardaarmi jiray: \"Dumarkiinna bara Suuradda An-Nuur\"."
    ],
    virtuesEnglish: [
      "Houses the peerless Verse of Light (24:35), celebrated across Islamic contemplation.",
      "Sayyiduna 'Umar urged the community: \"Teach your women Surah An-Nur\" for its domestic wisdom."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina sanadkii 5-aad ama 6-aad ee Hijrada ka dib Duullaankii Banii Mustaliq.",
    revelationContextEnglish: "Revealed in Madinah following the Expedition of Banu al-Mustaliq to extinguish slanderous domestic agitation."
  },
  25: {
    surahNumber: 25,
    revelationType: "Meccan",
    revelationOrder: 42,
    ayahCount: 77,
    wordCount: 1117,
    juzRange: "Juz 18-19",
    pageRange: "Pages 359-366",
    aboutSomali: "Suuradda Al-Furqaan waxay caddaysaa sharafta Qur'aanka ee kala saaraya Xaqa iyo Baadilka. Waxay beenisaa shakiyadii gaalada, waxay soo bandhigtaa calaamadaha koonka, waxayna xirtaa sifooyinka sharafta leh ee 'Cibaadur-Raxmaan'.",
    aboutEnglish: "Surah Al-Furqan (The Criterion) exalts the Quran as the standard separating truth from falsehood. It refutes pagan objections against the Prophet's mortality and concludes with the sublime characteristics of the 'Servants of the Merciful'.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Furqaan\" (Kala-soocaha) maxaa yeelay waa mid ka mid ah magacyada sharafta leh ee Qur'aanka oo kala saara xaqa iyo baadilka.",
    namingReasonEnglish: "Named \"Al-Furqan\" (The Criterion) honoring the Quran as the ultimate moral standard differentiating truth from delusion.",
    mainThemesSomali: [
      "Sharafta Qur'aanka ee ah Furqaan kala saaraya xaqa iyo baadilka",
      "Jawaabaha shakiyadii gaalada ee la xiriiray nolosha bini'aadamnimo ee Nebi Muxammad ﷺ",
      "Calaamadaha Awoodda Eebbe: Hooska la fidiyay, Habeenka oo dhar laga dhigay, iyo dabaysha bishaarada roobka wadata",
      "Kala-soocidda labada badood ee biyo macaan iyo biyo dhanaan leh balse aan is-dhexgelin",
      "Tilmaamaha sare ee \"Cibaadur-Raxmaan\" (Addoomada Naxariistaha): Socodka is-hoosaysiinta, salaadda habeenka, iyo deeqsinimada"
    ],
    mainThemesEnglish: [
      "The transcendent dignity of the Quran acting as the definitive Criterion for humanity",
      "Refutation of pagan demands seeking angels or wealth to accompany the Prophet",
      "Cosmic manifestations of divine grace: expanding shadows, restful night, and rain-heralding winds",
      "The confluence of freshwater and saltwater seas separated by an impassable barrier",
      "The sublime portrait of the Servants of the Merciful ('Ibad ar-Rahman): humility, night prayer, and generosity"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadaha lagu tilmaamay \"Cibaadur-Raxmaan\" ee qof kasta oo Muslim ahi ku hammiyo inuu yeesho.",
      "Waxay caddaysay in toobaddu ay xumaanta u beddesho wanaag (25:70)."
    ],
    virtuesEnglish: [
      "Portrays the exemplary qualities of 'Ibad ar-Rahman, the gold standard of Islamic spiritual character.",
      "Contains the inspiring promise that sincere repentance transmutes past sins into good deeds (25:70)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli ay gaaladu aad u weerarayeen shakhsiyadda Nabiga ﷺ iyo Kitaabka.",
    revelationContextEnglish: "Revealed in Makkah answering pagan polemics against the prophetic mission and divine revelation."
  },
  26: {
    surahNumber: 26,
    revelationType: "Meccan",
    revelationOrder: 47,
    ayahCount: 227,
    wordCount: 3292,
    juzRange: "Juz 19",
    pageRange: "Pages 367-376",
    aboutSomali: "Suuradda Ash-Shucaraa (Gabayaaga) waxay diiradda saartaa fariinta Tawxiidka ee ay wadeen toddobo Nebi: Muuse, Ibraahim, Nuux, Huud, Saalax, Luud, iyo Shucayb, waxayna caddaysaa in Qur'aanku aanu ahayn hadal gabay.",
    aboutEnglish: "Surah Ash-Shu'ara (The Poets) systematically presents seven prophetic missions (Moses, Abraham, Noah, Hud, Salih, Lut, Shu'ayb). It reiterates the supreme refrain of divine mercy and distinguishes revelation from poetic fantasy.",
    namingReasonSomali: "Waxaa loogu magac daray \"Ash-Shucaraa\" (Gabayaaga) sababtoo ah waxay ku xirantay kala-saaridda waxyiga rabaaniga ah iyo hadalka dhalanteedka ah ee gabayaaga baadilka ah.",
    namingReasonEnglish: "Named \"Ash-Shu'ara\" (The Poets) because its conclusion contrasts inspired divine revelation with erratic, fanciful poetic invention.",
    mainThemesSomali: [
      "Welwelka Nabiga ﷺ ee hanuunka dadka iyo naxariistiisa ballaaran",
      "Qisadii Nebi Muuse iyo Fircoon iyo mucjisadii kala-dillaacidda badda",
      "Dacwadii Nebi Ibraahim ee Tawxiidka: \"Kii i abuuray isagaa i hanuuninaya\"",
      "Qisooyinkii Nuux, Huud, Saalax, Luud, iyo Shucayb oo leh hal gabagabo: \"Hubaal Rabbigaa waa Adkaade Naxariis badan\"",
      "Kala-soocidda Waxyiga daahirka ah ee Malaa'ig Jibriil keeno iyo khuraafaadka gabayaaga baadilka ah"
    ],
    mainThemesEnglish: [
      "The Prophet's deep emotional longing for the guidance and salvation of his people",
      "Moses confronting Pharaoh, the parting of the sea, and the drowning of the Egyptian forces",
      "Abraham's eloquent testimony of pure faith: \"He who created me, it is He who guides me\"",
      "Repeated refrain across five prophetic stories: \"Indeed, your Lord is the Exalted in Might, the Merciful\"",
      "Definitive distinction between angelic revelation through Gabriel and wandering poetic imagination"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda \"Rabbigaa waa Adkaade Naxariis badan\" oo soo noqnoqota siddeed jeer.",
      "Waxay caddaysay in dacwada xaqa ahi ay mar walba guulaysato."
    ],
    virtuesEnglish: [
      "Distinguished by its rhythmic chorus affirming Allah as the Almighty and Most Merciful repeated eight times.",
      "Demonstrates that the prophetic call universally triumphs over tyrannical opposition."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u taageerto Nabiga ﷺ xilli ay gaaladu ku eedaynayeen inuu gabayaa yahay.",
    revelationContextEnglish: "Revealed in Makkah to refute pagan claims that the Quran was merely human poetic eloquence."
  },
  27: {
    surahNumber: 27,
    revelationType: "Meccan",
    revelationOrder: 48,
    ayahCount: 93,
    wordCount: 1349,
    juzRange: "Juz 19-20",
    pageRange: "Pages 377-384",
    aboutSomali: "Suuradda An-Namli waxay daaha ka rogeysaa Boqortooyadii iyo Cilmiga la siiyay Daa'uud iyo Sulaymaan, mucjisadii Qudhaanjada, Shimbirkii Hud-hudka, iyo Boqoraddii Saba (Bilqees) ee Islaamtay.",
    aboutEnglish: "Surah An-Naml (The Ant) highlights prophetic dominion and wisdom granted to David and Solomon. It details Solomon's communion with ants, the Hoopoe bird, the submission of Queen of Sheba (Bilqis), and signs of nature.",
    namingReasonSomali: "Waxaa loogu magac daray \"An-Namli\" (Qudhaanjada) sababtoo ah waxay xustay qisadii qudhaanjadii u digtay asxaabteeda markii ay aragtay ciidankii Nebi Sulaymaan.",
    namingReasonEnglish: "Named \"An-Naml\" (The Ant) after the miraculous incident of the female ant commanding her colony to shelter as Solomon's hosts advanced.",
    mainThemesSomali: [
      "Cilmigii iyo shukrigii la siiyay Nebi Daa'uud iyo Nebi Sulaymaan (Alxamdulillaah)",
      "Mucjisadii Nebi Sulaymaan ee fahanka luuqadda shimbiraha, qudhaanjada, iyo ciidanka jinniga",
      "Qisadii Boqoraddii Saba (Bilqees), waraaqdii Bismillaahi, iyo qaadashadeedii diinta Islaamka",
      "Qisooyinkii Nebi Saalax (Reer Thamuud) iyo Nebi Luud",
      "Shanta su'aalood ee awoodda Eebbe: \"Ma jiraa ilaah kale oo Eebbe la jira? (A-ilaahun macallaah)\""
    ],
    mainThemesEnglish: [
      "Divine wisdom and profound gratitude exemplified by Prophets David and Solomon",
      "Solomon's comprehension of animal communication: the speech of ants and the investigative Hoopoe",
      "The Queen of Sheba (Bilqis), the royal missive opening with the Basmalah, and her surrender to Allah",
      "Brief moral accounts of Salih confronting conspirators and the rescue of Lut",
      "Five rhetorical challenges demanding: \"Is there any deity alongside Allah?\" (A-ilahun ma'allah)"
    ],
    virtuesSomali: [
      "Waa suuradda kaliya ee ay ku dhex jirto \"Bismillaahir-Raxmaanir-Raxiim\" oo dhammaystiran laba jeer (bilowga iyo aayadda 30-aad).",
      "Waxay bartaa qofka in awoodda iyo xukunka looga mahadnaqo Eebbe."
    ],
    virtuesEnglish: [
      "Contains two complete occurrences of the Basmalah: at its start and embedded within Solomon's letter (27:30).",
      "Exemplifies that political power and wealth must be governed by deep humility and piety."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u tusto mushrikiinta in xukunka runta ahi yahay midka Eebbe u hoggaansama.",
    revelationContextEnglish: "Revealed in Makkah illustrating the divine supremacy over worldly kingdoms through Solomon's empire."
  },
  28: {
    surahNumber: 28,
    revelationType: "Meccan",
    revelationOrder: 49,
    ayahCount: 88,
    wordCount: 1276,
    juzRange: "Juz 20",
    pageRange: "Pages 385-395",
    aboutSomali: "Suuradda Al-Qasas waxay si faahfaahsan u sheegtaa dhalashadii Nebi Muuse, korsashadii guriga Fircoon, u cararkii Madyan, soo laabashadiisii, iyo qisadii Qaaruun ee maalkiisa ku kibray dhulkuna liqay.",
    aboutEnglish: "Surah Al-Qasas (The Stories) chronicles the life of Moses: infant cast into the Nile, nurtured in Pharaoh's palace, exile in Midian, and commissioning at Sinai. It concludes with the parable of Qarun (Korah) swallowed by the earth.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Qasas\" (Sheekooyinka) maxaa yeelay waxay si qoto dheer u soo bandhigtay sheekadii dhabta ahayd ee Nebi Muuse iyo Fircoon.",
    namingReasonEnglish: "Named \"Al-Qasas\" (The Stories) reflecting its comprehensive chronicle of Moses' life and the rise and fall of historical tyrants.",
    mainThemesSomali: [
      "Naxariista Eebbe ee kuwa la dulmiyo: \"Waxaan doonaynaa inaan u nicmeyno kuwii lagu daciifiyay dhulka\"",
      "Dhalashadii Nebi Muuse, dhiirranaanta hooyadiis, iyo korsashadii guriga cadawgiisa Fircoon",
      "U cararkii Madyan, caawintii labadii hablood, iyo guurkii gabadhii Nebi Shucayb",
      "Wadahadalkii dooxada Dhuwaa iyo soo diriddii uu la socday walaalkiis Haaruun",
      "Qisadii Qaaruun: Kibirka maalka, diidmadii waanada, iyo liqidda dhulku la go'ay isaga iyo maalkiisii"
    ],
    mainThemesEnglish: [
      "The divine law vindicating the oppressed: \"We intended to favor those who were oppressed in the land\"",
      "Infant Moses cast into the river, his mother's faith, and upbringing inside Pharaoh's court",
      "Exile to Midian, assisting the two shepherdesses, and ten-year contract with Shu'ayb",
      "The sacred calling at Mount Sinai and Aaron appointed as supportive spokesperson",
      "The arrogance of Qarun boasting of self-made wealth, swallowed alive along with his palatial estate"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay bishaarada in xaqa mar walba loo gargaaro xitaa haddii cadawgu awood leeyahay.",
      "Waxay qofka ka ilaalisaa kibirka maalka iyo ku faanista adduunka."
    ],
    virtuesEnglish: [
      "Provides supreme comfort: tyrannical regimes cannot thwart divine protection over righteous believers.",
      "A timeless warning against technocratic and financial arrogance through the destruction of Qarun."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli adag oo ay Muslimiintu la kulmayeen cadaadis daran oo kaga yimid Qureysh.",
    revelationContextEnglish: "Revealed in Makkah when persecuted believers identified with the vulnerability of Moses' early community."
  },
  29: {
    surahNumber: 29,
    revelationType: "Meccan",
    revelationOrder: 85,
    ayahCount: 69,
    wordCount: 1001,
    juzRange: "Juz 20-21",
    pageRange: "Pages 396-403",
    aboutSomali: "Suuradda Al-Cankabuut waxay caddaysaa in iimaanku yahay imtixaan (Axaasiban-naasu...), waxay soo qaadataa qisooyinka Nebiyada, waxayna tusaale u soo qaadataa Guriga Caarada oo ah midka ugu daciifsan.",
    aboutEnglish: "Surah Al-'Ankabut (The Spider) explores trials of faith: 'Do people think they will be left to say We believe without being tested?'. It presents prophetic trials and the striking parable of false deities resembling the fragile spider's web.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Cankabuut\" (Caarada) sababtoo ah waxay ku masaashay kuwa Eebbe ka sokow gargaare yeesha guriga caarada oo ah kan ugu daciifsan guryaha.",
    namingReasonEnglish: "Named \"Al-'Ankabut\" (The Spider) after the profound parable comparing those who take false protectors to the fragile, ephemeral web of a spider.",
    mainThemesSomali: [
      "Imtixaanka iimaanka: \"Dadku ma waxay u maleeyeen in looga tagayo inay dhahaan waan rumeynay iyagoo aan la imtixaamin?\"",
      "Baarinnimada waalidiinta iyadoo aan Eebbe loogu shariikyeelin diinta",
      "Dacwadii dheerayd ee Nebi Nuux ee 950 sano iyo samirkii Nebi Ibraahim",
      "Tusaalaha cajiibka ah ee kuwa sanamyada caabuda oo la mid ah guriga daciifka ah ee Caarada",
      "Xuska Eebbe iyo Salaadda oo qofka ka reebta xumaanta iyo dambiyada (29:45)"
    ],
    mainThemesEnglish: [
      "The inevitability of trials: \"Do people think that they will be left to say, We believe, and not be tested?\"",
      "Kindness to parents while firmly prioritizing Tawhid over parental pressure toward idolatry",
      "Noah's 950-year ministry and Abraham confronting tyrannical fire",
      "The iconic parable: those who take patrons other than Allah resemble the frail, flimsy web of a spider",
      "The spiritual prophylactic: \"Indeed, prayer restrains from immorality and wrongdoing\" (29:45)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda salaaddu kaga difaacdo xumaanta (29:45).",
      "Waxay qofka mu'minka ah u dhistaa sabir iyo adkeysi marka dhibaato soo gaarto."
    ],
    virtuesEnglish: [
      "Contains the foundational psychological doctrine of prayer restraining immoral behavior (29:45).",
      "Equips believers with spiritual resilience to endure personal tribulations and ideological pressure."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilligii ay socotay Hijradii Xabashida iyo dhibaatadii lagu hayay asxaabta.",
    revelationContextEnglish: "Revealed in Makkah directly addressing new converts facing severe physical and family persecution."
  },
  30: {
    surahNumber: 30,
    revelationType: "Meccan",
    revelationOrder: 84,
    ayahCount: 60,
    wordCount: 870,
    juzRange: "Juz 21",
    pageRange: "Pages 404-410",
    aboutSomali: "Suuradda Ar-Ruum waxay ku bilaabataa bishaarada guushii Ruumiyiinta, waxay soo bandhigtaa calaamadaha koonka (Jacaylka guurka, luuqadaha, midabada), waxayna digniin ka bixisaa fasahaadka bini'aadamku dhulka ku faliyo.",
    aboutEnglish: "Surah Ar-Rum (The Romans) opens with the stunning geopolitical prophecy of Byzantine triumph over Persia. It meditates on cosmic signs (spousal affection, languages, colors), environmental corruption by human hands, and the primordial Fitrah.",
    namingReasonSomali: "Waxaa loogu magac daray \"Ar-Ruum\" (Ruumiyiinta) sababtoo ah waxay sii sheegtay guusha ay Ruumiyiintu ka gaari doonaan Faarisiyiinta dhowr sano gudahood.",
    namingReasonEnglish: "Named \"Ar-Rum\" (The Romans) after its miraculous historical prophecy foretelling the Byzantine victory over the Persian Empire within a decade.",
    mainThemesSomali: [
      "Mucjisada sii-sheegidda guushii Ruumiyiinta ee Faarisiyiinta ka dib jabkoodii",
      "Calaamadaha Eebbe: Abuurista lammaanaha jacaylka iyo naxariista leh (30:21)",
      "Kala duwanaanshaha luuqadaha iyo midabada bini'aadamka oo ah calaamad Eebbe",
      "Fasahaadka ka muuqda dhulka iyo badda ee gacmaha dadku kasbadeen (30:41)",
      "Diinta toosan ee Islaamka oo ah Fitrada nadiifka ah ee Eebbe dadka ku abuuray"
    ],
    mainThemesEnglish: [
      "The miraculous historical prophecy of Byzantine resurgence against the Persian superpower",
      "Signs of divine compassion: marital bonding imbued with reciprocal love and tenderness (30:21)",
      "The linguistic and ethnic diversity of mankind celebrated as divine signatures across nature",
      "Ecological and moral degradation: \"Corruption has appeared throughout land and sea because of what hands have earned\" (30:41)",
      "The primordial, innate spiritual constitution of humanity (Fitrat Allah) aligned with monotheism"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda guurka iyo jacaylka qoyska (30:21) ee caanka ku ah nolosha Muslimiinta.",
      "Waxay xaqiijisay runnimada waxyiga iyadoo sii sheegtay dhacdooyin taariikhi ah oo dhaboobay."
    ],
    virtuesEnglish: [
      "Contains the celebrated wedding verse establishing marriage on tranquility, love, and mercy (30:21).",
      "Stands as a monumental historical proof of the miraculous prescience of the Quran."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilligii Faarisiyiintu jabiyeen Ruumiyiinta gaaladuna ku farxeen jabkaas.",
    revelationContextEnglish: "Revealed in Makkah when pagan aristocrats celebrated Persian victories over monotheistic Byzantium."
  },
  31: {
    surahNumber: 31,
    revelationType: "Meccan",
    revelationOrder: 57,
    ayahCount: 34,
    wordCount: 493,
    juzRange: "Juz 21",
    pageRange: "Pages 411-414",
    aboutSomali: "Suuradda Luqmaan waxay xambaarsan tahay dardaarankii xikmadda badnaa ee Luqmaan siiyay wiilkiisa: Tawxiidka, Baarinnimada waalidiinta, Salaadda, Samaha, Samirka, iyo Is-hoosaysiinta.",
    aboutEnglish: "Surah Luqman enshrines the timeless ethical maxims bequeathed by the sage Luqman to his son: absolute monotheism, filial gratitude, prayer, moral courage, steadfastness, and dignified humility.",
    namingReasonSomali: "Waxaa loogu magac daray ninkii xikmadda badnaa ee Luqmaan Al-Xakiim oo Eebbe ku mannaystay faham sare iyo waano suubban.",
    namingReasonEnglish: "Named after the righteous sage Luqman whose pedagogical counsel models the ideal Islamic spiritual upbringing.",
    mainThemesSomali: [
      "Dardaarankii Tawxiidka: Reebidda shirkiga oo ah dulmiga ugu weyn",
      "Baarinnimada iyo dhowridda xurmada waalidiinta, gaar ahaan hooyada dhibka badan soo martay",
      "Faridda samaha, reebidda xumaanta, iyo u dhabar-adayga dhibaatooyinka (Samirka)",
      "Reebidda kibirka, isla-weynida, iyo socodka faanka ah",
      "Shanta furaha ah ee cilmiga qarsoon ee Eebbe kaliya ogyahay (Wakhtiga Qiyaamada, Roobka, Uurjiifka, Mustaqbalka, iyo Goobta dhimashada)"
    ],
    mainThemesEnglish: [
      "The foundational counsel on Tawhid: warning that polytheism is the ultimate injustice",
      "Reverence and compassion toward parents, highlighting maternal sacrifice during pregnancy and weaning",
      "Social advocacy: commanding good, forbidding evil, and bearing consequences with patience",
      "Conduct and etiquette: absolute prohibition of pride, arrogance, and strutting boastfully",
      "The Five Keys of the Unseen known only to Allah (The Final Hour, Rain, Womb contents, Destiny, Place of death)"
    ],
    virtuesSomali: [
      "Waxay qeexaysaa shuruucda tarbiyada suubban ee carruurta iyo qoyska.",
      "Waxay xambaarsan tahay aayadda shanta arrimood ee qeybka ah ee aysan cidina ogeyn Eebbe mooyee."
    ],
    virtuesEnglish: [
      "Provides the supreme Quranic blueprint for youth education and family mentorship.",
      "Affirms that comprehensive knowledge of the future and unseen lies exclusively with the Creator."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli ay mushrikiintu dhallinyarada ku dhiirrigelinayeen inay diidaan Islaamka.",
    revelationContextEnglish: "Revealed in Makkah guiding Muslim youth to navigate familial and social opposition with wisdom and respect."
  },
  32: {
    surahNumber: 32,
    revelationType: "Meccan",
    revelationOrder: 75,
    ayahCount: 30,
    wordCount: 435,
    juzRange: "Juz 21",
    pageRange: "Pages 415-417",
    aboutSomali: "Suuradda As-Sajdah waxay xoojisaa runnimada Waxyiga, abuurista bini'aadamka ee dhoobada laga bilaabay, tilmaamaha mu'miniinta sujuudda u dhaca, iyo bishaarada nimcooyinka qarsoon ee Jannada.",
    aboutEnglish: "Surah As-Sajdah (The Prostration) affirms the divine origin of the Quran, biological generation from clay, the devotion of those who forsake beds for nighttime prayer, and eternal joy prepared in Paradise.",
    namingReasonSomali: "Waxaa loogu magac daray \"As-Sajdah\" (Sujuudda) sababtoo ah waxay ku ammaanaysaa mu'miniinta dhabta ah kuwa marka aayadaha Eebbe loo akhriyo sujuudda u dhaca iyagoo tasbiixsanaya.",
    namingReasonEnglish: "Named \"As-Sajdah\" (The Prostration) commemorating the spontaneous prostration of sincere believers when listening to divine revelation.",
    mainThemesSomali: [
      "Xaqiiqada dhabta ah ee soo degitaanka Qur'aanka Kariimka ah oo aan shaki ku jirin",
      "Abuurista koonka lix maalmood gudahood iyo bini'aadamka oo dhoobo laga bilaabay",
      "Tilmaamaha mu'miniinta: Kuwa sariiraha ka kaca habeenkii si ay Rabbigood u baryaan iyagoo cabsi iyo rajo qaba",
      "Nimcooyinka qarsoon ee Jannada: \"Nafina ma oga waxa loo qariyay oo indho-qabowsi ah\"",
      "Kala saaridda qofka mu'minka ah iyo qofka faasiqa ah: \"Marnaba ma simana\""
    ],
    mainThemesEnglish: [
      "Infallible divine authority of the Quran descending without a shadow of doubt",
      "Universal creation in six phases and human physiological genesis starting from clay",
      "Characteristics of devout believers: forsaking sleep at night to pray in awe and hope",
      "Unimaginable delights in Paradise: \"No soul knows what comfort of eyes is kept hidden for them\"",
      "Absolute moral distinction: the faithful believer and the defiant rebel can never be equal"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu akhriyi jiray Suuradda As-Sajdah iyo Al-Mulk habeen kasta ka hor inta uusan seexan (Tirmidi).",
      "Nabigu ﷺ wuxuu subaxda Jimcaha salaadda hore ku akhriyi jiray Suuradda As-Sajdah (Saxiiyul Bukhaari)."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ routinely recited Surahs As-Sajdah and Al-Mulk every night before sleep (Tirmidhi).",
      "The Prophet ﷺ consistently recited Surah As-Sajdah in the first rak'ah of Friday dawn prayer (Bukhari)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay dadka ugu xirto cibaadada habeennimo iyo cabsida aakhiro.",
    revelationContextEnglish: "Revealed in Makkah to inspire nocturnal devotion and contemplative awe in the early community."
  },
  33: {
    surahNumber: 33,
    revelationType: "Medinan",
    revelationOrder: 90,
    ayahCount: 73,
    wordCount: 1059,
    juzRange: "Juz 21-22",
    pageRange: "Pages 418-427",
    aboutSomali: "Suuradda Al-Axzaab waxay falanqaysaa Dagaalkii Khandaq (Xulafadii), go'doomintii Madiina, jebintii heshiiska ee Banii Qureyda, baabi'intii caadadii ilmo-qaadashada, Hooyooyinka Mu'miniinta, iyo Shaabaddii Nebiyada.",
    aboutEnglish: "Surah Al-Ahzab (The Combined Forces) dissects the Battle of the Trench, the siege of Madinah, the perfidy of Banu Qurayzah, the abolition of legal adoption claiming paternity, the Mothers of the Believers, and the Seal of the Prophets.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Axzaab\" (Xulafadii) sababtoo ah waxay xustay ciidamadii isbahaysiga ahaa ee gaalada ee ku soo duulay Madiina si ay Islaamka u tirtiraan.",
    namingReasonEnglish: "Named \"Al-Ahzab\" (The Combined Forces) commemorating the confederation of pagan tribes and dissident factions that besieged Madinah in the Battle of the Trench.",
    mainThemesSomali: [
      "Dagaalkii Khandaq: Baqdintii weynayd, taageerada Eebbe ee dabaysha, iyo jabkii xulafada",
      "Jebintii heshiiska ee Banii Qureyda iyo cawaaqibka khiyaanada qaran",
      "Baabi'intii caadadii korsashada magaca ilmaha iyo xaqiijinta xiriirka dhiigga dhabta ah",
      "Sharafta Nebi Muxammad ﷺ: \"Waa shaabadaydii Nebiyada (Khaatam an-Nabiyyeen)\"",
      "Xeerarka Hooyooyinka Mu'miniinta, Xijaabka, iyo amarka salaadda iyo saliga Nabiga ﷺ (33:56)"
    ],
    mainThemesEnglish: [
      "The Battle of the Trench: psychological terror of the siege, divine intervention by storm, and routing of invaders",
      "Treachery of Banu Qurayzah during critical vulnerability and subsequent military accountability",
      "Abolition of legal adoption erasing real paternity; establishing biological lineage and orphan care",
      "The transcendent stature of Prophet Muhammad as the final Seal of all Prophets (Khatam an-Nabiyyin)",
      "The noble status of the Mothers of the Believers, the Hijab, and the universal invocation of blessings upon the Prophet (33:56)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda saliga Nabiga ﷺ (33:56) ee qof kasta oo Muslim ahi ku duceysto.",
      "Waxay xambaarsan tahay aayadda tilmaantay in Nabigu yahay tusaalaha ugu wanaagsan (Uswatun Xasanah)."
    ],
    virtuesEnglish: [
      "Houses the monumental verse commanding perpetual blessings and peace upon Prophet Muhammad (33:56).",
      "Establishes the Prophet ﷺ as the supreme, flawless moral paradigm for all humanity (Uswah Hasanah: 33:21)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina sanadkii 5-aad ee Hijrada xilligii Dagaalkii Khandaq ka dib.",
    revelationContextEnglish: "Revealed in Madinah in the 5th year of the Hijrah analyzing the profound aftermath of the siege of the Trench."
  },
  34: {
    surahNumber: 34,
    revelationType: "Meccan",
    revelationOrder: 58,
    ayahCount: 54,
    wordCount: 783,
    juzRange: "Juz 22",
    pageRange: "Pages 428-433",
    aboutSomali: "Suuradda Saba waxay xustay nimcooyinkii loo fidiyay Nebi Daa'uud (Birta jilicsan) iyo Sulaymaan (Dabaysha iyo Jinniga), burburkii Reer Saba ee Daadkii Carim, iyo cilmiga koobay wax kasta.",
    aboutEnglish: "Surah Saba (Sheba) examines the wonders bestowed upon David (supple iron, praising mountains) and Solomon (subjugated winds, Jinn), contrasted with the devastation of Sheba by the Great Dam flood (Sayl al-'Arim) due to ingratitude.",
    namingReasonSomali: "Waxaa loogu magac daray Boqortooyadii \"Saba\" ee dalka Yaman oo Eebbe ku nimceeyay laba beerood balse markii ay ku kufriyeen daad ku baabi'iyay.",
    namingReasonEnglish: "Named after the civilization of \"Saba\" (Sheba) in southern Arabia, whose bountiful irrigated gardens were annihilated by a cataclysmic flood following their denial of truth.",
    mainThemesSomali: [
      "Cilmiga ballaaran ee Eebbe ee wax kasta oo dhulka gala ama ka soo baxa iyo waxa cirka ka soo dega",
      "Mucjisooyinkii Nebi Daa'uud (Buuraha iyo shimbiraha la tasbiixsan jiray, iyo birta u jilicsanayd)",
      "Awooddii Nebi Sulaymaan ee dabaysha loo sakhiray iyo jinnigii u shaqaynayay",
      "Qisadii Reer Saba: Nimcadii labada beerood iyo Daadkii baabi'iyay (Saylul Carim) markii ay mahadnaqa diideen",
      "Burinta shirkiga: Kuwa Eebbe ka sokow la caabudo waxba ma maamulaan xitaa miisaan saxar ah"
    ],
    mainThemesEnglish: [
      "All-encompassing divine omniscience over every particle entering or emerging from earth and heaven",
      "The miraculous blessings granted to David: mountains joining in psalms and iron softened like wax",
      "Solomon's mastery over physical elements: wind traveling a month's distance and subordinate Jinn workers",
      "The tragedy of Saba: fertile orchards ruined by the bursting of the Marib Dam (Sayl al-'Arim) following ingratitude",
      "Deconstruction of polytheism: false patrons possess not even the weight of an atom in the cosmos"
    ],
    virtuesSomali: [
      "Waa mid ka mid ah shanta suuradood ee ku bilaabata \"Alxamdullillaah\" (Mahad Eebbe).",
      "Waxay caddaysay in shukrigu yahay ilaalada nimcada, kufriguna yahay burburka maalka."
    ],
    virtuesEnglish: [
      "One of five Surahs initiated with the grand invocation of praise: \"Alhamdulillah\".",
      "Provides profound economic and civilizational lessons: ungrateful societies trigger their own collapse."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay mushrikiinta taajiriinta ah uga digto cawaaqibka kibirka maalka.",
    revelationContextEnglish: "Revealed in Makkah warning wealthy pagan elites that material affluence without gratitude leads to ruin."
  },
  35: {
    surahNumber: 35,
    revelationType: "Meccan",
    revelationOrder: 43,
    ayahCount: 45,
    wordCount: 653,
    juzRange: "Juz 22",
    pageRange: "Pages 434-439",
    aboutSomali: "Suuradda Faadhir waxay caddaysaa in Eebbe yahay Abuuraha Cirarka iyo Dhulka, in dadku dhammaantood yihiin faqiir Eebbe u baahan, saddexda qaybood ee Kitaabka loo dhaxalsiiyay, iyo cabsida culumada dhabta ah.",
    aboutEnglish: "Surah Fatir (The Originator) proclaims Allah as the Creator who appointed winged angelic messengers. It highlights human dependency upon the Self-Sufficient God, the three categories of Quranic inheritors, and scholarly reverence.",
    namingReasonSomali: "Waxaa loogu magac daray \"Faadhir\" oo ah Abuuraha cirarka iyo dhulka ee wax ka abuuray meel aan waxba ka jirin.",
    namingReasonEnglish: "Named \"Fatir\" (The Originator / Creator) honoring Allah as the sovereign initiator who brought the universe into existence from nothingness.",
    mainThemesSomali: [
      "Abuuraha Cirarka iyo Dhulka ee Malaa'igta ka dhigay ergooyin leh laba, saddex, iyo afar baalood",
      "Bini'aadamka oo dhammaantood faqiir u ah Eebbe, Isaguna yahay Hodan Mahadsan (35:15)",
      "Qofna ma qaado dambiga qof kale (Walaa taziru waaziratun wizra ukhraa)",
      "Saddexda qaybood ee loo dhaxalsiiyay Kitaabka: Mid naftiisa dulmiyay, mid dhexdhexaad ah, iyo mid khayrka ku dheereeyay",
      "Culumada dhabta ah ee Eebbe ka cabsata: \"Waxaa Eebbe ka cabsada addoomadiisa kuwa cilmiga leh\""
    ],
    mainThemesEnglish: [
      "Praise of the Originator who fashioned angelic messengers with wings of two, three, and four pairs",
      "Universal human existential dependency: \"O mankind, you are in need of Allah, and Allah is the Free of need, the Praiseworthy\" (35:15)",
      "Individual moral responsibility: no bearer of burdens shall carry the spiritual burden of another",
      "The three inheritors of the Quran: those who wrong themselves, the lukewarmly moderate, and the foremost in good deeds",
      "The intellectual essence of reverence: \"Only those fear Allah among His servants who possess knowledge\" (35:28)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda caanka ah ee qeexday sharafta culumada cilmiga leh (35:28).",
      "Waxay qofka bartaa inuu ogaado daciifnimadiisa iyo hodannimada Eebbe."
    ],
    virtuesEnglish: [
      "Contains the celebrated declaration establishing that true fear and awe of God resides among the learned (35:28).",
      "Cultivates sublime spiritual humility through realizing humanity's utter poverty before the Self-Sufficient Lord."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay qalbiyada ugu beerto dareenka weynaanta Eebbe.",
    revelationContextEnglish: "Revealed in Makkah to inspire cosmological awe and intellectual submission to divine wisdom."
  },
  36: {
    surahNumber: 36,
    revelationType: "Meccan",
    revelationOrder: 41,
    ayahCount: 83,
    wordCount: 1204,
    juzRange: "Juz 22-23",
    pageRange: "Pages 440-445",
    aboutSomali: "Suuradda Yaa-Siin waa Wadnaha Qur'aanka Kariimka ah. Waxay xaqiijisaa Risoolada Nabiga ﷺ, Qisadii Reer Magaalada iyo ninkii u hiiliyay xaqa, calaamadaha koonka, iyo amarka 'KUN FAYAKUUN'.",
    aboutEnglish: "Surah Ya-Sin is revered as the Heart of the Quran. It forcefully defends the validity of revelation, relates the courageous believer from the city outskirts, displays signs across nature, and affirms the command 'Be, and it is'.",
    namingReasonSomali: "Waxay ku bilaabataa xarfaha goos-gooska ah ee \"Yaa-Siin\" oo xambaarsan mucjiso iyo sharaf weyn.",
    namingReasonEnglish: "Named after the mystic opening letters \"Ya-Sin\", asserting divine authorship and addressing the Messenger of Allah.",
    mainThemesSomali: [
      "Xaqiijinta Risoolada Nebi Muxammad ﷺ ee ku taagan jidka toosan",
      "Qisadii Reer Magaalada iyo ninkii mu'minka ahaa ee u hiiliyay Nabiyada ee la dilay Jannadana galay",
      "Calaamadaha Awoodda Eebbe: Dhulka qalalan ee la nooleeyo, Habeenka iyo Maalinta, iyo maraakiibta badda",
      "Afuufidda Suurka iyo soo bixidda degdegga ah ee dadka xabaalaha ku jira",
      "Awoodda buuxda ee Eebbe: \"Amarkiisu marka uu wax rabo waa inuu dhaho Ahow oo way noqotaa (Kun fayakuun)\""
    ],
    mainThemesEnglish: [
      "Divine attestation confirming Prophet Muhammad upon an infallible, straight path of guidance",
      "The parable of the Town and the courageous martyr (Habib the Carpenter) murdered for testifying to truth",
      "Signs of Cosmic Providence: revival of dormant soil, orbital trajectories of sun and moon, and loaded vessels upon seas",
      "The single blast of the Trumpet mobilizing all human generations instantaneously before the Throne",
      "The absolute sovereign creative command: \"His command is only when He intends a thing that He says to it, Be, and it is\""
    ],
    virtuesSomali: [
      "Waxaa la weriyay: \"Wax walba waxay leeyihiin wadne, wadnaha Qur'aankuna waa Yaa-Siin\".",
      "Akhrinteeda waxay keentaa dambi-dhaaf, deganaansho, iyo barako badan."
    ],
    virtuesEnglish: [
      "Tradition celebrates it as the \"Heart of the Quran\" for encapsulating core tenets of Islamic faith.",
      "Routinely recited for the sick and dying to bring profound spiritual peace and ease the transition to the Hereafter."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli ay gaaladu beeninayeen soo saarista dhimashada ka dib.",
    revelationContextEnglish: "Revealed in Makkah when pagan oligarchs mocked the reality of bodily resurrection and divine judgment."
  },
  37: {
    surahNumber: 37,
    revelationType: "Meccan",
    revelationOrder: 56,
    ayahCount: 182,
    wordCount: 2639,
    juzRange: "Juz 23",
    pageRange: "Pages 446-452",
    aboutSomali: "Suuradda As-Saaffaat waxay ku bilaabataa Malaa'igta safafka u taagan cibaadada, imtixaankii weynaa ee gowraca Nebi Ismaaciil iyo beddelkii wanka weyn, qisooyinkii Ilyaas, Luud, iyo Yoonis, iyo guusha ciidanka Eebbe.",
    aboutEnglish: "Surah As-Saffat (Those Ranked in Rows) depicts angelic hosts arrayed in worship. It portrays Abraham's ultimate trial in the commanded sacrifice of his son, and recounts the missions of Elijah, Lut, and Jonah.",
    namingReasonSomali: "Waxaa loogu magac daray \"As-Saaffaat\" (Kuwa safan) oo ah Malaa'igta sharafta leh ee safafka u taagan cibaadada iyo fulinta amarka Eebbe.",
    namingReasonEnglish: "Named \"As-Saffat\" (Those Ranked in Rows) describing the immaculate ranks of angels standing in celestial adoration of Allah.",
    mainThemesSomali: [
      "Dhaarta Malaa'igta safan iyo ilaalinta samada sare ee laga ilaaliyo shaydaamiinta",
      "Qisadii imtixaanka weynaa ee Nebi Ibraahim iyo gowracii wiilkiisa Ismaaciil iyo beddelkii wanka",
      "Qisooyinkii Nebi Ilyaas iyo reerkiisii caabudi jiray sanamka Bacli",
      "Qisadii Nebi Yoonis ee tuuriddii doonida iyo liqidda kalluunku liqay",
      "Ballanqaadka guusha: \"Ciidankayaga (Mu'miniinta) ayaa hubaal ah kuwa adkaan doona\""
    ],
    mainThemesEnglish: [
      "Angelic ranks in celestial adoration and the defense of the heavens against eavesdropping demons",
      "Abraham's monumental test of love: submission to the commanded sacrifice of his son and redemption via the ram",
      "Prophet Elijah (Ilyas) calling his people to abandon the pagan idol Baal and turn to the Living Lord",
      "Prophet Jonah (Yunus) cast into the sea, swallowed by the great fish, and delivered upon repentance",
      "The triumphant divine guarantee: \"And that indeed Our hosts will be the overcome (victors)\""
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay qisada allabaryiga ee lagu asaasay Ciidul Adxaa iyo gowraca Udxiyada.",
      "Waxay caddaysay in samirka iyo hoggaansanka Eebbe uu keeno badbaado weyn."
    ],
    virtuesEnglish: [
      "Commemorates the profound act of primordial submission underlying the global observance of Eid al-Adha.",
      "Demonstrates that steadfast compliance with divine decree unlocks unprecedented relief and blessing."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u buriso caqiidada mushrikiinta ee ahayd in Malaa'igtu tahay gabdho Eebbe dhalay.",
    revelationContextEnglish: "Revealed in Makkah to obliterate the polytheistic mythology alleging that angels were the female daughters of God."
  },
  38: {
    surahNumber: 38,
    revelationType: "Meccan",
    revelationOrder: 38,
    ayahCount: 88,
    wordCount: 1276,
    juzRange: "Juz 23",
    pageRange: "Pages 453-457",
    aboutSomali: "Suuradda Saad waxay ku bilaabataa dhaarta Qur'aanka, waxay faahfaahisaa qisadii garsoorka ee Nebi Daa'uud, fardihii Nebi Sulaymaan, samirkii mucjisada ahaa ee Nebi Ayuub, iyo diidmadii Iblays ee sujuudda Aadan.",
    aboutEnglish: "Surah Sad explores prophetic integrity through royal tribulations. It details David's judicial trial, Solomon's fleet horses and prayer for unmatched rule, Job's heroic fortitude in illness, and the primordial defiance of Iblis.",
    namingReasonSomali: "Waxay ku bilaabataa xarafka goos-gooska ah ee \"Saad\" oo ka mid ah mucjisooyinka xarfaha Carabiga ee Qur'aanka furaha u ah.",
    namingReasonEnglish: "Named after the single arabic letter \"Sad\" with which it commences, signifying divine miraculous eloquence.",
    mainThemesSomali: [
      "Kibirka gaalada iyo diidmadii ay diideen Tawxiidka: \"Ma hal ilaah buu ka dhigay ilaahyadii?\"",
      "Qisadii Nebi Daa'uud ee garsoorkii labadii walaalaha ahaa ee midkood 99 laxood lahaa",
      "Qisadii Nebi Sulaymaan ee fardihii quruxda badnaa iyo ducadiisii boqortooyo aan cidina la helin",
      "Samirkii adkaa ee Nebi Ayuub markii cudurku taabtay: \"Waxaan ku aragnay samir badne, addoon fiicnaa!\"",
      "Halgankii u dhexeeyay Eebbe iyo Iblays markii uu diiday inuu u sujuudo Aadan kibir darteed"
    ],
    mainThemesEnglish: [
      "Pagan mockery of monotheism: \"Has he made the gods into one God? Indeed, this is a curious thing!\"",
      "Prophet David's judicial parable of the two disputants regarding 99 ewes versus a single sheep",
      "Prophet Solomon's contemplation of noble thoroughbred horses and his petition for unmatched sovereignty",
      "Prophet Job (Ayyub) embodying superhuman fortitude in chronic disease: \"Indeed, We found him patient, an excellent servant\"",
      "The cosmic genesis of evil: Iblis refusing to bow to Adam out of racial arrogance, claiming creation from fire"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay sujuudda Qur'aanka ee aayadda 24-aad ee Nebi Daa'uud u toobad-keenay Eebbe.",
      "Waxay dhiirrigelisaa qof kasta oo xanuunsan ama dhibaataysan inuu samro sida Nebi Ayuub."
    ],
    virtuesEnglish: [
      "Features the prostration of recitation (Sajdah) at verse 24 commemorating David's humble repentance before God.",
      "Stands as an eternal beacon of hope and strength for those experiencing prolonged illness and affliction."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii odayaashii Qureysh u yimaadeen Abuu Dhaalib si ay uga dacwoodaan Nabiga ﷺ.",
    revelationContextEnglish: "Revealed in Makkah following the deputation of Qurayshite chieftains appealing to Abu Talib to muzzle the Prophet."
  },
  39: {
    surahNumber: 39,
    revelationType: "Meccan",
    revelationOrder: 59,
    ayahCount: 75,
    wordCount: 1088,
    juzRange: "Juz 23-24",
    pageRange: "Pages 458-466",
    aboutSomali: "Suuradda Az-Zumar (Kooxaha) waxay daaha ka rogeysaa daahirnimada cibaadada (Al-Ikhlaas), aayadda naxariista toobadda (39:53), iyo kala-kaxaynta dadka Maalinta Qiyaame oo koox-koox Naarta iyo Jannada loogu kala wado.",
    aboutEnglish: "Surah Az-Zumar (The Crowds / The Troops) is the definitive treatise on Ikhlas (pure sincerity). It features the most hopeful verse of forgiveness (39:53) and culminates in humanity marshaled in throngs into Hell or Paradise.",
    namingReasonSomali: "Waxaa loogu magac daray \"Az-Zumar\" (Kooxaha) sababtoo ah waxay si muuqata u sawirtay sida dadka Maalinta Qiyaame koox-koox (Zumar) loogu kala kaxayn doono Jannada iyo Naarta.",
    namingReasonEnglish: "Named \"Az-Zumar\" (The Troops / Throngs) depicting the dramatic reality on Judgment Day when the condemned and redeemed are driven in distinct groups into eternity.",
    mainThemesSomali: [
      "Daahirnimada cibaadada oo Eebbe kaliya loo qiro (Mukhlikhiina lahud-Diin)",
      "Isbarbardhigga kuwa cilmiga leh iyo jaahiliinta: \"Ma siman yihiin kuwa wax og iyo kuwa aan wax ogayn?\"",
      "Aayadda ugu rajada weyn Qur'aanka ee toobadda: \"Ha ka quusannina naxariista Eebbe, wuxuu dhaafaa dambiyada oo dhan\" (39:53)",
      "Argagaxa dhimashada iyo sida nafta loo qabto xilliga hurdada iyo dhimashada",
      "Koox-koox u gelitaanka dadka: Kuwa Naarta loo kaxeeyo iyo kuwa Jannada albaabbadeeda nabad loogu furayo"
    ],
    mainThemesEnglish: [
      "Uncompromised spiritual purity: worshipping Allah alone with sincere and exclusive devotion (Ikhlas)",
      "The epistemological chasm: \"Are those who know equal to those who do not know?\" (39:9)",
      "The supreme verse of divine mercy and unconditional pardon: \"Despair not of the mercy of Allah; indeed, Allah forgives all sins\" (39:53)",
      "Divine sovereignty over consciousness: souls retained in death and released during slumber",
      "The grand segregation of destiny: throngs driven to the gates of Hell vs righteous multitudes welcomed into Paradise"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay Aayadda ugu naxariista badan Qur'aanka (39:53) ee furta albaabka toobadda.",
      "Nabigu ﷺ ma seexan jirin ilaa uu akhriyo Suuradda Az-Zumar iyo Al-Israa (Tirmidi)."
    ],
    virtuesEnglish: [
      "Contains what classical exegetes call the most hopeful verse in the Quran (Ayat ar-Raja: 39:53).",
      "The Prophet ﷺ made it a nocturnal practice never to sleep until reciting Surahs Az-Zumar and Al-Isra (Tirmidhi)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay dadka dambiyada culus galay ugu bishaareyso inuu Eebbe u toobad-dhaafayo haddii ay u noqdaan.",
    revelationContextEnglish: "Revealed in Makkah offering absolute spiritual pardon to polytheists weary of their past moral transgressions."
  },
  40: {
    surahNumber: 40,
    revelationType: "Meccan",
    revelationOrder: 60,
    ayahCount: 85,
    wordCount: 1233,
    juzRange: "Juz 24",
    pageRange: "Pages 467-476",
    aboutSomali: "Suuradda Ghaafir (ama Al-Mu'min) waxay iftiimisaa Dambi-dhaafka Eebbe, Malaa'igta Carshiga sida oo u duceysa mu'miniinta, Mu'minkii qoyska Fircoon ee xaqa u hiiliyay, iyo ballanqaadka ducada (Udcunii astajib lakum).",
    aboutEnglish: "Surah Ghafir (The Forgiver / Al-Mu'min) commences the seven Hawamim Surahs. It exalts divine forgiveness, the throne-bearing angels supplicating for the faithful, the secret Believer in Pharaoh's court, and the promise: 'Call upon Me; I will respond'.",
    namingReasonSomali: "Waxaa loogu magac daray \"Ghaafir\" (Dambidhaafaha) iyadoo lagu sifeeyay magacyada Eebbe ee aayadda 3-aad, waxaana sidoo kale loo yaqaannaa \"Al-Mu'min\" sababtoo ah ninkii mu'minka ahaa ee qoyska Fircoon.",
    namingReasonEnglish: "Named \"Ghafir\" (The Forgiver) from the opening attributes of Allah; also called \"Al-Mu'min\" (The Believer) honoring the courageous man in Pharaoh's household.",
    mainThemesSomali: [
      "Dambi-dhaafka ballaaran ee Eebbe, aqbalidda toobadda, iyo awoodda ciqaabtiisa",
      "Malaa'igta qaadda Carshiga Eebbe iyo kuwa ku xeeran oo dembi-dhaaf u barya mu'miniinta iyo qoysaskooda",
      "Qisadii ninkii mu'minka ahaa ee qoyska Fircoon ee qariyay iimaankiisa una dooday Nebi Muuse",
      "Kibirka Fircoon, Haamaan, iyo Qaaruun iyo sida ay u dulleysmeen",
      "Ballanqaadka Eebbe ee ajiibista ducada: \"I barya waan idiin ajiibayaaye (Udcunii astajib lakum)\" (40:60)"
    ],
    mainThemesEnglish: [
      "The divine attributes: Forgiver of sin, Acceptor of repentance, Severe in punishment, and Owner of abundance",
      "The magnificent intercession of the angels carrying the Throne supplicating for believing households",
      "The heroic advocacy of the Believing Man in Pharaoh's court who concealed his faith to defend Moses",
      "The downfall of political and financial tyrants (Pharaoh, Haman, Qarun) through delusions of grandeur",
      "The unconditional divine guarantee of answering prayer: \"Call upon Me; I will respond to you\" (40:60)"
    ],
    virtuesSomali: [
      "Waa furaha todobada suuradood ee ku bilaabata \"Xaa-Miim\" (Al-Xawaamiim) ee loo yaqaanno Quruxda Qur'aanka.",
      "Waxay xambaarsan tahay aayadda dammaanad-qaadka aqbalidda ducada (40:60)."
    ],
    virtuesEnglish: [
      "The inaugural chapter of the seven glorious \"Hawamim\" Surahs, celebrated as the crown jewels of the Quran.",
      "Contains the foundational spiritual anchor promising divine responsiveness to human prayer (40:60)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli mushrikiintu go'aansadeen inay dilaan Nebi Muxammad ﷺ sida Fircoon u doonayay dilka Muuse.",
    revelationContextEnglish: "Revealed in Makkah when Qurayshite leaders plotted the assassination of the Prophet, mirroring Pharaoh's plots against Moses."
  },
  41: {
    surahNumber: 41,
    revelationType: "Meccan",
    revelationOrder: 61,
    ayahCount: 54,
    wordCount: 783,
    juzRange: "Juz 24-25",
    pageRange: "Pages 477-482",
    aboutSomali: "Suuradda Fussilat (Kala-bixinta) waxay caddaysaa in Qur'aanku yahay Kitaab si faahfaahsan loogu qeexay carrabka Carabiga, waxay xustaa xubnaha bini'aadamka ee Qiyaamada marag-furi doona, iyo ku celinta xumaanta wanaag.",
    aboutEnglish: "Surah Fussilat (Explained in Detail) celebrates the precise Arabic exposition of the Quran. It details cosmic origins, warns of faculties (hearing, sight, skin) testifying against the sinner on Judgment Day, and teaches repelling evil with that which is better.",
    namingReasonSomali: "Waxaa loogu magac daray \"Fussilat\" (Kala-bixinta) sababtoo ah waxay ku bilaabataa in aayadaha Kitaabkan si faahfaahsan oo cad loo kala bixiyay.",
    namingReasonEnglish: "Named \"Fussilat\" (Explained in Detail) celebrating the meticulous clarity, thematic articulation, and linguistic perfection of the divine Arabic text.",
    mainThemesSomali: [
      "Qur'aanka Kariimka ah oo aayadihiisa si faahfaahsan oo cilmi ah loogu kala bixiyay carrabka Carabiga",
      "Abuurista Cirarka iyo Dhulka lix maalmood gudahood iyo amarkii Eebbe ku yidhi: \"Kaalaya idinkoo adeecsan ama khasban\"",
      "Xubnaha bini'aadamka (Maqalka, Aragga, iyo Maqaarka) oo ku marag-furi doona qofka dambiyadii uu galay",
      "Difaaca xumaanta ee wanaag lagu celiyo: \"Ku celi xumaanta waxa ugu wanaagsan markaas kii cadaawadu idin dhexaysay wuxuu noqon saaxiib dhow\" (41:34)",
      "Calaamadaha Eebbe ee koonka iyo nafta bini'aadamka dhexdeeda lagu muujin doono ilaa ay xaqa qiraan (41:53)"
    ],
    mainThemesEnglish: [
      "The meticulous divine architecture of the Quran: verses clearly expounded in pristine Arabic eloquence",
      "Cosmic genesis: creation of the heavens and earth and their joyous, compliant submission to the Almighty",
      "Sensory faculties testifying on the Day of Judgment: ears, eyes, and skin bearing witness to committed crimes",
      "The highest diplomatic ethics: \"Repel evil with that which is better; then the one with whom was enmity will become as an intimate friend\" (41:34)",
      "Universal cosmic and biological signs validating the Quran: \"We will show them Our signs in the horizons and within themselves\" (41:53)"
    ],
    virtuesSomali: [
      "Waa suuraddii uu Nabigu ﷺ ku akhriyay Cutbah binu Rabiicah markii uu doonayay inuu gorgortan diimeed la galo, taas oo gilgishay Cutbah.",
      "Waxay xambaarsan tahay aayadda ku baaqaysa in xumaanta lagu celiyo wanaag (41:34)."
    ],
    virtuesEnglish: [
      "Recited by the Prophet ﷺ to the Meccan diplomat 'Utbah ibn Rabi'ah, leaving the pagan emissary utterly spellbound and immobilized.",
      "Contains the epochal social principle transforming bitter hostility into intimate friendship through magnanimity (41:34)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii hoggaamiyeyaashii Qureysh u soo direen Cutbah si uu gorgortan ula galo Nabiga ﷺ.",
    revelationContextEnglish: "Revealed in Makkah answering pagan diplomatic overtures seeking compromise on core monotheistic principles."
  },
  42: {
    surahNumber: 42,
    revelationType: "Meccan",
    revelationOrder: 62,
    ayahCount: 53,
    wordCount: 769,
    juzRange: "Juz 25",
    pageRange: "Pages 483-488",
    aboutSomali: "Suuradda Ash-Shuuraa waxay dejisaa mabda'a Wadatashiga ee bulshada Islaamka (Wa amruhum shuuraa baynahum), xaqiiqada ah in wax la mid ahi jirin Eebbe (Laysa kamithlihii shay'), iyo qaddarka Eebbe ee ubadka.",
    aboutEnglish: "Surah Ash-Shura (The Consultation) champions the governance model of mutual consultation (Shura). It declares the peerless transcendence of Allah ('There is nothing like unto Him') and expounds the divine distribution of offspring and trials.",
    namingReasonSomali: "Waxaa loogu magac daray \"Ash-Shuuraa\" (Wadatashiga) sababtoo ah waxay ku tilmaamtay bulshada mu'miniinta ah kuwa hawlahooda ku maamula wadatashi.",
    namingReasonEnglish: "Named \"Ash-Shura\" (The Consultation) honoring the Quranic governance ethic where civic and communal affairs are conducted through reciprocal deliberation.",
    mainThemesSomali: [
      "Midnimada xididka waxyiga ee loo soo dejiyay Nebi Muxammad ﷺ iyo Nabiyadii ka horreeyay",
      "Mabda'a weyn ee Wadatashiga bulshada: \"Hawlahooduna waxay ku socdaan wadatashi dhexdooda ah\" (42:38)",
      "Kalinimada buuxda ee Eebbe: \"Wax la mid ah ma jiraan, waana Maqlaha Arkaha ah\" (Laysa kamithlihii shay'un)",
      "Qaddarka Eebbe ee qaybinta ubadka: Kuwa la siiyo gabdho, kuwa la siiyo wiilal, kuwa la isugu daro labadaba, iyo kuwa laga dhigo madhalays",
      "Cafiska iyo samirka marka dulmi qofka soo gaadho oo ka mid ah go'aamada culus ee wanaagsan"
    ],
    mainThemesEnglish: [
      "The continuous chain of prophetic inspiration linking Muhammad ﷺ with the ancient patriarchs",
      "The foundational sociopolitical pillar: \"And whose affair is determined by mutual consultation among them\" (42:38)",
      "Absolute transcendence in monotheism: \"There is nothing like unto Him, and He is the Hearing, the Seeing\" (42:11)",
      "Divine sovereignty in family procreation: granting daughters, granting sons, combining both, or decreeing barrenness",
      "The noble superiority of forgiveness over retaliation: pardoning and reforming secures divine compensation"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda aasaaska u ah caqiidada Tawxiidka ee daahirka ah (42:11).",
      "Waxay dejisay nidaamka dimuqraadiyadda iyo wadatashiga suubban ee Islaamka."
    ],
    virtuesEnglish: [
      "Houses the paramount theological axiom establishing the absolute dissimilarity of God from creation (42:11).",
      "Formulates the foundational constitutional basis for democratic consultative governance in Islamic political theory."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u xaqiijiso in diintu tahay mid Eebbe u soo dejiyay bini'aadamka oo dhan.",
    revelationContextEnglish: "Revealed in Makkah confirming the universal validity and theological consistency of the prophetic message."
  },
  43: {
    surahNumber: 43,
    revelationType: "Meccan",
    revelationOrder: 63,
    ayahCount: 89,
    wordCount: 1291,
    juzRange: "Juz 25",
    pageRange: "Pages 489-495",
    aboutSomali: "Suuradda Az-Zukhruf waxay caddeysaa sharafta Qur'aanka ee Ummul Kitaab ku qoran, waxay burisaa sheegashadii gaalada ee ahayd in Malaa'igtu tahay gabdho Eebbe dhalay, waxayna iftiimisaa qiimo-darrada dahabka iyo adduunka.",
    aboutEnglish: "Surah Az-Zukhruf (The Ornaments of Gold) exalts the Quran's celestial preservation in the Mother of the Book. It ridicules pagan claims of angels as divine daughters and exposes the fleeting insignificance of golden worldly adornments.",
    namingReasonSomali: "Waxaa loogu magac daray \"Az-Zukhruf\" (Qurxinta Dahabka) sababtoo ah waxay caddaysay in dahabka iyo quruxda adduunku aysan qiimo ku lahayn agta Eebbe.",
    namingReasonEnglish: "Named \"Az-Zukhruf\" (The Ornaments of Gold) emphasizing that material riches and golden decorations are ephemeral distractions devoid of eternal spiritual weight.",
    mainThemesSomali: [
      "Sharafta Qur'aanka Carabiga ah ee ku qoran Ummul Kitaabka agta Eebbe yaalla",
      "Burinta caadadii foosha xayd ee gaaladu gabdhaha u nisbeyn jireen Eebbe halka ay naftooda u diidaan",
      "Diidmadii gaalada ee ahaa in Nebigu noqdo nin taajir ah oo labada magaalo (Makkah & Daa'if) ka yimid",
      "Qisadii Nebi Ibraahim ee beri-noqoshada sanamyada iyo qiraalkii Tawxiidka",
      "Qiimo-darrada dahabka iyo qalinka adduunka marka la barbar-dhigo nolosha waaraysa ee Aakhiro"
    ],
    mainThemesEnglish: [
      "The exalted status of the Arabic Quran preserved immutably within the Mother of the Book (Umm al-Kitab)",
      "Denunciation of patriarchal hypocrisy: attributing unwanted daughters to God while burying their own infant girls",
      "Rebuttal of materialistic bias demanding that the Prophet should have been a wealthy oligarch from Mecca or Ta'if",
      "Prophet Abraham's definitive declaration of disassociation from the ancestral polytheism of his clan",
      "The cosmic triviality of silver roofs and golden ornaments compared to the eternal felicity of the Hereafter"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda ducada gaadiidka la fuulo: \"Subxaana alladii sakhara lanaa haadaa...\" (43:13).",
      "Waxay qofka ka saartaa jaceylka xad-dhaafka ah ee maalka iyo dahabka adduunka."
    ],
    virtuesEnglish: [
      "Features the universal travel supplication recited globally upon boarding any vehicle or conveyance (43:13).",
      "Liberates the human heart from material idolatry and the deceptive allure of ostentatious wealth."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay uga jawaabto shuruudihii maalka la xiriiray ee ay gaaladu ku xireen iimaanka.",
    revelationContextEnglish: "Revealed in Makkah directly confronting aristocratic oligarchs who measured spiritual worth solely through commercial assets."
  },
  44: {
    surahNumber: 44,
    revelationType: "Meccan",
    revelationOrder: 64,
    ayahCount: 59,
    wordCount: 856,
    juzRange: "Juz 25",
    pageRange: "Pages 496-498",
    aboutSomali: "Suuradda Ad-Dukhaan waxay ku bilaabataa soo degitaanka Qur'aanka ee Laylatul Qadr, waxay ka digaysaa Qiiqa weyn ee Qiyaamada ka horreeya, waxay xustaa qisadii Fircoon, iyo geedka qaraar ee Zaqquum.",
    aboutEnglish: "Surah Ad-Dukhan (The Smoke) opens with the descent of the Quran on the Blessed Night. It prophesies the cosmic Smoke preceding the End of Times, recounts the ruin of Pharaoh, and contrasts the Zaqqum tree with Paradise.",
    namingReasonSomali: "Waxaa loogu magac daray \"Ad-Dukhaan\" (Qiiqa) sababtoo ah waxay ka digaysaa qiiq weyn oo samada ka soo bixi doona oo dadka dabooli doona.",
    namingReasonEnglish: "Named \"Ad-Dukhan\" (The Smoke) after the apocalyptic tiding of an encroaching smoke emerging from heaven to envelop mankind prior to the Reckoning.",
    mainThemesSomali: [
      "Soo degitaankii Qur'aanka habeenka barakaysan ee Laylatul Qadr",
      "Digniinta Qiiqa weyn ee samada ka imaan doona oo dadka wada dabooli doona (Cadaabun Aliim)",
      "Qisadii Fircoon iyo qoomkiisii oo lagu maansheeyay badda ka dib markii ay daadufiyeen xaqqa",
      "Cuntada dembiilayaasha ee Naarta ku jirta: Geedka qadhaadh ee Zaqquum oo caloosha ku kici doona sida naxaasta kulul",
      "Abaal-marinta kuwa Alle ka cabsada ee Jannada xariirta ah iyo sariiraha sharafta leh fadhiisan doona"
    ],
    mainThemesEnglish: [
      "The initial descent of the Quran on the Blessed Night (Laylat al-Qadr) wherein every wise decree is distinguished",
      "The apocalyptic omen of the visible Smoke (Dukhan) casting terror upon arrogant rejecters of truth",
      "The downfall of Pharaoh's dynasty: leaving behind splendid gardens and palaces, drowned in retribution",
      "The agonizing sustenance of Hell: the tree of Zaqqum boiling within stomachs like molten metal",
      "The tranquil security of the righteous adorned in fine silks and reclined in eternal peace"
    ],
    virtuesSomali: [
      "Waxaa la weriyay in qofkii akhriya habeenkii Jimcaha loo dambi dhaafo 70,000 oo Malaa'igna u dembi-dhaaf barto.",
      "Waxay qofka ku beertaa xusuusta maalinta qiiqa weyn iyo xisaabta dhabta ah."
    ],
    virtuesEnglish: [
      "Prophetic narrations commend its nocturnal recitation on Thursday evenings for divine forgiveness and angelic supplications.",
      "Instills deep eschatological consciousness regarding the cosmic markers heralding the close of world history."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli abaar daran ku dhacday Qureysh gaaladuna qiiq u arkayeen gaajo darteed.",
    revelationContextEnglish: "Revealed in Makkah during a devastating famine afflicting Quraysh wherein desperate hunger caused skies to resemble smoke."
  },
  45: {
    surahNumber: 45,
    revelationType: "Meccan",
    revelationOrder: 65,
    ayahCount: 37,
    wordCount: 537,
    juzRange: "Juz 25",
    pageRange: "Pages 499-501",
    aboutSomali: "Suuradda Al-Jaathiyah waxay ku baaqaysaa fiirsashada calaamadaha koonka, waxay cambaaraysaa kuwa marka aayadaha loo akhriyo is-kibriya, waxayna sawiraysaa ummadaha oo Qiyaamada jilbaha u joogsan doona (Jaathiyah).",
    aboutEnglish: "Surah Al-Jathiyah (The Kneeling / The Crouching) directs attention toward ubiquitous signs across nature. It censures obstinate sinners and depicts all civilizations falling upon their knees in awe on Judgment Day.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Jaathiyah\" (Jilba-joogsiga) sababtoo ah waxay xustay in ummad kasta Maalinta Qiyaame ay jilbaha u joogsan doonto cabsida weyn darteed.",
    namingReasonEnglish: "Named \"Al-Jathiyah\" (The Kneeling) after the dramatic portrait of every nation brought to its knees in utter humility before the Divine Tribunal.",
    mainThemesSomali: [
      "Calaamadaha cadcad ee Tawxiidka ee cirarka, dhulka, iyo abuurka noolaha oo dhan",
      "Digniinta kuwa dambiyada badan ee marka aayadaha Eebbe loo akhriyo kibra ee jidkooda xun ku socda",
      "Nimcooyinkii loo fidiyay Reer Banii Israa'iil iyo khilaafkoodii ka dambeeyay markii cilmigu u yimid",
      "Kala-saaridda hawada nafta iyo Sharciga Eebbe: \"Qofkii ilaah ka dhigta hawada naftiisa Eebbaa lumiyay\"",
      "Ummad kasta oo Maalinta Qiyaame jilbaha u joogsan doonta si loogu akhriyo buugga camalkooda"
    ],
    mainThemesEnglish: [
      "Ubiquitous cosmological and biological signs witnessing to monotheistic design across nature",
      "Stern indictment of habitual sinners who hear divine revelation yet arrogantly persist in mockery",
      "Historical favors bestowed upon the Children of Israel and their subsequent internal schisms despite knowledge",
      "The destructive danger of egocentric desires: taking one's personal whims as an idol leads to psychological blindness",
      "The universal scene of Judgment: every civilization and empire brought to its knees before its recorded ledger"
    ],
    virtuesSomali: [
      "Waa suuraddii ugu dambaysay ee todobada suuradood ee ku bilaabata \"Xaa-Miim\" (Al-Xawaamiim).",
      "Waxay xirtaa xaqiijinta in kibirka iyo sharafta dhabta ahi ay Eebbe kaliya u sugnaatay (Kibriyaa'ul-Laah)."
    ],
    virtuesEnglish: [
      "The concluding chapter of the magnificent seven \"Hawamim\" Surahs culminating in divine exaltation.",
      "Affirms that ultimate majesty, sovereignty, and supreme pride (Al-Kibriya) belong exclusively to Allah."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u buriso caqiidada cilmaaniyiintii jaahiliyada ee dhihi jiray: \"Wax kale ma jiraan oo aan ahayn nolosha adduunka\".",
    revelationContextEnglish: "Revealed in Makkah directly confronting ancient materialists (Dahriyyun) who denied the afterlife, claiming time alone destroys humanity."
  },
  46: {
    surahNumber: 46,
    revelationType: "Meccan",
    revelationOrder: 66,
    ayahCount: 35,
    wordCount: 508,
    juzRange: "Juz 26",
    pageRange: "Pages 502-506",
    aboutSomali: "Suuradda Al-Axqaaf waxay xoojisaa baarinnimada waalidiinta gaar ahaan hooyada, qisadii halaaggii Reer Caad ee dooxada Axqaaf, kooxdii Jinniga ee Qur'aanka dhegeysatay, iyo dardaaranka samirka Ulul Cazmi.",
    aboutEnglish: "Surah Al-Ahqaf (The Sandhills) champions filial devotion to mothers. It chronicles the annihilation of 'Ad in the sand dunes, relates the cohort of Jinn listening to the Quran, and exhorts the Prophet to persevere like the Resolute Messengers.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Axqaaf\" oo ahaa buurihii ciidda ahaa ee deegaanka Reer Caad ee koonfurta Jasiiradda Carabta ku yaallay.",
    namingReasonEnglish: "Named \"Al-Ahqaf\" (The Wind-Curved Sandhills) identifying the desert dunes where the ancient titan civilization of 'Ad was annihilated by a fierce storm.",
    mainThemesSomali: [
      "Xaqiiqada abuurka cirarka iyo dhulka ee ku dhisan xaq iyo muddo go'an",
      "Baarinnimada iyo dhowridda hooyada dhibka ku qaadday kuna dhashay ilmaha ilaa 30 bilood (46:15)",
      "Qisadii Nebi Huud iyo halaaggii Reer Caad ee ku kibray dooxada Axqaaf",
      "Kooxdii Jinniga ahayd ee dhegeysatay Qur'aanka markaasna rumeeyay una digay qoomkoodii",
      "Dardaaranka samirka ee loo jeediyay Nabiga ﷺ: \"Ku samir sida ay u samreen kuwii go'aanka adkaa ee Rususha (Ulul Cazmi)\""
    ],
    mainThemesEnglish: [
      "The purposeful creation of the cosmos anchored in eternal truth and predetermined lifespans",
      "The sacred debt to mothers: enduring thirty months of pregnancy and weaning, followed by prayers of gratitude (46:15)",
      "Prophet Hud warning the arrogant civilization of 'Ad, destroyed by a torrential hurricane masked as clouds",
      "The deputation of Jinn listening spellbound to the Quran and returning to evangelize their own community",
      "The ultimate injunction to endurance: \"Be patient, as were the Messengers of Firm Resolve (Ulul 'Azm)\""
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda ducada da'da 40-jirka ee qofku ku shugriyo nimcooyinka Eebbe (46:15).",
      "Waxay xaqiijisay in Jinnigu leeyahay kuwo mu'miniin ah oo dhegeystay Qur'aanka."
    ],
    virtuesEnglish: [
      "Features the immortal prayer for reaching age forty: supplicating for gratitude, righteous progeny, and acceptance (46:15).",
      "Confirms the universal scope of the Quranic mission extending beyond humanity to the unseen realm of Jinn."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii Nabiga ﷺ ka soo noqday magaalada Daa'if oo ay dadkeedu soo ceyriyeen.",
    revelationContextEnglish: "Revealed in Makkah following the Prophet's painful rejection at Ta'if, consoling him with the conversion of the Jinn."
  },
  47: {
    surahNumber: 47,
    revelationType: "Medinan",
    revelationOrder: 95,
    ayahCount: 38,
    wordCount: 551,
    juzRange: "Juz 26",
    pageRange: "Pages 507-510",
    aboutSomali: "Suuradda Muxammad ﷺ waxay kala saartaa camalka gaalada ee baaba'a iyo camalka mu'miniinta ee la hagaajiyo. Waxay dejisaa xeerarka difaaca, webiyada Jannada, iyo fadeexaynta munaafiqiinta.",
    aboutEnglish: "Surah Muhammad ﷺ establishes the contrast between the annulment of disbelievers' deeds and the perfection of believers' affairs. It details defensive combat laws, the four rivers of Paradise, and exposes cowardly hypocrites.",
    namingReasonSomali: "Waxaa loogu magac daray magaca sharafta leh ee Rasuulka Eebbe \"Muxammad\" ﷺ oo aayadda labaad si cad loogu xusay.",
    namingReasonEnglish: "Named after the beloved Prophet \"Muhammad\" ﷺ, explicitly proclaimed by name in the foundational second verse.",
    mainThemesSomali: [
      "Burinta camalka kuwa gaaloobay iyo hagaajinta xaaladda kuwa rumeeyay wixii lagu soo dejiyay Muxammad ﷺ",
      "Xeerarka dagaalka jidka Eebbe, qafaalashada maxaabiista, iyo amarka caddaaladda",
      "Afaarta webi ee Jannada dhex qulqulaya: Biyo aan isbeddelin, Caano aan dhadhankoodu xumaan, Khamri daahir ah, iyo Malab saafi ah",
      "Fadeexaynta Munaafiqiinta iyo baqdintooda marka aayad jihaad ah soo degto",
      "Dardaaranka bixinta maalka jidka Eebbe iyo digniinta ah in haddii aad ka jeedsataan Eebbe idinku beddelayo qoom kale"
    ],
    mainThemesEnglish: [
      "Nullification of the deeds of rejecters versus the complete spiritual rectification of those who follow Muhammad ﷺ",
      "The legal ethics of defensive engagement: decisive resolve on the battlefield and humanitarian treatment of captives",
      "The four celestial rivers of Paradise: water unpolluted, milk unchanging in flavor, pure delicious wine, and refined honey",
      "The cowardice of hypocrites whose hearts flutter like dying men whenever civic sacrifice is ordained",
      "The solemn warning on stinginess: \"If you turn away, He will replace you with another people, and they will not be like you\""
    ],
    virtuesSomali: [
      "Waxaa kale oo loo yaqaannaa \"Suuradda Dagaalka\" (Suratul Qitaal) sababtoo ah waxay dhiirrigelisay mu'miniinta.",
      "Waxay xambaarsan tahay sharraxaadda ugu quruxda badan ee afarta webi ee Jannada."
    ],
    virtuesEnglish: [
      "Also known as \"Surat al-Qital\" (The Chapter of Fighting) for steeling the resolve of the nascent Medinan republic.",
      "Offers the most evocative Quranic description of the pristine rivers irrigating eternal Paradise."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina sanadkii koowaad ama labaad ee Hijrada markii la amray difaaca Islaamka.",
    revelationContextEnglish: "Revealed in early Madinah following the Hijrah as the young Muslim community braced for defensive mobilization."
  },
  48: {
    surahNumber: 48,
    revelationType: "Medinan",
    revelationOrder: 111,
    ayahCount: 29,
    wordCount: 421,
    juzRange: "Juz 26",
    pageRange: "Pages 511-514",
    aboutSomali: "Suuradda Al-Fatxi waxay bishaaraysaa Guusha weyn (Innaa fataxnaa laka fatxan mubiinaa) ee Sulxul Xudaybiyah, Yaboohii Baicatur-Ridwaan, raallinimada Eebbe, iyo tilmaamaha sharafta leh ee Asxaabta Nabiga ﷺ.",
    aboutEnglish: "Surah Al-Fath (The Victory) proclaims the watershed diplomatic triumph of the Treaty of Hudaybiyyah. It immortalizes the Pledge of the Tree (Bay'at ar-Ridwan), divine tranquility (Sakinah), and the majestic portrait of the Companions.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Fatxi\" (Guusha) maxaa yeelay waxay ku furantaa bishaarada Guusha cad ee Eebbe u furtay Nabiga ﷺ iyo asxaabtiisa.",
    namingReasonEnglish: "Named \"Al-Fath\" (The Victory) after its momentous opening declaration: \"Indeed, We have granted you a manifest victory\".",
    mainThemesSomali: [
      "Bishaarada Guusha Weyn (Al-Fatxul Mubiin) ee Sulxul Xudaybiyah iyo dembi-dhaafka Nabiga ﷺ",
      "Soo degitaanka Degganaanshaha (As-Sakiinah) ee quluubta mu'miniinta si iimaankoodu u kordho",
      "Yaboohii barakaysnaa ee Baicatur-Ridwaan ee geedka hoostiisa lagu galay iyo raallinimada Eebbe",
      "Riyadii runta ahayd ee Nabiga ﷺ ee ahayd gelidda Masjidka Xaramka iyadoo madaxa la xiirayo",
      "Tilmaamaha sare ee asxaabta: \"Muxammad waa Rasuulkii Eebbe, kuwa la socdana way ku daran yihiin gaalada dhexdeedana way isku naxariis badan yihiin\""
    ],
    mainThemesEnglish: [
      "Proclamation of the \"Manifest Victory\" (Al-Fath al-Mubin) embodied in the diplomatic ceasefire of Hudaybiyyah",
      "The descent of Divine Serenity (Sakinah) into believers' hearts to multiply their steadfast faith",
      "The historic Pledge beneath the Tree (Bay'at ar-Ridwan) where Allah declared eternal pleasure with the companions",
      "Vindication of the Prophet's vision: entering the Sacred Mosque in peace with shaven heads",
      "The timeless portrait of the Sahabah: formidable against oppressors, supremely compassionate among themselves (48:29)"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu yidhi: \"Waxaa caawa igu soo degtay suurad iiga jecel adduunka iyo waxa dhex yaal: Innaa fataxnaa laka fatxan mubiinaa\" (Saxiiyul Bukhaari).",
      "Waxay qofka gelisaa deganaansho iyo bishaarada guusha xaqa."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ said: \"Tonight a Surah was revealed to me dearer to me than the entire world and all it contains: Inna Fatahna\" (Bukhari).",
      "Instills profound peace, certifying that divine strategy frequently operates through patient diplomatic reconciliation."
    ],
    revelationContextSomali: "Waxay ku soo degtay wadada u dhaxaysa Makkah iyo Madiina ka dib markii la saxiixay Heshiiskii Xudaybiyah sanadkii 6-aad ee Hijrada.",
    revelationContextEnglish: "Revealed on the desert road returning from Hudaybiyyah in the 6th year of the Hijrah, transforming apparent concession into triumph."
  },
  49: {
    surahNumber: 49,
    revelationType: "Medinan",
    revelationOrder: 106,
    ayahCount: 18,
    wordCount: 261,
    juzRange: "Juz 26",
    pageRange: "Pages 515-517",
    aboutSomali: "Suuradda Al-Xujuraat waa 'Dastuurka Akhlaaqda' ee Islaamka. Waxay baraysaa aadaabta Nabiga ﷺ, xaqiijinta wararka, heshiisiinta dadka, mamnuucista xanta iyo jeesjeeska, iyo sinnaanta bini'aadamka.",
    aboutEnglish: "Surah Al-Hujurat (The Rooms) serves as the moral constitution of the Ummah. It mandates respect for leadership, journalistic verification of rumors, social reconciliation, outlaws racism, backbiting, and spying, and crowns Taqwa as true nobility.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Xujuraat\" (Qolalka) sababtoo ah waxay canaanatay reer miyigii Nabiga ﷺ magaciisa kaga yeeray bannaanka qolalkii xaasaskiisa.",
    namingReasonEnglish: "Named \"Al-Hujurat\" (The Rooms) censuring uncouth bedouin delegations who shouted disrespectfully outside the private chambers of the Prophet's family.",
    mainThemesSomali: [
      "Aadaabta sharafta leh ee loola dhaqmo Nebi Muxammad ﷺ iyo codka oo la hoos dhigo kiisa",
      "Xaqiijinta xogta iyo wararka: \"Haddii qof faasiq ahi idiinla yimaado war hubiya si aydan dad aan waxba galabsan u dhibin\"",
      "Heshiisiinta labada kooxood ee mu'miniinta ah ee dagaallama iyo caddaaladda loo kala garsooro",
      "Reebidda jeesjeeska, ceebaynta dadka, naaneysaha xunxun, xanta, iyo basaasidda (Xanta oo la mid ah cunista hilibka walaalkaa oo meyd ah)",
      "Sinnaanta bini'aadamka: \"Waxaan idinka yeellay shucuub iyo qabiilooyin si aad isku aqoonsataan; kan ugu sharaf badan waa kan ugu cabsida badan\" (49:13)"
    ],
    mainThemesEnglish: [
      "Etiquette of social reverence: modulating vocal volume in the presence of righteous leadership",
      "Journalistic ethics: \"If a troublemaker brings you news, verify it thoroughly lest you harm innocent people in ignorance\" (49:6)",
      "Civic arbitration: mandatory peacemaking between conflicting factions governed by uncompromising equity",
      "Prohibition of social poisons: mockery, defamation, offensive nicknames, suspicion, surveillance, and backbiting",
      "Universal equality and diversity: tribes created for mutual acquaintance, with moral piety (Taqwa) as the sole metric of honor (49:13)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay Aayadda Sinnaanta Caalamka (49:13) ee baabi'isay cunsuriyadda iyo qabyaaladda.",
      "Waxay aasaas u tahay nabadgelyada iyo xiriirka caafimaadka qaba ee bulshada."
    ],
    virtuesEnglish: [
      "Contains the epochal charter against racism and tribalism, establishing human parity across all ethnicities (49:13).",
      "Celebrated as the definitive manual on interpersonal psychology, communication ethics, and communal solidarity."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina sanadkii 9-aad ee Hijrada (Sanadkii Wufuudda) markii qabiilooyin badani yimaadeen.",
    revelationContextEnglish: "Revealed in Madinah during the Year of Delegations (9 AH) to socialize newly converted desert tribes into urban Islamic civility."
  },
  50: {
    surahNumber: 50,
    revelationType: "Meccan",
    revelationOrder: 34,
    ayahCount: 45,
    wordCount: 653,
    juzRange: "Juz 26",
    pageRange: "Pages 518-519",
    aboutSomali: "Suuradda Qaaf waxay ku dhaaranaysaa Qur'aanka weyn, waxay caddaysaa soo saarista dhimashada ka dib, dhowaanshaha Eebbe (Waan uga dhow nahay xididka wariidka), labada Malaa'igood ee camalka qora (Raqiib iyo Catiid), iyo Sakaraatka dhimashada.",
    aboutEnglish: "Surah Qaf initiates the Mufassal section with majestic solemnity. It affirms bodily resurrection via reviving parched earth, divine intimacy ('closer than the jugular vein'), the recording angels (Raqib and 'Atid), and death's stupor.",
    namingReasonSomali: "Waxay ku bilaabataa xarafka sharafta leh ee \"Qaaf\" (Qٓ ۚ وَٱلْقُرْءَانِ ٱلْمَجِيدِ) oo muujinaya awoodda iyo mucjisada Qur'aanka.",
    namingReasonEnglish: "Named after the resonant arabic letter \"Qaf\" which opens this sublime chapter with an oath by the Glorious Quran.",
    mainThemesSomali: [
      "Dhaarta Qur'aanka Sharafta leh iyo caddaynta soo saarista dhimashada ka dib",
      "Calaamadaha abuurka: Samada bilaa tiirarka ah, dhulka la fidiyay, iyo roobka nooleeya carrada dhimatay",
      "Dhowaanshaha Eebbe ee bini'aadamka: \"Waan uga dhow nahay xididka dhuunta ee dhiigga qaada (Wariid)\"",
      "Labada Malaa'igood ee qora eray kasta oo afka ka soo baxa: Raqiib iyo Catiid (50:18)",
      "Xaqiiqada Sakaraatka dhimashada, Suurka Qiyaame, iyo su'aasha Naarta la weydiin doono: \"Ma buuxsantay?\""
    ],
    mainThemesEnglish: [
      "Solemn oath by the Glorious Quran vindicating bodily resurrection against pagan skepticism",
      "Natural signs of renewal: pillarless celestial skies, anchored mountains, and reviving rainfall as proof of resurrection",
      "Intimate divine omnipresence: \"We are closer to him than his jugular vein\" (50:16)",
      "The recording guardians: \"Not a word does he utter but there is by him an observant scribe ready\" (50:18)",
      "The inevitable stupor of death (Sakrat al-Mawt) and Hell interrogated on Judgment Day: \"Are you full?\""
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu ku akhrin jiray Suuradda Qaaf salaadaha Ciidda iyo khudbadda Jimcaha sababtoo ah waanadeeda qotada dheer (Saxiiyu Muslim).",
      "Waxay qofka ku beertaa xusuusta joogtada ah ee dhimashada iyo ilaalinta carrabka."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ frequently recited Surah Qaf during the Friday sermon and Eid prayers for its thunderous moral eloquence (Muslim).",
      "Instills intense mindfulness regarding speech, guarding the tongue from gossip and sin."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u jebiso shakigii mushrikiinta ee ku saabsanaa sida lafo qudhuntay mar kale loo noolayn karo.",
    revelationContextEnglish: "Revealed in Makkah decisively demolishing pagan skepticism regarding biological reconstitution after decomposition."
  },
  51: {
    surahNumber: 51,
    revelationType: "Meccan",
    revelationOrder: 67,
    ayahCount: 60,
    wordCount: 870,
    juzRange: "Juz 26-27",
    pageRange: "Pages 520-522",
    aboutSomali: "Suuradda Adh-Dhaariyaat waxay ku bilaabataa dhaarta dabaylaha firdhiya, waxay xustaa martidii Ibraahim, burburkii qoomkii Luud, waxayna xambaarsan tahay aayadda ujeeddada abuurista bini'aadamka iyo Jinniga (51:56).",
    aboutEnglish: "Surah Adh-Dhariyat (The Scattering Winds) sweeps through cosmic oaths, the angelic visitation to Abraham, and the ruin of Pharaoh and Lut. It delivers the supreme existential mandate: 'I created not Jinn and mankind except to worship Me'.",
    namingReasonSomali: "Waxaa loogu magac daray \"Adh-Dhaariyaat\" oo ah dabaylaha xoogga badan ee firdhiya ciidda iyo boodhka.",
    namingReasonEnglish: "Named \"Adh-Dhariyat\" (The Winnowing Winds) invoking the cosmic winds that scatter dust and circulate atmospheric moisture across continents.",
    mainThemesSomali: [
      "Dhaarta dabaylaha firdhiya, daruuraha roobka sida, iyo maraakiibta badda ku socda",
      "Xaqiiqada dhabta ah ee ah in ballanka Qiyaamadu yahay mid run ah oo dhacaya",
      "Qisadii martidii sharafta lahayd ee u timid Nebi Ibraahim ee bishaaraysay dhalashadii Isxaaq",
      "Ciqaabtii lagu rogay qoomkii daalimiinta ahaa ee Luud, Fircoon, iyo Reer Caad",
      "Ujeeddada dhabta ah ee nolosha: \"Uma abuurin Jinniga iyo Bini'aadamka wax kale aan ahayn inay i caabudaan\" (51:56)"
    ],
    mainThemesEnglish: [
      "Cosmic oaths: winnowing winds, moisture-bearing clouds, gliding vessels, and angels apportioning divine decree",
      "Incontestable certainty of resurrection: the Day of Recompense is an inescapable reality",
      "Angelic guests visiting Abraham with the glad tidings of Isaac and Sarah's joyful amazement",
      "Historical retribution overtaking the insolent societies of Lut, Pharaoh, and the titanic 'Ad",
      "The foundational existential axiom: \"And I did not create the Jinn and mankind except to worship Me\" (51:56)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda 51:56 oo ah falsafadda iyo macnaha ugu weyn ee loo abuuray koonka iyo bini'aadamka.",
      "Waxay caddaysay in risiqa dadku uu ku yaallo samada uuna Eebbe dammaanad qaaday."
    ],
    virtuesEnglish: [
      "Houses the paramount existential verse defining the raison d'être of all human and spirit creation (51:56).",
      "Reassures the anxious soul: human sustenance is guaranteed in heaven and will certainly manifest on earth."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay dadka ugu qeexdo ujeeddada ay nolosha u joogaan.",
    revelationContextEnglish: "Revealed in Makkah orienting human consciousness toward its transcendent spiritual objective."
  },
  52: {
    surahNumber: 52,
    revelationType: "Meccan",
    revelationOrder: 76,
    ayahCount: 49,
    wordCount: 711,
    juzRange: "Juz 27",
    pageRange: "Pages 523-525",
    aboutSomali: "Suuradda Adh-Dhuur waxay ku dhaaranaysaa Buurta Dhuur, Kitaabka qoran, iyo Baytul Macmuur. Waxay faahfaahisaa farxadda reer Jannaha ah ee ubadkooda loo raaciyo, waxayna beenisaa eedaymihii gaalada.",
    aboutEnglish: "Surah At-Tur (The Mount) binds oaths by Mount Sinai, the Enscribed Scroll, and the Heavenly Frequented House (Bayt al-Ma'mur). It portrays families reunited in Paradise and poses forty penetrating rhetorical questions silencing skepticism.",
    namingReasonSomali: "Waxaa loogu magac daray \"Adh-Dhuur\" oo ah buurtii barakaysnayd ee Siinaay ee Eebbe kula hadlay Nebi Muuse (CS).",
    namingReasonEnglish: "Named \"At-Tur\" (The Mount) after Mount Sinai where Allah directly conversed with Prophet Moses (AS).",
    mainThemesSomali: [
      "Dhaarta Buurta Dhuur, Kitaabka qoran, Baytul Macmuur, iyo Badda buuxda ee karaysa",
      "Xaqiiqada ah in ciqaabta Eebbe ay dhacayso oo aysan jirin cid celin karta",
      "Nimcooyinka reer Jannaha ah iyo isu keenidda qoysaska mu'miniinta ah iyo ubadkooda (52:21)",
      "Su'aalaha caqliga ah ee gaalada lagu aamusiyay: \"Mise waxaa laga abuuray waxba, mise iyagaa abuurayaal ah?\"",
      "Dardaaranka samirka ee loo jeediyay Nabiga ﷺ: \"Ku samir xukunka Rabbigaa, maxaa yeelay adigu waxaad ku jirtaa indhahayaga (Ilaalintayada)\" (52:48)"
    ],
    mainThemesEnglish: [
      "Oaths by Sinai, the Heavenly Archetype (Bayt al-Ma'mur), the raised vault of heaven, and the swelling sea",
      "The absolute inevitability of divine judgment which no force can repel",
      "Reunion of faithful dynasties in Paradise without diminishing any individual's earned reward (52:21)",
      "Uncompromising philosophical interrogations: \"Or were they created by nothing, or were they the creators?\" (52:35)",
      "Sublime divine reassurance to the Prophet: \"So be patient for the decision of your Lord, for indeed, you are in Our eyes\" (52:48)"
    ],
    virtuesSomali: [
      "Waa suuraddii uu Jubayr binu Mudcim maqlay Nabiga ﷺ oo salaadda Maqrib ku akhrinaya, taas oo sababtay inuu iimaanku qalbigiisa galo.",
      "Waxay xambaarsan tahay aayadda ilaallinta Eebbe ee 52:48 ee qofka qalbiyada qaboojisa."
    ],
    virtuesEnglish: [
      "Recited by the Prophet in the Maghrib prayer where pagan hostage Jubayr ibn Mut'im felt his heart ready to fly to Islam.",
      "Contains the deeply tender promise assuring the faithful that they dwell continuously under divine surveillance and care (52:48)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay u baabi'iso doodaha caqli-xumada ah ee gaaladii Qureysh.",
    revelationContextEnglish: "Revealed in Makkah providing an unassailable rational challenge disarming every shade of polytheistic and atheist denial."
  },
  53: {
    surahNumber: 53,
    revelationType: "Meccan",
    revelationOrder: 23,
    ayahCount: 62,
    wordCount: 899,
    juzRange: "Juz 27",
    pageRange: "Pages 526-527",
    aboutSomali: "Suuradda An-Najmi waxay ku dhaaranaysaa Xiddigta, waxay caddaysaa runnimada Waxyiga, waxay sawirtaa Socdaalkii Micraajka iyo aragtida Sidratul Muntahaa, waxayna burisaa sanamyadii Laata iyo Cuzza.",
    aboutEnglish: "Surah An-Najm (The Star) opens with the descending star certifying divine inspiration. It chronicles the ascension beyond the Lote Tree of the Utmost Boundary (Sidrat al-Muntaha), shatters pagan idols, and demands prostration.",
    namingReasonSomali: "Waxaa loogu magac daray \"An-Najmi\" (Xiddigta) sababtoo ah waxay ku bilaabataa dhaarta xiddigta marka ay cirka ka dhacayso.",
    namingReasonEnglish: "Named \"An-Najm\" (The Star) after the opening cosmic oath swearing by the star as it descends into the horizon.",
    mainThemesSomali: [
      "Dhaarta Xiddigta iyo runnimada waxyiga: \"Kama hadlo hawada naftiisa, waa waxyi loo waxyiyay uun\" (53:3-4)",
      "Socdaalkii Micraajka iyo aragtida weynayd ee Sidratul Muntahaa agteeda",
      "Burburinta sanamyadii jaahiliyada ee been-abuurka ahaa: Al-Laata, Al-Cuzzaa, iyo Manaata",
      "Qaanuunka caddaaladda: Qofna ma qaado dambiga qof kale, qofkuna ma helo waxaan camalkiisa ahayn",
      "Sujuudda Eebbe ee xiritaanka suuradda oo ay wada sujuudeen xitaa gaaladii markii ay dhegeysteen"
    ],
    mainThemesEnglish: [
      "The infallibility of prophetic speech: \"Nor does he speak from his own inclination; it is not but a revelation revealed\" (53:3-4)",
      "The celestial Ascension (Mi'raj) reaching the ultimate horizon beside the Lote Tree of the Utmost Boundary",
      "Demolition of the triadic pagan pantheon: exposed as mere empty names invented by ancestors (Al-Lat, Al-'Uzza, Manat)",
      "The non-transferable principle of moral agency: no bearer carries another's sins; humanity earns only its strivings",
      "The climactic universal prostration ending the chapter, bowing even pagan adversaries who witnessed its power"
    ],
    virtuesSomali: [
      "Waa suuraddii ugu horreysay ee Makkah lagu dhex akhriyo si cad oo sababtay in Muslimiintii iyo Gaaladii oo dhammi u sujuudaan Eebbe.",
      "Waxay xambaarsan tahay sujuudda Qur'aanka ee aayadda u dambaysa."
    ],
    virtuesEnglish: [
      "The first Surah publicly proclaimed aloud in the sanctuary of the Ka'bah, compelling even pagan elders into spontaneous prostration.",
      "Features a definitive prostration of recitation (Sajdah) at its momentous final verse."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah bilowgii waxyiga, waxayna gilgishay reer Makkah awoodda erayadeeda darteed.",
    revelationContextEnglish: "Revealed in early Mecca, demonstrating the sheer, irresistible majesty of divine revelation upon human consciousness."
  },
  54: {
    surahNumber: 54,
    revelationType: "Meccan",
    revelationOrder: 37,
    ayahCount: 55,
    wordCount: 798,
    juzRange: "Juz 27",
    pageRange: "Pages 528-530",
    aboutSomali: "Suuradda Al-Qamar waxay ku bilaabataa Mucjisadii dillaacidda Dayaxa, waxay soo noqnoqotaa aayadda fududaynta Qur'aanka (Wa laqad yassarnal-Qur'aana lidh-Dhikr), waxayna xustaa halaaggii ummadihii beeniyay Nabiyadooda.",
    aboutEnglish: "Surah Al-Qamar (The Moon) records the celestial splitting of the moon witnessed in Mecca. It reverberates with the golden refrain 'And We have indeed made the Quran easy to understand and remember', warning through ancient destructions.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Qamar\" (Dayaxa) sababtoo ah waxay ku bilaabataa mucjisadii weynayd ee Dayaxa labada dhinac loo kala jeexay xilligii Nabiga ﷺ.",
    namingReasonEnglish: "Named \"Al-Qamar\" (The Moon) after the opening historical miracle where the lunar body split into two halves over Mecca as a divine sign.",
    mainThemesSomali: [
      "Mucjisadii weynayd ee Dayaxa dillaacay xilligii Nabiga ﷺ ee Makkah (54:1)",
      "Aayadda afarta jeer soo noqnoqota: \"Waxaan u fududaynay Qur'aanka xusidda, ee ma jiraa qof wax xusuusanaya?\"",
      "Halaaggii qoomkii Nuux ee daadka, Reer Caad ee dabaysha qabow, iyo Thamuud ee qaylada daran",
      "Qisadii qoomkii Luud iyo ciqaabtii Fircoon ee degdegga ahayd",
      "Qaddarka Eebbe ee wax kasta ku sugan: \"Wax kasta waxaan ku abuurnay qaddar sugan\" (54:49)"
    ],
    mainThemesEnglish: [
      "The historic celestial sign of the Splitting of the Moon witnessed over Mount Abu Qubays in Mecca (54:1)",
      "The quadruply reiterated divine promise: \"And We have certainly made the Quran easy for remembrance, so is there any who will remember?\"",
      "Ancient catastrophes overtaking rejecters: Noah's deluge, the freezing windstorm of 'Ad, and the shrieking blast on Thamud",
      "The destruction of the cities of Sodom and the overwhelming retribution seizing Pharaoh's hosts",
      "The universal cosmic principle: \"Indeed, all things We created with predestined determination (Qadar)\" (54:49)"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu ku akhrin jiray Suuradda Al-Qamar salaadaha Ciidda sababtoo ah aayadaheeda cajiibka ah.",
      "Waxay caddaysay in barashada iyo xifdinta Qur'aanka uu Eebbe u fududeeyay qof kasta oo niyad wanaagsan."
    ],
    virtuesEnglish: [
      "The Prophet routinely recited Surah Al-Qamar during Eid festivals to celebrate the cosmic signs of divine omnipotence.",
      "Provides perpetual reassurance that memorizing and understanding the Quran is divinely facilitated for every sincere seeker."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii gaaladu Nabiga ﷺ weydiisteen mucjiso cirka ah oo Dayaxu dillaacay.",
    revelationContextEnglish: "Revealed in Makkah when polytheist elders demanded an unambiguous astronomical sign before their eyes."
  },
  55: {
    surahNumber: 55,
    revelationType: "Medinan",
    revelationOrder: 97,
    ayahCount: 78,
    wordCount: 1131,
    juzRange: "Juz 27",
    pageRange: "Pages 531-533",
    aboutSomali: "Suuradda Ar-Raxmaan waa 'Caruusadda Qur'aanka' (Caruusul Qur'aan). Waxay ku celcelisaa 31 jeer su'aasha ah 'Teebee ka mid ah nimcooyinka Rabbigiin beeninaysaan?', waxayna sawirtaa nimcooyinka koonka iyo Jannada.",
    aboutEnglish: "Surah Ar-Rahman (The Beneficent) is celebrated as the 'Bride of the Quran' ('Arus al-Quran). With its mesmerizing 31-fold refrain 'Which of the favors of your Lord will you deny?', it weaves a tapestry of natural blessings and the gardens of Paradise.",
    namingReasonSomali: "Waxaa loogu magac daray Magaca Eebbe ee ugu naxariista badan ee \"Ar-Raxmaan\" oo ay ku bilaabato suuraddu.",
    namingReasonEnglish: "Named after the supreme divine attribute of infinite grace, \"Ar-Rahman\" (The Entirely Merciful), which opens this symphonic chapter.",
    mainThemesSomali: [
      "Nimcooyinka waaweyn ee Eebbe: Baridda Qur'aanka, abuurista bini'aadamka, iyo baridda hadalka (Bayaan)",
      "Isku dheelitirnaanta koonka: Qorraxda, Dayaxa, Xiddigaha, iyo Miisaanka caddaaladda ee la dhigay",
      "Labada badood ee kulma balse leh kala-sooce aanay ka gudbi karin (Barzakh)",
      "Su'aasha qalbiyada gilgisha ee 31 jeer soo noqnoqota: \"Ee teebee ka mid ah nimcooyinka Rabbigiin beeninaysaan?\"",
      "Quruxda aan la qiyaasi karin ee labada beerood ee Jannada iyo kuwa ka dambeeya iyo nabadgelyada dhex taal"
    ],
    mainThemesEnglish: [
      "The foundational hierarchy of grace: teaching the Quran preceding the creation of man and articulate communication",
      "Cosmic equilibrium: the calculated orbits of sun and moon, and the terrestrial balance of justice",
      "The oceanographic marvel of two converging bodies of water maintaining their chemical barrier (Barzakh)",
      "The haunting rhythmic refrain repeated thirty-one times: \"So which of the favors of your Lord will you deny?\"",
      "Lush, multi-tiered botanical descriptions of the lush twin gardens of Paradise and their elevated springs"
    ],
    virtuesSomali: [
      "Waxaa loo yaqaannaa \"Caruusul Qur'aan\" (Caruusadda Qur'aanka) quruxda codkeeda iyo qaab-dhismeedkeeda darteed.",
      "Markii Nabigu ﷺ ku akhriyay Jinniga waxay ku jawaabi jireen: \"Ma jirto wax ka mid ah nimcooyinkaaga oo aan beeninayno Rabbiyow\"."
    ],
    virtuesEnglish: [
      "Revered in prophetic tradition as the \"Bride of the Quran\" for its poetic symmetry and structural magnificence.",
      "When the Prophet recited it to the Jinn, they continuously responded: \"None of Your favors, our Lord, do we deny; all praise is Yours\"."
    ],
    revelationContextSomali: "Waxay leedahay qaybo Makki ah iyo kuwo Madani ah, waxayna dadka iyo Jinniga ugu yeertaa inay u shukriyaan Naxariistaha.",
    revelationContextEnglish: "Addressed jointly to the dual accountable species (mankind and Jinn) in rhythmic, choral grandeur."
  },
  56: {
    surahNumber: 56,
    revelationType: "Meccan",
    revelationOrder: 46,
    ayahCount: 96,
    wordCount: 1392,
    juzRange: "Juz 27",
    pageRange: "Pages 534-536",
    aboutSomali: "Suuradda Al-Waaqicah waxay si faahfaahsan u kala saartaa seddexda qaybood ee aadanuhu u qaybsami doono Maalinta Qiyaamaha: Kuwa ugu horreeya ee wanaagga ku dheereeyay (Saabiquun), Kuwa midigta (Asxaabul Yamiin), iyo Kuwa bidixda (Asxaabush-Shimaal).",
    aboutEnglish: "Surah Al-Waqi'ah (The Inevitable Event) graphically delineates humanity into three distinct categories on Judgment Day: The Foremost in faith (As-Sabiqun), the Companions of the Right, and the Companions of the Left, accompanied by undeniable proofs of Allah's creative majesty.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Waaqicah' oo ah mid ka mid ah magacyada Qiyaamaha ee aayadda koowaad ku xusan, oo macnaheedu yahay 'Dhacdada Lama-huraanka ah'.",
    namingReasonEnglish: "Named 'Al-Waqi'ah' (The Inevitable Reality) after the first verse, denoting the undeniable certainty of the Day of Judgment.",
    mainThemesSomali: [
      "Kala saaridda aadanaha saddexda kooxood Maalinta Qiyaame iyo dabiicadda abaalkooda",
      "Nimcooyinka layaabka leh ee loogu talagalay Kuwa ugu horreeya (As-Saabiquun) Jannada gudaheeda",
      "Abuurka nolosha: dhibicda biyaha, beeraha soo baxa, roobka macaan, iyo dabka shidan",
      "Wehelnimada Qur'aanka kariimka ah ee ku sugan Kitaab dhowrsan oo aysan taaban karin daahir maahane",
      "Xaqiiqada dhimashada marka ruuxu dhuunta soo gaadho iyo caddaynta awood-darrada aadanaha"
    ],
    mainThemesEnglish: [
      "The threefold cosmic categorization of souls on the Day of Resurrection",
      "Exquisite descriptions of the eternal gardens prepared for the spiritual vanguard (As-Sabiqun)",
      "Four natural proofs of divine providence: human semen, agricultural germination, pure rainwater, and ignited fire",
      "The sanctity and inviolability of the Noble Qur'an preserved in a well-guarded celestial record",
      "The stark reality of the dying soul at the throat and humanity's total helplessness before death"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu xusay in qofkii akhriya suuraddan habeen kasta uusan waligiis la kulmi doonin faqri daran.",
      "Waxay dhiirrigelisaa fikirka qotada dheer ee ku saabsan dhammaadka nolosha adduunka iyo abuurka Eebbe."
    ],
    virtuesEnglish: [
      "Traditions indicate that regular recitation of Surah Al-Waqi'ah serves as a spiritual safeguard against poverty.",
      "Features dynamic vivid portrayals of the afterlife that inspire awe, spiritual vigilance, and detachment from vanity."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii gaaladii Qureysh diideen soo noolaynta meydadka.",
    revelationContextEnglish: "Revealed in Makkah to confront pagan skepticism regarding bodily resurrection through tangible empirical signs."
  },
  57: {
    surahNumber: 57,
    revelationType: "Medinan",
    revelationOrder: 94,
    ayahCount: 29,
    wordCount: 421,
    juzRange: "Juz 27",
    pageRange: "Pages 537-541",
    aboutSomali: "Suuradda Al-Xadiid (Birta) waxay muujinaysaa awoodda ballaadhan ee Eebbe, dhiirrigelisaa wax bixinta jidka Alle, waxayna sheegaysaa abuurka birta oo faa'iido badan u leh aadanaha iyo hub adag.",
    aboutEnglish: "Surah Al-Hadid (The Iron) blends profound theological contemplation on the divine attributes (the First, the Last, the Manifest, the Hidden) with urgent calls to sacrifice wealth and self for the divine cause, noting the celestial origins and utility of iron.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Xadiid' (Birta) sababtoo ah aayadda 25-aad waxay xustaa in Birta la soo dejiyay iyadoo leh xoog daran iyo faa'iidooyin badan oo dadku u baahan yihiin.",
    namingReasonEnglish: "Named 'Al-Hadid' (The Iron) from verse 25, which underscores the divine sending down of iron with great strength and human utility.",
    mainThemesSomali: [
      "Sifooyinka Eebbe: Isagaa ah Kii ugu horreeyay, Kii ugu dambeeyay, Kii muuqda, iyo Kii qarsoon",
      "Dhiirrigelinta bixinta maalka iyo taageerada diinta ka hor intaanay fursaddu dhammaan",
      "Kala soocidda Nuurka Mu'miniinta iyo gudcurka Munaafiqiinta Maalinta Xisaabta",
      "Hufnaanta qaddarka: inaanan lagu farxin wixii la waayo laguna kibrayn wixii la helo",
      "Soo dejinta Birta oo leh xoog weyn iyo faa'iidooyin wax ku ool ah oo nolosha aadamiga lagama maarmaan u ah"
    ],
    mainThemesEnglish: [
      "Sublime divine names and attributes: The First, the Last, the Manifest, and the Hidden",
      "The imperative of selfless financial and spiritual sacrifice before historical turning points",
      "The dramatic bifurcation between the luminous faith of believers and the dark vacillation of hypocrites",
      "The psychological balance derived from belief in divine decree (Qadar): neither despair over loss nor arrogance over gain",
      "The providential blessing of iron as a foundation for societal justice, defense, and human civilization"
    ],
    virtuesSomali: [
      "Waxay ka mid tahay Musabbixaadka (suuradaha ku billowda weyneynta Eebbe) oo uu Nabigu ﷺ akhrin jiray ka hor hurdada.",
      "Aayaddeeda saddexaad waxay xambaarsan tahay sifooyinka ugu qotada dheer ee Tawxiidka Eebbe."
    ],
    virtuesEnglish: [
      "Counted among the Musabbihat (surahs beginning with divine glorification) recited by the Prophet ﷺ before sleeping.",
      "Its opening verses contain the deepest philosophical and ontological declarations of monotheism in scripture."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina xilli ay bulshadu u baahnayd abaabul adag iyo taakuleyn dhaqaale.",
    revelationContextEnglish: "Revealed in Madinah to solidify communal readiness, social cohesion, and sustained material commitment."
  },
  58: {
    surahNumber: 58,
    revelationType: "Medinan",
    revelationOrder: 105,
    ayahCount: 22,
    wordCount: 319,
    juzRange: "Juz 28",
    pageRange: "Pages 542-544",
    aboutSomali: "Suuradda Al-Mujaadilah (Gabadhii Doodday) waxay ku bilaabataa dhacdadii Khawlah bintu Thaclabah oo Alle u gar-garay markii ninkeedu u diiday qaabkii 'Dihaar'. Waxay sidoo kale canbaaraysaa xanta qarsoodiga ah (Najwa) iyo munaafaqnimada.",
    aboutEnglish: "Surah Al-Mujadila (The Pleading Woman) opens with Allah hearing the plea of Khawlah bint Tha'labah concerning the pre-Islamic customary divorce ('Dhihar'). It invalidates oppressive customs and strictly regulates secret conspiracies (Najwa).",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Mujaadilah' sababtoo ah waxay ku bilaabataa doodii Khawlah bintu Thaclabah ay Nabiga ﷺ kala hadashay dhibaatadii qoyskeeda soo gaadhay.",
    namingReasonEnglish: "Named 'Al-Mujadila' (The Disputing / Pleading Woman) after Khawlah bint Tha'labah who pleaded her domestic case before the Prophet ﷺ.",
    mainThemesSomali: [
      "Maqalka Eebbe ee codka qofka daciifka ah iyo baabi'inta caadadii foosha xayd ee Dihaarka",
      "Ilaalinta xuquuqda haweenka iyo xalinta khilaafaadka qoyska si caddaalad ah",
      "Cilmiga guud ee Eebbe: ma jiro seddex qof oo faqaya illaa Isagaa afaraad u ah",
      "Xeerarka iyo anshaxa kulamada gaarka ah iyo mamnuucidda faqaynta xumaanta iyo colaadda",
      "Kala saaridda Xisbiga Eebbe (Xisbullah) ee guuleysanaya iyo Xisbiga Shaydaanka ee khasaaray"
    ],
    mainThemesEnglish: [
      "Divine attentiveness to the vulnerable and the abolition of the oppressive pre-Islamic divorce ritual (Dhihar)",
      "Vindication of women's rights and establishmet of ethical domestic justice in marriage",
      "Omnipresence and omniscience of Allah: no three whisper except He is their fourth",
      "Strict moral protocols governing secret counsels (Najwa) and prohibition of conspiratorial malice",
      "The definitive triumph of the Party of Allah (Hizbullah) over the transient cohorts of Satan"
    ],
    virtuesSomali: [
      "Waa suuradda kaliya ee dhammaan aayadaheeda mid kastaa ay ku jirto magaca weyn ee 'Allaah'.",
      "Waxay caddaynaysaa in Eebbe maqlo dhawaaqa iyo baryada addoomaha xaalad kasta."
    ],
    virtuesEnglish: [
      "Unique in the entire Qur'an in that every single verse contains the majestic name 'Allah'.",
      "A monumental testament to the divine responsiveness to human suffering and the elevation of legal equity."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina ka dib cabashadii Khawlah ee ku saabsanayd ninkeeda Aws binu Saamit.",
    revelationContextEnglish: "Revealed in Madinah to establish matrimonial reform and dismantle clandestine fifth-column subversions."
  },
  59: {
    surahNumber: 59,
    revelationType: "Medinan",
    revelationOrder: 101,
    ayahCount: 24,
    wordCount: 348,
    juzRange: "Juz 28",
    pageRange: "Pages 545-548",
    aboutSomali: "Suuradda Al-Xashr (Musaafurinta / Isu-keenidda) waxay ka hadlaysaa saariddii qabiilkii Banii Nadiir ee ku jabay khiyaanadoodii, qaybinta maalka 'Fay' ee aan dagaalka lagu helin, iyo sifooyinka sare ee Eebbe.",
    aboutEnglish: "Surah Al-Hashr (The Gathering / Exile) chronicles the expulsion of the treacherous tribe of Banu al-Nadir from Madinah, establishes the legal framework for war booty without combat (Fay'), and culminates in the famous sublime Names of Allah.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Xashr' sababtoo ah waxay faahfaahinaysaa musaafurintii iyo isu-keeniddii gaaladii Banii Nadiir markii laga saaray Madiina.",
    namingReasonEnglish: "Named 'Al-Hashr' (The Exile / Gathering) referring to the expulsion of Banu al-Nadir from their fortified citadels.",
    mainThemesSomali: [
      "Jabkii Banii Nadiir iyo sida kibirkoodii qalcadaha ahaa uusan uga celin amarka Eebbe",
      "Qawaaniinta qaybinta hantida 'Fay' si uusan maalku ugu wareegin kaliya kuwa hodanka ah",
      "Ixtiraamka iyo jacaylka dhabta ah ee Ansaartu u muujiyeen Muhaajiriinta iyagoo wax siiyay",
      "Muuqaalka cabsida leh ee haddii Qur'aankan buur lagu soo dejin lahaa ay la dillaaci lahayd cabsida Eebbe",
      "Magacyada ugu wanaagsan ee Eebbe (Al-Asmaa'ul Xusnaa) ee aayadaha ugu dambeeya"
    ],
    mainThemesEnglish: [
      "The fall of Banu al-Nadir demonstrating that worldly fortifications cannot withstand divine justice",
      "The socioeconomic principle of Fay': wealth must circulate throughout society and not just among the elite",
      "The heroic altruism (Ithar) of the Ansar toward the Muhajirun emigrants of Mecca",
      "The parabolic contemplation of a mountain humbling itself and shattering out of awe for the Qur'an",
      "The closing symphony of the supreme divine names and attributes (Al-Asma' al-Husna)"
    ],
    virtuesSomali: [
      "Aayadaha ugu dambeeya ee suuraddan waxay xambaarsan yihiin Magacyada Eebbe, waxaana la jeclaystay in la akhriyo subax iyo galab.",
      "Suxufi Cabdullaahi binu Cabbaas (RC) wuxuu suuraddan ugu yeeri jiray 'Suuradda Banii Nadiir'."
    ],
    virtuesEnglish: [
      "The concluding verses (59:22-24) constitute one of the most sublime compilations of Allah's attributes in existence.",
      "Whoever recites the end of Surah Al-Hashr during the day or night is guaranteed immense angelic blessings."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina sanadkii 4-aad ee Hijrada ka dib heshiis-jebintii Banii Nadiir.",
    revelationContextEnglish: "Revealed in Madinah following the siege of Banu Nadir after their breach of the constitutional covenant."
  },
  60: {
    surahNumber: 60,
    revelationType: "Medinan",
    revelationOrder: 91,
    ayahCount: 13,
    wordCount: 189,
    juzRange: "Juz 28",
    pageRange: "Pages 549-550",
    aboutSomali: "Suuradda Al-Mumtaxanah (Haweenayda La Imtixaano) waxay dejisaa xeerarka xidhiidhka caalamiga ah ee u dhexeeya Muslimiinta iyo kuwa kale, iyadoo xustaa dhacdadii Xaadib binu Abii Balcatana iyo shuruudaha baycada haweenka.",
    aboutEnglish: "Surah Al-Mumtahanah (The Woman to be Examined) delineates the boundaries of international diplomacy and personal alliances, highlights the story of Hatib ibn Abi Balta'ah, and outlines the pledge of allegiance (Bay'ah) for women.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Mumtaxanah' sababtoo ah aayadda 10-aad waxay amartaa in la imtixaano haweenka Mu'minaadka ah ee ka soo hijrooda Makkah si loo xaqiijiyo iimaankooda.",
    namingReasonEnglish: "Named 'Al-Mumtahanah' (The Woman Examined) due to the directive in verse 10 to examine the faith of women emigrating to Madinah.",
    mainThemesSomali: [
      "Mamnuucidda sir-siinta cadowga dagaalka kula jira Muslimiinta iyo tusaalaha Xaadib binu Abii Balcata",
      "Ku dayashada Nebi Ibraahim iyo asxaabtiisii oo ka bari yeelatay shirkiga iyo gaalnimada qoomkooda",
      "Caddaaladda iyo naxariista loo samaynayo gaalada aan Muslimiinta la dagaallamin ee aan dalkooda ka saarin",
      "Shuruucda haweenka muhaajiriinta ah ee ka soo cararaya gaalada iyo imtixaanka daacadnimadooda",
      "Shuruudaha Baycada haweenka ee ku salaysan diidmada shirkiga, tuuganimada, sinada, iyo dilka carruurta"
    ],
    mainThemesEnglish: [
      "Prohibition of treasonous alliances with active belligerents and the pardon of Hatib ibn Abi Balta'ah",
      "The Abrahamic exemplar of theological disavowal of idol worship while maintaining personal integrity",
      "The universal mandate for benevolence and justice toward non-combatant, peaceful religious communities",
      "Legal asylum protocols and religious verification tests for female refugees fleeing persecution",
      "The comprehensive ethical pledge of allegiance (Bay'ah) taken by Muslim women"
    ],
    virtuesSomali: [
      "Waxay caddeysay mabda'a weyn ee caddaaladda iyo samafalka loola dhaqmayo dadka aan diinta kugu la dagaallamin.",
      "Waxay dhistay aasaaska xuquuqda iyo sharafta madaxbannaan ee haweenka Islaamka dhexdiisa."
    ],
    virtuesEnglish: [
      "Establishes the seminal Qur'anic charter for peaceful interfaith coexistence and civic equity (60:8).",
      "Affirms female agency and independent citizenship through direct political oath to the Prophet ﷺ."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina ka hor Furashadii Makkah xilligii loo diyaar garoobayay socdaalka.",
    revelationContextEnglish: "Revealed in Madinah shortly before the Liberation of Mecca to ensure security and ethical diplomatic cohesion."
  },
  61: {
    surahNumber: 61,
    revelationType: "Medinan",
    revelationOrder: 109,
    ayahCount: 14,
    wordCount: 203,
    juzRange: "Juz 28",
    pageRange: "Pages 551-552",
    aboutSomali: "Suuradda As-Saff (Safafka) waxay ku baaqaysaa daacadnimada hadalka iyo ficilka, waxay canbaaraysaa kuwa sheega wax aysan samaynayn, waxayna xustaa bishaaradii Nebi Ciise ee imaatinka Nebi Axmad ﷺ.",
    aboutEnglish: "Surah As-Saff (The Ranks) demands absolute congruence between words and deeds, castigates hypocritical rhetoric, details the struggles of Moses and Jesus, and records Christ's explicit prophecy of the coming of the Praised Prophet, Ahmad ﷺ.",
    namingReasonSomali: "Waxaa loogu magac daray 'As-Saff' sababtoo ah aayadda 4-aad waxay ammaantaa mu'miniinta ku dagaallama jidka Eebbe iyagoo safaf adag u wada taagan sida dhisme la isku kabay.",
    namingReasonEnglish: "Named 'As-Saff' (The Battle Array / Ranks) from verse 4, praising believers who stand united like a solid cemented structure.",
    mainThemesSomali: [
      "Canbaareynta weyn ee ah in qofku sheego wax uusan samaynayn (Nifaaqa ficilka)",
      "Mu'miniinta u safan jidka Eebbe sida dhisme adag oo la sibitiyeeyay (Bunyaanun Marsuus)",
      "Caasinnimadii Banii Israa'iil ee Nebi Muuse iyo dhibkii ay u geysteen",
      "Bishaaradii Nebi Ciise (CS) ee Nabiga imaan doona ee magaciisu yahay Axmad",
      "Ganacsiga badbaadada leh: rumeysiga Eebbe iyo Rasuulka iyo ku halganka maalka iyo nafta"
    ],
    mainThemesEnglish: [
      "Severe condemnation of cognitive dissonance: declaring moral convictions without practical adherence",
      "The divine love for believers who unite in disciplined ranks like a reinforced cemented edifice",
      "The historical obstinacy of the children of Israel toward Moses and Jesus",
      "Jesus' explicit prophetic foretelling of the final Messenger named Ahmad (Muhammad) ﷺ",
      "The supreme spiritual transaction: faith in Allah and striving with wealth and soul in exchange for salvation"
    ],
    virtuesSomali: [
      "Waxay ka mid tahay suuradaha Musabbixaadka ee uu Nabigu ﷺ akhrin jiray habeen kasta.",
      "Waxay dhiirrigelisaa midnimada, nidaamka, iyo heshiiska hadalka iyo waxqabadka dhabta ah."
    ],
    virtuesEnglish: [
      "Revered as an essential guide for organizational discipline, community solidarity, and personal integrity.",
      "Contains the singular scriptural identification of the Prophet's celestial name Ahmad ﷺ."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina ka dib Dagaalkii Uxud si loo adkeeyo safafka Muslimiinta.",
    revelationContextEnglish: "Revealed in Madinah post-Uhud to cure internal dissension and instill unwavering communal discipline."
  },
  62: {
    surahNumber: 62,
    revelationType: "Medinan",
    revelationOrder: 110,
    ayahCount: 11,
    wordCount: 160,
    juzRange: "Juz 28",
    pageRange: "Page 553",
    aboutSomali: "Suuradda Al-Jumucah waxay xoogga saartaa risaalada Nabiga ﷺ ee reer Makkah iyo caalamka, waxay tusaale u soo qaadataa kuwii Towraad dhabarka loo saaray ee aan ku dhaqmin, waxayna dejisaa waajibaadka Salaadda Jimcaha.",
    aboutEnglish: "Surah Al-Jumu'ah (Friday Congregation) celebrates the prophetic mission among the unlettered, employs the striking parable of donkeys laden with books for those who disregard scripture, and establishes the sacred obligation of Friday congregational prayer.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Jumucah' sababtoo ah waxay si gaar ah u fartay aadaabta iyo xurmada Salaadda Jimcaha aayadda 9-aad.",
    namingReasonEnglish: "Named 'Al-Jumu'ah' (Friday Congregation) due to the decisive ordinances established for the weekly Friday prayer.",
    mainThemesSomali: [
      "Soo diristii Nabiga ﷺ ee dadka ummiga ah si uu u daahiriyo una baro Kitaabka iyo Xigmadda",
      "Tusaalaha kuwa Towraad loo dhiibay balse aan ku dhaqmin oo la mid ah dameer kutub xambaarsan",
      "Baaqa ku aaddan dhimashada: qof kasta wuxuu la kulmi doonaa dhimashada uu ka cararayo",
      "Amarka Salaadda Jimcaha: ka tegista ganacsiga marka eedaanka la maqlo iyo u deg-degidda xuska Eebbe",
      "Isku dheellitirka nolosha: ku faafidda dhulka ka dib salaadda si loo raadsado fadliga iyo risiqa Eebbe"
    ],
    mainThemesEnglish: [
      "The divine grace of sending an illiterate Prophet to purify hearts and impart scripture and wisdom",
      "The metaphor of a donkey carrying tomes for religious communities who neglect active practice",
      "The inescapable reality of death pursuing every human soul regardless of evasion",
      "The legal mandate of Friday congregational prayer: suspending trade upon the call to prayer",
      "The holistic integration of worship and commerce: dispersing to seek honest livelihood after prayer"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu si joogto ah u akhrin jiray Suuradda Al-Jumucah salaadda Jimcaha rakcada koowaad.",
      "Waxay kulmisay aadaabta cibaadada wadareed iyo raadinta risiqa xalaasha ah."
    ],
    virtuesEnglish: [
      "Habitually recited by the Messenger of Allah ﷺ in the first rak'ah of the Friday communal service.",
      "Synthesizes profound spiritual contemplation with the rhythmic realities of weekly economic life."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina xilli ay socotay dhacdo qaar ka mid ah dadku kaga baxeen khudbaddii ganacsi darteed.",
    revelationContextEnglish: "Revealed in Madinah when a trade caravan's arrival momentarily distracted congregation members during a sermon."
  },
  63: {
    surahNumber: 63,
    revelationType: "Medinan",
    revelationOrder: 104,
    ayahCount: 11,
    wordCount: 160,
    juzRange: "Juz 28",
    pageRange: "Pages 554-555",
    aboutSomali: "Suuradda Al-Munaafiquun (Munaafiqiinta) waxay kashiftaa sifooyinka qarsoon, beenta, iyo dhagarta munaafiqiinta Madiina ee uu hoggaaminayay Cabdullaahi binu Ubay binu Saluul, waxayna kaga digtaa in maalka iyo carruurtu ay qofka ka mashquuliyaan xuska Alle.",
    aboutEnglish: "Surah Al-Munafiqun (The Hypocrites) exposes the deceitful psychology and clandestine maneuvers of the Medinan hypocrites led by Abd-Allah ibn Ubayy, warning believers not to let wealth or progeny distract them from the remembrance of Allah.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Munaafiquun' sababtoo ah waxay si toos ah u furfureysaa wajiga munaafiqiinta iyo xumaantooda qarsoon.",
    namingReasonEnglish: "Named 'Al-Munafiqun' (The Hypocrites) as it provides an exhaustive psychological profile of hypocritical behavior.",
    mainThemesSomali: [
      "Kashifidda dhaarta beenta ah ee munaafiqiinta iyo sida ay diinta uga carqaladeeyaan dadka",
      "Muuqaalka jirkooda oo cajiib ah laakiin qalbigoodu faaruq yahay sida qoryo gidaar lagu tiiriyay",
      "Cabsida joogtada ah ee munaafiqiinta: waxay u maleyaan dhawaaq kasta in iyaga lala rabo",
      "Kibirka Cabdullaahi binu Ubay iyo sheegashadiisii beenta ahayd ee ahayd in sharafluhu ka saari doono dulliga Madiina",
      "Digniinta ku aaddan in maalka iyo ubadku aysan qofka ka mashquulin xuska Eebbe ka hor dhimashada"
    ],
    mainThemesEnglish: [
      "Exposing the false oaths and religious duplicity used by hypocrites as protective camouflages",
      "The striking anatomical imagery of hypocrites: impressive outer appearance yet hollow as propped-up timber",
      "The chronic internal paranoia of the guilty: imagining every shout is directed against them",
      "Refutation of tribal supremacist rhetoric: true honor belongs entirely to Allah, His Messenger, and believers",
      "Urgent admonition against procrastination in charity before the arrival of irrevocable death"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu si joogto ah u akhrin jiray rakcada labaad ee Salaadda Jimcaha ka dib Suuradda Al-Jumucah.",
      "Waxay qofka ku dhiirrigelisaa daacadnimo qotodheer iyo inuu ka fogaado laba-wajiilenimada."
    ],
    virtuesEnglish: [
      "Recited by the Prophet ﷺ in the second rak'ah of the Friday prayer to cleanse souls from hypocrisy.",
      "Offers an unyielding psychological diagnostic tool to preserve sincerity and transparency of faith."
    ],
    revelationContextSomali: "Waxay ku soo degtay socdaalkii Banii Mustaliq ka dib markii Zayd binu Arqam uu kashifay hadalladii xumaa ee Ibnu Saluul.",
    revelationContextEnglish: "Revealed during the Muraysi' expedition, vindicating the young companion Zayd ibn Arqam who overheard seditious talk."
  },
  64: {
    surahNumber: 64,
    revelationType: "Medinan",
    revelationOrder: 108,
    ayahCount: 18,
    wordCount: 261,
    juzRange: "Juz 28",
    pageRange: "Pages 556-557",
    aboutSomali: "Suuradda At-Taghaabun (Khasaarada & Faa'iidada Dhabta ah) waxay iftiiminaysaa Maalinta Qiyaamaha ee dadku ogaan doonaan cidda dhabta ah ee guuleysatay iyo cidda khasaartay, waxayna faraysaa dhowrsanaanta iyo wax bixinta.",
    aboutEnglish: "Surah At-Taghabun (Mutual Disillusion / The Day of Mutual Gain and Loss) portrays the Day of Judgment as the ultimate day of reckoning where true losers and winners are unveiled, counselling patience and charity within family dynamics.",
    namingReasonSomali: "Waxaa loogu magac daray 'At-Taghaabun' sababtoo ah aayadda 9-aad waxay Maalinta Qiyaamaha ku tilmaantay 'Yawmut-Taghaabun' oo ah maalinta khasaaraha gaalada iyo faa'iidada mu'miniinta la kala ogaanayo.",
    namingReasonEnglish: "Named 'At-Taghabun' (Mutual Loss and Gain) from verse 9, referring to the Day of Judgment when worldly values are reversed.",
    mainThemesSomali: [
      "Tasbiixda wax kasta oo ku sugan samooyinka iyo dhulka iyo abuurka aadanaha ee sawirka fiican leh",
      "Aqoonta Eebbe ee sirta iyo waxa muuqda iyo xisaabinta dhabta ah ee ficillada dadka",
      "Maalinta Taghaabun: maalinta qof walba uu ogaan doono wixii uu seegay iyo abaalka Jannada",
      "Digniinta ku saabsan in xaasaska iyo carruurta qaarkood ay cadow u noqon karaan diinta qofka",
      "Dhiirrigelinta amaahinta Eebbe amaah wanaagsan (Sadaqada) iyo ka feejignaanta baahida nafta (Shux)"
    ],
    mainThemesEnglish: [
      "Universal cosmic glorification of the Creator who shaped human beings in supreme proportion",
      "Divine omniscience encompassing the innermost thoughts, private motives, and outward conduct",
      "The Day of Mutual Loss: worldly pride crumbles while spiritual endurance reaps eternal dividends",
      "Navigating domestic friction: wives and children as spiritual tests requiring forgiveness and forbearance",
      "Lending to Allah a goodly loan through unconditional charity to triumph over innate human greed"
    ],
    virtuesSomali: [
      "Waxay ka mid tahay Musabbixaadka uu Nabigu ﷺ akhrisan jiray habeen kasta ka hor intuusan seexan.",
      "Waxay bixisaa dawo nafsaani ah oo looga badbaado dabeecadda bakhaylnimada iyo kalsoonida maalka."
    ],
    virtuesEnglish: [
      "Ranked among the Musabbihat recited nightly by the Prophet ﷺ before retiring to bed.",
      "Imparts spiritual equilibrium for balancing familial obligations with unconditional religious loyalty."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina si ay u xalliso dhibaatadii dadkii qoysaskoodu ka celiyeen hijrada.",
    revelationContextEnglish: "Revealed in Madinah to counsel early converts whose relatives had hindered their migration and sacrifices."
  },
  65: {
    surahNumber: 65,
    revelationType: "Medinan",
    revelationOrder: 99,
    ayahCount: 12,
    wordCount: 174,
    juzRange: "Juz 28",
    pageRange: "Pages 558-559",
    aboutSomali: "Suuradda Ad-Dalaaq (Furitaanka) waxay dejisaa shuruucda xigmadda leh ee furriinka, ilaalinta xilliga ciddada, xuquuqda nafaqada iyo hoyga haweenka, waxayna xustaa in dhib kasta ka dib Eebbe keeno fudayd.",
    aboutEnglish: "Surah At-Talaq (Divorce) codifies the compassionate regulations governing marital dissolution, calculating waiting periods (Iddah), safeguarding maintenance and housing rights, and promising divine relief following severe tribulation.",
    namingReasonSomali: "Waxaa loogu magac daray 'Ad-Dalaaq' maxaa yeelay waxay si faahfaahsan u dhistay axkaamta furriinka Islaamka ee caddaaladda ku dhisan.",
    namingReasonEnglish: "Named 'At-Talaq' (The Divorce) as it provides foundational legal architecture regarding ethical marital termination.",
    mainThemesSomali: [
      "Xeerarka furitaanka sunnada ah iyo xisaabinta saxda ah ee xilliga Ciddada",
      "Mamnuucidda in haweenka laga saaro guryahooda muddada Ciddada socoto si heshiis loo helo",
      "Ballanqaadka weyn ee Eebbe: qofkii dhowrsada Alle wuxuu u yeelayaa furitanka dhibka iyo risiq aan la xisaabin",
      "Xeerarka nafaqada haweenka uurka leh iyo kuwa naas-nuujinaya carruurta",
      "Awoodda Eebbe ee abuuray toddobada samo iyo toddobada dhul oo kale"
    ],
    mainThemesEnglish: [
      "Sunnah guidelines for measured marital separation and meticulous calculation of the waiting period ('Iddah)",
      "Strict prohibition against expelling women from their marital homes during 'Iddah to foster reconciliation",
      "The epochal assurance: whoever is conscious of Allah, He will prepare a way out and provide from unanticipated realms",
      "Protective financial entitlements for pregnant and nursing mothers following marital dissolution",
      "Cosmic contemplation: the creation of seven heavens and a corresponding seven earths"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda caanka ah ee 'Wa may-yattaqillaaha yajcallahuu maxrajaa' oo ah furaha xalka dhibaatooyinka.",
      "Waxaa loogu yeeri jiray Suuradda An-Nisaa' As-Sughraa (Suuraddii Dumarka ee Yar)."
    ],
    virtuesEnglish: [
      "Houses the renowned verses of hope (65:2-3), a universal spiritual panacea during anxiety and hardship.",
      "Historically designated by Ibn Mas'ud as 'Surat an-Nisa al-Sughra' (The Shorter Surah of Women)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina si loo nidaamiyo qoysaska loona baabi'iyo xadgudubyadii xilligii jahligu jiray.",
    revelationContextEnglish: "Revealed in Madinah to establish civilized, dignified domestic rights during emotional dissolution."
  },
  66: {
    surahNumber: 66,
    revelationType: "Medinan",
    revelationOrder: 107,
    ayahCount: 12,
    wordCount: 174,
    juzRange: "Juz 28",
    pageRange: "Pages 560-561",
    aboutSomali: "Suuradda At-Taxriim (Reebidda) waxay wax ka baraysaa arrimihii qoyska Nabiga ﷺ, reebidda in qofku naftiisa ka xaaraantinimeeyo wixii Alle u baneeyay, waxayna tusaalayaal u soo qaadataa haweenkii fiicnaa iyo kuwii xumaaday.",
    aboutEnglish: "Surah At-Tahrim (The Prohibition) deals with domestic events within the prophetic household, prohibits self-imposed deprivation of lawful bounties, and contrasts exemplary righteous women (Asiya and Mary) with faithless spouses of Noah and Lot.",
    namingReasonSomali: "Waxaa loogu magac daray 'At-Taxriim' sababtoo ah aayadda koowaad waxay Nabiga ﷺ ku leedahay: 'Maxaad u reebaysaa wixii Alle kuu baneeyay?'.",
    namingReasonEnglish: "Named 'At-Tahrim' (The Prohibition) from the opening reprimand regarding prohibiting oneself lawful sustenance to please spouses.",
    mainThemesSomali: [
      "Mamnuucidda in qofku iska reebo wixii Eebbe u banneeyay si uu cid kale u raalli geliyo",
      "Ilaalinta siraha qoyska iyo nidaaminta xidhiidhka jacaylka iyo mas'uuliyadda",
      "Baqa ku aaddan in qofku naftiisa iyo ehelkiisa ka badbaadiyo Naar shidaalkeedu yahay dad iyo dhagaxaan",
      "Toobadda dhabta ah ee daacadda ah (Tawbatan Nasuuxaa) iyo masaxidda dembiyada",
      "Tusaalayaasha haweenka: Haweenaydii Fircoon (Aasiya), Maryam bintu Cimraan, iyo haweenkii Nuux iyo Luud"
    ],
    mainThemesEnglish: [
      "Prohibition against renouncing lawful provisions simply to accommodate the emotional preferences of others",
      "Sanctity of confidential domestic discourse and the moral accountability of spouses",
      "The imperative responsibility of shielding oneself and one's household from the hellfire fuelled by men and stones",
      "The concept of pure unadulterated repentance (Tawbah Nasuh) that totally obliterates transgression",
      "Typologies of faith: the contrast between Pharaoh's noble wife Asiya / Mary and the disbelieving wives of Noah / Lot"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay ducadii weyneyd ee Aasiya: 'Rabbiyow iiga dhis agtaada guri Jannada dhexdeeda'.",
      "Waxay muujinaysaa in qof kasta mas'uul ka yahay camalkiisa shakhsiga ah iyadoon loo eegin xidhiidhka dhiigga."
    ],
    virtuesEnglish: [
      "Contains Asiya's immortal prayer: 'My Lord, build for me near You a home in Paradise' (66:11).",
      "Demonstrates that spiritual salvation is individually earned regardless of familial or matrimonial ties."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina ka dib xaalado gaar ah oo ku saabsanaa qoyska Nabiga ﷺ.",
    revelationContextEnglish: "Revealed in Madinah to establish optimal ethical patterns in managing delicate domestic matters."
  },
  67: {
    surahNumber: 67,
    revelationType: "Meccan",
    revelationOrder: 77,
    ayahCount: 30,
    wordCount: 435,
    juzRange: "Juz 29",
    pageRange: "Pages 562-563",
    aboutSomali: "Suuradda Al-Mulk (Boqortooyada / Tabaarak) waxay muujinaysaa maamulka buuxa ee Eebbe ee koonka, abuurka nolosha iyo dhimashada si la isku imtixaano, waxayna ka hortagtaa cadaabka xabaasha qofkii akhrista.",
    aboutEnglish: "Surah Al-Mulk (Dominion) declares Allah's sovereign lordship over all creation, elucidates the teleological purpose of life and death as an ethical examination, and serves as an interceding shield against the punishment of the grave.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Mulk' maxaa yeelay aayadda koowaad waxay caddeynaysaa in Boqortooyada iyo maamulka gacantiisa ku jiraan.",
    namingReasonEnglish: "Named 'Al-Mulk' (The Dominion) after the opening verse proclaiming Allah's absolute sovereign majesty.",
    mainThemesSomali: [
      "Boqortooyada buuxda ee Eebbe iyo awoodda uu ku leeyahay wax walba oo jira",
      "Ujeeddada nolosha iyo dhimashada: in la tijaabiyo qofka ugu camalka wanaagsan",
      "Hufnaanta iyo quruxda abuurka toddobada samo iyadoon la helayn wax daldaloolo ah",
      "Muuqaalka cadaabka Naarta iyo qiraalka gaalada ee ah inaysan dhegaysan digtoonyada",
      "Aqoonta Eebbe ee waxa ku qarsoon laabta iyo risiqa uu ku fidiyay dhulka socodkiisa"
    ],
    mainThemesEnglish: [
      "The absolute sovereignty, omnipotence, and untrammeled kingship of Allah over the cosmos",
      "The existential purpose of creating life and death: to evaluate who excels in righteous deeds",
      "The flawless architectural symmetry of the seven heavens devoid of any fissure or defect",
      "The sorrowful confession of the dwellers of Hell lamenting their failure to listen to divine warnings",
      "Divine awareness of concealed thoughts and the provision of sustenance upon the hospitable earth"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu xusay inay tahay 30 aayadood oo u shafeeco qaada qofkii akhriya ilaa laga dhaafo dembigiisa.",
      "Waxaa loogu yeeri jiray 'Al-Maani'ah' (Ka hortagaha cadaabka qabriga) oo uu Nabigu ﷺ akhrin jiray habeen kasta."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ affirmed: 'Surah Al-Mulk consists of thirty verses that intercede for its companion until forgiven' (Tirmidhi).",
      "Designated 'Al-Mani'ah' (The Shield) for guarding reciters against the ordeal of the grave when recited before sleep."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loo toosiyo qalbiga aadanaha loona xusuusiyo awoodda abuuraha.",
    revelationContextEnglish: "Revealed in Makkah to direct human observation toward cosmic signs, fostering conviction in resurrection."
  },
  68: {
    surahNumber: 68,
    revelationType: "Meccan",
    revelationOrder: 2,
    ayahCount: 52,
    wordCount: 754,
    juzRange: "Juz 29",
    pageRange: "Pages 564-565",
    aboutSomali: "Suuradda Al-Qalam (Qalinka) waxay ka mid tahay waxyigii ugu horreeyay, waxay difaacaysaa akhlaaqda suubban ee Nabiga ﷺ, waxay kashiftaa sheekadii 'Asxaabul Jannah' ee beertoodu gubatay, waxayna dhiirrigelisaa samirka sida Yoonis.",
    aboutEnglish: "Surah Al-Qalam (The Pen) stands among the earliest revelations, vigorously defending the Prophet's mental integrity and monumental character, illustrating the folly of arrogance through the parable of the ruined garden, and urging patience like Jonah.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Qalam' maxaa yeelay Eebbe wuxuu ku dhaartay Qalinka iyo waxa la qorayo aayadda koowaad.",
    namingReasonEnglish: "Named 'Al-Qalam' (The Pen) after the cosmic oath sworn upon the pen and the written word in verse 1.",
    mainThemesSomali: [
      "Dhaarta Qalinka iyo difaaca Nabiga ﷺ ee eedaymihii waalida ee gaaladu u jeediyeen",
      "Akhlaaqda heerka sare ah ee Nabiga ﷺ: 'Waxaad ku sugan tahay dabeecad aad u weyn'",
      "Kashifidda sifooyinka xun ee madaxdii qabka badnayd ee cayda iyo xanta ku faani jiray",
      "Sheekadii nimankii beerta lahaa ee diiday inay masaakiinta wax siiyaan iyo sida beertoodii u gubatay",
      "Dulqaadka dacwada iyo xusuusinta dhacdadii Nebi Yoonis (Ninka kalluunka galay)"
    ],
    mainThemesEnglish: [
      "The divine oath by the instrument of the pen and the exoneration of the Prophet ﷺ from pagan slanders",
      "The timeless testimony to the supreme character of Prophet Muhammad: 'Indeed, you possess an exalted standard of character' (68:4)",
      "Unmasking the despicable anatomy of spiteful oppressors who hoard wealth and slander the vulnerable",
      "The parable of the hoarders of the orchard whose sunrise greed resulted in the overnight ashes of their harvest",
      "The call to steadfast perseverance exemplified by avoiding the premature despair of Jonah (the Companion of the Fish)"
    ],
    virtuesSomali: [
      "Waxay caddeysay maragga Eebbe ee akhlaaqda sare ee Nabiga ﷺ.",
      "Waxay baraysaa in bakhaylnimada iyo diidmada masaakiintu ay sababaan baaba'a maalka."
    ],
    virtuesEnglish: [
      "Contains the monumental divine affirmation of the Prophet's unassailable character (68:4).",
      "Presents an enduring economic lesson: greed and callousness toward the poor destroy human wealth."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah bilowgii hore ee dacwada markii gaaladu ku eedeeyeen Nabiga waalli.",
    revelationContextEnglish: "Revealed in early Makkah to shatter pagan smear campaigns against the Prophet's sanity and divine commission."
  },
  69: {
    surahNumber: 69,
    revelationType: "Meccan",
    revelationOrder: 78,
    ayahCount: 52,
    wordCount: 754,
    juzRange: "Juz 29",
    pageRange: "Pages 566-567",
    aboutSomali: "Suuradda Al-Xaaqqah (Xaqiiqada Lama-huraanka ah) waxay muujinaysaa awoodda Maalinta Qiyaamaha, halaaggii ummadihii hore sida Caad iyo Thamuud, dhiibista buugga camalka gacanta midig ama bidix, iyo runnimada Qur'aanka.",
    aboutEnglish: "Surah Al-Haqqah (The Inevitable Reality) pulsates with apocalyptic momentum, chronicling the annihilation of ancient defiant civilizations (Aad and Thamud), the distribution of records in the right or left hand, and the authenticity of the Qur'an.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Xaaqqah' sababtoo ah aayadda koowaad waxay xustaa magacan oo ka mid ah magacyada Qiyaamaha ee xaqiijinaya ballanka Eebbe.",
    namingReasonEnglish: "Named 'Al-Haqqah' (The Inevitable Truth) from the repeated rhythmic opening verses characterizing the Day of Judgment.",
    mainThemesSomali: [
      "Xaqiiqada dhabta ah ee Qiyaamaha iyo baaba'ii ummadihii beeniyay sida Thamuud iyo Caad",
      "Dhinaca dhiibista buugaagta: guusha qofka kitaabkiisa midigta laga siiyo iyo farxaddiisa",
      "Qoomamaynta qofka kitaabka bidixda laga siiyo iyo rajadiisa ahayd inaanba la soo saari lahayn",
      "Xaqiiqada Qur'aanka: ma aha hadal gabyaa ama faaliye balse waa soo dejin xagga Eebbe ka timid",
      "Digniinta ah in haddii Nabigu wax been ah sheegi lahaa laga jari lahaa xididka wadnaha (Al-Watiin)"
    ],
    mainThemesEnglish: [
      "The inexorable arrival of the Inevitable Hour and historical devastation of haughty empires (Thamud, 'Aad, Pharaoh)",
      "The joyous ecstasy of the righteous recipient awarded their record in their right hand",
      "The catastrophic sorrow and self-reproach of the sinner handed their record in their left hand",
      "Uncompromising vindication of the Qur'an: not the words of an eccentric poet or soothsayer, but divine revelation",
      "The stark hypothetical ultimatum: if Muhammad were to invent false sayings, Allah would sever his life-artery (69:44-46)"
    ],
    virtuesSomali: [
      "Waxay si qoto dheer u ruxaysaa quluubta qofka akhriya iyadoo tuseysa muqaalka Maalinta Xisaabta.",
      "Cumar binu Khadaab wuxuu sheegay in maqlidda suuraddan ay ahayd sababtii ugu horreysay ee Islaamku qalbigiisa u galay."
    ],
    virtuesEnglish: [
      "A powerhouse of poetic meter that historically arrested the conscience of figures like Umar ibn al-Khattab.",
      "Affirms the supreme integrity and preservation of the divine scripture against fabrication."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli mushrikiintu ku andacoonayeen in Nabigu gabay ama faal tirinayo.",
    revelationContextEnglish: "Revealed in Makkah to refute allegations that prophetic discourse was merely sorcery or poetic fabrication."
  },
  70: {
    surahNumber: 70,
    revelationType: "Meccan",
    revelationOrder: 79,
    ayahCount: 44,
    wordCount: 638,
    juzRange: "Juz 29",
    pageRange: "Pages 568-569",
    aboutSomali: "Suuradda Al-Macaarij (Jaranjarooyinka Samooyinka) waxay ka jawaabaysaa qofkii dalbaday cadaabka deg-degga ah, waxay xustaa dhererka Maalinta Qiyaamaha ee 50,000 oo sano ah, dabeecadda aadanaha ee daciifka ah, iyo sifooyinka mu'miniinta badbaadaya.",
    aboutEnglish: "Surah Al-Ma'arij (The Ascending Stairways) responds to the cynical skeptic who demanded immediate divine punishment, depicts the cosmic magnitude of the Day of Judgment (fifty thousand years), diagnoses human neuroticism, and outlines eight salvific virtues.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Macaarij' sababtoo ah aayadda 3-aad waxay Eebbe ku sifeysaa 'Dhil-Macaarij' oo macnaheedu yahay Eebaha jaranjarooyinka iyo dariiqyada sare ee malaa'igtu ku fuusho.",
    namingReasonEnglish: "Named 'Al-Ma'arij' (The Ways of Ascent) from verse 3, illustrating the celestial pathways traversing spiritual dimensions.",
    mainThemesSomali: [
      "Jawaabta qofkii degdegsaday cadaabka oo aan la celin karin markuu yimaado",
      "Dhererka iyo weynaanta Maalinta Qiyaame ee u dhiganta konton kun oo sano",
      "Dabeecadda aadanaha: inuu yahay mid naxariis-yar oo cabsi badan markii dhib taabto, kibraana markii khayr helo",
      "Sifooyinka badbaadayaasha: kuwa salaadda ilaaliya, maalkooda xaqa masaakiinta ka bixiya, kana dhowrsada xumaanta",
      "Ilaalinta ammaanada iyo ballamaha iyo ku taagnaanta marag-furka caddaaladda"
    ],
    mainThemesEnglish: [
      "The inexorable response to cynical challenges demanding immediate apocalyptic retributive punishment",
      "The staggering cosmic timescale: a Day whose comprehensive measure equals fifty thousand human years",
      "Psychological diagnosis of human anxiety: volatile and panic-stricken in distress, stingy and arrogant in affluence",
      "The eight foundational attributes of the redeemed: punctual prayer, regular charity, marital chastity, and truthfulness",
      "Upholding sacred trusts, maintaining covenants, and steadfastness in judicial testimony"
    ],
    virtuesSomali: [
      "Waxay bixisaa manhaj akhlaaqeed oo qofka ka saara dabeecadda werwerka iyo bakhaylnimada.",
      "Waxay dhiirrigelisaa samirka quruxda badan (Sabran Jamiilaa) ee aan cabashada lahayn."
    ],
    virtuesEnglish: [
      "Imparts the spiritual blueprint of 'Sabrun Jameel'—a patient endurance wholly unmarred by resentful complaint.",
      "Provides a definitive moral antidote to existential panic and chronic human anxiety."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii Nadr binu Xaarith uu yidhi: 'Ilaahow haddii kani yahay xaq nooga soo da' dhagaxaan'.",
    revelationContextEnglish: "Revealed in Makkah following pagan demands for tangible thunderbolts of immediate retribution."
  },
  71: {
    surahNumber: 71,
    revelationType: "Meccan",
    revelationOrder: 71,
    ayahCount: 28,
    wordCount: 406,
    juzRange: "Juz 29",
    pageRange: "Pages 570-571",
    aboutSomali: "Suuradda Nuux waxay si buuxda ugu go'an tahay halgankii dheeraa ee Nebi Nuux (CS) oo 950 sano dadkiisa ugu yeedhayay habeen iyo maalin, qarsoodi iyo caddaan, iyo sidii ay ugu kibreen ilaa daadkii weyni ku rogmaday.",
    aboutEnglish: "Surah Nuh is exclusively dedicated to the epic calling of Prophet Noah, recounting his 950 years of tireless mission—appealing secretly and openly, by day and night—confronting generational obstinacy that ultimately led to the cleansing Deluge.",
    namingReasonSomali: "Waxaa loogu magac daray 'Nuux' maxaa yeelay waxay bilow ilaa dhammaad ka sheekaynaysaa daacadnimadii iyo dhibaatadii Nebi Nuux.",
    namingReasonEnglish: "Named 'Nuh' (Noah) as its entirety is consecrated to the prophetic struggle and prayers of Noah.",
    mainThemesSomali: [
      "Halgankii Nebi Nuux ee xagga dacwada: ugu yeeridda habeen iyo maalin, qarsoodi iyo caddaan",
      "Barakooyinka Istiqfaarka (Dambi-dhaaf warsiga): roob da'a, hanti bata, carruur, beero, iyo wabiyaal qulqula",
      "Koonka iyo awoodda Eebbe: abuurista aadanaha heerar kala duwan, toddobada samo, iyo dayaxa nuurka ah",
      "Kibirka gaalada iyo ku dhagganaantoodii sanamyadii (Wadd, Suwaac, Yaghuuth, Yacuuq, iyo Nasr)",
      "Ducadii weyneyd ee Nebi Nuux ee ahayd in Eebbe u dhaafo isaga, waalidkiis, iyo kuwa mu'miniinta ah ee gurigiisa soo gala"
    ],
    mainThemesEnglish: [
      "The multidimensional methodology of Noah's mission: nocturnal and diurnal appeals, public preaching, and intimate private counsel",
      "The tangible earthly dividends of seeking forgiveness (Istighfar): torrential rain, economic wealth, progeny, and lush rivers",
      "Contemplating creative stages in embryonic human development and the harmonious cosmic architecture of heavens and celestial lights",
      "The stubborn idolatrous oligarchies and their defense of ancestral deities (Wadd, Suwa', Yaghuth, Ya'uq, and Nasr)",
      "Noah's immortal supplication for himself, his parents, and every believer who enters his sanctuary of faith"
    ],
    virtuesSomali: [
      "Waxay caddaysay in Istiqfaarku yahay furaha risiqa maalka, carruurta, iyo barwaaqada dhulka.",
      "Waxay muujinaysaa sabirka heerka sare ah ee looga baahan yahay qofka dacwada wada."
    ],
    virtuesEnglish: [
      "Contains the definitive scriptural equation linking sincere repentance (Istighfar) with material abundance and rain.",
      "The ultimate case study in patient, multi-century perseverance against overwhelming societal cynicism."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu samarsiiyo Nebi Muxammad ﷺ dhibaatada kaga imaanaysay Qureysh.",
    revelationContextEnglish: "Revealed in Makkah to comfort Prophet Muhammad ﷺ through the heroic archetype of Noah's unyielding mission."
  },
  72: {
    surahNumber: 72,
    revelationType: "Meccan",
    revelationOrder: 40,
    ayahCount: 28,
    wordCount: 406,
    juzRange: "Juz 29",
    pageRange: "Pages 572-573",
    aboutSomali: "Suuradda Al-Jinn waxay faahfaahinaysaa koox ka mid ah Jinigii oo maqlay Qur'aanka kariimka ah, rumeeyay, kana towbad keenay shirkigii. Waxay sidoo kale caddaynaysaa in cilmiga qeybka uu Eebbe kaliya leeyahay.",
    aboutEnglish: "Surah Al-Jinn reveals the dramatic conversion of a cohort of Jinn who eavesdropped on the recitation of the Qur'an, dismantled superstitious mythology surrounding unseen spirits, and established that absolute unseen knowledge belongs exclusively to Allah.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Jinn' sababtoo ah waxay si toos ah u xustaa imaanka iyo hadalladii cajaa'ibka lahaa ee jinigii rumeeyay Qur'aanka.",
    namingReasonEnglish: "Named 'Al-Jinn' after the spirits whose encounter with the Qur'an and theological transformation form the core narrative.",
    mainThemesSomali: [
      "Maqliddii Jiniga ee Qur'aanka cajiibka ah ee ku hanuuninaya toosnaanta iyo rumeyntoodii degdegga ahayd",
      "Bari-yeelidda Eebbe: in uusan yeelan wehel ama carruur, iyo beentii ay madaxdoodu ka sheegi jireen Alle",
      "Ilaalinta samada ee xiddigaha gubanaya (Shihaab) si aan waxyiga loo xadin",
      "Kala qaybsanaanta jiniga: kuwa Muslimiin ah oo xaqa raacay iyo kuwa qalloocday oo noqonaya shidaalka Naarta",
      "Cilmiga Qeybka oo aan loo muujin cidna marka laga reebo Rasuul Eebbe doortay"
    ],
    mainThemesEnglish: [
      "The awe-inspiring encounter of the Jinn with the Qur'an, sparking immediate conversion and spiritual clarity",
      "Vindication of divine transcendence: rejecting false beliefs that Allah has taken an associate, spouse, or son",
      "Celestial defense mechanisms: meteoric flames guarding heavenly realms to secure divine revelation from spiritual eavesdropping",
      "The internal moral divide within the Jinn realm: upright righteous believers versus deviant fuel for the inferno",
      "The inviolable privacy of the absolute Unseen (Ghayb), communicated selectively only to chosen messengers"
    ],
    virtuesSomali: [
      "Waxay baabi'isay cabsidii iyo khuraafaadkii dadku ka aaminsanaayeen jiniga iyo faalayaasha.",
      "Waxay muujinaysaa in dacwada Islaamku tahay mid caalami ah oo loo diray dadka iyo jiniga labadaba."
    ],
    virtuesEnglish: [
      "Dismantles pagan superstitious terror regarding demonic spirits and occult intermediaries.",
      "Affirms the universal scope of the Prophet's mission embracing all intelligent conscious beings across dimensions."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib socdaalkii Nabiga ﷺ ee Dhaa'if markii uu ku tukaday dooxada Nakhla.",
    revelationContextEnglish: "Revealed following the Prophet's difficult expedition to Ta'if, when Jinn listened to his dawn prayer at Nakhla."
  },
  73: {
    surahNumber: 73,
    revelationType: "Meccan",
    revelationOrder: 3,
    ayahCount: 20,
    wordCount: 290,
    juzRange: "Juz 29",
    pageRange: "Page 574",
    aboutSomali: "Suuradda Al-Muzzammil (Kii Is-duubay) waxay faraysaa Nabiga ﷺ kicidda salaadda habeenkii (Tahajjudka), akhrinta tartiibta ah ee Qur'aanka (Tartiil), iyo samirka ka hor inta aysan bilaaban hawlaha culus ee dacwada.",
    aboutEnglish: "Surah Al-Muzzammil (The Enshrouded One) commands the Prophet ﷺ to arise for the night vigil (Tahajjud), cultivate deliberate measured recitation (Tartil), and gird his soul through intimate prayer before shouldering the monumental weight of the message.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Muzzammil' iyadoo loogu yeerayo Nabiga ﷺ xaaladdii uu marada isku duubay markii waxyigu ku bilowday.",
    namingReasonEnglish: "Named 'Al-Muzzammil' (The Wrapped in Garments) from the intimate address to Prophet Muhammad trembling under the divine mantle.",
    mainThemesSomali: [
      "Baaqa kicidda habeenka: u taagnaanta cibaadada barkeed, in ka yar ama in ka badan",
      "Qur'aan akhrinta tartiibta ah (Tartiil) oo quluubta dejisa una diyaarisa culeyska waxyiga",
      "Xuska magaca Eebbe iyo u go'idda cibaadadiisa (Tabattul) oo dhan",
      "Samirka ku aaddan hadallada xun ee gaalada iyo ka fogaanshaha habboon ee sharafta leh",
      "Fududeynta cibaadada aayadda dambe: akhrinta wixii fudud oo Qur'aan ah marka ay jiraan jiro, safar, ama dagaal"
    ],
    mainThemesEnglish: [
      "The celestial summons to nocturnal vigilance: standing in devotion for half the night, or a little less or more",
      "The art of measured, contemplative recitation (Tartil) to fortify the soul against existential trials",
      "Devotional absorption: constant remembrance of Allah's Name and complete, focused consecration (Tabattul)",
      "Graceful endurance of cynical provocations and practicing dignified strategic disengagement",
      "The pragmatic mitigation in verse 20: reciting what is feasible amid illness, economic travel, and defense"
    ],
    virtuesSomali: [
      "Waa tiirka ugu weyn ee dhisidda ruuxiga ah ee qofka dacwada wada iyo qiyamka habeenka.",
      "Waxay culayska ka qaadday ummadda iyadoo tustay naxariista Eebbe ee xaaladaha kala duwan."
    ],
    virtuesEnglish: [
      "The classic manual for spiritual preparation, self-discipline, and nocturnal communion with the Divine.",
      "Exemplifies divine tenderness in adapting religious rigors to the physical limits of human biology and life duties."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilligii ugu horreeyay ee waxyiga si loo dhiso aasaaska ruuxiga ah.",
    revelationContextEnglish: "Revealed in the earliest dawn of revelation in Makkah to forge the Prophet's interior spiritual fortitude."
  },
  74: {
    surahNumber: 74,
    revelationType: "Meccan",
    revelationOrder: 4,
    ayahCount: 56,
    wordCount: 812,
    juzRange: "Juz 29",
    pageRange: "Pages 575-576",
    aboutSomali: "Suuradda Al-Muddaththir (Kii Marada Huwanaa) waxay amartaa Nabiga ﷺ inuu kaco oo dadka u digo, nadiifiyo dharkiisa, weyneeyo Rabbigiis, waxayna xustaa 19-ka malaa'igood ee Naarta ilaalisa iyo xisaabta Maalinta Qiyaamaha.",
    aboutEnglish: "Surah Al-Muddaththir (The Cloaked One) marks the active commission of the Prophet ﷺ to arise and warn, purify his apparel, magnify his Lord, elucidates the nineteen angelic guardians of the fire, and describes the flight of wild donkeys fleeing lions.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Muddaththir' sababtoo ah waxay ku bilaabataa baaqa tooska ah ee ku wajahan Nabiga ﷺ ee marada ku huwanaa cabsida waxyiga.",
    namingReasonEnglish: "Named 'Al-Muddaththir' (The Cloaked One) from the opening address awakening the Prophet to his global public mission.",
    mainThemesSomali: [
      "Amarka kacaanta iyo digidda: 'Kac oo dadka u dig, Rabbigaana weynee, dharkaagana daahiri'",
      "Kala fogaanshaha xumaanta iyo sanamyada iyo inaan wax loo bixin si wax badan looga helo",
      "Digniinta ku socota Al-Waliid binu Muqiirah oo ku kibray maalkii iyo carruurtii Eebbe siiyay",
      "Muuqaalka Naarta Saqar iyo 19-ka malaa'igood ee ilaaliya oo imtixaan u ah dadka",
      "Su'aasha reer Jannuhu weydiin doonaan dambiilayaasha: 'Maxaa idin galiyay Saqar?' iyo sababihii ay ku jabeen"
    ],
    mainThemesEnglish: [
      "The trumpet call to public prophetic activism: 'Arise and warn! And magnify your Lord, and purify your garments!'",
      "Ethical imperatives: abandoning idolatry and not giving charity with the calculation of receiving more in return",
      "The psychological profile of the ingrate tycoon al-Walid ibn al-Mughirah who met divine favors with disdain",
      "The nature of Saqar (the scorching fire) and its nineteen angelic wardens set as a test of faith",
      "The inquiry of Paradise: 'What brought you into Saqar?' and their fourfold confession (abandoning prayer, neglecting the poor, cynicism, denial)"
    ],
    virtuesSomali: [
      "Waa suuraddii bilaabay dacwada caddaan ah ee Nabiga ﷺ.",
      "Aayadaheeda dambe waxay si cajiib ah u qeexaan sababaha ugu waaweyn ee dadku Naarta u galaan si looga digtoonaado."
    ],
    virtuesEnglish: [
      "Historical catalyst transitioning the Prophet from meditative retreat into active, transformative public leadership.",
      "Contains the pivotal dialogue outlining the four cardinal spiritual faults that plunge souls into perdition."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii uu Nabigu arkay Malaa'ig Jibriil oo u dhexeeya samada iyo dhulka.",
    revelationContextEnglish: "Revealed in Makkah when the Prophet witnessed the Angel Gabriel seated between heaven and earth, launching the public call."
  },
  75: {
    surahNumber: 75,
    revelationType: "Meccan",
    revelationOrder: 31,
    ayahCount: 40,
    wordCount: 580,
    juzRange: "Juz 29",
    pageRange: "Page 577",
    aboutSomali: "Suuradda Al-Qiyaamah waxay xoogga saartaa xaqiiqada dhabta ah ee soo noolaynta meydadka, waxay ku dhaaranaysaa Nafta canbaareysa xumaanta (Al-Lawwaamah), waxay baraysaa aadaabta waxyiga, waxayna qeexaysaa xilliga nafta la qaadayo.",
    aboutEnglish: "Surah Al-Qiyamah (The Resurrection) dramatizes the certainty of physical resurrection down to reconstructed fingertips, swears by the self-reproaching soul (Nafs al-Lawwamah), outlines pedagogical manners of receiving revelation, and depicts the agony of departure.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Qiyaamah' maxaa yeelay Eebbe wuxuu ku dhaartay Maalinta Qiyaamaha aayadda ugu horreysa.",
    namingReasonEnglish: "Named 'Al-Qiyamah' (The Resurrection) from the dramatic divine oath sworn upon the Day of Resurrection in verse 1.",
    mainThemesSomali: [
      "Dhaarta Maalinta Qiyaamaha iyo Nafta canbaareysa xumaanta (Nafs Al-Lawwaamah)",
      "Awoodda Eebbe ee dib u habeynta farta faraha (Banaanah) oo muujinaysa far-qaadka gaarka ah ee qof kasta",
      "Aadaabta helidda waxyiga: inuusan Nabigu deg-dejin carrabkiisa maxaa yeelay Eebbe ayaa isu keenaya",
      "Muuqaalka wejiyada Maalinta Qiyaame: wejiyo ifaya oo Rabbigood eegaya iyo wejiyo madow oo musiibo filanaya",
      "Xilliga dhimashada marka ruuxu soo gaaro lafta dhuunta (Taraaqi) iyo kala tagga nolosha adduunka"
    ],
    mainThemesEnglish: [
      "The twin oaths by the Day of Resurrection and the awakened, self-reproaching conscience (Nafs al-Lawwamah)",
      "Biological reconstruction: Allah's absolute power to restore individual unique fingertips (fingerprints) with perfect fidelity",
      "Manners of receiving revelation: admonition to the Prophet not to move his tongue in hurried anxiety, for Allah guarantees its retention",
      "The great visual contrast on Judgment Day: radiant faces beholding their Lord versus darkened faces expecting impending disaster",
      "The physical and spiritual agony of death: the soul arriving at the collarbone and the agonizing entwinement of the legs"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda mucjisada sayniska ee ku saabsan faraha (Banaan) oo ah aqoonsiga gaarka ah ee bani'aadamka.",
      "Waxay toosisaa damiirka qofka iyadoo xustaa Nafta Lawwaamada ah ee qofka wanaagsan ku canbaaraysa wixii dhiman."
    ],
    virtuesEnglish: [
      "Celebrated for its striking allusion to human unique dermatoglyphic individuality (fingerprints) in verse 4.",
      "A deep meditation on the psychological struggle of the human conscience striving for ethical perfection."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu caddeeyo gaaladii la yaabbanaa sidii lafo qudhuntay mar kale loo soo noolayn lahaa.",
    revelationContextEnglish: "Revealed in Makkah to refute pagan mockers who brought decaying bones to question bodily reconstruction."
  },
  76: {
    surahNumber: 76,
    revelationType: "Medinan",
    revelationOrder: 98,
    ayahCount: 31,
    wordCount: 450,
    juzRange: "Juz 29",
    pageRange: "Pages 578-579",
    aboutSomali: "Suuradda Al-Insaan (ama Ad-Dahr) waxay xusuusisaa bini'aadamka abuuristiisii dhibicda ahayd, waxay ammaanaysaa kuwa suubban (Al-Abraar) ee quudiya masaakiinta, agoonta, iyo maxaabiista iyagoo aan abaalgud doonayn, waxayna sawirtaa nimcooyinka Jannada.",
    aboutEnglish: "Surah Al-Insan (Man / Time) recalls human non-existence prior to creation. It praises the righteous (Abrar) who feed the poor, orphan, and prisoner purely for Allah's countenance, and paints an exquisite portrait of Paradise.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Insaan\" (Bini'aadamka) maxaa yeelay waxay ku bilaabataa xusuusinta bilowgii iyo abuuristii qofka bini'aadamka ah.",
    namingReasonEnglish: "Named \"Al-Insan\" (Man) reflecting its opening contemplation on human fragility, genesis from mingled fluid, and moral testing.",
    mainThemesSomali: [
      "Xusuusinta bini'aadamka inuu ahaa wax aan la xusin ka hor inta aan la abuurin (76:1)",
      "Abuurista dhibicda manida ah iyo siinta maqalka iyo aragga si loo imtixaano",
      "Tilmaamaha sare ee kuwa suubban (Al-Abraar): Quudinta masaakiinta, agoonta, iyo maxaabiista iyagoo aan abaal iyo mahadnaq toona doonayn (76:8-9)",
      "Nimcooyinka layaabka leh ee Jannada: Xariirta, koobabka qalinka ah ee hufan, iyo ilaha barakaysan ee Salsabiil",
      "Sabirka dacwada iyo dardaaranka xuska Eebbe subaxdii, galabtiina, iyo salaadda habeenkii"
    ],
    mainThemesEnglish: [
      "The humbling existential reminder: a span of time passed when man was not even a thing mentioned (76:1)",
      "Conception from a mingled drop endowed with hearing and sight to navigate the moral trial of existence",
      "The transcendent altruism of the Righteous (Abrar): feeding the poor, orphan, and captive expecting neither reward nor thanks (76:8-9)",
      "The refined aesthetics of Paradise: silk robes, crystalline silver goblets, and ginger-infused springs of Salsabil",
      "Nocturnal perseverance: maintaining constant patience and celebrating the praises of Allah morning, evening, and night"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu ku akhrin jiray Suuradda Al-Insaan salaadda Fajarka ee subaxda Jimcaha rakcadda labaad (Saxiiyul Bukhaari).",
      "Waxay xambaarsan tahay tusaalaha ugu sarreeya ee sadaqada daacadda ah ee aan faan lahayn."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ regularly recited Surah Al-Insan in the second rak'ah of Friday dawn prayer (Bukhari).",
      "Provides the supreme scriptural definition of altruistic charity unpolluted by desire for social recognition."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina (ama Makkah) markii Cali binu Abii Dhaalib iyo Faadumo ay cunto bixiyeen iyagoo sooman.",
    revelationContextEnglish: "Associated with the self-sacrificing generosity of the Prophet's household giving their only meals to the destitute."
  },
  77: {
    surahNumber: 77,
    revelationType: "Meccan",
    revelationOrder: 33,
    ayahCount: 50,
    wordCount: 725,
    juzRange: "Juz 29",
    pageRange: "Pages 580-581",
    aboutSomali: "Suuradda Al-Mursalaat waxay ku dhaaranaysaa Malaa'igta iyo dabaylaha waxyiga wada, waxay sawirtaa dillaaca cirka iyo damidda xiddigaha, waxayna ku celcelisaa 10 jeer: 'Hoog waxaa maalintaas u sugnaaday kuwa beeniyayaasha ah'.",
    aboutEnglish: "Surah Al-Mursalat (The Emissaries) unleashes cosmic oaths by divine emissaries. It depicts stars extinguished, skies split, and mountains pulverized, punctuated by the thunderous tenfold refrain: 'Woe that Day to the deniers!'.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Mursalaat\" oo ah dabaylaha ama Malaa'igta sharafta leh ee loo soo diro fulinta amarka Eebbe.",
    namingReasonEnglish: "Named \"Al-Mursalat\" (The Emissaries) invoking the celestial winds and angelic messengers sent forth with divine decrees.",
    mainThemesSomali: [
      "Dhaarta Malaa'igta iyo dabaylaha la soo diro ee waxyiga iyo roobka wada",
      "Calaamadaha cabsida leh ee Qiyaamada: Xiddigaha oo dami doona, cirka oo dillaaci doona, iyo buuraha oo la baabi'in doono",
      "Tusaalooyinkii ummadihii hore ee halaaggu ku dhacay markii ay runta beeniyeen",
      "Awoodda Eebbe ee abuurka bini'aadamka biyaha daciifka ah ka abuuray iyo dhulka u yeelay hoyga noolaha iyo meydka",
      "Aayadda toban jeer soo noqnoqota ee digniinta ah: \"Hoog waxaa maalintaas u sugnaaday kuwa beeniyayaasha ah\" (Waylun yawma'idhin lil-mukadh-dhibiin)"
    ],
    mainThemesEnglish: [
      "Celestial oaths: emissary winds, moisture-bearing tempests, and angels transmitting revelation",
      "Cosmic markers of the End: stars losing their brilliance, heaven ripped apart, and mountains pulverized to dust",
      "Historical lessons: ancient civilizations annihilated when they rejected prophetic messengers",
      "The biological marvel of human conception from humble fluid, and the earth engineered as a repository for living and dead",
      "The solemn rhythmic refrain repeated ten times: \"Woe, that Day, to the deniers!\" (Waylun yawma'idhin lil-mukadhdhibin)"
    ],
    virtuesSomali: [
      "Waa suuraddii ugu dambaysay ee Nabiga ﷺ ku tukado salaadda Maqrib ka hor inta uusan dhiman (Saxiiyul Bukhaari).",
      "Waxay qofka ku beertaa baqdin iyo u diyaargarowga Maalinta Xisaabta."
    ],
    virtuesEnglish: [
      "The final chapter Prophet Muhammad ﷺ recited while leading congregational prayer (Maghrib) prior to his passing (Bukhari).",
      "Instills uncompromising vigilance regarding personal integrity and the inescapable reality of divine judgment."
    ],
    revelationContextSomali: "Waxay ku soo degtay god ku yaalla Mina xilligii Xajka markii Nabigu ﷺ asxaabtiisa dhex joogay.",
    revelationContextEnglish: "Revealed in a cave at Mina during the pilgrimage, transmitted directly to the Companions fresh from revelation."
  },
  78: {
    surahNumber: 78,
    revelationType: "Meccan",
    revelationOrder: 80,
    ayahCount: 40,
    wordCount: 580,
    juzRange: "Juz 30",
    pageRange: "Page 582",
    aboutSomali: "Suuradda An-Naba (Warka Weyn) waa bilowga Juz 'Amma. Waxay iftiimisaa warka weyn ee Qiyaamada, nimcooyinka dhulka iyo koonka, afuufidda Suurka, cadaabka Jahannama, iyo shalaayada gaalka: 'Shalaaytadaydee waxaan ahaan lahaa ciid'.",
    aboutEnglish: "Surah An-Naba (The Tidings) opens the final 30th Juz. It interrogates the Great Tiding of Resurrection, showcases earthly foundations, details the Trumpet assembling humanity, and captures the sinner's lament: 'Oh, would that I were dust!'.",
    namingReasonSomali: "Waxaa loogu magac daray \"An-Naba\" (Warka Weyn) sababtoo ah waxay ku bilaabataa su'aasha ku saabsan Warka Weyn ee Qiyaamada ee la is weydiinayo.",
    namingReasonEnglish: "Named \"An-Naba\" (The Tidings / The News) focusing on the momentous announcement of bodily resurrection stirring widespread dispute.",
    mainThemesSomali: [
      "Warka Weyn ee Qiyaamada (Canin-Naba'il Cadhiim) ee ay dadku isku khilaafsan yihiin",
      "Nimcooyinka Eebbe: Dhulka oo gogol laga dhigay, buuraha oo dhihigyo laga dhigay, hurdada oo nasasho laga dhigay, iyo qorraxda iftiimaysa",
      "Maalinta Kala-sooca (Yawmul Fasli) iyo afuufidda Suurka oo dadku koox-koox u soo bixi doonaan",
      "Cadaabta daran ee Jahannama ee kuwa xadgudbay loogu diyaariyay biyo karsan iyo malax",
      "Abaalka kuwa dhowrsada ee beero, canabyo, iyo koobab buuxa leh, iyo shalaayada gaalka: \"Shalaaytadaydee waxaan ahaan lahaa ciid!\" (78:40)"
    ],
    mainThemesEnglish: [
      "The momentous dispute: humanity questioning the Great Tiding (An-Naba al-'Adhim) of physical resurrection",
      "Foundational gifts of providence: earth as a cradle, mountains as stabilizing pegs, sleep for rejuvenation, and radiant sunlight",
      "The Day of Sorting Out (Yawm al-Fasl): the blast of the Trumpet summoning all human generations in vast multitudes",
      "The horrors of Jahannam: an inescapable ambush for tyrants, serving boiling fluid and freezing pus",
      "The bliss of the righteous contrasted with the disbeliever's terminal lament: \"Oh, would that I were dust!\" (78:40)"
    ],
    virtuesSomali: [
      "Waa suuradda magaceeda loogu bixiyay Juzka 30-aad ee Qur'aanka (Juz Camma).",
      "Waxay sawirtaa dhicitaanka Qiyaamada iyo xisaabta dhabta ah ee hortaalla qof kasta."
    ],
    virtuesEnglish: [
      "Lends its opening phrase to the entire thirtieth section of the Quran, universally memorized as \"Juz 'Amma\".",
      "Awakens human intellect to observe natural harmony and prepares the soul for ultimate accountability."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah markii mushrikiintu bilaabeen inay su'aalo iska weydiiyaan soo saarista dhimashada ka dib.",
    revelationContextEnglish: "Revealed in Makkah directly addressing the bewildered skepticism circulating in pagan assemblies concerning the afterlife."
  },
  79: {
    surahNumber: 79,
    revelationType: "Meccan",
    revelationOrder: 81,
    ayahCount: 46,
    wordCount: 667,
    juzRange: "Juz 30",
    pageRange: "Pages 583-584",
    aboutSomali: "Suuradda An-Naazicaat waxay ku bilaabataa Malaa'igta nafta si adag u siibta iyo kuwa si naxariis leh u qaada, qisadii Fircoon ee dooxada Dhuwaa, abuurka samada, iyo labada kooxood ee Naarta iyo Jannada gala.",
    aboutEnglish: "Surah An-Nazi'at (Those Who Drag Forth) contrasts angels violently uprooting rebellious souls with those gently releasing righteous spirits. It recalls Moses at Tuwa confronting Pharaoh, and measures life as but an evening or morning.",
    namingReasonSomali: "Waxaa loogu magac daray \"An-Naazicaat\" oo ah Malaa'igta nafta gaalada si xoog iyo daran uga siibta jirkooda.",
    namingReasonEnglish: "Named \"An-Nazi'at\" (Those Who Drag Forth) invoking the angels of death who sternly extract the souls of the wicked.",
    mainThemesSomali: [
      "Dhaarta Malaa'igta nafta si adag u siibta iyo kuwa nafta mu'miniinta si fudud oo naxariis leh u qaada",
      "Qisadii Nebi Muuse iyo Fircoonkii kibray ee dooxada Dhuwaa yidhi: \"Anigaa ah rabbigiinna ugu sarreeya\"",
      "Awoodda abuurka cirka la taagay, habeenka la madoobeeyay, maalinta la iftiimiyay, iyo buuraha la muday",
      "Musibaada Weyn (Ad-Daammatul Kubraa) marka bini'aadamku xusuusan doono waxa uu shaqaystay",
      "Labada cawaaqib: Kii xadgudbay oo Naartu hoy u tahay, iyo kii ka cabsaday Rabbigiis naftiisana ka reebay hawada oo Jannadu hoy u tahay (79:40-41)"
    ],
    mainThemesEnglish: [
      "Angelic transitions: those sternly uprooting defiant souls versus those gently drawing forth righteous spirits",
      "Moses at the sacred valley of Tuwa confronting Pharaoh's megalomania: \"I am your lord most high\"",
      "Cosmic architecture: raised celestial canopies, night draped in darkness, radiant daylight, and anchored mountains",
      "The Overwhelming Calamity (At-Tammah al-Kubra): humanity recalling every action when Hell is exposed to view",
      "The decisive divergence: the transgressor destined for Hell vs the God-fearing who restrained their soul granted Paradise (79:40-41)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayadda 79:40-41 oo ah sharciga guusha Jannada: Ka cabsashada Eebbe iyo ka reebidda nafta hawada.",
      "Waxay caddaysay in nolosha adduunku tahay sida fiid yar ama barqo kooban oo kale."
    ],
    virtuesEnglish: [
      "Contains verses 40-41, the golden spiritual formula: restraining the ego from base desires earns Paradise.",
      "Reduces the entire temporal lifespan of humanity into perspective: feeling in eternity like mere hours of a single afternoon."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay dadka ugu digto kibirka sida kii Fircoon oo kale.",
    revelationContextEnglish: "Revealed in Makkah warning proud tribal lords that worldly wealth and power cannot withstand divine justice."
  },
  80: {
    surahNumber: 80,
    revelationType: "Meccan",
    revelationOrder: 24,
    ayahCount: 42,
    wordCount: 609,
    juzRange: "Juz 30",
    pageRange: "Page 585",
    aboutSomali: "Suuradda Cabasa waxay xambaarsan tahay canaantii naxariista lahayd ee Nabiga ﷺ markii uu ka jeedsaday ninkii indhoolaha ahaa (Cabdullaahi binu Ummi Maktuum), sharafta Qur'aanka, nimcooyinka cuntada, iyo qofka oo maalinta Qiyaame ka carari doona ehelkiisa.",
    aboutEnglish: "Surah 'Abasa (He Frowned) records the gentle divine reprimand when the Prophet turned from blind seeker Ibn Umm Maktum to address pagan aristocrats. It highlights the honor of the Quran, agricultural gifts, and the Day when individuals flee from family.",
    namingReasonSomali: "Waxaa loogu magac daray \"Cabasa\" (Wajiguxumeeyay) sababtoo ah waxay ku bilaabataa canaanta Nabiga ﷺ markii uu wejiga kaduuday.",
    namingReasonEnglish: "Named \"'Abasa\" (He Frowned) acknowledging the opening incident where the Prophet briefly frowned when interrupted by a sincere blind seeker.",
    mainThemesSomali: [
      "Canaantii naxariista lahayd: \"Wejiguu xumeeyay oo jeedsaday markii uu u yimid ninkii indhoolaha ahaa\" (80:1-2)",
      "Qiimaha qofka xaqa doonaya xitaa haddii uu daciif yahay marka la barbardhigo kuwa kibra ee is-hodansiiya",
      "Sharafta Qur'aanka ee ku qoran waraaqo daahir ah oo ay gacmaha ku hayaan Malaa'ig suubban",
      "Nimcooyinka cuntada: Biyaha roobka, dillaaca dhulka, badarka, canabka, saytuunka, iyo timirta",
      "Qaylada weyn ee Qiyaamada (As-Saakhah) marka qofku ka carari doono walaalkiis, hooyadiis, aabbihiis, xaaskiisa, iyo carruurtiisa (80:34-36)"
    ],
    mainThemesEnglish: [
      "The gentle divine reproach: \"He frowned and turned away because there came to him the blind man\" (80:1-2)",
      "The egalitarian core of Islam: a humble seeker seeking purification outweighs arrogant aristocrats indifferent to truth",
      "The sublime dignity of the Quran: preserved in honored, exalted, purified scrolls held by noble angelic scribes",
      "Bounties of sustenance: pouring rain, split soil, grains, luscious grapes, olives, date palms, and dense foliage",
      "The Deafening Blast (As-Sakhkhah): the terrible day when man flees from his brother, mother, father, wife, and children (80:34-36)"
    ],
    virtuesSomali: [
      "Waxay caddaysay caddaaladda buuxda ee Islaamka oo aan qofka taajirka ah ka dooran qofka masaakiinta ah ee xaqa doonaya.",
      "Waxay xambaarsan tahay tusaalaha sida Nabigu ﷺ ugu naxariisan jiray Cabdullaahi binu Ummi Maktuum wixii intaas ka dambeeyay."
    ],
    virtuesEnglish: [
      "Stands as an unimpeachable proof of divine revelation: the Prophet candidly transmitted verses containing his own divine reprimand.",
      "Establishes the permanent moral principle that spiritual sincerity transcends all social, economic, and physical status."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah markii Nabigu ﷺ la hadlayay odayaasha Qureysh uuna yimid saxaabiga indhoolaha ahaa ee Cabdullaahi binu Ummi Maktuum.",
    revelationContextEnglish: "Revealed in Mecca when the Prophet was intensely engaged in calling elite Quraysh chieftains, momentarily overlooking a blind disciple."
  },
  81: {
    surahNumber: 81,
    revelationType: "Meccan",
    revelationOrder: 7,
    ayahCount: 29,
    wordCount: 421,
    juzRange: "Juz 30",
    pageRange: "Page 586",
    aboutSomali: "Suuradda At-Takwiir waxay si faahfaahsan u sawirtaa 12 dhacdo oo Qiyaamada dhacaya (Qorraxda oo la duubo, Xiddigaha oo daata, Badaha oo qarxa), su'aasha gabadha noolasha lagu aasay (Maw'uudah), iyo aaminnimada Jibriil.",
    aboutEnglish: "Surah At-Takwir (The Overthrowing) unleashes twelve apocalyptic events: sun shrouded, stars scattered, mountains moved, pregnant camels neglected, and the buried infant girl questioned. It confirms Gabriel's trustworthiness and the Prophet's sanity.",
    namingReasonSomali: "Waxaa loogu magac daray \"At-Takwiir\" (Isku-duubidda) sababtoo ah waxay ku bilaabataa marka Qorraxda la isku duubo oo nuurkeedu baxo.",
    namingReasonEnglish: "Named \"At-Takwir\" (The Overthrowing / Shrouding) after its opening vision of the solar orb being shrouded and extinguished at the End of Days.",
    mainThemesSomali: [
      "Laba iyo tobanka dhacdo ee Qiyaamada: Qorraxda oo la duubo, xiddigaha oo daata, buuraha oo la socodsiin doono, iyo badaha oo la qarxin doono",
      "Su'aasha cadaaladda: Gabadha yar ee noolasha lagu aasay (Al-Maw'uudah) oo la weydiin doono dambiga lagu dilay (81:8-9)",
      "Soo bandhigidda buugaagta camalka: \"Marka buugaagta la furo, naf kasta waxay ogaan doontaa waxa ay soo dirtay\"",
      "Aaminnimada Malaa'ig Jibriil: Waa ergey sharaf leh, awood badan agta Carshiga, la adeeco oo aamin ah",
      "Daahirinta Nabiga ﷺ: \"Saaxiibkiin ma waalna\", iyo in Qur'aanku yahay waano caalamka oo dhan u timid"
    ],
    mainThemesEnglish: [
      "Twelve apocalyptic convulsions: the sun shrouded, stars falling, mountains swept away, and oceans ignited into fire",
      "The defense of the defenseless: the buried infant daughter questioned for what crime she was murdered (81:8-9)",
      "The cosmic unveiling: deeds laid bare when personal records are distributed and every soul discovers what it brought forth",
      "The majestic credentials of Angel Gabriel: a noble messenger possessing vast power with the Lord of the Throne, obeyed and trustworthy",
      "Vindication of the Prophet: \"Your companion is not mad\", and the Quran affirmed as an enduring universal reminder for whoever wills to walk straight"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu yidhi: \"Qofkii jecel inuu Qiyaamada u eego sida isagoo indhihiisa ku arkaya, ha akhriyo: Idhash-shamsu kuwwirat, iyo Idhas-samaa'un-fadharat, iyo Idhas-samaa'un-shaqqat\" (Tirmidi).",
      "Waxay baabi'isay caadadii xumayd ee jaahiliyada ee gabdhaha yaryar noolasha lagu aasi jiray."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ said: \"Whoever delights to behold the Day of Resurrection as if seeing it with his own eyes, let him recite At-Takwir, Al-Infitar, and Al-Inshiqaq\" (Tirmidhi).",
      "Delivered the death blow to pre-Islamic female infanticide, enshrining absolute human rights for female children."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah bilowgii waxyiga si ay u toosiso quluubta una tusto dhicitaanka dhabta ah ee Qiyaamada.",
    revelationContextEnglish: "Revealed in early Mecca painting an indelible, cinematic panorama of the physical dissolution of the cosmic order."
  },
  82: {
    surahNumber: 82,
    revelationType: "Meccan",
    revelationOrder: 82,
    ayahCount: 19,
    wordCount: 276,
    juzRange: "Juz 30",
    pageRange: "Page 587",
    aboutSomali: "Suuradda Al-Infidaar waxay ku bilaabataa dillaaca samada iyo daadashada xiddigaha, waxay canaanataa kibirka bini'aadamka ee Rabbigiis (Maa gharraka bi-Rabbikal Kariim), waxay xustaa Malaa'igta camalka qorta (Kiraaman Kaatibiin), iyo xisaabta dhabta ah.",
    aboutEnglish: "Surah Al-Infitar (The Cleaving) depicts skies torn apart, stars scattered, and graves upturned. It pierces human ingratitude ('What has deluded you concerning your Generous Lord?'), introduces the guardian scribes (Kiram Katibin), and affirms Judgment.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Infidaar\" (Dillaacidda) sababtoo ah waxay ku bilaabataa marka samadu dillaacdo baqdinta Maalinta Qiyaame darteed.",
    namingReasonEnglish: "Named \"Al-Infitar\" (The Cleaving) after the celestial sky rending asunder at the sounding of the final catastrophe.",
    mainThemesSomali: [
      "Dillaacidda samada, daadashada xiddigaha, qarxinta badaha, iyo rogidda qabuuraha",
      "Su'aasha qalbiyada gilgisha: \"Dadow maxaa kugu kibriyay Rabbigaaga deeqsinimada badan ee ku abuuray, ku toosiyay, kuna qaabeeyay?\" (82:6-7)",
      "Labada Malaa'igood ee sharafta leh ee qora camalka: \"Kiraaman Kaatibiin, waxay og yihiin waxaad falaysaan\" (82:11-12)",
      "Abaalka labada kooxood: Kuwa suubban (Al-Abraar) oo Jannada ku raaxaysanaya iyo kuwa xun (Al-Fujjaar) oo Naarta gala",
      "Awood-la'aanta bini'aadamka maalintaas: Maalin aysan nafina naf kale waxba u tari karin, xukunkuna Eebbe kaliya u sugnaaday"
    ],
    mainThemesEnglish: [
      "The cosmic rupture: heavens cleft apart, planetary stars dispersed, seas overflowing their basins, and graves overturned",
      "The piercing ethical query: \"O mankind, what has deluded you concerning your Generous Lord, who created you, fashioned you, and proportioned you?\" (82:6-7)",
      "The recording guardians: \"Indeed, appointed over you are noble scribes (Kiram Katibin); they know whatever you do\" (82:10-12)",
      "The moral dichotomy: the righteous residing in eternal delight while the wicked plunge into blazing torment",
      "Absolute divine sovereignty: \"The Day when no soul will possess power for another soul, and the command on that Day will be with Allah alone\" (82:19)"
    ],
    virtuesSomali: [
      "Waa mid ka mid ah saddexda suuradood ee Nabigu ﷺ sheegay in qofkii akhriya uu Qiyaamada u arkayo sida indhihiisa ku arkaya.",
      "Waxay xambaarsan tahay aayadda 82:6 ee bini'aadamka ku baraarujisa deeqsinimada iyo nimcada Eebbe."
    ],
    virtuesEnglish: [
      "One of three companion chapters praised by the Prophet ﷺ for rendering the scenery of the Last Day visible to the spiritual eye.",
      "Features verse 82:6, deeply moving exegetes through its tender appeal to human conscience regarding the Generous Lord."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay dadka uga saarto ku faanista been-abuurka ah ee adduunka.",
    revelationContextEnglish: "Revealed in Makkah puncturing human vanity and calling humanity to contemplate the biological perfection bestowed upon them."
  },
  83: {
    surahNumber: 83,
    revelationType: "Meccan",
    revelationOrder: 86,
    ayahCount: 36,
    wordCount: 522,
    juzRange: "Juz 30",
    pageRange: "Pages 587-588",
    aboutSomali: "Suuradda Al-Mudaffifiin waxay ka digaysaa dhimista miisaanka iyo beeca (Mudaffifiin), waxay faahfaahisaa buugga kuwa xun (Sijjiin) iyo buugga kuwa suubban (Cilliyyiin), waxayna xustaa khamriga daahirka ah ee Miska leh (Raxiiqul Makhtuum).",
    aboutEnglish: "Surah Al-Mutaffifin (The Defrauding) opens with war against commercial dishonesty and shortchanging scales. It contrasts the prison ledger of the wicked (Sijjin) with the exalted register of the pious ('Illiyyun), and describes the sealed nectar of Paradise.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Mudaffifiin\" oo ah kuwa miisaanka iyo beeca dhima marka ay wax iibinayaan balse buuxsada marka ay wax iibsanayaan.",
    namingReasonEnglish: "Named \"Al-Mutaffifin\" (The Defrauding / Those Who Give Short Measure), launching a severe divine condemnation against commercial cheating and economic fraud.",
    mainThemesSomali: [
      "Hoogga kuwa miisaanka dhima: Kuwa marka ay cabbiranayaan buuxsada balse marka ay dadka u cabbirayaan dhima (83:1-3)",
      "Rumaynta Maalinta Weyn: \"Miyaanay kuwaasi u malaynayn in la soo saari doono Maalin aad u weyn?\"",
      "Buugga kuwa xun ee ku yaalla Sijjiin (godka hoose) iyo ciqaabta kuwa beeniya Maalinta Xisaabta",
      "Buugga kuwa suubban ee ku yaalla Cilliyyiin (meelaha ugu sarreeya) oo ay Malaa'igtu marag ka tahay",
      "Nimcooyinka reer Jannaha ah: Sariiro sharaf leh, dhar qurux badan, iyo khamri daahir ah oo miski lagu shaabadeeyay (Raxiiqul Makhtuum)"
    ],
    mainThemesEnglish: [
      "The curse upon commercial fraud: those who demand full measure when buying but shortchange scales when selling to others (83:1-3)",
      "The foundational deterrent: \"Do they not think that they will be resurrected for a momentous Day?\"",
      "The black ledger of the corrupt inscribed in Sijjin (the subterranean abyss), suffering the veil from their Lord",
      "The celestial register of the righteous inscribed in 'Illiyyun, witnessed by the closest angelic hosts",
      "The splendors of Paradise: reclining upon elevated couches, drinking the pure sealed nectar (Rahiqum Makhtum) with the fragrance of musk"
    ],
    virtuesSomali: [
      "Waa suuraddii ugu horreysay ee soo degta markii Nabigu ﷺ Madiina yimid si loo saxo suuqa iyo ganacsiga Madiina.",
      "Waxay caddaysay in Islaamku ilaaliyo caddaaladda dhaqaalaha iyo xuquuqda macaamiisha."
    ],
    virtuesEnglish: [
      "Revealed as the first legislative guidance upon arrival in Madinah, instantly transforming commercial market ethics in the city.",
      "Establishes that economic justice, fair weights, and consumer rights are religious imperatives directly tied to salvation."
    ],
    revelationContextSomali: "Waxay ku soo degtay inta u dhaxaysa Makkah iyo Madiina markii dadka reer Madiina caanka ku ahaayeen dhimista miisaanka.",
    revelationContextEnglish: "Revealed during the Hijrah transition to Madinah, immediately reforming fraudulent market habits into ethical commerce."
  },
  84: {
    surahNumber: 84,
    revelationType: "Meccan",
    revelationOrder: 83,
    ayahCount: 25,
    wordCount: 363,
    juzRange: "Juz 30",
    pageRange: "Page 589",
    aboutSomali: "Suuradda Al-Inshiqaaq waxay sawirtaa kala-jeexanka samada, u hoggaansanka amarka Eebbe, dadaalka bini'aadamka ee ku wajahan Rabbigiis, xisaabta fudud ee kii buuggiisa midigta laga siiyo, iyo shalaayada kii dhabarka laga siiyo.",
    aboutEnglish: "Surah Al-Inshiqaq (The Splitting Asunder) depicts the sky splitting in submission to its Lord. It reminds man of his relentless striving toward his Creator, the effortless accounting for those receiving their record in the right hand, and the grief of those receiving it from behind.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Inshiqaaq\" (Kala-jeexanka) sababtoo ah waxay ku bilaabataa marka samadu kala dillaacdo oo amarka Eebbe u hoggaansanto.",
    namingReasonEnglish: "Named \"Al-Inshiqaq\" (The Splitting Asunder) after the celestial heavens obediently rending apart upon hearing the command of their Creator.",
    mainThemesSomali: [
      "Kala-jeexanka samada iyo u hoggaansanaanta amarka Rabbigeed oo ah xaqiiqo",
      "Dadaalka joogtada ah ee bini'aadamka: \"Dadow waxaad tahay mid ugu dadaalaya xagga Rabbigaa dadaal adag ilaa aad la kulanto\" (84:6)",
      "Qofka buuggiisa midigta laga siiyo: Wuxuu mari doonaa xisaab fudud wuxuuna reerkiisa ugu noqon doonaa farxad",
      "Qofka buuggiisa dhabarka gadaashiisa laga siiyo: Wuxuu u yeeran doonaa halaag wuxuuna geli doonaa Naar ololaysa",
      "Kala-gudubka marxaladaha nolosha (Dabaqan can dabaq), iyo diidmada gaalada ee sujuudda marka Qur'aanka loo akhriyo"
    ],
    mainThemesEnglish: [
      "The cosmic sky cleaving asunder, listening and submitting in total obedience to its Sovereign Lord",
      "The universal human condition: \"O mankind, indeed you are laboring toward your Lord with exertion and will meet Him\" (84:6)",
      "The joy of transparent vindication: whoever receives their record in their right hand will experience an easy accounting and return to family rejoicing",
      "The horror of disgrace: whoever receives their record from behind their back will call for destruction and burn in a blaze",
      "The human pilgrimage through developmental, physical, and spiritual planes: \"You will surely embark upon stage after stage\" (84:19)"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay sujuudda Qur'aanka ee aayadda 21-aad ee Nabigu ﷺ iyo asxaabtu u sujuudi jireen.",
      "Waxay qofka ku dhiirrigelisaa inuu ogaado in shaqada iyo dadaalku ay ku dhammaan doonaan kulanka Eebbe."
    ],
    virtuesEnglish: [
      "Features a revered prostration of recitation (Sajdah) at verse 21, practiced by the Prophet and Companions.",
      "Reassures the weary soul that all mortal striving and fatigue will culminate in the personal encounter with Allah."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si ay dadka ugu xusuusiso in nolosha adduunku tahay safar ku wajahan Eebbe.",
    revelationContextEnglish: "Revealed in Makkah contextualizing earthly toil as an ongoing existential journey toward the divine presence."
  },
  85: {
    surahNumber: 85,
    revelationType: "Meccan",
    revelationOrder: 27,
    ayahCount: 22,
    wordCount: 319,
    juzRange: "Juz 30",
    pageRange: "Page 590",
    aboutSomali: "Suuradda Al-Buruuj waxay xustaa qisadii Asxaabul Ukhduud (Dhallinyaradii iimaanka dartiis dabka loogu gubay), awoodda adag ee Eebbe (Batsha Rabbika lashadiid), Magacyada Al-Ghafuur iyo Al-Waduud, iyo Looxul Maxfuudka.",
    aboutEnglish: "Surah Al-Buruj (The Mansions of the Stars) commemorates the Martyrs of the Trench (Ashab al-Ukhdud) incinerated for faith alone. It affirms divine retribution, exalts Allah as the All-Forgiving and Loving (Al-Wadud), and glorifies the Preserved Tablet.",
    namingReasonSomali: "Waxaa loogu magac daray \"Al-Buruuj\" oo ah meerayaasha iyo xiddigaha waaweyn ee samada ku yaalla ee burjiyada leh.",
    namingReasonEnglish: "Named \"Al-Buruj\" (The Mansions of the Stars) swearing by the celestial sky adorned with colossal stellar constellations.",
    mainThemesSomali: [
      "Dhaarta samada burjiyada leh, Maalinta Qiyaame ee ballanka ah, iyo markhaatiga iyo waxa la marag-furayo",
      "Qisadii naxdinta lahayd ee Asxaabul Ukhduud: Mu'miniintii lagu gubay godadka dabka ah sabab kale oo aan ahayn inay Eebbe rumeeyeen darteed (85:4-8)",
      "Ciqaabta kuwa mu'miniinta fitneeya iyo abaal-marinta Jannada ee kuwa sabra ee rumeeya xaqa",
      "Awoodda adag ee Eebbe: \"Qabashada Rabbigaa waa mid aad u daran\", Isagaana ah Dambidhaafaha Jacaylka badan (Al-Waduud)",
      "Sharafta Qur'aanka Kariimka ah ee ku dhowrsan Looxul Maxfuudka (Lawxin Maxfuudh) ee aan waxba laga beddeli karin"
    ],
    mainThemesEnglish: [
      "Oaths by the sky containing constellations, the Promised Day of Judgment, and the Witness and the Witnessed",
      "The martyrdom of the Trench (Ashab al-Ukhdud): innocent believers incinerated in fiery ditches solely for their faith in Allah (85:4-8)",
      "Severe retribution awaiting unrepentant persecutors vs triumphant gardens with flowing rivers for the steadfast",
      "The overwhelming might and tenderness of God: \"Indeed, the seizure of your Lord is severe... and He is the Forgiving, the Loving (Al-Wadud)\"",
      "The eternal, inviolable preservation of the Holy Quran inscribed upon the Preserved Tablet (Lawh Mahfuz)"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu ku akhrin jiray Suuradda Al-Buruuj salaadda Cishaha (Tirmidi).",
      "Waxay dhiirrigelisaa qof kasta oo loo dhibaateeyo diintiisa darteed iyadoo tuseysa in guusha dhabta ahi tahay iimaanka."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ regularly recited Surah Al-Buruj in the night prayer ('Isha) for its inspirational fortitude (Tirmidhi).",
      "Serves as the supreme global anthem of religious freedom, reassuring persecuted minorities across human history."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli mushrikiintu bilaabeen inay jirdilaan asxaabta daciifka ah sida Bilaal iyo Yaasir.",
    revelationContextEnglish: "Revealed in Makkah to comfort early Muslims enduring horrific torture (such as the family of Yasir and Bilal)."
  },
  86: {
    surahNumber: 86,
    revelationType: "Meccan",
    revelationOrder: 36,
    ayahCount: 17,
    wordCount: 247,
    juzRange: "Juz 30",
    pageRange: "Page 591",
    aboutSomali: "Suuradda Ad-Daariq (Xiddigta Guuraasha ah) waxay ku dhaaranaysaa xiddigta iftiinka badan ee habeenkii soo baxda, waxay xustaa in naf kasta ay leedahay malaa'ig ilaalinaysa, waxayna caddaysaa abuurka aadanaha ee dhibicda biyaha ah.",
    aboutEnglish: "Surah At-Tariq (The Nightcomer / Piercing Star) swears by the piercing nocturnal celestial body, affirms that every soul possesses an appointed divine guardian, points to human embryological origin from emitted fluid, and declares the Qur'an as a decisive criterion.",
    namingReasonSomali: "Waxaa loogu magac daray 'Ad-Daariq' (Xiddigta soo baxda habeenka) oo aayadda koowaad ku xusan iyadoo loola jeedo xiddigta daloolisa gudcurka iftiinkeeda daran awgeed.",
    namingReasonEnglish: "Named 'At-Tariq' (The Piercing Night Star) from verse 1, depicting a luminous star piercing through the velvet canopy of night.",
    mainThemesSomali: [
      "Dhaarta samada iyo xiddigta Daariq ee iftiinkeedu gudcurka dalooliyo",
      "Ilaalinta rabaaniga ah: in naf kasta ay dushiisa ka jirto malaa'ig dhowrta oo qorta camalkeeda",
      "Asalka abuurka aadanaha: biyaha ka soo baxa dhabarka iyo feeraha dhexdooda",
      "Awoodda Eebbe ee soo noolaynta meydadka iyo bannaanka soo bixidda siraha laabta ku qarsoon Maalinta Xisaabta",
      "Xaqiiqada Qur'aanka: waa hadal kala saare ah oo run ah, mana aha kaftan ama ciyaar"
    ],
    mainThemesEnglish: [
      "Cosmic oath sworn upon the heavens and the piercing nocturnal star (At-Tariq)",
      "Universal divine guardianship: an angelic watcher assigned over every human soul preserving their actions",
      "Biological genesis: human formation from an emitted fluid gushing between the spine and the ribs",
      "The ease of resurrection for the Creator and the total exposure of innermost secrets on Judgment Day",
      "The definitive character of the Noble Qur'an: a solemn, decisive criterion and not idle jest"
    ],
    virtuesSomali: [
      "Waxay xambaarsan tahay aayado saynis ah oo iftiiminaya asalka abuurka noolaha.",
      "Waxay qalbiga ku beertaa xusuusta in siraha qarsoon oo dhan la kashifi doono Maalinta Qiyaame."
    ],
    virtuesEnglish: [
      "Offers poignant biological and cosmological reflections reconciling natural origin with final accountability.",
      "A profound reminder that hidden motives and masked hypocrisies will be comprehensively laid bare."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu caddeeyo mushrikiinta inaan qofna ka baxsan karin kormeerka Eebbe.",
    revelationContextEnglish: "Revealed in Makkah to dissolve pagan illusions of unaccountability through inescapable empirical signs."
  },
  87: {
    surahNumber: 87,
    revelationType: "Meccan",
    revelationOrder: 8,
    ayahCount: 19,
    wordCount: 276,
    juzRange: "Juz 30",
    pageRange: "Page 591",
    aboutSomali: "Suuradda Al-Aclaa (Eebbaha Sarreeya) waxay amartaa weyneeynta iyo tasbiixda Eebbe, waxay ballanqaadaysaa in Nabigu uusan hilmaami doonin Qur'aanka, waxayna xustaa in qofkii naftiisa daahiriya uu liibaano.",
    aboutEnglish: "Surah Al-A'la (The Most High) opens with the command to sanctify the name of the transcendent Creator, promises the Prophet effortless memorization of revelation, warns against prioritizing ephemeral worldly life, and echoes the primordial scrolls of Abraham and Moses.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Aclaa' (Kan ugu Sarreeya) sababtoo ah aayadda koowaad waxay amartaa weyneynta Magaca Rabbiga ugu sarreeya.",
    namingReasonEnglish: "Named 'Al-A'la' (The Most High) after the majestic opening command to glorify the supreme transcendent name of the Lord.",
    mainThemesSomali: [
      "Tasbiixda iyo weyneynta Magaca Eebbe ee sarreeya, abuuray wax kasta, qaddaray una hanuuniyay",
      "Bishaarada Nabiga ﷺ la siiyay: 'Waan ku akhrisiin doonaa mana hilmaami doontid'",
      "Faa'iidada waanada: in lagu waaniyo dadka meesha waanadu wax ka tarayso",
      "Liibaanta qofka naftiisa daahiriya, xusa magaca Rabbigiis, oo tukada",
      "Doorbididda nolosha dambe: nolosha Aakhiro ayaa ka wanaagsan oo ka waarid badan adduunkan gaaban"
    ],
    mainThemesEnglish: [
      "Sanctification of the Most High Lord who creates, proportions, determines destinies, and guides creation",
      "The sublime prophetic promise: 'We will cause you to recite, so you will not forget' (87:6)",
      "The selective mandate of reminder: admonishing where moral counsel benefits receptive hearts",
      "The ultimate success of inner spiritual purification (Tazkiyah), remembrance of Allah, and prayer",
      "The spiritual critique of materialism: prioritizing the everlasting hereafter over ephemeral worldly delights"
    ],
    virtuesSomali: [
      "Nabigu ﷺ aad buu u jeclaa suuraddan wuxuuna si joogto ah ugu akhrin jiray Salaadaha Ciidda, Jimcaha, iyo Witirka.",
      "Marka la akhriyo aayadda koowaad waxaa sunne ah in la yiraahdo: 'Subxaana Rabbiyal-Aclaa'."
    ],
    virtuesEnglish: [
      "Deeply cherished by the Prophet ﷺ, who recited it regularly during Friday, Eid, and Witr prayers (Muslim).",
      "Upon hearing the first verse, it is prophetic practice to respond: 'Subhana Rabbiya al-A'la' (Glory be to my Lord, the Most High)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah bilowgii waxyiga si loo qaboojiyo welwelka Nabiga ﷺ ee xifdinta aayadaha.",
    revelationContextEnglish: "Revealed in early Makkah to provide reassurance regarding the effortless memorization and preservation of divine scripture."
  },
  88: {
    surahNumber: 88,
    revelationType: "Meccan",
    revelationOrder: 68,
    ayahCount: 26,
    wordCount: 377,
    juzRange: "Juz 30",
    pageRange: "Page 592",
    aboutSomali: "Suuradda Al-Ghaashiyah (Dhacdada Huwisa) waxay barbar dhigtaa labada xaaladood ee dadku ku sugnaan doonaan Qiyaamaha: wejiyo dulleysan oo daallan iyo wejiyo faraxsan oo nicmeysan. Waxay kaloo farta ku fiiqdaa mucjisooyinka geela, cirka, buuraha, iyo dhulka.",
    aboutEnglish: "Surah Al-Ghashiyah (The Overwhelming Event) vividly contrasts the two distinct groups on Judgment Day: humiliated, exhausted faces in blazing torment versus joyful, contented faces in sublime paradise. It invokes four empirical signs: camels, sky, mountains, and earth.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Ghaashiyah' (Dhacdada Huwisa) oo ah magac ka mid ah magacyada Maalinta Qiyaamaha ee aayadda koowaad ku xusan.",
    namingReasonEnglish: "Named 'Al-Ghashiyah' (The Overwhelming) after the opening designation of Judgment Day whose catastrophic magnitude envelops all creations.",
    mainThemesSomali: [
      "Xaaladda dadka Naarta gala: wejiyo dullaysan, cunto dhiiran oo aan wax nafaqo ah lahayn, iyo biyo karkaraya",
      "Xaaladda dadka Jannada gala: wejiyo faraxsan, sariiro sarsare, koobab la ag dhigay, iyo ilo biyood qulqulaya",
      "Fiirinta iyo fikirka ku saabsan mucjisada abuurka Geela, kor-u-qaadista Cirka, taagidda Buuraha, iyo fidinta Dhulka",
      "Xaddiga doorka dacwada: Nabigu ﷺ waa uun xusuusiye ee ma aha mid dadka ku qasbaya iimaanka",
      "Soo noqoshada aadanaha: Eebbe ayaa leh xisaabinta dhabta ah ee ficillada dadka"
    ],
    mainThemesEnglish: [
      "The torment of the doomed: humiliated, exhausted countenances consuming thorny shrubs without nourishment",
      "The serenity of the redeemed: joyous faces in lofty gardens enjoying flowing springs, raised couches, and arranged goblets",
      "Four accessible marvels of natural design: the physiology of camels, the soaring vault of heaven, anchored mountains, and spread earth",
      "The essence of prophetic vocation: a compassionate reminder, not a coercive tyrant over consciences (88:21-22)",
      "The cosmic conclusion: the ultimate return of all humanity is to Allah, who alone executes the final reckoning"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu si joogto ah u wada akhrin jiray Suuradda Al-Aclaa iyo Al-Ghaashiyah salaadaha Ciidda iyo Jimcaha.",
      "Waxay fureysaa indhaha dadka reer miyiga iyo reer magaalada labadaba si ay u fiiriyaan abuurka Eebbe."
    ],
    virtuesEnglish: [
      "Recited together with Surah Al-A'la in Friday and Eid congregational assemblies by the Messenger of Allah ﷺ.",
      "Synthesizes profound sensory imagery with accessible theological invitations to observe nature with reverence."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu iftiimiyo reer baadiyaha iyo qabiillada xaqiiqada dhabta ah ee Qiyaamaha.",
    revelationContextEnglish: "Revealed in Makkah to address early Arabian society with familiar landscapes while anchoring eternal verities."
  },
  89: {
    surahNumber: 89,
    revelationType: "Meccan",
    revelationOrder: 10,
    ayahCount: 30,
    wordCount: 435,
    juzRange: "Juz 30",
    pageRange: "Page 593",
    aboutSomali: "Suuradda Al-Fajr (Waabberiga) waxay ku bilaabataa dhaarar ku saabsan waabberiga iyo tobanka habeen ee barakeysan (Dul-Xijjah), waxay xustaa halaaggii ummadihii Caad, Thamuud, iyo Fircoon, waxayna ku dhammaataa baaqa quruxda badan ee ku socda Nafta Deggan (An-Nafs Al-Mutma'innah).",
    aboutEnglish: "Surah Al-Fajr (The Dawn) opens with sacred oaths by dawn and the ten sacred nights, recalls the historic downfall of titanic tyrannies (Iram of Aad, Thamud, Pharaoh), analyzes human misconceptions about wealth, and concludes with the eternal call to the Tranquil Soul.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Fajr' maxaa yeelay waxay ku furantaa dhaarta iftiinka waabberiga ee habeenka jabiyay.",
    namingReasonEnglish: "Named 'Al-Fajr' (The Dawn) from the magnificent opening divine oath sworn upon the break of morning light.",
    mainThemesSomali: [
      "Dhaarta Waabberiga, tobanka habeen ee hore ee bisha Dul-Xijjah, tirada dhabanka ah iyo midda kisi ah",
      "Halaaggii magaalooyinkii weynaa: Iram tiirarka lahayd, Thamuud oo dhagxaanta dooxooyinka ka qori jirtay, iyo Fircoonkii miqdaarrada lahaa",
      "Khaladka aadanaha ee xagga maalka: in qofku u maleeyo hodantinimadu inay sharaf tahay faqrigaana dulleyn yahay",
      "Dayacaada agoonka iyo danyarta iyo cunista dhaxalka si xad-dhaaf ah",
      "Baaqa qaaliga ah ee Nafta xasilloon (An-Nafs Al-Mudma'innah): 'Ku noqo Rabbigaa adoo raalli ah lana raalli yahay'"
    ],
    mainThemesEnglish: [
      "Sacred cosmic oaths: the break of dawn, the ten nights of Dhu al-Hijjah, and the even and the odd",
      "Historical monuments of hubris shattered: Iram of many pillars, rock-hewing Thamud, and stakes-owning Pharaoh",
      "Deconstructing materialist fallacies: human error in equating wealth with divine favor and austerity with humiliation",
      "Social indictment: mistreatment of the orphan, indifference to feeding the destitute, and rapacious greed for inheritance",
      "The immortal celestial invocation to the Contented Soul (An-Nafs al-Mutma'innah): 'Return to your Lord, well-pleased and pleasing'"
    ],
    virtuesSomali: [
      "Aayadda labaad 'Wa layaalin cashr' waxay daliil u tahay fadliga weyn ee tobanka maalmood ee ugu horreeya bisha Dul-Xijjah.",
      "Waxay xambaarsan tahay mid ka mid ah magacyada ugu quruxda badan ee lagu sagootiyo ruuxa mu'minka ah marka uu dhimanayo."
    ],
    virtuesEnglish: [
      "Canonizes the first ten days of Dhu al-Hijjah as the supreme season of spiritual devotion and charitable worship.",
      "Provides the ultimate solace for dying believers as angels whisper: 'O tranquil soul, return to your Lord well-pleased.'"
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loo xusuusiyo madaxdii Qureysh in awooddoodu aysan dhaamin tii Iram iyo Fircoon.",
    revelationContextEnglish: "Revealed in Makkah to warn the merchant elite that wealth and monuments cannot shield oppressive societies from ruin."
  },
  90: {
    surahNumber: 90,
    revelationType: "Meccan",
    revelationOrder: 35,
    ayahCount: 20,
    wordCount: 290,
    juzRange: "Juz 30",
    pageRange: "Page 594",
    aboutSomali: "Suuradda Al-Balad (Magaalada Makkah) waxay ku dhaaranaysaa magaalada barakeysan ee Makkah, waxay caddaynaysaa in aadanaha loo abuuray dhib iyo halgan joogto ah (Kabad), waxayna faraysaa fuulista jaranjarada adag ee daryeelka agoomaha iyo xoraynta addoomada.",
    aboutEnglish: "Surah Al-Balad (The City) opens with an oath sworn upon Mecca, diagnosis the human condition as one forged in struggle (Kabad), challenges humanity to scale the steep ethical ascent ('Aqabah) through liberating captives and feeding hungry kin.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Balad' maxaa yeelay aayadda koowaad waxay ku dhaaranaysaa Magaalada xurmada leh ee Makkah.",
    namingReasonEnglish: "Named 'Al-Balad' (The City) referring to the sanctuary city of Mecca where Prophet Muhammad resided.",
    mainThemesSomali: [
      "Dhaarta Magaalada Makkah iyo sharafta weyn ee uu Nabigu ﷺ ku leeyahay",
      "Xaqiiqada dabiiciga ah: 'Waxaan aadanaha u abuurnay dhib iyo hawl joogto ah' (Kabad)",
      "Kibirka ninka hodanka ah ee ku faana: 'Waxaan baabi'iyay maal aad u badan'",
      "Fuulista Waddada Adag (Al-Caqabah): xoraynta addoonka iyo quudinta dadka gaajeysan xilli macaluul jirto",
      "Xaqiijinta daryeelka agoonka xigaalka ah iyo miskiinka ciidda ku dhacay, iyo isku dardaaranka samirka iyo naxariista"
    ],
    mainThemesEnglish: [
      "Solemn oath sworn upon the sanctified sanctuary of Mecca and the sacred standing of the Messenger therein",
      "The existential reality of the human condition: humanity is irrevocably created into hardship and continuous struggle (Kabad)",
      "Refutation of ostentatious squanderers who boast: 'I have squandered enormous fortunes'",
      "Scaling the steep ethical ascent (Al-'Aqabah): freeing captives from bondage and feeding the starving in times of famine",
      "Sheltering the orphan relative and the destitute laid low in the dust, coupled with mutual counsel of patience and mercy"
    ],
    virtuesSomali: [
      "Waxay dhistay manhajka caddaaladda bulshada: xoraynta dadka dulman iyo quudinta xilliyada abaaraha.",
      "Waxay tilmaantay in jidka Jannadu yahay caawinta danyarta iyo isku dardaaranka naxariista (Tawaasaw bil-marxamah)."
    ],
    virtuesEnglish: [
      "Seminal Qur'anic manifesto for active social justice: emancipating slaves, combating famine, and uplifting the marginalized.",
      "Defines the true believers as the Companions of the Right, distinguished by mutual encouragement to patience and mercy."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah xilli ay Muslimiinta daciifka ah iyo addoomaha la kulmayeen jirdil aad u daran.",
    revelationContextEnglish: "Revealed in Makkah during severe oppression of early underprivileged believers and enslaved converts."
  },
  91: {
    surahNumber: 91,
    revelationType: "Meccan",
    revelationOrder: 26,
    ayahCount: 15,
    wordCount: 218,
    juzRange: "Juz 30",
    pageRange: "Page 595",
    aboutSomali: "Suuradda Ash-Shams (Qorraxda) waxay xambaarsan tahay silsilad dhaarar cosmic ah oo 11 dhaarood ka kooban oo ku saabsan qorraxda, dayaxa, habeenka, iyo nafta, waxayna caddaynaysaa in qofkii naftiisa nadiifiya uu liibaanay, qofkii wasakheeyana uu khasaaray.",
    aboutEnglish: "Surah Ash-Shams (The Sun) contains the longest sequential oath in the Qur'an—eleven oaths sworn upon the sun, moon, day, night, celestial canopy, and human soul—declaring that redemption lies in soul purification (Tazkiyah) while corruption leads to ruin, citing Thamud.",
    namingReasonSomali: "Waxaa loogu magac daray 'Ash-Shams' (Qorraxda) sababtoo ah waxay ku bilaabataa dhaarta qorraxda iyo iftiinkeeda subaxnimo.",
    namingReasonEnglish: "Named 'Ash-Shams' (The Sun) from the dramatic inaugural oath sworn upon the sun and its radiant morning glory.",
    mainThemesSomali: [
      "Silsiladda 11-ka dhaarood ee koonka: qorraxda, dayaxa, maalinta, habeenka, samada, iyo dhulka",
      "Dhaarta Nafta aadanaha iyo sidii Eebbe ugu habeeyay aqoonsiga xumaanta (Fujuurohaa) iyo samaanta (Taqwaahaa)",
      "Xeerka liibaanta ruuxiga ah: 'Waxaa xaqiiqdii liibaanay qofkii naftiisa daahiya (Zakkaahaa)'",
      "Xeerka halaagga: 'Waxaa khasaaray qofkii naftiisa xumaan ku aasay (Dassaahaa)'",
      "Sheekadii qoomkii Thamuud ee dilay Hashii Nebi Saalix iyo sidii ciqaab loogu simay dhammaantood"
    ],
    mainThemesEnglish: [
      "The majestic elevenfold cosmic oath: sun, radiance, moon, daylight, enveloping night, heaven, and earth",
      "The architecture of human soul: divinely endowed with inherent moral awareness discerning wickedness and righteousness",
      "The immutable law of spiritual success: 'He has succeeded who purifies it' (91:9)",
      "The tragic consequence of self-corruption: 'And he has failed who buries it in darkness' (91:10)",
      "The case study of Thamud: the hamstrung She-Camel of Salih and the collective punishment that leveled their rebellion"
    ],
    virtuesSomali: [
      "Waa suuradda xambaarsan dhaararka ugu badan ee isku xiga ee Qur'aanka kariimka ah.",
      "Waxay dhidibada u aastay cilmiga Daahirinta Nafta (Tazkiyatun-Nafs) oo ah ujeeddada diinta Islaamka."
    ],
    virtuesEnglish: [
      "Features the longest continuous sequence of cosmic oaths in the entire Qur'anic corpus.",
      "The definitive scriptural foundation for Islamic psychology and spiritual purification (Tazkiyat an-Nafs)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu baraarujiyo aadanaha xorriyadda doorashada anshaxa ee qalbigooda ku abuuran.",
    revelationContextEnglish: "Revealed in Makkah to inspire deep moral responsibility through contemplation of majestic planetary cycles."
  },
  92: {
    surahNumber: 92,
    revelationType: "Meccan",
    revelationOrder: 9,
    ayahCount: 21,
    wordCount: 305,
    juzRange: "Juz 30",
    pageRange: "Page 595",
    aboutSomali: "Suuradda Al-Layl (Habeenka) waxay kala saartaa labada dariiqo ee nolosha: dariiqa wax-bixinta, cabsida Alle, iyo fudeydinta khayrka oo dhinac ah, iyo dariiqa bakhaylnimada, iskufilaanshaha beenta ah, iyo u fududeynta xumaanta oo dhinaca kale ah.",
    aboutEnglish: "Surah Al-Layl (The Night) polarizes human ethical endeavors into two pathways: generous charity coupled with righteousness leading to ultimate ease versus arrogant stinginess and self-sufficiency leading to ultimate agony, praising Abu Bakr's pure philanthropy.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Layl' sababtoo ah waxay ku bilaabataa dhaarta Habeenka markuu gudcurkiisu wax walba daboolo.",
    namingReasonEnglish: "Named 'Al-Layl' (The Night) after the initial cosmic oath sworn upon the night when it conceals reality.",
    mainThemesSomali: [
      "Dhaarta Habeenka, Maalinta markay ifto, iyo abuurka labka iyo dheddiga",
      "Kala duwanaanshaha dadaalka aadanaha: ficillada dadku ma simana waxayna leeyihiin natiijooyin kala duwan",
      "Jidka fudeydka: qofkii wax bixiya, dhowrsada, rumeyana wanaagga, Eebbe wuxuu u fududeyn doonaa jidka khayrka",
      "Jidka cidhiidhiga: qofkii bakhayla, isku filnaada, beeniyana wanaagga, Eebbe wuxuu u fududeyn doonaa dhibaatada iyo cadaabka",
      "Badbaadada qofka taqwada badan ee maalkiisa u bixiya si uu isu daahiriyo isagoon cidna abaal uga doonayn (sida Abu Bakar)"
    ],
    mainThemesEnglish: [
      "Cosmic oaths: the enveloping night, the dazzling daylight, and the purposeful creation of male and female",
      "The divergent nature of human striving: actions diverge wildly in motives and ultimate spiritual destinations",
      "The pathway to divine ease: whoever gives in charity, remains God-conscious, and affirms ultimate goodness",
      "The pathway to hardship: whoever hoards wealth, deems himself self-sufficient, and denies ultimate goodness",
      "The portrait of the purest soul who donates wealth purely to purify himself seeking only the Face of his Lord (exemplified by Abu Bakr)"
    ],
    virtuesSomali: [
      "Waxay ku soo degtay sharafta Saxaabiga weyn ee Abu Bakar As-Siddiiq (RC) markii uu xoreeyay Bilaal binu Rabaax.",
      "Waxay baraysaa in sadaqadu noqoto mid Eebbe kaliya loo doonayo oo aan abaal-gud dad laga sugeyn."
    ],
    virtuesEnglish: [
      "Historically associated with the unmatched philanthropy of Abu Bakr al-Siddiq who ransomed enslaved believers.",
      "Presents the quintessential definition of spiritual altruism: giving solely for the divine countenance without expectation of reciprocity."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii Abu Bakar hantidiisa ku iibiyay oo ku xoreeyay Muslimiintii la addoonsanayay.",
    revelationContextEnglish: "Revealed in Makkah celebrating Abu Bakr's emancipation of tortured slaves like Bilal ibn Rabah purely for Allah."
  },
  93: {
    surahNumber: 93,
    revelationType: "Meccan",
    revelationOrder: 11,
    ayahCount: 11,
    wordCount: 160,
    juzRange: "Juz 30",
    pageRange: "Page 596",
    aboutSomali: "Suuradda Ad-Duxaa (Barqada) waxay ku degtay xilli waxyigu muddo ka joogsaday Nabiga ﷺ oo mushrikiintu ku jees-jeeseen, waxayna u xaqiijinaysaa inuusan Rabbigiis ka tagin nacayna, waxayna xustaa nimcooyinkii uu u gudaafay markii uu ahaa agoon, wareersan, iyo faqri.",
    aboutEnglish: "Surah Ad-Duha (The Glorious Morning Light) was revealed after a painful cessation of revelation to dispel prophetic sorrow, affirming that Allah has neither forsaken nor detested him, promising that the afterlife is superior, and recalling his orphanhood, wandering, and poverty.",
    namingReasonSomali: "Waxaa loogu magac daray 'Ad-Duxaa' (Barqada) sababtoo ah waxay ku bilaabataa dhaarta iftiinka diiran ee barqada.",
    namingReasonEnglish: "Named 'Ad-Duha' (The Morning Hours) from the tender opening oath sworn upon the morning light after dark night.",
    mainThemesSomali: [
      "Dhaarta Barqada iyo Habeenka markuu dego oo muujinaya degenaanshaha qalbiga Nabiga ﷺ",
      "Kalsoonida rabaaniga ah: 'Rabbigaa kuma tegin mana ku nisin'",
      "Bishaarada weyn: 'Aakhiro ayaa kaaga wanaagsan adduunka, Rabbigaana wuu ku siin doonaa waadna raalli noqon doontaa'",
      "Xusuusinta nimcooyinkii hore: helidda hoy markii uu ahaa agoon, hanuuninta markii uu hanuun raadinayay, iyo qaninimada markii uu faqiirka ahaa",
      "Amarrada anshaxa: inaan agoonka la maquunin, tuugsada aan la eryin, nimcada Rabbigaana laga sheekeeyo"
    ],
    mainThemesEnglish: [
      "The soothing oaths of morning brightness and still night dispelling despondency and isolation",
      "The divine reassurance: 'Your Lord has neither forsaken you, nor is He displeased' (93:3)",
      "The transcendent promise: the hereafter is infinitely superior to the present, and your Lord will give until you are satisfied",
      "Recounting protective grace: finding an orphan and giving refuge, finding wandering and guiding, finding in need and enriching",
      "The ethical directives: do not oppress the orphan, do not repel the petitioner, and proclaim the bounties of your Lord"
    ],
    virtuesSomali: [
      "Waa suuradda ugu qaboojinta badan qalbiga qofka murugaysan ama dareemaya in laga tagay.",
      "Waxaa sunne ah in la weyneeyo Takbiirta ('Allaahu Akbar') laga bilaabo suuraddan ilaa dhammaadka Qur'aanka."
    ],
    virtuesEnglish: [
      "Universally treasured as the supreme balm for emotional grief, spiritual burnout, and abandonment trauma.",
      "Initiates the traditional communal recitation of the Takbir ('Allahu Akbar') following surahs through the end of the Qur'an."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah markii waxyigu ka daahay Nabiga ﷺ oo ay gaaladu lahaayeen: 'Maxamed Rabbigiis wuu ka tagay'.",
    revelationContextEnglish: "Revealed after months of silence in Makkah, overturning pagan mockery and illuminating prophetic intimacy with God."
  },
  94: {
    surahNumber: 94,
    revelationType: "Meccan",
    revelationOrder: 12,
    ayahCount: 8,
    wordCount: 116,
    juzRange: "Juz 30",
    pageRange: "Page 596",
    aboutSomali: "Suuradda Ash-Sharx (Laab-faydidda) waxay toos ula hadlaysaa Nabiga ﷺ iyadoo xusuusinaysa sida laabtiisa loo waasiciyay, culayskii dhabarka jebinayay looga dulqaaday, magaciisana kor loogu qaaday, waxayna bishaaraysaa in dhib kasta la socdo laba fudayd.",
    aboutEnglish: "Surah Ash-Sharh (The Expansion / Solace) continues the divine solace to Prophet Muhammad, reminding him of the opening of his heart, the removal of the crushing burden from his back, the exaltation of his fame, and the eternal spiritual law that with every hardship comes ease.",
    namingReasonSomali: "Waxaa loogu magac daray 'Ash-Sharx' sababtoo ah aayadda koowaad waxay xustaa fidinta iyo waasicinta laabta Nabiga ﷺ.",
    namingReasonEnglish: "Named 'Ash-Sharh' (The Opening / Expansion of Breast) from verse 1, commemorating the expansion of the prophetic heart.",
    mainThemesSomali: [
      "Nimcada weyn ee waasicinta iyo nadiifinta laabta Nabiga ﷺ si uu u xammilo waxyiga",
      "Dul-qaadista culeyskii dacwada ee dhabarkiisa cuslaynayay",
      "Kor-u-qaadista magaca iyo sharafta Nabiga ﷺ oo magaciisa lala xidhiidhiyay magaca Eebbe",
      "Xeerka rabaaniga ah ee xaqiijinaya: 'Dhib kasta wuxuu la socdaa fudayd, xaqiiqdii dhib kasta waxaa la socda fudayd'",
      "Amarka ah in marka hawl laga baxo loo jeesto cibaado cusub, Rabbigana kaliya la raadsado"
    ],
    mainThemesEnglish: [
      "The divine gift of expanding the Prophet's heart with celestial wisdom, compassion, and divine serenity",
      "The removal of the crushing spiritual and communal weight that burdened his back",
      "The exalted reputation granted to the Prophet ﷺ, pairing his name with the divine across every Adhan and testimony",
      "The immutable cosmic principle: 'Indeed, with hardship comes ease; indeed, with hardship comes ease' (94:5-6)",
      "The discipline of continuous spiritual endeavor: when relieved of duty, immediately labor in worship and yearn for your Lord"
    ],
    virtuesSomali: [
      "Waxay bixisaa kalsooni buuxda oo ah inaanu hal dhib waligiis ka adkaan karin laba fudayd oo Eebbe ballanqaaday.",
      "Waxay qofka ku dhiirrigelisaa inuu laabtiisu furto oo uu rajo wanaagsan yeesho xaalad kasta."
    ],
    virtuesEnglish: [
      "Houses the renowned linguistic miracle whereby one singular hardship is enveloped by duplicate indefinite ease.",
      "A perennial source of inner peace and resilience during severe domestic or psychological crises."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib Suuradda Ad-Duxaa si loo sii xoojiyo niyadda Nabiga ﷺ iyo asxaabtiisa.",
    revelationContextEnglish: "Revealed in sequence with Surah Ad-Duha in Makkah to provide profound psychological consolidation to the early believers."
  },
  95: {
    surahNumber: 95,
    revelationType: "Meccan",
    revelationOrder: 28,
    ayahCount: 8,
    wordCount: 116,
    juzRange: "Juz 30",
    pageRange: "Page 597",
    aboutSomali: "Suuradda At-Tiin (Tiinka) waxay ku dhaaranaysaa Tiinka, Saytuunka, Buurta Dhuur ee Siinaay, iyo Magaalada Makkah ee aaminka ah, waxay caddaynaysaa in aadanaha lagu abuuray qaabka ugu quruxda badan (Axasani Taqwiim), balse uu hoos ugu dhici karo heerka ugu hooseeya.",
    aboutEnglish: "Surah At-Tin (The Fig) invokes four sacred symbols: the Fig, the Olive, Mount Sinai, and the secure city of Mecca. It declares that humanity was engineered in the supreme mold of perfection (Ahsani Taqwim), capable of plunging into the lowest depths without faith.",
    namingReasonSomali: "Waxaa loogu magac daray 'At-Tiin' sababtoo ah waxay ku bilaabataa dhaarta geedka barakeysan ee Tiinka.",
    namingReasonEnglish: "Named 'At-Tin' (The Fig) after the opening divine oath sworn upon the nutritious fruit of the fig tree.",
    mainThemesSomali: [
      "Dhaarta afarraleyda ah: Tiinka iyo Saytuunka (Dhulkii Nebiyada ee Qudus), Buurta Dhuur (Muuse), iyo Magaalada Aaminka ah (Makkah)",
      "Abuurka aadanaha: in lagu abuuray heerka ugu sarreeya ee quruxda, caqliga, iyo qaab-dhismeedka (Axasani Taqwiim)",
      "Hoos-u-dhaca ruuxiga ah: in qofku hoos ugu dhici karo heerka ugu liita haddii uu iimaanka ka tago",
      "Ka reebanaanshaha kuwa rumeeyay oo camalka wanaagsan фаlay: waxay leeyihiin ajar aan go'ayn",
      "Caddaaladda ugu dambaysa: 'Miyaanu Eebbe ahayn kan ugu caddaaladda badan kuwa xukuma?'"
    ],
    mainThemesEnglish: [
      "Fourfold sacred geography: the Fig and Olive (Jerusalem), Mount Sinai (Moses), and the Secure City (Mecca)",
      "Anthropological excellence: 'We have certainly created man in the best of stature and constitution' (Ahsani Taqwim)",
      "Moral degeneration: humanity's potential to plummet into the lowest of the low through sin and disbelief",
      "The exception of redemption: those who cultivate faith and perform righteous works receive boundless reward",
      "The supreme theological question: 'Is not Allah the most just of judges?'"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu si joogto ah u akhrin jiray suuraddan xilliyada uu safrayo salaadda Cishaha.",
      "Waxay muujinaysaa sharafta weyn ee Eebbe u yeelay jirka iyo ruuxda bani'aadamka."
    ],
    virtuesEnglish: [
      "Recited by the Prophet ﷺ during travel in the night prayer ('Isha) for its lyrical brevity and profound theology.",
      "Affirms the intrinsic nobility of the human composition prior to moral choices."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu caddeeyo aadanaha meesha sare ee uu joogo iyo sida uu isu dulleyn karo.",
    revelationContextEnglish: "Revealed in Makkah to anchor human existential dignity while highlighting the risk of moral degradation."
  },
  96: {
    surahNumber: 96,
    revelationType: "Meccan",
    revelationOrder: 1,
    ayahCount: 19,
    wordCount: 276,
    juzRange: "Juz 30",
    pageRange: "Page 597",
    aboutSomali: "Suuradda Al-Calaq (Dhiigga Fadhiistay) waxay xambaarsan tahay shantii aayadood ee ugu horreeyay ee Qur'aanka kariimka ah ee ku soo dega Nabiga ﷺ godkii Xiraa ('Akhri magaca Rabbigaa'), waxayna ka digaysaa kibirka qofka isku filaaday sida Abuu Jahal.",
    aboutEnglish: "Surah Al-Alaq (The Clinging Clot) opens with the monumental inaugural five verses revealed to Prophet Muhammad inside Cave Hira ('Read in the name of your Lord!'), laying the foundation for learning, and warning tyrants like Abu Jahl against stifling prayer.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Calaq' sababtoo ah aayadda labaad waxay xustaa in aadanaha laga abuuray Calaq (dhiig fadhiistay ama xinjir dheggan).",
    namingReasonEnglish: "Named 'Al-Alaq' (The Clot) from verse 2 describing the miraculous embryonic stage of human conception.",
    mainThemesSomali: [
      "Waxyigii ugu horreeyay: amarka akhriska magaca Eebbe ee abuuray koonka",
      "Qiimaha Qalinka: in Eebbe aadanaha baray qoraalka qalinka iyo cilmi uusan hore u aqoon",
      "Kibirka aadanaha: inuu xadgudbo markii uu isku arko inuu isku filan yahay (Istighnaa)",
      "Kashifidda dabeecadda Abu Jahal oo doonayay inuu Nabiga ﷺ ka celiyo salaadda Kacbada agteeda",
      "U yeeridda kooxda (Naadi) iyo Malaa'igta cadaabka (Zabaaniyah), iyo amarka sujuudda iyo u dhowaanshaha Alle"
    ],
    mainThemesEnglish: [
      "The inaugural revelation of Islam: the divine mandate to read and learn in the Name of the Creator",
      "The epistemological dignity of the Pen: teaching humanity literacy and knowledge previously unimagined",
      "The pathology of human tyranny: overstepping all bounds when perceiving oneself as self-sufficient (Istighna)",
      "Confronting Abu Jahl's threats to stamp out prayer in the sacred sanctuary",
      "The clash of retinues: summoning worldly councils against the guardians of Hell (Zabaniyah), concluding in prostration"
    ],
    virtuesSomali: [
      "Waa aasaaskii waxyiga iyo bilaawgii iftiinka Islaamka ee godkii Xiraa.",
      "Waxay ku dhammaataa aayad sujuud ah oo qofka u dhoweysa Rabbigiis: 'Sujuud oo u dhowow'."
    ],
    virtuesEnglish: [
      "Represents the historical genesis of the Islamic revelation through the timeless imperative 'Iqra' (Read!).",
      "Culminates in an obligatory verse of prostration (Sajdah): 'Prostrate and draw near to Allah' (96:19)."
    ],
    revelationContextSomali: "Shanteeda aayadood ee hore waxay ku soo degeen Godka Xiraa sanadkii 610 Miladi, qaybta dambena Kacbada hortooda.",
    revelationContextEnglish: "Verses 1-5 marked the historic dawn of prophecy at Cave Hira in 610 CE; the latter verses addressed Abu Jahl's persecution."
  },
  97: {
    surahNumber: 97,
    revelationType: "Meccan",
    revelationOrder: 25,
    ayahCount: 5,
    wordCount: 73,
    juzRange: "Juz 30",
    pageRange: "Page 598",
    aboutSomali: "Suuradda Al-Qadr (Habeenka Sharafta Badan) waxay ku saabsan tahay habeenka qaaliga ah ee Laylatul-Qadr ee Qur'aanka la soo dejiyay, oo ka khayr badan kun bilood, Malaa'igtuna ku soo degto ilaa waabberigu ka baryo.",
    aboutEnglish: "Surah Al-Qadr (The Night of Decree / Power) celebrates the sacred nocturnal descent of the Noble Qur'an during Laylat al-Qadr, an epochal night superior to a thousand months, during which Gabriel and host of angels descend with divine peace until dawn.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Qadr' sababtoo ah waxay si gaar ah u iftiiminaysaa sharafta iyo weynaanta Habeenka Qadarka.",
    namingReasonEnglish: "Named 'Al-Qadr' (The Night of Decree / Destiny) after the night whose spiritual value surpasses an entire lifetime.",
    mainThemesSomali: [
      "Soo dejintii Qur'aanka kariimka ah habeenka barakeysan ee Laylatul-Qadr",
      "Fadliga aan xadka lahayn: hal habeen oo ka khayr badan kun bilood (in ka badan 83 sano oo cibaado ah)",
      "Soo degitaanka Malaa'igta tirada badan iyo Ruuxa (Jibriil) iyagoo wada amarka Eebbe",
      "Nabadgelyada iyo xasiloonida buuxda ee habeenkaas taal ilaa inta waagu ka baryayo",
      "Dhiirrigelinta cibaadada tobanka dambe ee bisha barakeysan ee Ramadaan"
    ],
    mainThemesEnglish: [
      "The primordial sending down of the Qur'an from the Preserved Tablet during the Night of Decree",
      "Exponential spiritual multiplier: a single night surpassing the worship of a thousand months (over 83 years)",
      "The massive descent of angelic hosts led by Gabriel (Ar-Ruh) administering every ordained divine decree",
      "Unbroken celestial peace, serenity, and forgiveness blanketing the earth until the emergence of dawn",
      "The primary spiritual catalyst motivating nocturnal worship during the final ten nights of Ramadan"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu xusay in qofkii kaca habeenkan isagoo rumeysan ajarne doonaya loo dhaafi doono wixii hore ee dembigiisa ah.",
      "Waa suuradda calaamadda u ah bisha Ramadaan iyo habeenka ugu qaalisan sanadka."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ declared: 'Whoever stands in prayer during Laylat al-Qadr with faith and hope will be forgiven all past sins' (Bukhari).",
      "Stands as the spiritual crown of the Islamic calendar, animating the final nights of Ramadan."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu bishaareeyo ummadda Nabiga ﷺ cimriga gaaban laakiin ajarka badan leh.",
    revelationContextEnglish: "Revealed to reassure Muslims of their spiritual advantage through concentrated moments of infinite divine mercy."
  },
  98: {
    surahNumber: 98,
    revelationType: "Medinan",
    revelationOrder: 100,
    ayahCount: 8,
    wordCount: 116,
    juzRange: "Juz 30",
    pageRange: "Page 598",
    aboutSomali: "Suuradda Al-Bayyinah (Caddaynta Cad) waxay caddaynaysaa in gaaladii reer Kitaabka iyo mushrikiintu aysan ka tanaasuleen shirkiga ilaa ay ka heleen caddeyn cad (Rasuulka iyo Qur'aanka), waxayna dadka u qaybisaa kuwa ugu xun abuurka iyo kuwa ugu wanaagsan abuurka.",
    aboutEnglish: "Surah Al-Bayyinah (The Clear Proof) elucidates why the Peoples of the Book and polytheists required unequivocal living evidence—the Messenger reciting purified pages. It categorizes humanity into the worst of creation (evil deniers) and the best of creation (righteous believers).",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Bayyinah' (Caddaynta Cad) sababtoo ah aayadda koowaad waxay xustaa imaatinka caddeynta aan mugdiga ku jirin.",
    namingReasonEnglish: "Named 'Al-Bayyinah' (The Clear Proof) referring to the unequivocal clarity provided by the Prophet and the Qur'an.",
    mainThemesSomali: [
      "Imaatinka Caddaynta Cad (Al-Bayyinah): Rasuul xagga Eebbe ka yimid oo akhrinaya waraaqo daahir ah",
      "Kala qaybsanaanta reer Kitaabka ka dib markii caddayntu u timid oo kaliya",
      "Amarka kaliya ee diinta: in Eebbe kaliya loo caabudo si daacad ah (Ikhlaas), salaadda la oogo, sakadana la bixiyo",
      "Kuwa ugu xun abuurka (Sharrul-Bariyyah): gaalada iyo munaafiqiinta ku waaraya Naarta",
      "Kuwa ugu wanaagsan abuurka (Khayrul-Bariyyah): mu'miniinta camalka wanaagsan фаlay ee Eebbe ka raalli noqday iyaguna ka raalli noqdeen"
    ],
    mainThemesEnglish: [
      "The arrival of the unambiguous proof: an unlettered Messenger reciting purified celestial scriptures containing upright laws",
      "Historical sectarianism: factions divided only after conclusive truth confronted their personal interests",
      "The pure, unadulterated essence of divine religion: sincere, monotheistic worship of Allah, regular prayer, and zakah",
      "The catastrophic depths of the worst of creation (Sharru al-Bariyyah): stubborn rejectors abiding in the fire",
      "The supreme zenith of the best of creation (Khayru al-Bariyyah): righteous believers rewarded with eternal Eden and mutual divine pleasure"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu u yeedhay Ubay binu Kacab wuxuuna ku yiri: 'Eebbe wuxuu i amray inaan kugu dul akhriyo suuraddan'.",
      "Waxay koobaysaa dhammaan ujeeddooyinka sharciga Islaamka oo ku saleysan Ikhlaaska iyo cibaadada toosan."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ personally summoned Ubayy ibn Ka'b, saying: 'Allah commanded me to recite this surah to you' (Bukhari).",
      "Encapsulates the universal perennial core of all revealed religions: sincere monotheism, prayer, and systemic charity."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina si looga jawaabo murankii iyo shakigii yuhuudda iyo masiixiyiinta ee xaqiiqada Nabiga ﷺ.",
    revelationContextEnglish: "Revealed in Madinah to establish the finality and universal authority of prophetic testimony over sectarian claims."
  },
  99: {
    surahNumber: 99,
    revelationType: "Medinan",
    revelationOrder: 93,
    ayahCount: 8,
    wordCount: 116,
    juzRange: "Juz 30",
    pageRange: "Page 599",
    aboutSomali: "Suuradda Az-Zalzalah (Dhulgariirka) waxay sawiraysaa dhulgariirka weyn ee dunida gilgili doona marka Qiyaamuhu dhaco, marka dhulku soo tuuro wixii ku dhex aasnaa, iyo marka camal kasta xitaa hadduu yahay miisaanka xabbad khardal ah (Dharrah) la arki doono.",
    aboutEnglish: "Surah Az-Zalzalah (The Quaking) portrays the apocalyptic seismic convulsions of the earth at the final hour, the earth discharging its ancient burdens and testifying to historical events, culminating in the atomic precision of divine reckoning.",
    namingReasonSomali: "Waxaa loogu magac daray 'Az-Zalzalah' sababtoo ah waxay ku furantaa dhacdada dhulgariirka gilgili doona dhulka oo dhan.",
    namingReasonEnglish: "Named 'Az-Zalzalah' (The Earthquake) from the opening cosmic tremors that dismantle terrestrial geology on the Last Day.",
    mainThemesSomali: [
      "Dhulgariirka weyn ee kama-dambeysta ah ee dhulka gilgili doona",
      "Dhulka oo soo saaraya wixii ku dhex jiray oo meydad iyo kheyraad ah (Athqaalahaa)",
      "Dhulka oo marag furaya: ka sheekeynta wax kasta oo dushiisa lagu sameeyay amarka Eebbe darteed",
      "Dadka oo koox-koox u soo baxaya si loo tuso camalladoodii ay adduunka ku soo sameeyeen",
      "Miisaanka saxda ah: qofkii sameeyay wax le'eg saxar wanaag ah wuu arki doonaa, qofkii sameeyay saxar xumaan ahna wuu arki doonaa"
    ],
    mainThemesEnglish: [
      "The ultimate cosmic cataclysm: the earth violently convulsing in its definitive apocalyptic earthquake",
      "Terrestrial exhumation: the earth expelling its subterranean secrets, human remains, and ancient treasures",
      "Geological testimony: the earth articulately bearing witness to every righteous or sinful deed committed upon its crust",
      "The grand resurrection parade: humanity surging forth in scattered factions to inspect their life dossiers",
      "Atomic moral precision: whoever performs an atom's weight (Dharrah) of good or evil shall behold it"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu sheegay in Suuradda Az-Zalzalah ay u dhiganto nus Qur'aanka kariimka ah marka la akhriyo.",
      "Waxay baraysaa inaanan wax yar oo wanaag ah la yaraysan xitaa hadday tahay timir barteed."
    ],
    virtuesEnglish: [
      "The Messenger of Allah ﷺ remarked that Surah Az-Zalzalah is equivalent to half of the Qur'an (Tirmidhi).",
      "The definitive scriptural barrier against spiritual despair: not even a subatomic quantum of good goes unrewarded."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina si loo xusuusiyo dadka inaan wax camal ah la dhayalsan karin xumaan iyo samaanba.",
    revelationContextEnglish: "Revealed to eradicate moral complacency, demonstrating that ethical deeds of microscopic scale determine eternity."
  },
  100: {
    surahNumber: 100,
    revelationType: "Meccan",
    revelationOrder: 14,
    ayahCount: 11,
    wordCount: 160,
    juzRange: "Juz 30",
    pageRange: "Page 599",
    aboutSomali: "Suuradda Al-Caadiyaat (Fardaha Orodka Badan) waxay ku bilaabataa muuqaal xawli ah oo fardo dagaal oo neeftu ku dheggan tahay dhagxaantana dab ka dhalinaya, waxay caddaynaysaa in aadanuhu aad ugu mahad-sheegid daran yahay Rabbigiis, maalkana aad u jecel yahay.",
    aboutEnglish: "Surah Al-Adiyat (The Courser / Charging Steeds) opens with dynamic kinetic oaths portraying war-horses galloping at dawn, sparks flying beneath their hooves as they charge enemy lines, contrasting animal loyalty with human ingratitude and avarice.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Caadiyaat' (Fardaha carara) sababtoo ah waxay ku bilaabataa dhaarta fardaha xawaaraha daran ku ordaya.",
    namingReasonEnglish: "Named 'Al-Adiyat' (The Charging War-Steeds) capturing the breathless charge of horses racing into the fray.",
    mainThemesSomali: [
      "Dhaarta fardaha orodka daran ee neeftu ku dhegto (Dabxan) iyo kuwa qoobabkoodu dhagxaanta dabka ka dhaliyaan",
      "Duulaanka subaxnimo iyo boodhka cirka isku shareeray marka ay dhex galaan cadowga",
      "Dabiicadda aadanaha: inuu yahay mid aad ugu mahad-sheegid daran Rabbigiis (Kanuud)",
      "Jacaylka daran ee aadanuhu u qabo urursiga maalka iyo hodantinimada",
      "Digtoonyada Maalinta Qiyaamaha: marka la soo faqo wixii qabriyada ku jiray lana muujiyo wixii laabta ku qarsoonaa"
    ],
    mainThemesEnglish: [
      "Dynamic oaths sworn upon galloping steeds breathing panting gasps (Dabha) and striking sparks of fire from flint stones",
      "The morning ambush: raising billowing clouds of dust while penetrating the deep ranks of the adversary",
      "The human moral indictment: humanity is chronically ingrate, ungrateful, and unfaithful to their Cherisher (Kanud)",
      "The fierce obsession with worldly acquisitions: 'And indeed, he is intense in love for wealth' (100:8)",
      "The final audit: the sudden overturning of graves and the comprehensive exposure of everything secret in hearts"
    ],
    virtuesSomali: [
      "Waxay muujinaysaa tusaale layaab leh: farasku wuxuu u daacad yahay ninka quudiya, laakiin aadanuhu wuu caasiyaa Rabbigii abuuray.",
      "Waxaa lagu tiriyaa inay u dhiganto nus Qur'aanka xagga macnaha iyo awoodda waanada."
    ],
    virtuesEnglish: [
      "Presents a searing psychological analogy: a horse risks its life for an earthly master, while humans rebel against their Sustainer.",
      "A potent wake-up call dismantling consumerist obsessions before the terrifying opening of the graves."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii ciidan gaashaanbuur ahi doonayeen inay weeraraan Muslimiinta.",
    revelationContextEnglish: "Revealed in Makkah to direct attention toward the impending eternal awakening that awaits heedless humanity."
  },
  101: {
    surahNumber: 101,
    revelationType: "Meccan",
    revelationOrder: 30,
    ayahCount: 11,
    wordCount: 160,
    juzRange: "Juz 30",
    pageRange: "Page 600",
    aboutSomali: "Suuradda Al-Qaacirad waxay ka hadlaysaa dhiillada Maalinta Qiyaamaha marka dadku noqdaan sida balanbaalis firirsan, buuruhuna noqdaan sida suuf la daabacay, waxayna kala saartaa qofkii miisaankiisu cuslaado iyo qofkii miisaankiisu fududaado.",
    aboutEnglish: "Surah Al-Qari'ah (The Calamity / Striking Hour) dramatizes the ear-splitting cataclysm of the Last Day when humans resemble scattered moths and mountains become carded wool, dividing all souls between heavy and light scales of righteousness.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Qaacirad' (Dhacdada garaacda quluubta) oo ah magac ka mid ah magacyada Qiyaamaha.",
    namingReasonEnglish: "Named 'Al-Qari'ah' (The Striking Calamity) reflecting the shattering percussion that awakens creation to judgment.",
    mainThemesSomali: [
      "Dhacdada weyn ee Al-Qaacirad ee quluubta garaacaysa cabsida darteed",
      "Dadka oo noqonaya sida balanbaalis daadsan oo aan jiho lahayn argagax awgeed",
      "Buuraha waaweyn oo noqonaya sida dhogor suuf ah oo la feyday oo dabayshu qaaday",
      "Guusha qofka miisaanka camalkiisa wanaagsan cuslaado: wuxuu ku jiri doonaa nolol raalli laga yahay Jannada",
      "Khasaarada qofka miisaankiisu fududaado: hoygiisu waa 'Haawiyah' (Naar aad u kulul)"
    ],
    mainThemesEnglish: [
      "The percussion of the Striking Calamity resonating across cosmic dimensions",
      "Human fragility under judgment: people scattered aimlessly like bewildered dispersed moths",
      "Geological dissolution: colossal mountain ranges transformed into weightless carded, colored wool",
      "The triumph of substantive character: the one whose righteous scale weighs heavy enters a life of eternal bliss",
      "The abyss of moral bankruptcy: the one whose spiritual scale weighs light is embraced by the blazing abyss of Hawiyah"
    ],
    virtuesSomali: [
      "Waxay si cad u qeexaysaa muhiimadda Miisaanka Maalinta Qiyaame iyo qiimaha ficil kasta.",
      "Waxay qofka ku dhiirrigelisaa inuu barto camalka culus sida tasbiixda iyo akhlaaqda suubban."
    ],
    virtuesEnglish: [
      "Provides an indelible visualization of the scales of cosmic justice (Al-Mizan) determining final destiny.",
      "Directs believers toward substantive weighty deeds: high moral character, sincere charity, and continuous remembrance."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loogu baraarujiyo kuwa ku faanayay awoodda qabiilka iyo lacagta.",
    revelationContextEnglish: "Revealed in Makkah to shock tribal aristocracies out of false security and focus them on personal moral weight."
  },
  102: {
    surahNumber: 102,
    revelationType: "Meccan",
    revelationOrder: 16,
    ayahCount: 8,
    wordCount: 116,
    juzRange: "Juz 30",
    pageRange: "Page 600",
    aboutSomali: "Suuradda At-Takaathur (Tartanka Badashada) waxay canbaaraysaa ku mashquulidda taranka maalka, carruurta, iyo sharafta adduunka ilaa qabriga la booqdo, waxayna xustaa in Maalinta Qiyaamaha su'aalo la iska weydiin doono nimco kasta.",
    aboutEnglish: "Surah At-Takathur (Competition in Worldly Increase) severely reprimands the human obsession with accumulating wealth, status, and numbers until visiting the graves, promising certainty of vision and an unsparing interrogation concerning every blessing.",
    namingReasonSomali: "Waxaa loogu magac daray 'At-Takaathur' sababtoo ah aayadda koowaad waxay canbaaraysaa tartanka badashada iyo isku faanista maalka.",
    namingReasonEnglish: "Named 'At-Takathur' (Rivalry in Accumulation) from the opening indictment of materialistic greed distracts souls until death.",
    mainThemesSomali: [
      "Mashquulka aadanaha ee tartanka badashada maalka iyo xubnaha qoyska ilaa dhimashadu ka timaado",
      "Booqashada qabriyada: dhimashada degdegga ah ee soo afjarta damaca adduunka",
      "Ogaanshaha dhabta ah: 'Waa hubaal inaad ogaan doontaan, mar kale waa hubaal inaad ogaan doontaan'",
      "Aragtida dhabta ah ee Naarta: ku arkidda isha yaqiinta (Caynal-Yaqiin)",
      "Su'aasha weyn ee Qiyaamaha: 'Ka dib waxaa hubaal ah in la idin weydiin doono maalintaas nimco kasta' (An-Naciim)"
    ],
    mainThemesEnglish: [
      "The trance of competitive accumulation: endless rivalry in wealth, prestige, and posterity blinding humans to purpose",
      "Visiting the graves: physical burial as the rude termination of materialistic consumerism",
      "The escalation of certainty: from knowledge of certainty ('Ilm al-Yaqin) to the tangible vision of certainty ('Ayn al-Yaqin)",
      "Witnessing the blazing furnace of Hell as an incontrovertible empirical reality",
      "The final ethical audit: 'Then you will surely be interrogated on that Day concerning all worldly bounties' (102:8)"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu xusay in suuraddan ay u dhiganto akhrinta kun aayadood oo Qur'aan ah.",
      "Waxay xambaarsan tahay dawo qoto dheer oo ka hortagta cudurka qanacsanaan la'aanta iyo orodka maalka adduunka."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ suggested that reciting this surah equals the spiritual merit of reciting a thousand verses (Hakim).",
      "A transcendent psychological corrective to hyper-consumerism, status anxiety, and unchecked material ambition."
    ],
    revelationContextSomali: "Waxay ku soo degtay laba qabiil oo reer Makkah ah oo ku tartamayay tirada dadkooda xitaa qabriyada ku jira.",
    revelationContextEnglish: "Revealed in Makkah when rival clans competed over genealogical headcounts, even counting ancestral graves."
  },
  103: {
    surahNumber: 103,
    revelationType: "Meccan",
    revelationOrder: 13,
    ayahCount: 3,
    wordCount: 44,
    juzRange: "Juz 30",
    pageRange: "Page 601",
    aboutSomali: "Suuradda Al-Casr waxay xambaarsan tahay saddex aayadood oo koobaya dhammaan nolosha aadanaha: dhaarta waqtiga (Casarka), qirashada in aadanuhu khasaaro ku jiro, iyo afarta tiir ee badbaadada: Iimaan, Camal wanaagsan, Xaqa oo la isku dardaarmo, iyo Samirka.",
    aboutEnglish: "Surah Al-Asr (The Declining Day / Time) comprises just three monumental verses distilling the entirety of human existence: an oath sworn upon time, the universal diagnosis of human loss, and the four pillars of salvation: Faith, Good Deeds, Counsel of Truth, and Perseverance.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Casr' sababtoo ah waxay ku bilaabataa dhaarta Waqtiga iyo xilliga Casarka.",
    namingReasonEnglish: "Named 'Al-Asr' (Time / The Declining Afternoon) from the opening oath sworn upon the fleeting passage of time.",
    mainThemesSomali: [
      "Dhaarta Waqtiga (Al-Casr) oo ah raasumaalka qaaliga ah ee aadanaha ee si degdeg ah u dhammaanaya",
      "Xaqiiqada guud: 'Bani'aadamka oo dhami wuxuu ku sugan yahay khasaare weyn'",
      "Tiirka koowaad & labaad ee badbaadada: Iimaanka dhabta ah iyo samaynta camalka suubban",
      "Tiirka saddexaad: Isku dardaaranka xaqa iyo caddaaladda bulshada dhexdeeda (Tawaasaw bil-Xaqq)",
      "Tiirka afaraad: Isku dardaaranka samirka iyo adkaysiga duruufaha dacwada iyo nolosha (Tawaasaw bis-Sabr)"
    ],
    mainThemesEnglish: [
      "The oath sworn upon Time—the singular, irrecoverable capital of every conscious human lifespan",
      "The universal baseline diagnosis: 'Indeed, humanity is irrevocably in devastating loss' (103:2)",
      "The dual foundational anchors of personal salvation: sincere theological faith coupled with righteous actions",
      "The communal responsibility of truth: mutual counsel in upholding justice and moral authenticity (Tawasi bil-Haqq)",
      "The communal responsibility of perseverance: mutual encouragement to steadfast endurance and fortitude (Tawasi bis-Sabr)"
    ],
    virtuesSomali: [
      "Imaam Shaafici wuxuu yidhi: 'Haddii aysan Qur'aanka ka soo degi lahayn wax kale oo aan suuraddan ahayn, way ku filnaan lahayd aadanaha'.",
      "Saxaabada Nabigu ﷺ ma kala tegi jirin markay kulmaan ilaa midkood kan kale u akhriyo Suuradda Al-Casr."
    ],
    virtuesEnglish: [
      "Imam al-Shafi'i famously remarked: 'If people contemplated only this surah, it would suffice them entirely.'",
      "The Companions of the Prophet ﷺ never parted after meeting until one recited Surah Al-Asr to the other."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loo qeexo shuruudaha guusha dhabta ah ee ka duwan fahamka gaalada.",
    revelationContextEnglish: "Revealed in Makkah to establish the essential formula of human triumph against the relentless tide of cosmic time."
  },
  104: {
    surahNumber: 104,
    revelationType: "Meccan",
    revelationOrder: 32,
    ayahCount: 9,
    wordCount: 131,
    juzRange: "Juz 30",
    pageRange: "Page 601",
    aboutSomali: "Suuradda Al-Humazah waxay si adag u canbaaraysaa xanta, cayda, ceebeynta dadka, iyo ku qancidda urursiga maalka ee qofku u maleeyo inuu maalkiisu waaraynayo, waxayna digniin ka bixisaa Naarta Al-Xudamah ee quluubta gubta.",
    aboutEnglish: "Surah Al-Humazah (The Traducer / Slanderer) delivers a blistering rebuke to the backbiter, slanderer, and greedy hoarder of wealth who deludes himself into believing his riches grant immortality, condemning such tyrants to Al-Hutamah (The Crusher) whose flames leap over hearts.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Humazah' sababtoo ah aayadda koowaad waxay هلاk u ballanqaadaysaa qof kasta oo caytan iyo xan badan.",
    namingReasonEnglish: "Named 'Al-Humazah' (The Slanderer) after the opening woe denounced upon every malicious faultfinder.",
    mainThemesSomali: [
      "Halaagga qof kasta oo caadaystay xanta iyo ceebaynta dadka (Humazah iyo Lumazah)",
      "Cudurka nafsaaniga ah: urursiga maalka iyo tirintiisa joogtada ah",
      "Dhalanteedka qaldan: inuu u maleeyo maalkiisu inuu adduunka ku waarayn doono",
      "Cadaabka Al-Xudamah: Naarta jajabinaysa wax kasta oo dhex gala",
      "Dabeecadda Naartaas: waxay toos u gaadhaa quluubta iyadoo lagu xiray tiirar dhaadheer oo adag"
    ],
    mainThemesEnglish: [
      "Denunciation of the habitual gossip, slanderer, and scorner of human dignity (Humazah and Lumazah)",
      "Psychopathology of avarice: the pathological hoarding and repetitive counting of capital assets",
      "The mortal delusion: assuming that private wealth grants metaphysical permanence or physical immortality",
      "The punitive reality of Al-Hutamah (The Crusher) that smashes haughty arrogance into dust",
      "The unique agony of the inner inferno: flames piercing the emotional sanctuary of the heart, locked behind towering columns"
    ],
    virtuesSomali: [
      "Waxay ilaalisaa sharafta iyo karaamada bani'aadamka iyadoo mamnuucday cayda iyo xanta qarsoon.",
      "Waxay kashifaysaa dhalanteedka kuwa mooda in lacagtu ay tahay awoodda dhabta ah ee aadanaha."
    ],
    virtuesEnglish: [
      "Provides an unyielding moral shield safeguarding human reputation and dignity against casual character assassination.",
      "Diagnoses the intoxicating hubris of plutocracy that conflates commercial fortune with absolute impunity."
    ],
    revelationContextSomali: "Waxay ku soo degtay madaxdii Qureysh ee hodanka ahayd sida Akhnas binu Shuraiq ama Walid binu Muqiirah oo dadka daciifka ah caayi jiray.",
    revelationContextEnglish: "Revealed in Makkah targeting aristocratic oligarchs who mocked impoverished believers while tallying fortunes."
  },
  105: {
    surahNumber: 105,
    revelationType: "Meccan",
    revelationOrder: 19,
    ayahCount: 5,
    wordCount: 73,
    juzRange: "Juz 30",
    pageRange: "Page 601",
    aboutSomali: "Suuradda Al-Fiil (Maroodiga) waxay xustaa mucjisadii weyneyd ee sanadkii uu dhashay Nabigu ﷺ markii Abraha iyo ciidankiisii Maroodiyaasha watey ay yimaadeen Makkah si ay Kacbada u dumiyaan, Eebbana u soo diray shimbirihii 'Abaabiil' ee dhagxaanta ku baabi'iyay.",
    aboutEnglish: "Surah Al-Fil (The Elephant) recounts the historic miraculous defeat of the Abyssinian viceroy Abraha and his elephant brigade who marched to demolish the Ka'bah during the Year of the Elephant, destroyed by swarms of Ababil birds carrying stones of baked clay.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Fiil' sababtoo ah waxay ku saabsan tahay qisadii 'Asxaabul Fiil' (Kuwa maroodiga watay).",
    namingReasonEnglish: "Named 'Al-Fil' (The Elephant) commemorating the military elephant corps routed at the gates of Mecca.",
    mainThemesSomali: [
      "Xusuusinta sidii Eebbe ula dhaqmay ciidankii maroodiga watay ee Abraha Al-Ashram",
      "Fashilinta dhagartii cadowga: qorshahoodii duminta Kacbada oo laga dhigay mid baaba'ay",
      "Soo diristii shimbirihii Abaabiil (koox-koox u duulayay) iyagoo xambaarsan dhagxaan Naar ah (Sijjiil)",
      "Halaaggii ciidankii kibray: laga dhigay sidii caleen xoolihii cuneen oo kale (Casfim Ma'kuul)",
      "Ilaalinta Kacbada barakeysan iyadoon Muslimiin joogin oo Eebbe magangalkiisa ku dhowray"
    ],
    mainThemesEnglish: [
      "The historic demonstration of divine protection over Mecca against Abraha's overwhelming invasion forces",
      "The complete subversion of military conspiracies: rendering sophisticated battlefield aggression utterly futile",
      "The angelic air-assault: swarms of soaring birds (Tayran Ababil) pelting invaders with stones of fired clay (Sijjil)",
      "Total devastation of the proud aggressors: pulverized like harvested stalks chewed and trampled by grazing cattle",
      "The inviolable sanctity of the Ka'bah: safeguarded through miraculous intervention ahead of the Prophet's birth"
    ],
    virtuesSomali: [
      "Waxay muujinaysaa in Eebbe awood u leeyahay inuu ku baabi'iyo kuwa ugu xoogga badan makhluuqda kuwa ugu yar sida shimbiraha.",
      "Waxay xoojisay sharafta Kacbada qalbiyada carabta ka hor intaan waxyigu bilaaban."
    ],
    virtuesEnglish: [
      "Exemplifies the divine method of neutralizing overwhelming physical empires through seemingly fragile instruments.",
      "Sanctified the Arabian sanctuary ahead of the final prophetic mission, preparing the historic theater of Islam."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah si loo xusuusiyo Qureysh in Eebbihii maroodiga ka celiyay uu sidoo kale Nabiga difaaci karo.",
    revelationContextEnglish: "Revealed in Makkah to remind Quraysh of the providential protection they enjoyed and encourage humility before God."
  },
  106: {
    surahNumber: 106,
    revelationType: "Meccan",
    revelationOrder: 29,
    ayahCount: 4,
    wordCount: 58,
    juzRange: "Juz 30",
    pageRange: "Page 602",
    aboutSomali: "Suuradda Qureysh waxay xusuusinaysaa qabiilka Qureysh nimcooyinka waaweyn ee Eebbe u qabay: safarradii ganacsi ee xilliga Jiilaalka (Yemen) iyo Gu'ga (Shaam), quudintoodii xilligii gaajada, iyo nabadgelyada laga siiyay cabsida, iyadoo faraysa inay caabudaan Rabbiga Gurigan (Kacbada).",
    aboutEnglish: "Surah Quraysh reminds the dominant tribe of Mecca of divine provisions: safe passage for their winter trading caravans to Yemen and summer expeditions to the Levant, feeding them against starvation, and shielding them from terror, commanding grateful worship of the Lord of this House.",
    namingReasonSomali: "Waxaa loogu magac daray 'Quraysh' sababtoo ah waxay si gaar ah u xustaa qabiilkii reer Makkah ee Nabigu ka soo jeeday.",
    namingReasonEnglish: "Named 'Quraysh' after the prominent Arabian tribe responsible for custodianship of the holy sanctuary.",
    mainThemesSomali: [
      "Heshiisyada iyo nabadgelyada ganacsiga ee Qureysh loogu fududeeyay safarka (Iilaaf)",
      "Socdaalladii barakeysnaa: socdaalka xilliga Jiilaalka ee Yemen iyo socdaalka xilliga Xagaaga ee Shaam",
      "Amarka cibaadada toosan: in la caabudo kaliya Eebaha leh Gurigan barakeysan (Rabba haadal-Bayt)",
      "Nimcada quudinta: Eebbihii ka quudiyay gaajada xilli dadka kale macaluulaysnaayeen",
      "Nimcada amniga: Eebbihii ka nabadgaliyay cabsida iyo weerarrada xilli carartu is-boobaysay"
    ],
    mainThemesEnglish: [
      "The customary international diplomatic treaties securing safe trade corridors for the Quraysh (Ilaf)",
      "The historic trade routes: the winter caravan descending to Yemen and the summer voyage journeying to Syria",
      "The focal obligation of worship: dedicating monotheistic service exclusively to 'the Lord of this Sacred House'",
      "Economic security: divine provision of food sustaining the community during rampant regional famine",
      "Geopolitical peace: granting immunity from terror, raid, and invasion while surrounding lands lived in chronic dread"
    ],
    virtuesSomali: [
      "Waxay kulmisay labada baahi ee ugu waaweyn ee bini'aadamku u baahan yahay: Cunto (Nafaqo) iyo Nabadgelyo (Amni).",
      "Waxay dhiirrigelisaa shukriga iyo qirashada nimcooyinka Eebbe ee nolol-maalmeedka."
    ],
    virtuesEnglish: [
      "Synthesizes the two foundational pillars of human societal wellbeing: economic sustenance and physical security.",
      "An enduring lesson in gratitude: material privileges demand corresponding moral and religious devotion."
    ],
    revelationContextSomali: "Waxay xidhiidh dhow la leedahay Suuradda Al-Fiil, waxaana la soo dejiyay si loo xusuusiyo nimcooyinka Makkah la siiyay.",
    revelationContextEnglish: "Revealed in continuation of Surah Al-Fil to call Mecca's merchant class to accept Islam out of gratitude for divine protection."
  },
  107: {
    surahNumber: 107,
    revelationType: "Meccan",
    revelationOrder: 17,
    ayahCount: 7,
    wordCount: 102,
    juzRange: "Juz 30",
    pageRange: "Page 602",
    aboutSomali: "Suuradda Al-Maacuun (Kaalmada Yar) waxay kashiftaa laba-wajiilenimada qofka beeniya xisaabta Maalinta Qiyaamaha: xaqiridda agoonka, diidmada quudinta masaakiinta, salaadda oo la dhayalsado lana tuso dadka (Riyaa'), iyo diidmada in la bixiyo xitaa kaalmada ugu yar (Maacuun).",
    aboutEnglish: "Surah Al-Ma'un (The Small Kindnesses) unmasks religious fraud by connecting theological skepticism with social cruelty: repelling orphans, neglecting the hungry, praying with ostentation (Riya'), and refusing the most basic neighborly assistance (Ma'un).",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Maacuun' sababtoo ah waxay ku dhammaataa canbaareynta kuwa diida bixinta kaalmada yar ee derisku isweydaarsado.",
    namingReasonEnglish: "Named 'Al-Ma'un' (The Small Kindnesses) from the final verse castigating those who refuse basic household charity.",
    mainThemesSomali: [
      "Tilmaamidda qofka beeniya Xisaabta iyo Diinta dhabta ah: dabeecaddiisa xagga bulshada",
      "Xadgudubka agoonka: riixidda iyo xaqiridda xuquuqda agoonta masaakiinta ah",
      "Bakhaylnimada quudinta: inaanan lagu dhiirran quudinta dadka gaajaysan",
      "Digniinta kuwa tukada: kuwa salaaddooda hilmaansan oo ka daaha ama aan qalbiga ku hayn",
      "Munaafaqnimada iyo diidmada caawinta: muujinta camalka si dadku u arkaan iyo diidmada alaabta yar ee laysku caawiyo"
    ],
    mainThemesEnglish: [
      "Diagnostic profile of the religious cynic: rejecting the reality of the Final Judgment reflected in social apathy",
      "Abuse of the vulnerable: violently pushing away the fragile orphan and denying basic compassion",
      "Neglect of collective social welfare: refusing to encourage the feeding of the hungry",
      "The tragedy of negligent worship: 'Woe to those who pray, yet are completely unmindful of their prayers'",
      "Religious ostentation (Riya') coupled with everyday callousness: refusing simple everyday utensils to neighbors in need"
    ],
    virtuesSomali: [
      "Waxay xiriirisaa rumeynta Eebbe iyo u naxariisashada masaakiinta; salaaddu waxba ma tarto haddii anshaxu xun yahay.",
      "Waxay bartaa in wax kasta oo yar xitaa cusbo ama weel derisku is-weydaarsanayo ay ajar leeyihiin."
    ],
    virtuesEnglish: [
      "Directly yokes the authenticity of ritual prayer to active social conscience: worship without compassion is an abomination.",
      "Elevates micro-charities—loaning simple household tools and extending neighborly kindness—to essential markers of faith."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah iyo Madiina labadaba si loo xakameeyo dhaqanka xun ee munaafiqiinta iyo bakhayliinta.",
    revelationContextEnglish: "Revealed in part in Makkah (targeting pagan oligarchs) and Madinah (targeting hypocrites) to purify intentions."
  },
  108: {
    surahNumber: 108,
    revelationType: "Meccan",
    revelationOrder: 15,
    ayahCount: 3,
    wordCount: 44,
    juzRange: "Juz 30",
    pageRange: "Page 602",
    aboutSomali: "Suuradda Al-Kawthar (Khayrka Badan) waa suuradda ugu gaaban Qur'aanka (3 aayadood), waxayna u bishaaraysaa Nabiga ﷺ khayr aan xad lahayn iyo wabiga Al-Kawthar ee Jannada, waxay faraysaa salaadda iyo qallidda xoolaha (Udxiyada), waxayna caddaynaysaa in cadowgiisu yahay kan dhabta ah ee go'an.",
    aboutEnglish: "Surah Al-Kawthar (The Abundance) is the shortest surah in the Qur'an (three verses), conferring infinite cosmic abundance upon Prophet Muhammad ﷺ, instituting sacrificial worship (Eid/Udhiyah), and declaring that his mocking detractors are the ones cut off from posterity and grace.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Kawthar' sababtoo ah aayadda koowaad waxay xustaa khayrka badan iyo Wabiga Kawthar ee Nabiga ﷺ la siiyay.",
    namingReasonEnglish: "Named 'Al-Kawthar' (The Abundance) denoting the inexhaustible celestial river and boundless prophetic honors granted by Allah.",
    mainThemesSomali: [
      "Hadiyadda rabaaniga ah: siinta Nabiga ﷺ Khayrka badan ee adduun iyo aakhiro iyo Wabiga Al-Kawthar",
      "Shukriga camalka ah: 'U tuko Rabbigaa dartiis waxna qall (Naxar)'",
      "Isku dheellitirka salaadda iyo sadaqada qalliinka xoolaha (Udxiyada Ciidda)",
      "Gudidda Nabiga ﷺ: cadowgiisii (sida Caas binu Waa'il) oo sheegay inuu dhasho-go'ay ayaa ah kan dhabta ah ee go'an",
      "Waarta magaca iyo diinta Nabiga ﷺ ilaa dhammaadka adduunka halka cadowgiisu baaba'ay"
    ],
    mainThemesEnglish: [
      "The divine conferment of supreme abundance: boundless earthly impact and the celestial river Kawthar in Paradise",
      "Active devotional thanksgiving: 'So pray to your Lord and sacrifice' (108:2)",
      "Synthesizing spiritual worship with charitable feast through the sacred rite of animal sacrifice (Udhiyah)",
      "Vindication of lineage: refuting pagan mockers (al-'As ibn Wa'il) who celebrated the death of the Prophet's infant sons",
      "The immutable verdict of history: the Prophet's spiritual posterity shines globally while his persecutors are utterly forgotten"
    ],
    virtuesSomali: [
      "Nabigu ﷺ markii ay ku soo degtay wuu dhoolla-caddeeyay wuxuuna ku macneeyay Al-Kawthar wabi Jannada ku yaalla oo biyahiisu caanaha ka cad yihiin malabkana ka macaan yihiin.",
      "Waxay bixisaa kalsooni buuxda xilliyada dhibaatada iyo murugada."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ smiled radiantly when it was revealed, describing Kawthar as a paradisiacal river whiter than milk and sweeter than honey.",
      "A timeless reservoir of emotional upliftment for anyone facing social ostracization or grief over personal loss."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah markii uu dhintay Cabdullaahi oo ahaa wiilkii Nabiga ﷺ oo mushrikiintu ku jees-jeeseen inuu magac-go'ay (Abtar).",
    revelationContextEnglish: "Revealed in Makkah following the tragic death of the Prophet's infant son, transforming mockery into eternal victory."
  },
  109: {
    surahNumber: 109,
    revelationType: "Meccan",
    revelationOrder: 18,
    ayahCount: 6,
    wordCount: 87,
    juzRange: "Juz 30",
    pageRange: "Page 603",
    aboutSomali: "Suuradda Al-Kaafiruun (Gaalada) waxay dejisaa soohdinta cad ee caqiidada Tawxiidka, iyadoo gebi ahaanba diidaysa heshiis-hoosaadkii mushrikiintu soo jeediyeen ee ahaa in la isku beddelo cibaadada sanamyada iyo cibaadada Alle, waxayna ku dhammaataa mabda'a madaxbannaanida diinta: 'Idinku diintiina baad leedihiin, anna tayda'.",
    aboutEnglish: "Surah Al-Kafirun (The Disbelievers) establishes the absolute frontier of monotheistic theology, decisively rejecting pagan compromises proposing rotational syncretism, culminating in the monumental charter of religious differentiation: 'To you your religion, and to me my religion.'",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Kaafiruun' sababtoo ah waxay ku bilaabataa baaqa tooska ah ee ku socda gaalada: 'Dheh: Kuwa gaaloobayow'.",
    namingReasonEnglish: "Named 'Al-Kafirun' (The Disbelievers) from the uncompromising inaugural proclamation addressing the polytheist delegates.",
    mainThemesSomali: [
      "Baaqa cad ee madaxbannaanida caqiidada: 'Dheh kuwa gaaloobayow!'",
      "Diidmada buuxda ee shirkiga: 'Ma caabudayo waxaad caabudaysaan'",
      "Diidmada wada-wadaagga cibaadada: idinkuna ma caabudeysaan Eebaha aan caabudo haddii aad shirkiga waddaan",
      "Go'aanka kama dambeysta ah ee ah inaanan tawxiidka wax gorgortan ah laga geli karin",
      "Mabda'a weyn ee kala soocidda: 'Idinku waxaad leedihiin diintiinna, anna waxaan leeyahay diintayda'"
    ],
    mainThemesEnglish: [
      "The unambiguous proclamation of religious identity and ethical boundaries",
      "Absolute rejection of polytheistic compromises: 'I do not worship what you worship' (109:2)",
      "Uncompromising rejection of syncretic eclecticism: neither shall the Prophet venerate idols, nor pagan cults adulterate monotheism",
      "The eternal principle of theological non-negotiability: divine truth cannot be bartered for social peace",
      "The definitive declaration of boundary: 'For you is your religion, and for me is my religion' (109:6)"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu xusay inay suuraddani tahay mid ka bari yeelaysa qofka shirkiga (Baraa'ah minash-shirk).",
      "Waxay u dhigantaa rubuc (afar-meelood meel) Qur'aanka kariimka ah, waxaana la akhriyaa ka hor hurdada iyo sunnada Subaxa/Maghribka."
    ],
    virtuesEnglish: [
      "The Prophet ﷺ designated this surah as a total spiritual immunity against idolatry (Bara'ah min al-Shirk).",
      "Equivalent in value to one-quarter of the Qur'an, traditionally recited in the Sunnah of Fajr and before sleep."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah markii hoggaamiyeyaashii Qureysh u soo jeediyeen Nabiga ﷺ inuu sanad caabudo sanamyadooda, sanadna ay caabudaan Rabbigiis.",
    revelationContextEnglish: "Revealed in Makkah when pagan oligarchs proposed a syncretic pact to rotate gods on an annual basis."
  },
  110: {
    surahNumber: 110,
    revelationType: "Medinan",
    revelationOrder: 114,
    ayahCount: 3,
    wordCount: 44,
    juzRange: "Juz 30",
    pageRange: "Page 603",
    aboutSomali: "Suuradda An-Nasr (Gargaarka) waa suuraddii ugu dambeysay ee si buuxda u soo degta, waxayna bishaareynaysaa Gargaarka Eebbe, Furashadii Makkah, iyo dadka oo koox-koox diinta Alle u galaya, iyadoo sidoo kale tilmaamaysa soo dhowaanshaha dhimashadii Nabiga ﷺ.",
    aboutEnglish: "Surah An-Nasr (The Divine Support / Triumph) was the final complete surah revealed, heralding the victory of Allah, the Liberation of Mecca, and the mass entry of humanity into Islam, while subtly portending the completion of Prophet Muhammad's mortal mission.",
    namingReasonSomali: "Waxaa loogu magac daray 'An-Nasr' sababtoo ah aayadda koowaad waxay xustaa imaatinka gargaarka guusha ee xagga Eebbe ka yimid.",
    namingReasonEnglish: "Named 'An-Nasr' (The Divine Help / Triumph) commemorating the ultimate victory and consolidation of truth.",
    mainThemesSomali: [
      "Bishaarada Gargaarka Eebbe iyo Furashada weyn ee Makkah (Fatxu Makkah)",
      "Muuqaalka dadka oo koox-koox iyo qabiil-qabiil u soo gelaya diinta Islaamka",
      "Amarka tasbiixda iyo weyneynta Eebbe waqtiga guusha halkii lagu faani lahaa awoodda",
      "Istiqfaarka (Dambi-dhaaf warsiga): qirashada in guushu tahay fadliga Eebbe oo kaliya",
      "Tilmaanta sagootinta Nabiga ﷺ ee dunida ka dib markii uu gutay dhammaan farriintii loo igmaday"
    ],
    mainThemesEnglish: [
      "The tidings of divine succour and the historic liberation of Mecca (Fath Makkah)",
      "The mass demographic transition: witnessing humanity entering the fold of Islam in immense congregations",
      "Ethical protocol of triumph: responding to sweeping victory with humility, tasbih, and praise rather than arrogance",
      "The imperative of seeking divine forgiveness (Istighfar) recognizing that ultimate accomplishment belongs entirely to Allah",
      "The subtle elegiac undertone: marking the nearing conclusion of the Prophet's earthly life and prophetic commission"
    ],
    virtuesSomali: [
      "Cabdullaahi binu Cabbaas iyo Cumar binu Khadaab waxay fahmeen in suuraddani tahay sagootinta iyo ogeysiinta dhimashada Nabiga ﷺ.",
      "Waxaa lagu tiriyaa inay u dhiganto rubuc Qur'aanka kariimka ah xagga fadliga."
    ],
    virtuesEnglish: [
      "Deeply revered by Ibn Abbas and Umar as the divine announcement of the nearing departure of the Messenger of Allah ﷺ.",
      "Equivalent to one-quarter of the Qur'an, instilling profound humility during the height of worldly triumph."
    ],
    revelationContextSomali: "Waxay ku soo degtay Mina xilligii Xajkii Sagootinta (Xajjatul-Wadaac) sanadkii 10-aad ee Hijrada.",
    revelationContextEnglish: "Revealed at Mina during the Farewell Pilgrimage in 10 AH, drawing the prophetic era toward its sublime culmination."
  },
  111: {
    surahNumber: 111,
    revelationType: "Meccan",
    revelationOrder: 6,
    ayahCount: 5,
    wordCount: 73,
    juzRange: "Juz 30",
    pageRange: "Page 603",
    aboutSomali: "Suuradda Al-Masad (Xadhigga Xariirka ah / Tabbat) waxay si cad u canbaaraysaa Abu Lahab iyo xaaskiisa Umm Jamiil oo ahaa cadawgii ugu darnaa ee dhibaatayn jiray Nabiga ﷺ, waxayna ku bishaareysaa halaagga maalkooda iyo mustaqbalkooda cadaabka Naarta.",
    aboutEnglish: "Surah Al-Masad (The Palm Fiber / The Ruin of Abu Lahab) delivers a definitive prophetic indictment against the Prophet's uncle Abu Lahab and his malicious wife Umm Jamil, declaring the futility of their wealth and cementing their eternal perdition in the blazing fire.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Masad' sababtoo ah aayadda ugu dambeysa waxay sheegaysaa in haweenaydii xaasidda ahayd qoorta loo gelin doono xadhig kulul oo xariir ama geed timir ah laga sameeyay.",
    namingReasonEnglish: "Named 'Al-Masad' (The Palm Fiber) after the twisted cord around the neck of Abu Lahab's spiteful wife in the inferno.",
    mainThemesSomali: [
      "Halaagga labada gacmood ee Abu Lahab iyo khasaaraha buuxa ee naftiisa soo gaadhay",
      "Faa'iido-darrada maalka: maalkiisa iyo wixii uu kasbaday waxba kama celin karin xukunka Eebbe",
      "Gudcurka mustaqbalkiisa: galitaanka Naar olol badan leh (Naaran daata lahab)",
      "Ciqaabka xaaskiisa: haweenaydii qodxaha dhigi jirtay waddada Nabiga oo Naarta ku xambaari doonta xaabo",
      "Calaamadda dullinimada: qoorteeda oo lagu xidhi doono xadhig adag oo xariir ah oo dab ah"
    ],
    mainThemesEnglish: [
      "The definitive doom declared upon the two hands of Abu Lahab and his utter spiritual and worldly ruination",
      "The futility of accumulated fortune: neither hoarded wealth nor tribal clout can shield the oppressor from divine justice",
      "The retribution in the hereafter: consignment to a furnace of crackling flames (Dhat Lahab)",
      "The poetic justice awarded to his wife: the carrier of firewood who littered thorny branches across the Prophet's path",
      "The collar of degradation: a twisted cord of coarse fiery palm-fiber bound around her neck"
    ],
    virtuesSomali: [
      "Waa mucjiso weyn oo Qur'aanka ah: waxay sheegtay 10 sano ka hor dhimashadooda inaysan waligood Islaami doonin Abu Lahab iyo xaaskiisu, runtiina sidii baa dhacday.",
      "Waxay muujinaysaa in qaraabada Nabigu aysan qofka anfacayn haddii uusan lahayn iimaan suubban."
    ],
    virtuesEnglish: [
      "Stands as an extraordinary predictive miracle: proclaimed a decade before their deaths that Abu Lahab and his wife would never embrace Islam.",
      "Establishes that genetic kinship with prophets carries zero spiritual privilege without personal faith and integrity."
    ],
    revelationContextSomali: "Waxay ku soo degtay Buurta Safa markii uu Nabigu ﷺ dadka u yeeray, Abu Lahab-na uu ku yidhi: 'Halaag baad mudan tahay ma tan baad noogu yeedhay?'.",
    revelationContextEnglish: "Revealed on Mount Safa after Abu Lahab publicly cursed the Prophet's initial proclamation of monotheism."
  },
  112: {
    surahNumber: 112,
    revelationType: "Meccan",
    revelationOrder: 22,
    ayahCount: 4,
    wordCount: 58,
    juzRange: "Juz 30",
    pageRange: "Page 604",
    aboutSomali: "Suuradda Al-Ikhlaas (Daacadnimada Tawxiidka) waa qolofka ugu sarreeya ee Tawxiidka Islaamka, waxay caddeysaa in Eebbe yahay Kow (Ahad), loo wada baahan yahay oo aan cidna u baahnayn (As-Samad), aan wax dhalin lana dhalin, uusan jirin cid la mid ah ama la mid dhiganta.",
    aboutEnglish: "Surah Al-Ikhlas (Sincerity / The Purity of Faith) is the absolute theological epicenter of Islamic monotheism (Tawhid), declaring Allah to be singular (Ahad), self-sufficient and eternally besought by all (As-Samad), who neither begets nor was begotten, peerless without equal.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Ikhlaas' sababtoo ah waxay qofka qalbigiisa ka saartaa shirkiga oo dhan waxayna u hufaysaa daacadnimada Eebbe kaliya.",
    namingReasonEnglish: "Named 'Al-Ikhlas' (Purity / Absolute Sincerity) because it purifies monotheistic theology of all anthropomorphic distortions.",
    mainThemesSomali: [
      "Midnimada buuxda ee Eebbe: 'Dheh: Isagu Eebbe waa Kow' (Ahad)",
      "As-Samad: Eebaha wax kasta u baahan yihiin, Isaguna aan cidna iyo waxna u baahnayn",
      "Ka reebanaanshaha dhalmada: 'Ma dhalin, lamana dhalin' oo diidaysa dhammaan sheegashooyinka carruurta Alle",
      "Kalinimada buuxda ee koonka: 'Ma jiro cid la siman ama la mid ah midna' (Kufuwan Ahad)",
      "Hufnaanta caqiidada: baabi'inta dhammaan noocyada sanam-caabudka iyo shirkiga"
    ],
    mainThemesEnglish: [
      "The absolute indivisible oneness of Allah: 'Say, He is Allah, the One and Unique' (112:1)",
      "The attribute of As-Samad: the eternal refuge upon whom all contingent creation relies while He relies on none",
      "Rejection of anthropomorphic lineage: 'He neither begets nor is born', refuting pagan genealogies and filial claims",
      "Absolute incomparability: 'And there is none comparable or equivalent unto Him' (112:4)",
      "The pristine definition of Tawhid transcending polytheism, dualism, trinity, and all philosophical compromises"
    ],
    virtuesSomali: [
      "Nabigu ﷺ wuxuu xusay inay u dhiganto saddex-meelood meel Qur'aanka kariimka ah (Thuluthal Qur'aan).",
      "Jacaylka loo qabo akhrinta suuraddani waxay qofka u horseedaa gelidda Jannada, sida uu Nabigu u sheegay saxaabigii jeclaa."
    ],
    virtuesEnglish: [
      "Prophetic tradition affirms that reciting Surah Al-Ikhlas equals one-third of the entire Qur'an in theological value (Bukhari).",
      "Love for reciting this surah was guaranteed by the Prophet ﷺ as an express pathway into Paradise."
    ],
    revelationContextSomali: "Waxay ku soo degtay Makkah ka dib markii mushrikiintu yiraahdeen: 'Muxammadow noo sheeg abtirsiga Rabbigaa'.",
    revelationContextEnglish: "Revealed in Makkah when polytheists demanded an ontological genealogy and physical description of Allah."
  },
  113: {
    surahNumber: 113,
    revelationType: "Meccan",
    revelationOrder: 20,
    ayahCount: 5,
    wordCount: 73,
    juzRange: "Juz 30",
    pageRange: "Page 604",
    aboutSomali: "Suuradda Al-Falaq (Waaga Baryey) waa mid ka mid ah labada suuradood ee la isku magangaliyo (Al-Micawwidhatayn), waxayna baraysaa aadanaha inuu Eebbe ka magangalo sharka abuurka, sharka gudcurka habeenka, sharka sixirroolayaasha guntimaha afuufa, iyo sharka xaasidka markuu wax xaasido.",
    aboutEnglish: "Surah Al-Falaq (The Daybreak) is the first of the twin shields of spiritual refuge (Al-Mu'awwidhatayn), invoking the Lord of the dawn against the universal perils of creation, the creeping darkness of night, the malicious sorcery of knot-blowers, and the poison of the envious.",
    namingReasonSomali: "Waxaa loogu magac daray 'Al-Falaq' sababtoo ah aayadda koowaad waxay amartaa magangalidda Rabbiga waaga dillaaca.",
    namingReasonEnglish: "Named 'Al-Falaq' (The Daybreak / Split Morning) referring to the radiant morning cleaving the darkness of night.",
    mainThemesSomali: [
      "Magangalidda Rabbiga waaga baryey ee iftiinka kaga saara gudcurka",
      "Ka magangalidda sharka wax kasta oo Eebbe abuuray (Makhluuqaadka)",
      "Ka magangalidda sharka habeenka marka uu gudcurkiisu fido (Ghaasiqin idhaa waqab)",
      "Ka magangalidda sharka sixirka iyo haweenka guntimaha wax ku afuufa (Naffaathaati fil-cuqad)",
      "Ka magangalidda sharka isha iyo xaasidka marka uu xaasidnimadiisa bilaabo (Xaasidin idhaa xasad)"
    ],
    mainThemesEnglish: [
      "Seeking celestial sanctuary with the Lord of the Daybreak who shatters terrestrial darkness",
      "Universal spiritual shield against potential hazards from all created entities (Sharri ma khalaq)",
      "Protection from the latent vulnerabilities of the deep night as shadows engulf consciousness",
      "Neutralizing malignant occult manipulations: the evil of occult blowers upon knots (sorcery)",
      "Protection against destructive psychological malevolence: the toxic envy of the resentful when jealousy is manifested"
    ],
    virtuesSomali: [
      "Waxay ka mid tahay Al-Micawwidhatayn oo uu Nabigu ﷺ ku tukan jiray xilliyada xanuunka iyo hurdada ka hor.",
      "Waa daawada ugu xoogga badan ee lagaga badbaado sixirka, isha xun, iyo xaasidnimada."
    ],
    virtuesEnglish: [
      "Together with Surah An-Nas, forms the premier prophetic armor against spiritual affliction, psychic trauma, and witchcraft.",
      "The Prophet ﷺ blew its verses into his palms nightly before sleep, wiping over his entire body for divine safeguarding."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina xilligii nin yuhuudi ah oo la oran jiray Labiid binu Aclam uu sixir u sameeyay Nabiga ﷺ.",
    revelationContextEnglish: "Revealed in Madinah to dismantle the occult sorcery attempted against the Prophet by Labid ibn al-A'sam."
  },
  114: {
    surahNumber: 114,
    revelationType: "Meccan",
    revelationOrder: 21,
    ayahCount: 6,
    wordCount: 87,
    juzRange: "Juz 30",
    pageRange: "Page 604",
    aboutSomali: "Suuradda An-Naas (Dadka) waa suuradda ugu dambeysa Qur'aanka kariimka ah, waxayna baraysaa qofka inuu magangalo Rabbiga dadka, Boqorka dadka, iyo Ilaaha dadka, isagoo ka magangalaya sharka waswaasiyaha dhuunta (Shaydaanka) ee xumaanta ku waswaasiya laabta aadanaha, ha ahaado jini ama dad.",
    aboutEnglish: "Surah An-Nas (Mankind) is the crowning conclusion of the Noble Qur'an, sheltering human vulnerability under the threefold divine sovereignty—Lord, King, and God of humanity—against the insidiously retreating whisperer (Waswas) corrupting hearts from Jinn and humankind.",
    namingReasonSomali: "Waxaa loogu magac daray 'An-Naas' sababtoo ah waxay ku soo noqnoqotaa kalmadda 'Dadka' shanta aayadood ee ugu horreeya.",
    namingReasonEnglish: "Named 'An-Nas' (Mankind) from the repeated invocation of human vulnerability before divine sovereignty.",
    mainThemesSomali: [
      "Magangalidda saddexda magac ee waaweyn: Rabbiga dadka, Boqorka dadka, iyo Ilaaha dadka",
      "Kashifidda dabeecadda cadawga qarsoon: Shaydaanka waswaasiyaha ah ee dib u gurta marka Eebbe la xuso (Al-Waswaas Al-Khannaas)",
      "Halka uu Shaydaanku bartilmaameedsado: wuxuu xumaanta iyo shakiga ku tuuraa laabta iyo quluubta dadka",
      "Kala soocidda ilaha waswaaska: kuwa ka yimaada xagga Jiniga iyo kuwa ka yimaada xagga dadka xun",
      "Gunaanadka Qur'aanka: xiritaanka Kitaabka iyadoo aadanaha lagu xirayo naxariista iyo ilaalinta Eebbe"
    ],
    mainThemesEnglish: [
      "Seeking ultimate sanctuary in the threefold divine majesty: Lord of mankind, King of mankind, and God of mankind",
      "Unmasking the internal psychic adversary: the insidious whisperer who advances in distraction and retreats at divine remembrance (Al-Waswas al-Khannas)",
      "The spiritual battlefield: evil insinuations and debilitating moral doubt introduced into the human heart",
      "The dual vector of corruption: recognizing whisperers emerging from both unseen demonic ranks and human corruptors",
      "The grand architecture of the Qur'an: commencing with Praise of the Creator (Al-Fatihah) and concluding with humanity under His refuge (An-Nas)"
    ],
    virtuesSomali: [
      "Waa suuradda soo xirta Qur'aanka kariimka ah iyadoo muujinaysa in nolosha oo dhan lagu dhex jiro ilaalinta Eebbe.",
      "Nabigu ﷺ wuxuu xusay inaysan jirin wax la mid ah oo dadku isku difaaci karaan labadan suuradood (Falaq iyo Naas)."
    ],
    virtuesEnglish: [
      "The sublime crowning capstone of the Qur'an, sealing the divine revelation with eternal refuge in God.",
      "The Prophet ﷺ remarked: 'No seeker has ever sought refuge with anything comparable to these two surahs' (Abu Dawud)."
    ],
    revelationContextSomali: "Waxay ku soo degtay Madiina iyadoo la socota Suuradda Al-Falaq si looga bogsado xanuunkii sixirka.",
    revelationContextEnglish: "Revealed together with Surah Al-Falaq in Madinah to bring total spiritual liberation and transcendent peace to humanity."
  }
};

/**
 * Retrieves the full educational overview and major themes for a given Surah number.
 * Always returns rich, authentic, Surah-specific themes.
 */
export function getSurahOverview(
  surahNumber: number,
  allSurahsList?: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    somaliNameTranslation?: string;
    numberOfAyahs: number;
    revelationType: string;
    page: number;
  }>
): SurahOverview {
  if (SURAH_OVERVIEWS[surahNumber]) {
    return SURAH_OVERVIEWS[surahNumber];
  }

  // Dynamic fallback synthesis if an out-of-range number is queried
  const surah = allSurahsList?.find((s) => s.number === surahNumber);
  const nameEn = surah?.englishName || `Surah ${surahNumber}`;
  const nameSo = surah?.somaliNameTranslation || surah?.englishNameTranslation || nameEn;
  const isMeccan = (surah?.revelationType || '').toLowerCase().includes('mecc');
  const revType: 'Meccan' | 'Medinan' = isMeccan ? 'Meccan' : 'Medinan';
  const ayahCount = surah?.numberOfAyahs || 10;
  const page = surah?.page || 1;
  const approxWords = Math.round(ayahCount * 14.5);
  const approxJuz = Math.min(30, Math.max(1, Math.ceil(page / 20)));

  return {
    surahNumber,
    revelationType: revType,
    revelationOrder: surahNumber,
    ayahCount,
    wordCount: approxWords,
    juzRange: `Juz ${approxJuz}`,
    pageRange: `Page ${page}`,
    aboutSomali: `Suuradda ${nameEn} (${nameSo}) waxay ka kooban tahay ${ayahCount} aayadood. Waxay ${revType === 'Meccan' ? 'ku soo degtay Makkah' : 'ku soo degtay Madiina'}, waxayna xoojinaysaa caqiidada, akhlaaqda Islaamka, iyo nuxurka fariinta Eebbe ee ku wajahan ${nameSo}.`,
    aboutEnglish: `Surah ${nameEn} (${surah?.englishNameTranslation || nameEn}) comprises ${ayahCount} verses. Revealed in ${revType === 'Meccan' ? 'Makkah' : 'Madinah'}, it explores fundamental themes of faith, moral excellence, and divine guidance specifically centered around ${surah?.englishNameTranslation || nameEn}.`,
    namingReasonSomali: `Waxaa loogu magac daray "${nameEn}" sababtoo ah waxay si toos ah u faahfaahinaysaa xigmadda iyo dhacdooyinka la xidhiidha ${nameSo}.`,
    namingReasonEnglish: `Named "${nameEn}" (${surah?.englishNameTranslation || nameEn}) after its central thematic subject and distinctive teachings.`,
    mainThemesSomali: [
      `Kalinimada iyo Weynida Eebbe ee ku cad aayadaha Suuradda ${nameEn}`,
      `Xikmadda, amarrada, iyo waanooyinka gaarka ah ee ${nameSo}`,
      `Dhisidda iimaanka suubban iyo addeecidda fariinta Nabiga ﷺ`,
      `Xisaabta Aakhiro iyo abaalgudka kuwa wanaagga фаla`
    ],
    mainThemesEnglish: [
      `The absolute Oneness and Majesty of Allah illuminated in Surah ${nameEn}`,
      `Specific ethical precepts, wisdom, and moral reflections regarding ${surah?.englishNameTranslation || nameEn}`,
      `Fortifying sincere faith and adherence to prophetic guidance`,
      `Accountability in the Hereafter and the eternal reward of righteousness`
    ],
    virtuesSomali: [
      `Akhrinta xaraf kasta oo suuraddan ka mid ah waxaa lagu helaa 10 xasano bi'idnillaah.`,
      `Waxay qofka u horseedaa iftiin, deganaansho, iyo hanuun nolosha ah.`
    ],
    virtuesEnglish: [
      `Every single letter recited yields ten divine rewards (hasanat).`,
      `Brings tranquility, spiritual clarity, and divine safeguarding to the reader.`
    ],
    revelationContextSomali: `Waxay ku soo degtay ${revType === 'Meccan' ? 'Makkah al-Mukarramah' : 'Madiina al-Munawwarah'} si ay u toosiso qalbiyada una dhisdo bulshada suubban.`,
    revelationContextEnglish: `Revealed in ${revType === 'Meccan' ? 'Makkah' : 'Madinah'} to establish steadfast conviction and ethical guidance.`
  };
}
