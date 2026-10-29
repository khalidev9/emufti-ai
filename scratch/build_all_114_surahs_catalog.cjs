const fs = require('fs');
const path = require('path');

// Read ALL_114_SURAHS from metadata
const metadataContent = fs.readFileSync(path.join(__dirname, '../src/data/quranMetadata.ts'), 'utf8');
const match = metadataContent.match(/export const ALL_114_SURAHS: Surah\[\] = (\[[\s\S]*?\]);/);
const allSurahs = eval(match[1]);

// Distinct Surah themes dictionary for all 114 Surahs
// Each entry has:
// aboutSo, aboutEn, namingReasonSo, namingReasonEn, themesSo, themesEn, virtuesSo, virtuesEn, contextSo, contextEn, revOrder
const SURAH_THEMES_MASTER = {
  1: {
    revOrder: 5,
    aboutSo: "Suuradda Al-Faatixa waa Hooyada Qur'aanka (Umm al-Kitaab) iyo furaha salaad kasta. Waxay koobeysaa dhammaan asalka caqiidada Islaamka: Tawxiidka, Mahadnaqa Eebbe, Tilmaamaha Naxariista, Rumaynta Maalinta Qiyaame, iyo Ducada toosan ee hanuunka.",
    aboutEn: "Surah Al-Fatihah (The Opening) is the Mother of the Book (Umm al-Kitab) and the foundation of daily prayers. It encompasses monotheism, divine praise, mercy, accountability on the Day of Judgment, and the ultimate supplication for spiritual guidance.",
    namingReasonSo: 'Waxaa loogu magac daray "Al-Faatixa" (Furitaanka) maxaa yeelay waa suuradda ugu horreysa ee uu ku furmo Kitaabka Qur\'aanka Kariimka ah, waana furaha salaadaha oo dhan.',
    namingReasonEn: 'Named "Al-Fatihah" (The Opening) because it opens the Holy Quran and initiates every unit of daily ritual prayer (Salah).',
    themesSo: [
      'Tawxiidka iyo Mahadnaqa kaliya ee Eebbe loo qiro (Alxamdullillaah)',
      'Naxariista ballaaran ee Eebbe (Ar-Raxmaan, Ar-Raxiim)',
      'Abaal-marinta iyo Xisaabta Maalinta Qiyaame (Maaliki Yawmid-Diin)',
      'Cibaadada iyo gargaar-weyddiisiga Eebbe kaliya (Iyyaaka Nacbudu)',
      'Ducada jidka toosan iyo ka fogaanshaha kuwa lumay (Siraad al-Mustaqiim)'
    ],
    themesEn: [
      'Praise and gratitude exclusively to Allah, Lord of all creation',
      'The vastness of Divine Mercy and Compassion (Ar-Rahman, Ar-Rahim)',
      'Divine sovereignty and ultimate accountability on the Day of Recompense',
      'Monotheistic devotion and relying solely upon Allah for support',
      'Supplication for steadfastness on the Straight Path and avoiding misguidance'
    ],
    virtuesSo: [
      'Nabigu ﷺ wuxuu ku tilmaamay suuradda ugu weyn Kitaabka Qur\'aanka (Saxiiyul Bukhaari).',
      'Waa toddobada aayadood ee soo noqnoqda (Sab\'ul Mathaani) ee salaad kasta lama huraanka u ah.',
      'Waa Ruqyo iyo Dawo shafi ah oo lagu caafimaado bi\'idnillaah.'
    ],
    virtuesEn: [
      'The Prophet ﷺ described it as the greatest Surah in the Quran (Sahih al-Bukhari).',
      'Known as the "Seven Oft-Repeated Verses" (As-Sab\' al-Mathani) essential for prayer.',
      'A profound spiritual cure (Shifa\') and source of divine refuge.'
    ],
    contextSo: 'Waxay ku soo degtay Makkah bilowgii waxyiga, waana suuraddii ugu horreysay ee hal mar wada degta.',
    contextEn: 'Revealed in Makkah early in the prophetic mission as the first complete Surah revealed at one time.'
  },
  2: {
    revOrder: 87,
    aboutSo: "Suuradda Al-Baqarah waa suuradda ugu dheer Qur'aanka Kariimka ah, waxayna xambaarsan tahay Aayadda ugu sarreysa ee Aayatal Kursi. Waxay dajisaa shareecada Islaamka, cibaadaadka, xeerarka qoyska, ganacsiga, iyo qisooyinkii Nebiyadii hore.",
    aboutEn: "Surah Al-Baqarah (The Cow) is the longest chapter of the Quran, housing Ayat al-Kursi. It articulates comprehensive Islamic legislation: social ethics, civil laws, fasting, pilgrimage, marriage, contracts, financial ethics, and prophetic lessons.",
    namingReasonSo: 'Waxaa loogu magac daray qisadii mucjisada Sacda ee Reer Banii Israa\'iil xilligii Nebi Muuse (CS) oo lagu baray addeecidda amarka Eebbe.',
    namingReasonEn: 'Named after the parable of the Cow (Al-Baqarah) commanded to the Israelites under Prophet Moses (AS), emphasizing sincere obedience without evasion.',
    themesSo: [
      'Kala saaridda saddexda kooxood: Mu\'miniinta, Gaalada, iyo Munaafiqiinta',
      'Abuuristii Nebi Aadan (CS) iyo doorka khilaafada bini\'aadamka ee dhulka',
      'Axkaamta Soonka bisha Ramadaan, Xajka, iyo Difaaca jidka Eebbe',
      'Xeerarka qoyska: Guurka, Furriinka, Masruufka, iyo Nuujinta carruurta',
      'Reebidda Ribada iyo xeerka qoraalka deynta (Aayadda ugu dheer Qur\'aanka)'
    ],
    themesEn: [
      'The spiritual taxonomy of humanity: Believers, Disbelievers, and Hypocrites',
      'The genesis of Adam (AS) and humanity\'s sacred vicegerency upon Earth',
      'Foundational legislations of Ramadan fasting, Hajj pilgrimage, and defensive combat',
      'Comprehensive family laws: Marriage, Divorce, Child custody, and Alimony',
      'Prohibition of Usury (Riba) and commercial contract verification (Ayat ad-Dayn)'
    ],
    virtuesSo: [
      'Nabigu ﷺ wuxuu yidhi: "Guryihiinna ha ka dhigina xabaalo; shaydaanku wuxuu ka cararaa guriga lagu akhriyo Al-Baqarah" (Saxiiyu Muslim).',
      'Waxay xambaarsan tahay Aayatal Kursi (2:255) oo ah aayadda ugu sharafta badan Qur\'aanka.',
      'Labada aayadood ee ugu dambeeya waxay qofka ka difaacaan xumaan kasta habeenkii.'
    ],
    virtuesEn: [
      'Satan flees from any household in which Surah Al-Baqarah is recited (Sahih Muslim).',
      'Contains Ayat al-Kursi (2:255), the single greatest verse in the Holy Quran.',
      'Its concluding two verses provide complete spiritual protection when recited at night.'
    ],
    contextSo: 'Waxay ku soo degtay Madiina ka dib Hijradii, waxayna dhistay nidaamka bulshada cusub ee Muslimiinta.',
    contextEn: 'Revealed in Madinah following the Hijrah, establishing the legal, moral, and social constitution of the early Muslim community.'
  },
  3: {
    revOrder: 89,
    aboutSo: "Suuradda Aali Cimraan waxay xoojisaa sugnaanta iimaanka iyo difaaca runta. Waxay iftiimisaa wada-hadalladii lala yeeshay Reer Kitaabka, barakada qoyskii Cimraan iyo Nebi Ciise (CS), iyo casharradii Dagaalkii Uxud.",
    aboutEn: "Surah Ali 'Imran (Family of Imran) emphasizes steadfastness in faith, theological discourse with the People of the Book, the immaculate heritage of Maryam and Jesus (AS), and decisive lessons from the Battle of Uhud.",
    namingReasonSo: 'Waxaa loogu magac daray Qoyskii barakaysnaa ee Cimraan oo ay ka soo jeedaan Maryama iyo Nebi Ciise (CS).',
    namingReasonEn: 'Named after the righteous Family of \'Imran, the blessed ancestral lineage of Maryam and Prophet Isa (Jesus AS).',
    themesSo: [
      'Sugnaanta Tawxiidka iyo Kitaabka Eebbe ee xaqqa ku soo degay',
      'Dhalashadii mucjisada ahayd ee Nebi Ciise iyo daahirnimada Maryam',
      'Doodaha cilmiga ah ee lala yeeshay Kiristaankii Najraan',
      'Casharradii Dagaalkii Uxud: Sabirka, u hoggaansanaanta hoggaanka, iyo ka fogaanshaha hunguriga',
      'Midnimada ummadda Islaamka iyo ku dheggenaanta xadhigga Eebbe'
    ],
    themesEn: [
      'Uncompromising affirmation of monotheism and the divine preservation of Scripture',
      'The miraculous virgin birth of Jesus and the honored purity of Maryam',
      'Theological discourse and respectful dialogue with the Christian delegation of Najran',
      'Crucial tactical and spiritual lessons of discipline derived from the Battle of Uhud',
      'Upholding the collective unity of the Muslim Ummah by holding firmly to the rope of Allah'
    ],
    virtuesSo: [
      'Al-Baqarah iyo Aali Cimraan waxaa loo yaqaannaa "Az-Zahrawaani" (Labada Iftiimaya) ee shafeecada qaada.',
      'Nabigu ﷺ wuxuu akhriyi jiray 10-ka aayadood ee ugu dambeeya marka uu habeenkii Tahajjudka u kaco.'
    ],
    virtuesEn: [
      'Revered alongside Al-Baqarah as "Az-Zahrawayn" (The Two Radiant Luminaries) providing shade on Judgment Day.',
      'The Prophet ﷺ routinely recited its closing ten contemplative verses upon waking for nocturnal Tahajjud prayer.'
    ],
    contextSo: 'Waxay ku soo degtay Madiina xilligii ay socdeen wada-hadalladii Najraan iyo wixii ka dambeeyay Dagaalkii Uxud.',
    contextEn: 'Revealed in Madinah during the era of interfaith delegations and the decisive aftermath of the Battle of Uhud.'
  },
  4: {
    revOrder: 92,
    aboutSo: "Suuradda An-Nisaa (Haweenka) waxay udub-dhexaad u tahay caddaaladda bulshada, ilaalinta danyarta, xuquuqda dumarka iyo agoonta, qaybinta dhaxalka, iyo dhismaha qoys xasiloon.",
    aboutEn: "Surah An-Nisa (The Women) establishes the principles of social justice, legal equity, the protection of vulnerable demographics (women and orphans), divine inheritance laws, and marital cohesion.",
    namingReasonSo: 'Waxaa loogu magac daray "An-Nisaa" (Haweenka) maxaa yeelay waxay si ballaaran u faahfaahisaa xuquuqda, xurmada, iyo shuruucda haweenka Islaamka.',
    namingReasonEn: 'Named "An-Nisa" (The Women) because it contains comprehensive divine enactments concerning the rights, dignity, and legal protections of women.',
    themesSo: [
      'Ilaalinta xuquuqda agoonta, dumarka, iyo maalkooda',
      'Xeerarka dhaxalka (Mirath) ee caddaaladda ku qotoma',
      'Xeerarka guurka, xallinta khilaafaadka qoyska, iyo masruufka',
      'Caddaaladda garsoorka iyo marag-furka xaqa ah xitaa haddii ay naftaada ka dhan tahay',
      'Difaaca Tawxiidka iyo burinta caqiidada khaldan ee Saddex-midnimada (Trinity)'
    ],
    themesEn: [
      'Safeguarding the financial and physical rights of orphans and vulnerable women',
      'The equitable and non-negotiable divine apportionment of inheritance shares (Mirath)',
      'Sanctity of the marriage covenant, conflict mediation, and spousal maintenance',
      'Unwavering judicial integrity and truthful testimony even against one\'s own self or kin',
      'Purification of pure monotheism and refutation of trinitarian dogma'
    ],
    virtuesSo: [
      'Waxay xambaarsan tahay aayadda caddaaladda buuxda (4:135) ee caanka ku ah garsoorka caalamka.',
      'Waxay caddaysay xurmada dhiigga qofka mu\'minka ah iyo ciqaabta kii si bareer ah u dila.'
    ],
    virtuesEn: [
      'Houses the monumental Verse of Justice (4:135), etched in leading world legal faculties.',
      'Affirms the immense sanctity of innocent human life, sternly warning against intentional homicide.'
    ],
    contextSo: 'Waxay ku soo degtay Madiina ka dib Dagaalkii Uxud si ay u xalliso dhibaatadii agoontii iyo carmalladii laga tagay.',
    contextEn: 'Revealed in Madinah following the Battle of Uhud to institute legal care and financial protection for war widows and orphans.'
  },
  5: {
    revOrder: 112,
    aboutSo: "Suuradda Al-Maa'idah waa suuraddii ugu dambaysay ee soo degta ee xukunno xalaal iyo xaaraan ah xambaarsan. Waxay ku baaqaysaa oofinta heshiisyada, cuntooyinka xalaasha ah, iyo daahirnimada.",
    aboutEn: "Surah Al-Ma'idah (The Table Spread) is one of the final legislative revelations, perfecting dietary statutes, ritual purity, contractual fidelity, civil justice, and interfaith covenants.",
    namingReasonSo: 'Waxaa loogu magac daray Miiskii Cuntada ee barakaysnaa (Al-Maa\'idah) ee Eebbe u soo dejiyay Xawaariyiintii Nebi Ciise (CS).',
    namingReasonEn: 'Named after the miraculous Table Spread (Al-Ma\'idah) descending from heaven requested by the disciples of Prophet Isa (Jesus AS).',
    themesSo: [
      'Oofinta ballamaha, heshiisyada, iyo axdiyada la galo (Awfuu bil-Cuquud)',
      'Cuntooyinka xalaasha ah iyo reebidda dhiigga, hilibka doofaarka, khamriga, iyo khamaarka',
      'Axkaamta daahirnimada: Waysova, qubeyska, iyo tayammumka',
      'Qisadii labadii wiil ee Aadan (Qaabiil iyo Haabiil) iyo dilkii ugu horreeyay',
      'Qisadii Miiskii Cirka ka soo degay iyo qiraalkii Nebi Ciise ee ahaa inuu Eebbe kaliya yahay kan mudan caabudidda'
    ],
    themesEn: [
      'The sacred obligation of fulfilling all contractual, civil, and spiritual covenants',
      'Dietary regulations: Halal food and absolute prohibitions on carrion, swine, wine, and gambling',
      'Ordinances of ritual purity encompassing ablution (Wudu), bath (Ghusl), and dry purification (Tayammum)',
      'The tragic historical archetype of Cain and Abel illustrating the destructive malice of jealousy',
      'The miraculous celestial banquet (Al-Ma\'idah) and Jesus\' solemn disavowal of divine claims'
    ],
    virtuesSo: [
      'Waxay xambaarsan tahay Aayadda Dhammaystirka Diinta (5:3) ee soo degtay Maalintii Carafo.',
      'Waxay leedahay xukunno shuruuceed oo aan la nasakhin (la baabi\'in).'
    ],
    virtuesEn: [
      'Contains the epochal Verse of Religious Perfection (5:3) revealed during the Farewell Pilgrimage at Arafat.',
      'Revered as a conclusive legislative code with definitive, unrepealed moral ordinances.'
    ],
    contextSo: 'Waxay ku soo degtay Madiina xilligii uu Islaamku awoodda iyo maamulka buuxa ku lahaa Jasiiradda Carabta.',
    contextEn: 'Revealed late in the Medinan era during the consolidation of Islamic sovereignty and governance across the Arabian Peninsula.'
  }
};

console.log('Master themes template initialized for base surahs');
