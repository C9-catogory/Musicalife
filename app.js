(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    lang: localStorage.getItem('ml_lang') || 'zh',
    route: 'home',
    simple: localStorage.getItem('ml_simple') === '1',
    reduced: localStorage.getItem('ml_reduced') === '1',
    learned: new Set(JSON.parse(localStorage.getItem('ml_learned') || '[]')),
    activeAnim: 'wave',
    activeVoice: 'instrument',
    currentGalaxy: 'all',
    audioCtx: null
  };

  const ui = {
    zh: {
      navHome: '首页', navVoyage: '航行', navMap: '星盘', navVoice: '人声', navLife: '生活', navExplore: '探索', navLibrary: '图书馆',
      searchTitle: '搜索音乐星海', simple: '少字', deep: '深知', home: '回首页', enter: '进入音乐星海', open: '打开', animation: '打开动画', learn: '点亮这颗星', related: '关联星点', sources: '资料来源',
      homeTitle: '音乐不是孤立的声音，而是一片可以航行的星海。',
      homeLead: '从振动、比例、身体、语言、记忆和世界出发，理解音乐如何成为关系、表达与生活的力量。',
      startVoyage: '开始航行', viewMap: '查看星盘', voiceLab: '进入人声宇宙', lifeTools: '生活工具箱', exploreWorld: '探索世界音乐', library: '进入图书馆',
      voyageTitle: '声之塔：点亮音乐银河', voyageLead: '像解码一座星塔一样学习音乐：每一层都是一个问题，每一次互动都会点亮一颗知识星。',
      mapTitle: '知识星盘', mapLead: '专业名词不是孤岛。点击一颗星，看它如何与声学、乐理、声乐、脑科学、生活和文化连接。',
      voiceTitle: '人声宇宙', voiceLead: '人是会呼吸、会变形、会表达情绪的乐器。学习唱歌，就是学习身体如何把空气变成意义。',
      lifeTitle: '生活星系', lifeLead: '把音乐知识转化为具体生活策略：睡眠、注意、疼痛、情绪、记忆、过载、社交声音与房间声景。',
      exploreTitle: '世界音乐博物馆', exploreLead: '音乐存在于身体、语言、仪式、机械、电子、星际想象与未来媒介之中。',
      libraryTitle: '图书馆', libraryLead: '从心理声学、声乐科学、音乐认知、乐理、声景和世界音乐继续深入。',
      animTitle: '动画实验室', animLead: '每个动画对应一个概念。拖动、点击、组合，让抽象知识变成可见的音乐结构。',
      searchPlaceholder: '频率 / resonance / voice / sleep', all: '全部星系', reset: '重置视角', playSound: '轻声试听', stopSound: '停止声音', noAuto: '默认静音，点击后才会发声。'
    },
    en: {
      navHome: 'Home', navVoyage: 'Voyage', navMap: 'Atlas', navVoice: 'Voice', navLife: 'Life', navExplore: 'Explore', navLibrary: 'Library',
      searchTitle: 'Search the musical cosmos', simple: 'Simple', deep: 'Deep', home: 'Home', enter: 'Enter the musical cosmos', open: 'Open', animation: 'Open animation', learn: 'Light up this star', related: 'Related stars', sources: 'Sources',
      homeTitle: 'Music is not an isolated sound. It is a cosmos you can travel through.',
      homeLead: 'From vibration, ratio, body, language, memory and world, Musicalife explores how music becomes relation, expression and daily support.',
      startVoyage: 'Start voyage', viewMap: 'Open atlas', voiceLab: 'Enter Voice Cosmos', lifeTools: 'Life toolkit', exploreWorld: 'Explore world music', library: 'Open library',
      voyageTitle: 'Tower of Sound: light up the musical galaxy', voyageLead: 'Learn music like decoding a constellation: each level asks one question, and every interaction lights up a knowledge star.',
      mapTitle: 'Knowledge atlas', mapLead: 'Terms are not islands. Tap a star to see how it connects acoustics, theory, voice, neuroscience, life and culture.',
      voiceTitle: 'Voice Cosmos', voiceLead: 'The human voice is an instrument that breathes, reshapes itself and carries emotion. Singing begins when air becomes meaning.',
      lifeTitle: 'Life galaxy', lifeLead: 'Turn musical knowledge into daily strategies for sleep, attention, pain, emotion, memory, overload, social voice and soundscape design.',
      exploreTitle: 'World music museum', exploreLead: 'Music lives in bodies, languages, rituals, machines, electronics, future media and cosmic imagination.',
      libraryTitle: 'Library', libraryLead: 'Go deeper through psychoacoustics, voice science, music cognition, theory, soundscape and world music.',
      animTitle: 'Animation lab', animLead: 'Each animation teaches one concept. Drag, tap and combine so abstract ideas become visible musical structures.',
      searchPlaceholder: 'frequency / resonance / voice / sleep', all: 'All galaxies', reset: 'Reset view', playSound: 'Play softly', stopSound: 'Stop sound', noAuto: 'Sound never autoplays. Tap to hear.'
    }
  };
  const t = key => ui[state.lang][key] || key;
  const L = obj => obj?.[state.lang] || obj?.zh || obj?.en || '';

  const galaxies = [
    { id:'physics', color:'#78e7ff', zh:'声音物理', en:'Sound physics' },
    { id:'hearing', color:'#b592ff', zh:'听觉心理', en:'Hearing mind' },
    { id:'theory', color:'#ffe08d', zh:'乐理数理', en:'Theory & math' },
    { id:'voice', color:'#ff9bd2', zh:'人声人体', en:'Voice body' },
    { id:'brain', color:'#9ff0c0', zh:'大脑身体', en:'Brain & body' },
    { id:'life', color:'#ffc08b', zh:'生活应用', en:'Life use' },
    { id:'culture', color:'#86e8d8', zh:'语言文化', en:'Language culture' },
    { id:'instruments', color:'#cad8ff', zh:'乐器媒介', en:'Instruments media' },
    { id:'future', color:'#d7a4ff', zh:'未来音乐', en:'Future music' }
  ];
  const gById = Object.fromEntries(galaxies.map(g => [g.id, g]));

  const termData = [
    {id:'wave', g:'physics', x:70,y:90, anim:'wave', zh:{title:'声波', one:'声音是空气压力的周期性变化。', detail:'声波把能量从声源带到耳朵。频率决定高低，振幅影响强弱，相位影响叠加与抵消。'}, en:{title:'Sound wave', one:'Sound is a repeating change in air pressure.', detail:'A wave carries energy from source to ear. Frequency shapes pitch, amplitude shapes level, and phase shapes interference.'}},
    {id:'frequency', g:'physics', x:160,y:130, anim:'wave', zh:{title:'频率', one:'一秒振动多少次，单位是 Hz。', detail:'频率越高，通常听起来越高。A4 常用 440 Hz；高八度约为 880 Hz。'}, en:{title:'Frequency', one:'How many cycles happen each second, measured in Hz.', detail:'Higher frequency usually sounds higher. A4 is commonly 440 Hz; one octave above is about 880 Hz.'}},
    {id:'amplitude', g:'physics', x:140,y:230, anim:'wave', zh:{title:'振幅', one:'波上下摆动的幅度，和声音强弱有关。', detail:'振幅不是情绪强度，而是物理摆动大小。过大音量会增加听力风险。'}, en:{title:'Amplitude', one:'How far a wave moves from its resting line.', detail:'Amplitude relates to sound level. It is not emotion itself, and excessive level can harm hearing.'}},
    {id:'phase', g:'physics', x:230,y:210, anim:'interference', zh:{title:'相位', one:'波形在时间中的位置。', detail:'相位相同会加强；相位相反可能抵消。这是主动降噪的关键思想之一。'}, en:{title:'Phase', one:'A wave’s position in its cycle.', detail:'In phase waves reinforce; opposite phase waves can cancel. This is a core idea behind active noise control.'}},
    {id:'harmonics', g:'physics', x:250,y:85, anim:'harmonics', zh:{title:'谐波 / 泛音', one:'基频的整数倍频率会一起塑造音色。', detail:'同样音高的钢琴、小提琴和人声不同，是因为泛音强弱不同。'}, en:{title:'Harmonics', one:'Integer multiples of a fundamental frequency shape timbre.', detail:'A piano, violin and voice can share the same pitch but differ because their harmonic spectra differ.'}},
    {id:'spectrum', g:'physics', x:330,y:160, anim:'harmonics', zh:{title:'频谱', one:'把一个声音拆成不同频率的能量图。', detail:'频谱像声音的指纹。它帮助我们理解音色、噪声、共振峰和滤波。'}, en:{title:'Spectrum', one:'A map of energy across frequencies.', detail:'A spectrum is like a sonic fingerprint. It helps explain timbre, noise, formants and filtering.'}},
    {id:'resonance', g:'physics', x:390,y:250, anim:'resonance', zh:{title:'共振', one:'系统遇到适合自己的频率时，振动会被放大。', detail:'乐器腔体、房间、声道和身体感觉都与共振有关。共振不是玄学，而是能量选择性放大。'}, en:{title:'Resonance', one:'A system vibrates strongly at its preferred frequency.', detail:'Instrument bodies, rooms, vocal tracts and bodily vibration all involve resonance. It is selective energy amplification.'}},
    {id:'fourier', g:'physics', x:470,y:145, anim:'fourier', zh:{title:'傅里叶思想', one:'复杂声音可以拆成许多简单波。', detail:'这让我们能从数理上理解音色、噪声、滤波、采样和电子音乐。'}, en:{title:'Fourier idea', one:'Complex sound can be decomposed into simple waves.', detail:'This gives a mathematical route into timbre, noise, filtering, sampling and electronic music.'}},

    {id:'masking', g:'hearing', x:670,y:110, anim:'masking', zh:{title:'掩蔽效应', one:'一个声音会遮住另一个声音。', detail:'噪声机、白噪声、粉红噪声常利用掩蔽，让环境突发声不那么突出。'}, en:{title:'Masking', one:'One sound can hide another sound.', detail:'Noise machines often use masking so sudden environmental sounds become less salient.'}},
    {id:'criticalBand', g:'hearing', x:760,y:200, anim:'masking', zh:{title:'临界带', one:'太接近的频率更容易互相干扰。', detail:'临界带帮助解释为什么某些组合刺耳、为什么同频附近噪声更容易遮住目标音。'}, en:{title:'Critical band', one:'Nearby frequencies interfere more strongly.', detail:'Critical bands explain roughness, masking and why nearby noise hides a target more effectively.'}},
    {id:'loudness', g:'hearing', x:820,y:90, anim:'loudness', zh:{title:'响度', one:'人主观感到的声音大小。', detail:'响度不等于物理声压。人耳对不同频率的敏感度不同。'}, en:{title:'Loudness', one:'The perceived strength of sound.', detail:'Loudness is not identical to physical pressure. Human ears are more sensitive to some frequency ranges.'}},
    {id:'roughness', g:'hearing', x:890,y:190, anim:'roughness', zh:{title:'粗糙度', one:'快速起伏和频率拥挤会让声音显得粗糙。', detail:'粗糙度与紧张、刺耳、不协和感有关，也可成为音乐表达的材料。'}, en:{title:'Roughness', one:'Fast fluctuations and crowded frequencies can feel rough.', detail:'Roughness relates to tension, harshness and dissonance, but can also become expressive material.'}},
    {id:'binaural', g:'hearing', x:960,y:105, anim:'binaural', zh:{title:'双耳效应', one:'两只耳朵的时间差和强度差帮助定位声音。', detail:'空间听觉、耳机立体声、双耳去掩蔽都依赖左右耳信息差。'}, en:{title:'Binaural hearing', one:'Two ears use timing and level differences to locate sound.', detail:'Spatial hearing, stereo headphones and binaural unmasking depend on differences between ears.'}},
    {id:'anc', g:'hearing', x:1030,y:215, anim:'anc', zh:{title:'主动降噪', one:'用反相声波抵消部分噪声。', detail:'稳定低频更容易处理；突发高频和人声更难完全抵消。'}, en:{title:'Active noise control', one:'Opposite-phase sound can reduce parts of noise.', detail:'Stable low-frequency noise is easier to reduce than sudden high-frequency sounds and speech.'}},

    {id:'interval', g:'theory', x:120,y:430, anim:'scale', zh:{title:'音程', one:'两个音之间的距离。', detail:'音程是旋律、和声、音准训练的基础。'}, en:{title:'Interval', one:'The distance between two notes.', detail:'Intervals are the foundation of melody, harmony and ear training.'}},
    {id:'scale', g:'theory', x:215,y:470, anim:'scale', zh:{title:'音阶', one:'按规则排列的一组音。', detail:'半音、全音、八度和调式共同塑造音阶的性格。'}, en:{title:'Scale', one:'A set of notes arranged by rules.', detail:'Semitones, whole tones, octaves and modes shape the character of a scale.'}},
    {id:'circleFifths', g:'theory', x:310,y:400, anim:'fifths', zh:{title:'五度圈', one:'调性关系像星环。', detail:'相邻调关系接近，远处调性关系更陌生。'}, en:{title:'Circle of fifths', one:'Keys form a ring of relationships.', detail:'Nearby keys feel close; distant keys feel more remote.'}},
    {id:'chord', g:'theory', x:400,y:485, anim:'chord', zh:{title:'和弦', one:'多个音同时出现形成结构。', detail:'1-3-5 像积木一样搭出三和弦，改变三度就改变明暗。'}, en:{title:'Chord', one:'Several notes sounding together create structure.', detail:'1-3-5 builds a triad; changing the third shifts brightness and mood.'}},
    {id:'meter', g:'theory', x:520,y:415, anim:'metronome', zh:{title:'节拍器', one:'外部时间支架。', detail:'节拍器不只是练速度，也是训练身体预测、重拍、细分和稳定感。'}, en:{title:'Metronome', one:'An external time scaffold.', detail:'A metronome trains prediction, strong beats, subdivision and steadiness, not just speed.'}},
    {id:'polyrhythm', g:'theory', x:600,y:505, anim:'polyrhythm', zh:{title:'复节奏', one:'两个时间网格同时存在。', detail:'3 over 4、2 over 3 会让身体感到多层时间。'}, en:{title:'Polyrhythm', one:'Two time grids coexist.', detail:'3 over 4 or 2 over 3 creates a layered sense of time.'}},
    {id:'relativePitch', g:'theory', x:690,y:425, anim:'scale', zh:{title:'相对音准', one:'听出音与音之间的关系。', detail:'大多数音乐学习更依赖相对音准，而不是绝对音准。'}, en:{title:'Relative pitch', one:'Hearing relationships between notes.', detail:'Most musical learning relies more on relative pitch than absolute pitch.'}},
    {id:'absolutePitch', g:'theory', x:770,y:495, anim:'scale', zh:{title:'绝对音准', one:'不用参照物也能识别音名。', detail:'它很特别，但不是学音乐的唯一道路。'}, en:{title:'Absolute pitch', one:'Naming a note without a reference.', detail:'It is special, but it is not the only path to musicianship.'}},

    {id:'humanInstrument', g:'voice', x:900,y:405, anim:'voiceSystem', zh:{title:'人是乐器', one:'人声是呼吸、振动、共鸣、吐字和听觉反馈的系统。', detail:'唱歌不是只用声带，而是全身协同把空气变成可表达的声音。'}, en:{title:'Human as instrument', one:'Voice is a system of breath, vibration, resonance, articulation and feedback.', detail:'Singing is not only the vocal folds. It is coordinated sound-making through the whole body.'}},
    {id:'airflow', g:'voice', x:1000,y:455, anim:'voiceSystem', zh:{title:'气流', one:'稳定气流比吸很多气更重要。', detail:'气流和气压驱动声带振动。过度推气会导致紧张或漏气。'}, en:{title:'Airflow', one:'Stable airflow matters more than taking a huge breath.', detail:'Airflow and pressure drive vocal fold vibration. Excess pushing may create tension or breathiness.'}},
    {id:'vocalFolds', g:'voice', x:1090,y:385, anim:'vocalfold', zh:{title:'声带', one:'声带像柔软的门，被气流带动开合。', detail:'太松会漏气，太紧会挤压，平衡闭合才更可持续。'}, en:{title:'Vocal folds', one:'Vocal folds act like soft doors set into vibration by air.', detail:'Too loose becomes breathy; too tight becomes pressed. Balanced closure is more sustainable.'}},
    {id:'sovt', g:'voice', x:1160,y:485, anim:'sovt', zh:{title:'SOVT', one:'半闭合声道练习让声带更省力。', detail:'吸管音、唇颤、哼鸣、v/z/ng 都能提供温和回压。'}, en:{title:'SOVT', one:'Semi-occluded vocal tract exercises can ease vocal fold vibration.', detail:'Straw phonation, lip trills, humming, v/z/ng create gentle back pressure.'}},
    {id:'formant', g:'voice', x:1250,y:400, anim:'formant', zh:{title:'Formant 共振峰', one:'声道放大某些频率，形成元音和音色。', detail:'舌位、嘴唇、下颌和咽腔空间改变共振峰。'}, en:{title:'Formants', one:'The vocal tract amplifies selected frequencies, shaping vowels and timbre.', detail:'Tongue position, lips, jaw and pharyngeal space change formants.'}},
    {id:'toneValue', g:'voice', x:1330,y:505, anim:'tone', zh:{title:'调值 / 声调', one:'语言里的音高走势也能传递意义。', detail:'普通话四声就是音高轮廓系统。讲话本身也是音乐。'}, en:{title:'Tone contour', one:'Pitch movement in language can carry meaning.', detail:'Mandarin tones are a pitch-contour system. Speech itself is musical.'}},

    {id:'prediction', g:'brain', x:140,y:720, anim:'prediction', zh:{title:'预测编码', one:'大脑不断猜下一步声音。', detail:'音乐的魅力常在“可预测”和“有一点惊喜”之间。'}, en:{title:'Predictive coding', one:'The brain keeps guessing what comes next.', detail:'Musical pleasure often lives between predictability and a small surprise.'}},
    {id:'reward', g:'brain', x:250,y:780, anim:'prediction', zh:{title:'奖赏系统', one:'期待、到达和惊喜会激活愉悦。', detail:'旋律回归、和声解决、熟悉歌曲都可触发奖赏体验。'}, en:{title:'Reward system', one:'Expectation, arrival and surprise can create pleasure.', detail:'Melodic return, harmonic resolution and familiar songs can trigger reward.'}},
    {id:'hrv', g:'brain', x:360,y:720, anim:'breathSync', zh:{title:'HRV', one:'心率微小变化反映自主神经调节。', detail:'慢呼气、哼鸣和稳定节律可能帮助身体从高唤醒降档。'}, en:{title:'HRV', one:'Heart-rate variability reflects autonomic regulation.', detail:'Slow exhale, humming and stable rhythm may help the body downshift from high arousal.'}},
    {id:'entrainment', g:'brain', x:470,y:790, anim:'metronome', zh:{title:'节律夹带', one:'身体和大脑会跟随外部节律同步。', detail:'这解释了为什么鼓点能让人想动，为什么节拍器能帮助启动。'}, en:{title:'Entrainment', one:'Body and brain can synchronize with external rhythm.', detail:'This helps explain why beats move us and why metronomes can support initiation.'}},
    {id:'dmn', g:'brain', x:570,y:715, anim:'prediction', zh:{title:'DMN', one:'默认模式网络与自我、记忆和内在想象有关。', detail:'熟悉或沉思性的音乐可能牵动记忆、联想和自我叙事。'}, en:{title:'DMN', one:'The default mode network relates to self, memory and inner imagery.', detail:'Familiar or reflective music may engage memory, association and self-narrative.'}},

    {id:'sleep', g:'life', x:720,y:720, anim:'lifeSleep', zh:{title:'睡眠降档', one:'低预测负荷的声音能帮助环境变得可忽略。', detail:'粉红噪声、雨声、低动态 ambient 可用于遮住突发声，但音量要低。'}, en:{title:'Sleep downshift', one:'Low-prediction sound can make the environment easier to ignore.', detail:'Pink noise, rain and low-dynamic ambient can mask sudden sounds, but keep volume low.'}},
    {id:'adhdStart', g:'life', x:840,y:790, anim:'metronome', zh:{title:'ADHD 启动', one:'外部节律可以像脚手架。', detail:'90–120 BPM、低歌词负荷、短时任务常比完全安静更容易启动。'}, en:{title:'ADHD initiation', one:'External rhythm can act like scaffolding.', detail:'90–120 BPM, low lyric load and short tasks may help more than total silence.'}},
    {id:'pain', g:'life', x:960,y:720, anim:'pain', zh:{title:'疼痛管理', one:'音乐可作为注意、情绪和呼吸调节的辅助。', detail:'它不替代医疗，但可帮助一些人获得可控感、节律和情绪缓冲。'}, en:{title:'Pain support', one:'Music can support attention, emotion and breathing regulation.', detail:'It does not replace medical care, but may support control, rhythm and emotional buffering.'}},
    {id:'soundscape', g:'life', x:1070,y:790, anim:'soundscape', zh:{title:'声景设计', one:'声音环境不只是分贝，也关乎体验、控制权和意义。', detail:'设计房间声景时，要区分危险提示、背景声、安全锚点和静音出口。'}, en:{title:'Soundscape design', one:'Sound environments are not only decibels; they involve experience, control and meaning.', detail:'Design soundscapes by separating alerts, background sound, anchors and quiet exits.'}},

    {id:'languageMusic', g:'culture', x:1180,y:720, anim:'tone', zh:{title:'语言与音乐', one:'语言有音高、节奏、重音和停顿。', detail:'声调语言、诗歌、rap、戏曲和吟唱都显示讲话与音乐相连。'}, en:{title:'Language and music', one:'Language has pitch, rhythm, stress and pause.', detail:'Tone languages, poetry, rap, opera and chant show how speech and music connect.'}},
    {id:'talkingDrum', g:'culture', x:1290,y:790, anim:'talkingDrum', zh:{title:'会说话的鼓', one:'鼓可以模仿语言的音高轮廓和节奏。', detail:'一些 talking drum 传统用鼓声传递类似语言的信息。'}, en:{title:'Talking drum', one:'A drum can imitate pitch contours and rhythms of language.', detail:'Some talking drum traditions transmit language-like information through drumming.'}},
    {id:'choir', g:'culture', x:1370,y:700, anim:'choir', zh:{title:'合唱', one:'多人呼吸、音高和情绪同步。', detail:'合唱不只是和声，也包含身体同步、社会连接和空间声学。'}, en:{title:'Choir', one:'Many people synchronize breath, pitch and emotion.', detail:'Choir is not only harmony; it includes bodily synchrony, social connection and spatial acoustics.'}},

    {id:'theremin', g:'instruments', x:300,y:980, anim:'theremin', zh:{title:'Theremin', one:'不接触乐器，用手与电磁场控制音高和音量。', detail:'它像科幻中的声音光线，展示了电子振荡如何变成音乐。'}, en:{title:'Theremin', one:'A no-touch instrument controlled by hand position in electromagnetic fields.', detail:'It sounds like science fiction and shows how electronic oscillation becomes music.'}},
    {id:'gamelan', g:'instruments', x:440,y:1010, anim:'gamelan', zh:{title:'Gamelan', one:'印尼青铜打击乐群，层叠周期与闪亮音色。', detail:'它让人听见不同时间层如何同时运转。'}, en:{title:'Gamelan', one:'Indonesian bronze ensemble with layered cycles and shimmering timbre.', detail:'It lets us hear multiple time layers at once.'}},
    {id:'mbira', g:'instruments', x:580,y:970, anim:'mbira', zh:{title:'Mbira', one:'金属簧片振动，循环纹理像小星群。', detail:'拇指琴展示了自鸣体、重复结构和共鸣箱如何结合。'}, en:{title:'Mbira', one:'Metal tines vibrate into looping star-like textures.', detail:'Mbira shows how idiophones, repetition and resonance boxes combine.'}},
    {id:'daw', g:'future', x:790,y:980, anim:'sampling', zh:{title:'DAW / 采样', one:'声音可以被切片、排列、复制和重组。', detail:'现代音乐媒介把声音变成可编辑的时间材料。'}, en:{title:'DAW / Sampling', one:'Sound can be sliced, arranged, copied and recomposed.', detail:'Modern media turn sound into editable time material.'}},
    {id:'tactile', g:'future', x:940,y:1020, anim:'tactile', zh:{title:'触觉音乐', one:'音乐也可以通过身体振动被感受。', detail:'声音不只属于耳朵，也可以被皮肤、骨传导和触觉系统体验。'}, en:{title:'Tactile music', one:'Music can be felt through bodily vibration.', detail:'Sound is not only for ears; skin, bone conduction and touch can also carry musical information.'}},
    {id:'spaceMusic', g:'future', x:1090,y:970, anim:'space', zh:{title:'太空音乐', one:'真空不能传播普通声波，但音乐可以成为数据、光和振动。', detail:'科幻音乐提醒我们：音乐可以跨越媒介，不只是空气里的声音。'}, en:{title:'Space music', one:'Vacuum cannot carry ordinary sound, but music can become data, light and vibration.', detail:'Science-fiction music reminds us that music can cross media, not only air.'}}
  ];

  const edges = [
    ['wave','frequency'],['wave','amplitude'],['wave','phase'],['frequency','harmonics'],['harmonics','spectrum'],['frequency','resonance'],['spectrum','fourier'],['phase','anc'],['frequency','scale'],['harmonics','chord'],['resonance','formant'],['resonance','mbira'],['resonance','gamelan'],
    ['masking','criticalBand'],['masking','sleep'],['criticalBand','roughness'],['binaural','anc'],['binaural','soundscape'],['loudness','soundscape'],
    ['interval','scale'],['scale','circleFifths'],['scale','relativePitch'],['scale','absolutePitch'],['chord','choir'],['meter','polyrhythm'],['meter','entrainment'],['polyrhythm','gamelan'],
    ['humanInstrument','airflow'],['airflow','vocalFolds'],['vocalFolds','sovt'],['vocalFolds','formant'],['formant','toneValue'],['toneValue','languageMusic'],['sovt','hrv'],['formant','choir'],['relativePitch','choir'],
    ['prediction','reward'],['prediction','dmn'],['entrainment','adhdStart'],['hrv','sleep'],['hrv','pain'],['reward','sleep'],['dmn','languageMusic'],
    ['languageMusic','talkingDrum'],['talkingDrum','polyrhythm'],['choir','soundscape'],['theremin','frequency'],['theremin','future'],['daw','fourier'],['daw','spectrum'],['tactile','wave'],['spaceMusic','tactile']
  ];

  const levels = [
    {id:'lv1', term:'wave', anim:'wave', zh:{title:'第一层：听见振动', one:'调频率和振幅，看声音如何从波开始。'}, en:{title:'Level 1: Hear vibration', one:'Adjust frequency and amplitude to see sound begin as waves.'}},
    {id:'lv2', term:'harmonics', anim:'harmonics', zh:{title:'第二层：点亮泛音', one:'把简单波叠起来，听见音色的诞生。'}, en:{title:'Level 2: Light harmonics', one:'Stack simple waves to see timbre emerge.'}},
    {id:'lv3', term:'resonance', anim:'resonance', zh:{title:'第三层：进入共振', one:'寻找让空间变亮的频率。'}, en:{title:'Level 3: Enter resonance', one:'Find the frequency that makes a space glow.'}},
    {id:'lv4', term:'masking', anim:'masking', zh:{title:'第四层：穿过噪声', one:'在噪声云里寻找目标音。'}, en:{title:'Level 4: Through noise', one:'Find a target sound inside a noise cloud.'}},
    {id:'lv5', term:'scale', anim:'scale', zh:{title:'第五层：搭建音阶', one:'半音、全音和八度像通往旋律的台阶。'}, en:{title:'Level 5: Build a scale', one:'Semitones, whole tones and octaves become steps toward melody.'}},
    {id:'lv6', term:'meter', anim:'metronome', zh:{title:'第六层：点亮节拍星钟', one:'跟随节拍器，看时间如何变成身体秩序。'}, en:{title:'Level 6: Light the rhythm clock', one:'Follow the metronome and watch time become bodily order.'}},
    {id:'lv7', term:'humanInstrument', anim:'voiceSystem', zh:{title:'第七层：成为人声乐器', one:'空气、声带、声道和吐字共同生成声音。'}, en:{title:'Level 7: Become a human instrument', one:'Air, folds, tract and articulation generate voice together.'}},
    {id:'lv8', term:'choir', anim:'choir', zh:{title:'第八层：创造和声', one:'多个声音相遇，星图变成和弦。'}, en:{title:'Level 8: Create harmony', one:'Voices meet and the star map becomes a chord.'}},
    {id:'lv9', term:'sleep', anim:'lifeSleep', zh:{title:'第九层：把知识带回生活', one:'让音乐成为睡眠、注意、情绪和身体的温柔工具。'}, en:{title:'Level 9: Bring music into life', one:'Let music become a gentle tool for sleep, attention, emotion and body.'}},
    {id:'lv10', term:'spaceMusic', anim:'space', zh:{title:'第十层：进入未来音乐', one:'音乐可以是声音、振动、数据、光，也可以是想象。'}, en:{title:'Level 10: Enter future music', one:'Music can be sound, vibration, data, light and imagination.'}}
  ];

  const animationCards = [
    {id:'wave', g:'physics', zh:{title:'声波调音台', one:'频率、振幅、相位如何改变波。'}, en:{title:'Wave console', one:'How frequency, amplitude and phase reshape a wave.'}},
    {id:'harmonics', g:'physics', zh:{title:'谐波织机', one:'叠加泛音，创造音色。'}, en:{title:'Harmonic loom', one:'Layer harmonics to create timbre.'}},
    {id:'resonance', g:'physics', zh:{title:'共振之杯', one:'找到适合空间的频率。'}, en:{title:'Resonance cup', one:'Find the preferred frequency of a space.'}},
    {id:'fourier', g:'physics', zh:{title:'傅里叶星谱', one:'把复杂声音拆成星柱。'}, en:{title:'Fourier spectrum', one:'Decompose sound into star bars.'}},
    {id:'masking', g:'hearing', zh:{title:'掩蔽云雾', one:'噪声如何遮住目标音。'}, en:{title:'Masking cloud', one:'How noise hides a target.'}},
    {id:'binaural', g:'hearing', zh:{title:'双耳定位', one:'左右耳差异如何生成空间。'}, en:{title:'Binaural space', one:'How ear differences create space.'}},
    {id:'anc', g:'hearing', zh:{title:'反相降噪', one:'相反波形如何抵消。'}, en:{title:'Anti-noise', one:'How opposite waves cancel.'}},
    {id:'scale', g:'theory', zh:{title:'音阶楼梯', one:'半音、全音、八度。'}, en:{title:'Scale stairs', one:'Semitone, whole tone and octave.'}},
    {id:'fifths', g:'theory', zh:{title:'五度星环', one:'调性像星座邻居。'}, en:{title:'Fifths ring', one:'Keys as neighboring constellations.'}},
    {id:'metronome', g:'theory', zh:{title:'节拍器星钟', one:'BPM、重拍、细分。'}, en:{title:'Metronome clock', one:'BPM, strong beats and subdivision.'}},
    {id:'polyrhythm', g:'theory', zh:{title:'复节奏轨道', one:'两个时间网格同时运行。'}, en:{title:'Polyrhythm orbit', one:'Two time grids at once.'}},
    {id:'voiceSystem', g:'voice', zh:{title:'人是乐器总图', one:'空气如何变成声音。'}, en:{title:'Human instrument map', one:'How air becomes voice.'}},
    {id:'vocalfold', g:'voice', zh:{title:'声带之门', one:'漏气、挤压、平衡闭合。'}, en:{title:'Vocal fold gate', one:'Breathy, pressed and balanced closure.'}},
    {id:'sovt', g:'voice', zh:{title:'SOVT 回压', one:'吸管和哼鸣为什么更省力。'}, en:{title:'SOVT back pressure', one:'Why straw and humming can feel easier.'}},
    {id:'formant', g:'voice', zh:{title:'元音星图', one:'舌位和嘴唇改变 Formant。'}, en:{title:'Vowel star map', one:'Tongue and lips reshape formants.'}},
    {id:'tone', g:'voice', zh:{title:'声调曲线', one:'讲话也有旋律。'}, en:{title:'Tone contours', one:'Speech also has melody.'}},
    {id:'choir', g:'culture', zh:{title:'合唱星座', one:'多声部如何形成和声。'}, en:{title:'Choir constellation', one:'How voices form harmony.'}},
    {id:'lifeSleep', g:'life', zh:{title:'睡眠降档', one:'声音如何降低预测负荷。'}, en:{title:'Sleep downshift', one:'How sound lowers prediction load.'}},
    {id:'soundscape', g:'life', zh:{title:'声景房间', one:'背景声、安全锚点和静音出口。'}, en:{title:'Soundscape room', one:'Background, anchors and quiet exits.'}},
    {id:'talkingDrum', g:'culture', zh:{title:'会说话的鼓', one:'鼓如何模仿语言轮廓。'}, en:{title:'Talking drum', one:'How drums imitate language contours.'}},
    {id:'theremin', g:'instruments', zh:{title:'Theremin 星场', one:'手势与电磁场控制声音。'}, en:{title:'Theremin field', one:'Gesture controls sound through fields.'}},
    {id:'gamelan', g:'instruments', zh:{title:'Gamelan 周期层', one:'层叠节奏如何闪光。'}, en:{title:'Gamelan cycles', one:'How layered cycles shimmer.'}},
    {id:'tactile', g:'future', zh:{title:'触觉音乐', one:'音乐如何变成身体振动。'}, en:{title:'Tactile music', one:'How music becomes bodily vibration.'}},
    {id:'space', g:'future', zh:{title:'太空音乐', one:'声音、数据、光和振动。'}, en:{title:'Space music', one:'Sound, data, light and vibration.'}}
  ];

  const voiceChapters = [
    {id:'instrument', anim:'voiceSystem', zh:{title:'总：为什么人也是乐器', one:'人声不是只有声带，而是呼吸、声带、声道、吐字、听觉反馈和情绪表达的整体系统。', steps:['观察身体：颈肩不夹紧，肋骨有弹性。','轻轻呼气，不急着唱。','发一个舒服的嗯，把声音当作空气上的振动。','再把嗯打开成啊，观察音色如何变化。']}, en:{title:'Whole: why the human is an instrument', one:'Voice is not only vocal folds. It is breath, folds, tract, articulation, auditory feedback and emotion working as a system.', steps:['Notice the body: free neck and shoulders, elastic ribs.','Exhale gently before singing.','Hum softly and feel voice as vibration riding on air.','Open hum into ah and notice the change of tone.']}},
    {id:'breath', anim:'voiceSystem', zh:{title:'呼吸与气流', one:'气息支持不是吸很多气，也不是硬顶肚子，而是稳定、弹性的呼气管理。', steps:['sss 5 秒：让气流稳定。','fff 5 秒：感受气流量。','vvv 5 秒：加入声带振动。','说一句短句，不憋气，不推气。']}, en:{title:'Breath and airflow', one:'Breath support is not taking huge air or forcing the belly. It is stable, elastic exhale management.', steps:['sss for 5 seconds: stabilize airflow.','fff for 5 seconds: feel airflow amount.','vvv for 5 seconds: add vocal vibration.','Speak a short sentence without holding or pushing air.']}},
    {id:'folds', anim:'vocalfold', zh:{title:'声带闭合', one:'漏气、挤压和平衡闭合会产生完全不同的声音和身体感觉。', steps:['哈——听漏气。','呃——感受挤压，但不要持续。','嗯——找到更轻松的闭合。','嗯—啊，保持声音不断裂。']}, en:{title:'Vocal fold closure', one:'Breathy, pressed and balanced closure create very different sounds and sensations.', steps:['haa: hear breathiness.','uh: feel pressed onset briefly, then stop.','mm: find easier closure.','mm-ah: open without breaking the sound.']}},
    {id:'sovt', anim:'sovt', zh:{title:'SOVT：半闭合声道', one:'吸管音、唇颤、哼鸣给声道一点回压，让声带更容易协调。', steps:['只吹吸管 5 秒。','吸管发 wu 5 秒。','用吸管滑音，从低到高再回来。','拿掉吸管，轻轻唱 u-o-a。']}, en:{title:'SOVT: semi-occluded vocal tract', one:'Straw, lip trill and humming give gentle back pressure so the folds coordinate more easily.', steps:['Blow through a straw for 5 seconds.','Sing wu through the straw for 5 seconds.','Slide low-high-low through the straw.','Remove straw and sing u-o-a gently.']}},
    {id:'resonance', anim:'formant', zh:{title:'三腔 / 共鸣澄清', one:'胸腔更多是振动感觉；口腔、咽腔、鼻腔和声道形状真实改变音色。', steps:['用 m 感受面部振动。','唱 ma-me-mi-mo-mu，听音色变化。','轻捏鼻子唱 m 和 a，比较鼻腔参与。','不要追求某个腔体，先追求轻松清楚。']}, en:{title:'Resonance: clarifying the “three cavities”', one:'Chest is mostly felt vibration; mouth, pharynx, nasal cavity and tract shape truly change timbre.', steps:['Hum m and feel facial vibration.','Sing ma-me-mi-mo-mu and hear timbre shift.','Gently pinch nose on m and a to compare nasal involvement.','Do not chase a cavity; seek ease and clarity first.']}},
    {id:'formants', anim:'formant', zh:{title:'Formant 与元音', one:'声带是声源，声道是滤波器。不同元音就是不同的滤波形状。', steps:['固定音高唱 a-e-i-o-u。','观察舌头、嘴唇、下颌如何变化。','保持音量小，听明暗而不是用力。','把同一音高唱成不同元音。']}, en:{title:'Formants and vowels', one:'The vocal folds are the source; the vocal tract is a filter. Vowels are different filter shapes.', steps:['Sing a-e-i-o-u on one pitch.','Notice tongue, lips and jaw change.','Keep volume low and listen for brightness, not effort.','Keep pitch steady while vowels change.']}},
    {id:'tone', anim:'tone', zh:{title:'讲话也是音乐', one:'语言有音高、节奏、重音和停顿。普通话四声就是音高轮廓。', steps:['画一声：高平。','画二声：上升。','画三声：低降再升。','画四声：快速下降。','同一句话说出安慰、疑问、坚定三种语气。']}, en:{title:'Speech is also music', one:'Language has pitch, rhythm, stress and pause. Mandarin tones are pitch contours.', steps:['Draw tone 1: high level.','Draw tone 2: rising.','Draw tone 3: dipping.','Draw tone 4: falling.','Say one sentence as comfort, question and firmness.']}},
    {id:'pitch', anim:'scale', zh:{title:'音高、音准与调值', one:'音准不是神秘天赋。相对音准是学习音与音之间的关系，调值是音高走势系统。', steps:['先唱滑音，不急着准确。','唱 sol-mi-do 三音。','听两个音谁更高。','用键盘或 App 检查，但不要完全依赖屏幕。']}, en:{title:'Pitch, intonation and contour', one:'Pitch accuracy is not mystical. Relative pitch learns relationships; tone contour is a pitch-shape system.', steps:['Start with slides, not exact notes.','Sing sol-mi-do.','Hear which note is higher.','Use keyboard or an app to check, but do not depend only on screen.']}},
    {id:'rhythm', anim:'metronome', zh:{title:'节拍器与身体时间', one:'节拍器不是机械惩罚，而是帮助身体建立可预测时间。', steps:['60 BPM 拍手。','每 4 拍加重一次。','一拍分成 2 个，再分成 3 个。','关掉 4 小节，再回到节拍检查。']}, en:{title:'Metronome and body time', one:'A metronome is not punishment. It builds predictable time for the body.', steps:['Clap at 60 BPM.','Accent every 4 beats.','Divide one beat into 2, then 3.','Mute 4 bars, then return and check timing.']}},
    {id:'choir', anim:'choir', zh:{title:'合唱、和声与群体共鸣', one:'合唱是音高、呼吸、身体、空间与情绪的同步。', steps:['一个人唱 do。','第二人加入 mi。','第三人加入 sol。','听稳定三和弦如何出现。','一起吸气，一起进入。']}, en:{title:'Choir, harmony and group resonance', one:'Choir synchronizes pitch, breath, body, space and emotion.', steps:['One voice sings do.','A second adds mi.','A third adds sol.','Hear a stable triad appear.','Breathe together and enter together.']}}
  ];

  const lifeCards = [
    {id:'sleep', anim:'lifeSleep', zh:{title:'睡前脑内噪声', one:'用低信息、低动态声音降低环境突发声的存在感。', why:'掩蔽 + 预测负荷降低 + 呼吸降档。', steps:['关掉歌词和随机播放。','选择粉红噪声、雨声或低动态 ambient。','音量调到刚好覆盖环境声。','10 分钟后再降低音量。'], avoid:'不要用高动态、强鼓点、情绪强烈或突然变化大的音乐。'}, en:{title:'Racing mind before sleep', one:'Use low-information, low-dynamic sound to reduce sudden environmental salience.', why:'Masking + lower prediction load + breathing downshift.', steps:['Turn off lyrics and shuffle.','Choose pink noise, rain or low-dynamic ambient.','Set volume only high enough to cover the room.','Lower volume after 10 minutes.'], avoid:'Avoid high dynamics, strong beats, intense emotion and sudden changes.'}},
    {id:'adhd', anim:'metronome', zh:{title:'ADHD 启动困难', one:'用外部节律给大脑一个开始动作的脚手架。', why:'节律夹带 + 奖赏启动 + 时间结构。', steps:['选 90–120 BPM。','低歌词或无歌词。','只承诺做 3 分钟。','开始后换成更低信息量背景。'], avoid:'不要先找完美歌单；不要让歌词抢占阅读写作。'}, en:{title:'ADHD initiation', one:'Use external rhythm as a scaffold for action.', why:'Entrainment + reward start + time structure.', steps:['Choose 90–120 BPM.','Use low-lyric or no-lyric tracks.','Commit to only 3 minutes.','After starting, switch to lower-information background.'], avoid:'Do not hunt for a perfect playlist; lyrics may steal language attention.'}},
    {id:'overload', anim:'soundscape', zh:{title:'感官过载', one:'先减少刺激，再用可预测声音建立安全锚点。', why:'降低突发声、粗糙度和不可控感。', steps:['先暂停所有不必要声音。','用低音量、稳定、可退出的声音。','允许静音，不强迫放松音乐。','设置安静角落。'], avoid:'不要用更大的音乐压过过载。'}, en:{title:'Sensory overload', one:'Reduce stimulation first, then use predictable sound as a safe anchor.', why:'Lower suddenness, roughness and loss of control.', steps:['Pause unnecessary sounds.','Use quiet, stable, optional sound.','Allow silence; do not force calming music.','Create a quiet corner.'], avoid:'Do not cover overload with even louder music.'}},
    {id:'pain', anim:'pain', zh:{title:'疼痛管理辅助', one:'音乐不能替代医疗，但能支持注意、呼吸、情绪和可控感。', why:'注意竞争 + 情绪缓冲 + 呼吸同步。', steps:['选择熟悉、安全的音乐。','跟随音乐慢慢延长呼气。','把注意从疼痛评分转到声音层次。','记录疼痛和情绪变化。'], avoid:'疼痛严重或异常时必须求医。'}, en:{title:'Pain support', one:'Music does not replace care, but can support attention, breath, emotion and control.', why:'Attention competition + emotional buffering + breath synchronization.', steps:['Choose familiar safe music.','Let exhale slowly follow the music.','Shift attention from pain score to sound layers.','Record pain and emotion changes.'], avoid:'Seek medical care for severe or unusual pain.'}},
    {id:'memory', anim:'scale', zh:{title:'记忆学习', one:'旋律和节奏可以成为信息的钩子。', why:'节奏编码 + 情绪标签 + 重复结构。', steps:['把要记的列表分组。','给每组一个短节奏。','用固定旋律重复。','复习时先哼旋律再回忆内容。'], avoid:'阅读理解时减少歌词干扰。'}, en:{title:'Memory learning', one:'Melody and rhythm can become hooks for information.', why:'Rhythmic encoding + emotional tagging + repetition.', steps:['Group what you need to remember.','Give each group a short rhythm.','Repeat with a simple melody.','Hum first, then recall the content.'], avoid:'Reduce lyrics during reading comprehension.'}},
    {id:'mbct', anim:'soundscape', zh:{title:'音乐正念 / MBCT', one:'不评价音乐好坏，只观察声音、身体和注意力。', why:'注意回到当下 + 情绪去融合。', steps:['听 60 秒，不分析。','标记：我听到什么？','标记：身体哪里有反应？','走神后温柔回来。'], avoid:'不要把正念变成考试。'}, en:{title:'Music mindfulness / MBCT', one:'Do not judge the music. Observe sound, body and attention.', why:'Returning attention + decentering from emotion.', steps:['Listen for 60 seconds without analysis.','Label: what do I hear?','Label: where does the body respond?','When mind wanders, return gently.'], avoid:'Do not turn mindfulness into a test.'}},
    {id:'socialVoice', anim:'tone', zh:{title:'社交声音', one:'语气可以被拆成音量、速度、停顿、重音和音高线。', why:'把模糊的“语气问题”变成可观察参数。', steps:['同一句话说成安慰。','再说成疑问。','再说成坚定。','比较音高、速度和停顿。'], avoid:'不要把所有表达都压成一种“正常语气”。'}, en:{title:'Social voice', one:'Tone can be decomposed into volume, speed, pause, stress and pitch line.', why:'It turns vague “tone problems” into observable parameters.', steps:['Say one sentence as comfort.','Say it as a question.','Say it as firmness.','Compare pitch, speed and pauses.'], avoid:'Do not force every expression into one “normal tone”.'}},
    {id:'room', anim:'soundscape', zh:{title:'房间声景设计', one:'让房间有背景层、安全锚点和静音出口。', why:'声音权利 + 可控感 + 环境预测。', steps:['标出最刺耳声源。','加柔和背景声或吸音材料。','保留一个完全安静区域。','给突发声设置替代提示。'], avoid:'不要只看分贝，也要看意义和控制权。'}, en:{title:'Room soundscape design', one:'Give the room background, safe anchors and quiet exits.', why:'Sound rights + control + environmental prediction.', steps:['Mark the harshest sound sources.','Add soft background or absorbing materials.','Keep one truly quiet zone.','Replace sudden alerts when possible.'], avoid:'Do not only measure decibels; consider meaning and control.'}}
  ];

  const instrumentData = [
    {id:'violin', cat:'string', anim:'resonance', zh:{title:'小提琴', one:'弦振动，琴身放大，弓让能量持续进入。'}, en:{title:'Violin', one:'Strings vibrate, the body amplifies, and the bow continuously feeds energy.'}},
    {id:'guqin', cat:'string', anim:'resonance', zh:{title:'古琴', one:'弦、木体、滑音与留白让声音像时间中的水墨。'}, en:{title:'Guqin', one:'String, wood, slides and silence make sound feel like ink in time.'}},
    {id:'kora', cat:'string', anim:'harmonics', zh:{title:'Kora', one:'西非竖琴-琵琶，明亮循环像流动星河。'}, en:{title:'Kora', one:'A West African harp-lute with bright looping constellations.'}},
    {id:'hurdy', cat:'string', anim:'resonance', zh:{title:'Hurdy-gurdy', one:'轮擦弦乐器，机械持续音与旋律共存。'}, en:{title:'Hurdy-gurdy', one:'A wheel-bowed instrument where drone and melody coexist.'}},
    {id:'flute', cat:'air', anim:'resonance', zh:{title:'长笛', one:'空气柱与边缘气流振动，孔位改变有效长度。'}, en:{title:'Flute', one:'An air column and edge tone vibrate; holes change effective length.'}},
    {id:'organ', cat:'air', anim:'resonance', zh:{title:'管风琴', one:'许多空气柱组成一座声音建筑。'}, en:{title:'Pipe organ', one:'Many air columns become an architecture of sound.'}},
    {id:'djembe', cat:'membrane', anim:'talkingDrum', zh:{title:'Djembe', one:'手与膜的对话，低音、边音和脆音组成节奏语言。'}, en:{title:'Djembe', one:'Hands speak with a membrane through bass, tone and slap.'}},
    {id:'talkingDrum', cat:'membrane', anim:'talkingDrum', zh:{title:'Talking drum', one:'通过改变膜张力模仿语言音高。'}, en:{title:'Talking drum', one:'Changing membrane tension imitates speech pitch.'}},
    {id:'tabla', cat:'membrane', anim:'polyrhythm', zh:{title:'Tabla', one:'指法、音节和节奏语汇结合。'}, en:{title:'Tabla', one:'Finger technique, syllables and rhythmic vocabulary combine.'}},
    {id:'mbira', cat:'idiophone', anim:'mbira', zh:{title:'Mbira', one:'金属簧片自鸣，循环与共鸣箱让声音闪烁。'}, en:{title:'Mbira', one:'Metal tines self-vibrate; loops and resonance box shimmer.'}},
    {id:'gamelan', cat:'idiophone', anim:'gamelan', zh:{title:'Gamelan', one:'青铜键与锣组成层叠时间星系。'}, en:{title:'Gamelan', one:'Bronze keys and gongs form layered time galaxies.'}},
    {id:'handpan', cat:'idiophone', anim:'resonance', zh:{title:'Handpan', one:'金属壳体上的音区产生温柔泛音。'}, en:{title:'Handpan', one:'Tone fields on a metal shell create gentle overtones.'}},
    {id:'theremin', cat:'electronic', anim:'theremin', zh:{title:'Theremin', one:'无接触电子乐器，手在场中移动改变声音。'}, en:{title:'Theremin', one:'A no-touch electronic instrument controlled by hand movement in fields.'}},
    {id:'synth', cat:'electronic', anim:'fourier', zh:{title:'模块合成器', one:'振荡器、滤波器、包络和调制搭建声音。'}, en:{title:'Modular synthesizer', one:'Oscillators, filters, envelopes and modulation build sound.'}},
    {id:'sampler', cat:'electronic', anim:'sampling', zh:{title:'采样器', one:'把声音切片、重排、变速、重生。'}, en:{title:'Sampler', one:'Slice, rearrange, stretch and rebirth sound.'}},
    {id:'tactile', cat:'future', anim:'tactile', zh:{title:'触觉乐器', one:'通过皮肤和身体振动演奏音乐。'}, en:{title:'Tactile instrument', one:'Music played through skin and bodily vibration.'}},
    {id:'light', cat:'future', anim:'space', zh:{title:'光控乐器', one:'用光、距离或手势控制声音参数。'}, en:{title:'Light-controlled instrument', one:'Light, distance or gesture controls sound parameters.'}}
  ];

  const timelineData = [
    {zh:'身体与口传',en:'Body and oral transmission'},{zh:'骨笛与古老乐器',en:'Bone flute and ancient instruments'},{zh:'记谱',en:'Notation'},{zh:'宗教空间与回声',en:'Sacred space and echo'},{zh:'剧场与歌剧',en:'Theater and opera'},{zh:'留声机',en:'Phonograph'},{zh:'广播',en:'Radio'},{zh:'黑胶',en:'Vinyl'},{zh:'磁带',en:'Tape'},{zh:'合成器',en:'Synthesizer'},{zh:'MIDI',en:'MIDI'},{zh:'采样器',en:'Sampler'},{zh:'DAW',en:'DAW'},{zh:'流媒体',en:'Streaming'},{zh:'AI 生成音乐',en:'AI music generation'},{zh:'触觉 / 太空音乐',en:'Tactile / space music'}
  ];

  const sourceData = [
    {cat:'psycho', url:'https://link.springer.com/book/10.1007/978-3-540-68888-4', zh:{title:'Fastl & Zwicker', sub:'Psychoacoustics: Facts and Models', one:'心理声学基础：掩蔽、响度、粗糙度、双耳听觉、音乐声学。'}, en:{title:'Fastl & Zwicker', sub:'Psychoacoustics: Facts and Models', one:'Foundational psychoacoustics: masking, loudness, roughness, binaural hearing and musical acoustics.'}},
    {cat:'cog', url:'https://www.penguinrandomhouse.com/books/300081/this-is-your-brain-on-music-by-daniel-j-levitin/', zh:{title:'Daniel Levitin', sub:'This Is Your Brain on Music', one:'音乐、大脑、记忆、奖赏与人类为何迷恋音乐。'}, en:{title:'Daniel Levitin', sub:'This Is Your Brain on Music', one:'Music, brain, memory, reward and why humans are drawn to music.'}},
    {cat:'cog', url:'https://direct.mit.edu/books/monograph/1961/Sweet-AnticipationMusic-and-the-Psychology-of', zh:{title:'David Huron', sub:'Sweet Anticipation', one:'音乐期待心理学：为什么下一步让人着迷。'}, en:{title:'David Huron', sub:'Sweet Anticipation', one:'The psychology of musical expectation: why the next moment is compelling.'}},
    {cat:'voice', url:'https://www.cornellpress.cornell.edu/book/9780875805429/the-science-of-the-singing-voice/', zh:{title:'Johan Sundberg', sub:'The Science of the Singing Voice', one:'声乐科学：声源、声道、共鸣、歌唱声学。'}, en:{title:'Johan Sundberg', sub:'The Science of the Singing Voice', one:'Voice science: source, tract, resonance and singing acoustics.'}},
    {cat:'voice', url:'https://www.nidcd.nih.gov/health/voice-speech-and-language', zh:{title:'NIDCD', sub:'Voice and speech resources', one:'发声、语音、嗓音健康的权威科普。'}, en:{title:'NIDCD', sub:'Voice and speech resources', one:'Authoritative resources on voice, speech and vocal health.'}},
    {cat:'theory', url:'https://viva.pressbooks.pub/openmusictheory/', zh:{title:'Open Music Theory', sub:'Open online textbook', one:'开放乐理教材：音阶、节奏、和声、曲式、流行与爵士。'}, en:{title:'Open Music Theory', sub:'Open online textbook', one:'Open music theory textbook: scales, rhythm, harmony, form, popular and jazz.'}},
    {cat:'theory', url:'https://www.musictheory.net/lessons', zh:{title:'musictheory.net', sub:'Lessons and exercises', one:'乐理和练耳互动练习。'}, en:{title:'musictheory.net', sub:'Lessons and exercises', one:'Interactive theory and ear-training exercises.'}},
    {cat:'therapy', url:'https://www.musictherapy.org/about/musictherapy/', zh:{title:'AMTA', sub:'Music therapy definition', one:'严格音乐治疗定义和职业边界。'}, en:{title:'AMTA', sub:'Music therapy definition', one:'Clinical definition and professional boundaries of music therapy.'}},
    {cat:'soundscape', url:'https://www.wfae.net/', zh:{title:'R. Murray Schafer / WFAE', sub:'Soundscape and acoustic ecology', one:'声景、声音生态和世界如何被听见。'}, en:{title:'R. Murray Schafer / WFAE', sub:'Soundscape and acoustic ecology', one:'Soundscape, acoustic ecology and how the world is heard.'}},
    {cat:'world', url:'https://folkways.si.edu/', zh:{title:'Smithsonian Folkways', sub:'World music archive', one:'世界音乐、民俗音乐与声音文化。'}, en:{title:'Smithsonian Folkways', sub:'World music archive', one:'World, folk and sound culture resources.'}},
    {cat:'tech', url:'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API', zh:{title:'Web Audio API', sub:'Browser sound synthesis', one:'网页声音合成、滤波、采样与互动音乐。'}, en:{title:'Web Audio API', sub:'Browser sound synthesis', one:'Browser sound synthesis, filtering, sampling and interactive music.'}}
  ];

  function persist() {
    localStorage.setItem('ml_lang', state.lang);
    localStorage.setItem('ml_simple', state.simple ? '1' : '0');
    localStorage.setItem('ml_reduced', state.reduced ? '1' : '0');
    localStorage.setItem('ml_learned', JSON.stringify([...state.learned]));
  }

  function init() {
    document.body.classList.toggle('simple', state.simple);
    document.body.classList.toggle('reduce-motion', state.reduced);
    startCosmos();
    startGateWave();
    bindShell();
    if (localStorage.getItem('ml_seenGate') === '1') enterApp(state.lang);
  }

  function bindShell() {
    $$('[data-enter]').forEach(b => b.addEventListener('click', () => enterApp(b.dataset.enter)));
    $('#skipGate').addEventListener('click', () => enterApp(state.lang));
    $('#reducedAtGate').addEventListener('click', () => { state.reduced = !state.reduced; persist(); document.body.classList.toggle('reduce-motion', state.reduced); });
    $('#homeBtn').addEventListener('click', () => go('home'));
    $('#backBtn').addEventListener('click', () => history.length > 1 ? history.back() : go('home'));
    $('#langBtn').addEventListener('click', () => { state.lang = state.lang === 'zh' ? 'en' : 'zh'; persist(); applyLang(); render(); });
    $('#simpleBtn').addEventListener('click', () => { state.simple = !state.simple; persist(); document.body.classList.toggle('simple', state.simple); $('#simpleBtn').textContent = state.simple ? t('deep') : t('simple'); });
    $$('.bottomnav button').forEach(b => b.addEventListener('click', () => go(b.dataset.nav)));
    $('#closeDrawer').addEventListener('click', closeDrawer);
    $('#searchBtn').addEventListener('click', openSearch);
    $('#closeSearch').addEventListener('click', closeSearch);
    $('#searchInput').addEventListener('input', doSearch);
    window.addEventListener('hashchange', () => {
      const r = location.hash.replace('#','') || 'home';
      state.route = r;
      render();
    });
  }

  function enterApp(lang) {
    state.lang = lang || state.lang;
    localStorage.setItem('ml_seenGate', '1');
    persist();
    $('#gate').classList.remove('active');
    $('#app').hidden = false;
    applyLang();
    if (!location.hash) location.hash = 'home';
    state.route = location.hash.replace('#','') || 'home';
    render();
  }

  function applyLang() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    $$('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
    $('#searchInput').placeholder = t('searchPlaceholder');
    $('#simpleBtn').textContent = state.simple ? t('deep') : t('simple');
  }

  function go(route) { location.hash = route; }

  function render() {
    applyLang();
    $$('.bottomnav button').forEach(b => b.classList.toggle('active', b.dataset.nav === state.route));
    closeDrawer(false);
    const view = $('#view');
    const route = state.route;
    const renderers = { home: renderHome, voyage: renderVoyage, map: renderMap, voice: renderVoice, life: renderLife, explore: renderExplore, library: renderLibrary, anim: renderAnimLab };
    view.innerHTML = (renderers[route] || renderHome)();
    bindRendered(route);
    view.focus({preventScroll:true});
  }

  function renderHome() {
    return `
      <section class="page home">
        <div class="hero">
          <div class="hero-card">
            <p class="kicker">Musicalife</p>
            <h1 class="gradient-text">${t('homeTitle')}</h1>
            <p class="lead">${t('homeLead')}</p>
            <div class="hero-actions">
              <button class="primary big" data-go="voyage">${t('startVoyage')}</button>
              <button class="ghost big" data-go="map">${t('viewMap')}</button>
              <button class="ghost big" data-go="voice">${t('voiceLab')}</button>
            </div>
            <p class="tiny longtext" style="margin-top:18px">Sound is vibration. Music is relation. Every star is a concept; every line is a way to connect sound with life.</p>
          </div>
          <div class="mini-map panel">
            <div class="kicker">Cosmos preview</div>
            <canvas id="homeOrbit" class="anim-canvas" style="min-height:300px"></canvas>
            <div class="grid two">
              <button class="pill" data-go="life">${t('lifeTools')}</button>
              <button class="pill" data-go="explore">${t('exploreWorld')}</button>
              <button class="pill" data-go="anim">${t('animTitle')}</button>
              <button class="pill" data-go="library">${t('library')}</button>
            </div>
          </div>
        </div>
        <section class="section grid four">
          ${galaxies.slice(0,8).map(g => `<article class="card" style="--accent:${g.color}"><span class="tag">${state.lang==='zh'?g.zh:g.en}</span><h3>${state.lang==='zh'?starTitleZh(g.id):starTitleEn(g.id)}</h3><p>${state.lang==='zh'?starDescZh(g.id):starDescEn(g.id)}</p><div class="card-actions"><button class="pill" data-mapg="${g.id}">${t('open')}</button></div></article>`).join('')}
        </section>
      </section>`;
  }
  function starTitleZh(id){return ({physics:'声音如何存在',hearing:'耳朵如何重建世界',theory:'比例如何成为美',voice:'人如何成为乐器',brain:'音乐如何进入身体',life:'知识如何回到生活',culture:'语言如何歌唱',instruments:'世界如何制造声音'})[id]||'未来音乐';}
  function starTitleEn(id){return ({physics:'How sound exists',hearing:'How ears rebuild the world',theory:'How ratio becomes beauty',voice:'How humans become instruments',brain:'How music enters the body',life:'How knowledge returns to life',culture:'How language sings',instruments:'How worlds make sound'})[id]||'Future music';}
  function starDescZh(id){return ({physics:'波、频率、谐波、共振、傅里叶。',hearing:'掩蔽、双耳、响度、声景。',theory:'音阶、和弦、节奏、调性。',voice:'呼吸、声带、共鸣、吐字、合唱。',brain:'预测、奖赏、HRV、记忆。',life:'睡眠、注意、疼痛、过载与房间声景。',culture:'声调语言、会说话的鼓、合唱与社会。',instruments:'弦、管、膜、自鸣体、电子与未来乐器。'})[id]||'数据、光、触觉、AI 与太空音乐。';}
  function starDescEn(id){return ({physics:'Waves, frequency, harmonics, resonance, Fourier.',hearing:'Masking, binaural hearing, loudness, soundscape.',theory:'Scales, chords, rhythm, tonality.',voice:'Breath, folds, resonance, articulation, choir.',brain:'Prediction, reward, HRV, memory.',life:'Sleep, attention, pain, overload and room soundscape.',culture:'Tone languages, talking drums, choir and society.',instruments:'Strings, air columns, membranes, idiophones, electronics and future instruments.'})[id]||'Data, light, touch, AI and space music.';}

  function renderVoyage() {
    return `<section class="page">
      ${pageTitle(t('voyageTitle'), t('voyageLead'))}
      <div class="grid two">${levels.map((lv,i) => {
        const done = state.learned.has(lv.term);
        return `<article class="card" style="--accent:${gById[term(lv.term).g].color}"><span class="tag">${done?'✦':'○'} ${i+1}/10</span><h3>${L(lv).title}</h3><p>${L(lv).one}</p><div class="card-actions"><button class="pill" data-openanim="${lv.anim}">${t('animation')}</button><button class="pill" data-learn="${lv.term}">${done?'✓':'✦'} ${t('learn')}</button></div></article>`;
      }).join('')}</div>
    </section>`;
  }

  function renderMap() {
    const buttons = [`<button class="pill ${state.currentGalaxy==='all'?'active-tab':''}" data-galaxy="all">${t('all')}</button>`].concat(galaxies.map(g => `<button class="pill ${state.currentGalaxy===g.id?'active-tab':''}" data-galaxy="${g.id}">${state.lang==='zh'?g.zh:g.en}</button>`)).join('');
    return `<section class="page">
      ${pageTitle(t('mapTitle'), t('mapLead'))}
      <div class="galaxy-wrap">
        <div class="galaxy-toolbar"><input id="galaxySearch" placeholder="${t('searchPlaceholder')}">${buttons}<button class="pill" id="resetGalaxy">${t('reset')}</button></div>
        <svg class="galaxy-svg" id="galaxySvg" viewBox="0 0 1460 1120" role="img" aria-label="Knowledge galaxy"></svg>
      </div>
    </section>`;
  }

  function renderVoice() {
    const current = voiceChapters.find(v => v.id === state.activeVoice) || voiceChapters[0];
    return `<section class="page">
      ${pageTitle(t('voiceTitle'), t('voiceLead'))}
      <div class="lesson">
        <div class="lesson-list">${voiceChapters.map(v => `<button class="${v.id===current.id?'active':''}" data-voice="${v.id}">${L(v).title}</button>`).join('')}</div>
        <article class="panel lesson-body">
          <span class="tag">Voice Cosmos</span>
          <h2>${L(current).title}</h2>
          <p class="lead">${L(current).one}</p>
          <div class="anim-stage" style="margin:16px 0">${animStageHTML(current.anim)}</div>
          <h3>${state.lang==='zh'?'30 秒练习':'30-second practice'}</h3>
          <div class="steps">${L(current).steps.map(s => `<div class="step">${s}</div>`).join('')}</div>
          <div class="card-actions"><button class="pill" data-openanim="${current.anim}">${t('animation')}</button><button class="pill" data-go="map">${t('viewMap')}</button></div>
        </article>
      </div>
    </section>`;
  }

  function renderLife() {
    return `<section class="page">
      ${pageTitle(t('lifeTitle'), t('lifeLead'))}
      <div class="grid two">${lifeCards.map(c => `<article class="card" style="--accent:${gById.life.color}"><span class="tag">Life tool</span><h3>${L(c).title}</h3><p>${L(c).one}</p><details class="deep"><summary>${state.lang==='zh'?'展开机制与步骤':'Open mechanism and steps'}</summary><p><b>${state.lang==='zh'?'机制':'Mechanism'}:</b> ${L(c).why}</p><div class="steps">${L(c).steps.map(s=>`<div class="step">${s}</div>`).join('')}</div><p><b>${state.lang==='zh'?'避免':'Avoid'}:</b> ${L(c).avoid}</p></details><div class="card-actions"><button class="pill" data-openanim="${c.anim}">${t('animation')}</button></div></article>`).join('')}</div>
    </section>`;
  }

  function renderExplore() {
    const cats = [
      ['string', state.lang==='zh'?'弦振动星区':'String vibration'],['air',state.lang==='zh'?'空气柱星区':'Air column'],['membrane',state.lang==='zh'?'膜振动星区':'Membrane'],['idiophone',state.lang==='zh'?'自鸣体星区':'Idiophone'],['electronic',state.lang==='zh'?'电子星区':'Electronic'],['future',state.lang==='zh'?'未来星区':'Future']
    ];
    return `<section class="page">
      ${pageTitle(t('exploreTitle'), t('exploreLead'))}
      <section class="section"><h2>${state.lang==='zh'?'乐器宇宙博物馆':'Instrument cosmos museum'}</h2>
      ${cats.map(([cat,label]) => `<div class="section"><h3 class="gradient-text">${label}</h3><div class="grid three">${instrumentData.filter(x=>x.cat===cat).map(ins => `<article class="card"><span class="tag">${label}</span><h3>${L(ins).title}</h3><p>${L(ins).one}</p><div class="card-actions"><button class="pill" data-openanim="${ins.anim}">${t('animation')}</button></div></article>`).join('')}</div></div>`).join('')}</section>
      <section class="section"><h2>${state.lang==='zh'?'音乐媒介发展史星轨':'Media history orbit'}</h2><div class="timeline">${timelineData.map((x,i)=>`<article class="card timecard" style="--accent:${i%2? 'var(--cyan)':'var(--gold)'}"><span class="tag">${String(i+1).padStart(2,'0')}</span><h3>${x[state.lang]}</h3><p>${state.lang==='zh'?'音乐的媒介改变了人类捕捉、保存、传播和想象声音的方式。':'Media changes how humans capture, store, transmit and imagine sound.'}</p></article>`).join('')}</div></section>
    </section>`;
  }

  function renderLibrary() {
    return `<section class="page">
      ${pageTitle(t('libraryTitle'), t('libraryLead'))}
      <div class="source-list">${sourceData.map(s => `<article class="card source-card"><span class="tag">${s.cat}</span><h3>${L(s).title}</h3><p><b>${L(s).sub}</b></p><p>${L(s).one}</p><a class="pill" href="${s.url}" target="_blank" rel="noopener noreferrer">${t('sources')}</a></article>`).join('')}</div>
    </section>`;
  }

  function renderAnimLab() {
    return `<section class="page">
      ${pageTitle(t('animTitle'), t('animLead'))}
      <div class="anim-stage">${animStageHTML(state.activeAnim)}</div>
      <p class="tiny">${t('noAuto')}</p>
      <div class="animation-list">${animationCards.map(a => `<article class="card anim-mini" style="--accent:${gById[a.g]?.color || 'var(--violet)'}"><span class="tag">${state.lang==='zh'?gById[a.g]?.zh:gById[a.g]?.en}</span><h3>${L(a).title}</h3><p>${L(a).one}</p><div class="card-actions"><button class="pill" data-openanim="${a.id}">${t('open')}</button></div></article>`).join('')}</div>
    </section>`;
  }

  function pageTitle(title, lead) { return `<div class="page-title"><div><p class="kicker">Musicalife</p><h2 class="gradient-text">${title}</h2><p>${lead}</p></div><button class="pill" data-go="home">${t('home')}</button></div>`; }

  function animStageHTML(animId) {
    return `<canvas class="anim-canvas" data-animcanvas="${animId}"></canvas><div class="anim-controls" data-animcontrols="${animId}"></div>`;
  }

  function bindRendered(route) {
    $$('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
    $$('[data-mapg]').forEach(b => b.addEventListener('click', () => { state.currentGalaxy = b.dataset.mapg; go('map'); }));
    $$('[data-openanim]').forEach(b => b.addEventListener('click', () => { state.activeAnim = b.dataset.openanim; go('anim'); }));
    $$('[data-learn]').forEach(b => b.addEventListener('click', () => { state.learned.add(b.dataset.learn); persist(); render(); }));
    $$('[data-voice]').forEach(b => b.addEventListener('click', () => { state.activeVoice = b.dataset.voice; render(); }));
    if (route === 'home') drawHomeOrbit();
    if (route === 'map') bindGalaxy();
    $$('.anim-canvas').forEach(c => mountAnimation(c.dataset.animcanvas, c, c.parentElement.querySelector('.anim-controls')));
  }

  function term(id) { return termData.find(x => x.id === id) || termData[0]; }

  function bindGalaxy() {
    const input = $('#galaxySearch');
    const reset = $('#resetGalaxy');
    const svg = $('#galaxySvg');
    let query = '';
    const draw = () => drawGalaxy(svg, query);
    draw();
    input.addEventListener('input', e => { query = e.target.value.toLowerCase().trim(); draw(); });
    reset.addEventListener('click', () => { state.currentGalaxy = 'all'; render(); });
    $$('[data-galaxy]').forEach(b => b.addEventListener('click', () => { state.currentGalaxy = b.dataset.galaxy; render(); }));
  }

  function drawGalaxy(svg, query='') {
    const show = n => (state.currentGalaxy === 'all' || n.g === state.currentGalaxy) && (!query || L(n).title.toLowerCase().includes(query) || L(n).one.toLowerCase().includes(query) || n.id.toLowerCase().includes(query));
    const nodes = termData.filter(show);
    const nodeIds = new Set(nodes.map(n=>n.id));
    const edgeEls = edges.filter(([a,b]) => nodeIds.has(a) && nodeIds.has(b)).map(([a,b]) => {
      const A=term(a), B=term(b); const lit=state.learned.has(a)&&state.learned.has(b);
      return `<line class="edge ${lit?'lit':''}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>`;
    }).join('');
    const clusterLabels = state.currentGalaxy === 'all' ? galaxies.map(g => {
      const pts = termData.filter(n=>n.g===g.id); if(!pts.length) return '';
      const cx = pts.reduce((s,n)=>s+n.x,0)/pts.length, cy=pts.reduce((s,n)=>s+n.y,0)/pts.length;
      return `<text class="constellation-label" x="${cx-40}" y="${cy-58}" fill="${g.color}">${state.lang==='zh'?g.zh:g.en}</text>`;
    }).join('') : '';
    const nodeEls = nodes.map(n => {
      const g = gById[n.g]; const learned=state.learned.has(n.id); const r=learned?8:6;
      return `<g class="node ${learned?'focus':''}" data-node="${n.id}"><circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${g.color}" opacity="${learned?1:.82}"></circle><circle cx="${n.x}" cy="${n.y}" r="${r+8}" fill="${g.color}" opacity=".08"></circle><text x="${n.x+12}" y="${n.y+4}">${L(n).title}</text></g>`;
    }).join('');
    svg.innerHTML = `<defs><filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${edgeEls}${clusterLabels}${nodeEls}`;
    $$('.node', svg).forEach(g => g.addEventListener('click', () => openTerm(g.dataset.node)));
  }

  function openTerm(id) {
    const n = term(id); state.learned.add(id); persist();
    const relatedIds = edges.flatMap(([a,b]) => a===id?[b]:b===id?[a]:[]);
    const related = [...new Set(relatedIds)].map(r => `<button data-related="${r}">${L(term(r)).title}</button>`).join('');
    const g = gById[n.g];
    openDrawer(`<span class="tag" style="color:${g.color};border-color:${g.color}55">${state.lang==='zh'?g.zh:g.en}</span><h2>${L(n).title}</h2><p class="lead">${L(n).one}</p><p class="deep">${L(n).detail}</p><div class="card-actions"><button class="pill" data-openanim="${n.anim}">${t('animation')}</button><button class="pill" data-learn="${n.id}">✓ ${t('learn')}</button></div><h3>${t('related')}</h3><div class="related">${related}</div>`);
    $$('[data-related]', $('#drawer')).forEach(b => b.addEventListener('click', () => openTerm(b.dataset.related)));
    $$('[data-openanim]', $('#drawer')).forEach(b => b.addEventListener('click', () => { closeDrawer(); state.activeAnim=b.dataset.openanim; go('anim'); }));
    $$('[data-learn]', $('#drawer')).forEach(b => b.addEventListener('click', () => { state.learned.add(b.dataset.learn); persist(); }));
  }

  function openDrawer(html) { $('#drawerContent').innerHTML = html; $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden','false'); }
  function closeDrawer(animated=true) { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden','true'); if(!animated) $('#drawerContent').innerHTML=''; }

  function openSearch(){ $('#searchPanel').hidden=false; $('#searchInput').value=''; $('#searchInput').focus(); doSearch(); }
  function closeSearch(){ $('#searchPanel').hidden=true; }
  function doSearch(){
    const q = $('#searchInput').value.toLowerCase().trim();
    const pool = [...termData.map(x=>({type:'term', id:x.id, title:L(x).title, one:L(x).one})), ...lifeCards.map(x=>({type:'life', id:x.id, title:L(x).title, one:L(x).one})), ...voiceChapters.map(x=>({type:'voice', id:x.id, title:L(x).title, one:L(x).one}))];
    const res = pool.filter(x => !q || x.title.toLowerCase().includes(q) || x.one.toLowerCase().includes(q) || x.id.toLowerCase().includes(q)).slice(0,16);
    $('#searchResults').innerHTML = res.map(r=>`<div class="result"><b>${r.title}</b><p>${r.one}</p><button class="pill" data-searchhit="${r.type}:${r.id}">${t('open')}</button></div>`).join('');
    $$('[data-searchhit]').forEach(b => b.addEventListener('click', () => {
      const [type,id] = b.dataset.searchhit.split(':'); closeSearch();
      if(type==='term') { state.currentGalaxy = term(id).g; go('map'); setTimeout(()=>openTerm(id),100); }
      if(type==='voice') { state.activeVoice=id; go('voice'); }
      if(type==='life') go('life');
    }));
  }

  // ---------- Canvas background and animations ----------
  function startCosmos() {
    const c = $('#cosmos'), ctx = c.getContext('2d');
    let stars = [];
    function resize(){ c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); stars = Array.from({length: Math.min(180, Math.floor(innerWidth*innerHeight/6000))}, () => ({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.8+.25,a:Math.random(),v:Math.random()*0.18+.02})); }
    resize(); addEventListener('resize', resize);
    function frame(t){
      ctx.clearRect(0,0,innerWidth,innerHeight); ctx.fillStyle='rgba(8,7,25,.25)'; ctx.fillRect(0,0,innerWidth,innerHeight);
      for(const s of stars){ s.a += s.v*.02; const alpha=.25+.55*Math.abs(Math.sin(s.a+t*.0004)); ctx.fillStyle=`rgba(245,240,255,${alpha})`; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); }
      if(!state.reduced){ requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }
  function startGateWave(){
    const c = $('#gateWave'); if(!c) return; const ctx = c.getContext('2d');
    function resize(){ c.width=c.clientWidth*devicePixelRatio; c.height=c.clientHeight*devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
    setTimeout(resize,20); addEventListener('resize', resize);
    function frame(t){ drawCosmicWave(ctx,c.clientWidth,c.clientHeight,t*.001); if($('#gate').classList.contains('active') && !state.reduced) requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  }
  function drawCosmicWave(ctx,w,h,time){
    ctx.clearRect(0,0,w,h); const grad=ctx.createLinearGradient(0,0,w,h); grad.addColorStop(0,'rgba(181,146,255,.22)'); grad.addColorStop(.55,'rgba(120,231,255,.16)'); grad.addColorStop(1,'rgba(255,224,141,.13)'); ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
    for(let j=0;j<5;j++){ ctx.beginPath(); for(let x=0;x<w;x++){ const y=h*.55 + Math.sin(x*.012 + time*1.4 + j*.8)*40/(j+1)+Math.sin(x*.027+time*2.1)*12; x?ctx.lineTo(x,y-j*18):ctx.moveTo(x,y-j*18); } ctx.strokeStyle=`rgba(${j%2?120:255},${j%2?231:224},${j%2?255:141},${.35-j*.045})`; ctx.lineWidth=2.2; ctx.stroke(); }
    for(let i=0;i<50;i++){ const x=(Math.sin(i*12.989+time*.2)*43758.5453%1+1)%1*w; const y=(Math.sin(i*78.2+time*.13)*23454.2%1+1)%1*h; ctx.fillStyle='rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(x,y,1.2,0,6.28); ctx.fill(); }
    ctx.fillStyle='rgba(255,255,255,.8)'; ctx.font='900 18px ui-rounded, sans-serif'; ctx.fillText('f(t) = Σ Aₙ sin(nωt + φₙ)', 24, 38);
  }
  function drawHomeOrbit(){ const c=$('#homeOrbit'); if(!c) return; const ctx=c.getContext('2d'); fitCanvas(c); drawOrbit(ctx,c.clientWidth,c.clientHeight,0); let t=0; function loop(){ if(state.route!=='home'||state.reduced) return; t+=.015; drawOrbit(ctx,c.clientWidth,c.clientHeight,t); requestAnimationFrame(loop); } loop(); }
  function drawOrbit(ctx,w,h,t){ ctx.clearRect(0,0,w,h); ctx.fillStyle='rgba(9,10,38,.4)'; ctx.fillRect(0,0,w,h); const cx=w/2, cy=h/2; for(let k=0;k<7;k++){ ctx.beginPath(); for(let a=0;a<Math.PI*2;a+=.02){ const r=30+k*21 + Math.sin(a*3+t+k)*8; const x=cx+Math.cos(a+t*.15*k)*r*1.55; const y=cy+Math.sin(a-t*.1*k)*r*.75; a?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.strokeStyle=k%2?'rgba(120,231,255,.45)':'rgba(181,146,255,.45)'; ctx.lineWidth=1.5; ctx.stroke(); } ctx.fillStyle='rgba(255,224,141,.9)'; ctx.beginPath(); ctx.arc(cx,cy,7+Math.sin(t*2)*2,0,6.28); ctx.fill(); }
  function fitCanvas(c){ c.width=c.clientWidth*devicePixelRatio; c.height=c.clientHeight*devicePixelRatio; const ctx=c.getContext('2d'); ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); return ctx; }

  function mountAnimation(id, canvas, controls){
    if(!canvas || !controls) return; const ctx=fitCanvas(canvas); controls.innerHTML='';
    const model = {a:1, b:1, c:0, d:0.5, bpm:80, vowel:'a', voices:{C:true,E:true,G:true,B:false}};
    const addSlider=(key,label,min,max,step,val)=>{ model[key]=val; const wrap=document.createElement('div'); wrap.className='control'; wrap.innerHTML=`<label><span>${label}</span><span data-val="${key}">${val}</span></label><input type="range" min="${min}" max="${max}" step="${step}" value="${val}">`; controls.appendChild(wrap); wrap.querySelector('input').addEventListener('input',e=>{ model[key]=parseFloat(e.target.value); wrap.querySelector('[data-val]').textContent=e.target.value; draw(); }); };
    const addButton=(label,fn)=>{ const b=document.createElement('button'); b.className='pill'; b.textContent=label; b.addEventListener('click',fn); controls.appendChild(b); };
    const addSelect=(key,label,opts,val)=>{ model[key]=val; const wrap=document.createElement('div'); wrap.className='control'; wrap.innerHTML=`<label>${label}</label><select>${opts.map(o=>`<option value="${o[0]}" ${o[0]===val?'selected':''}>${o[1]}</option>`).join('')}</select>`; controls.appendChild(wrap); wrap.querySelector('select').addEventListener('change',e=>{ model[key]=e.target.value; draw(); }); };
    function base(){ ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight); ctx.fillStyle='rgba(7,8,30,.35)'; ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight); }
    function draw(){
      const w=canvas.clientWidth,h=canvas.clientHeight; base(); ctx.lineCap='round'; ctx.lineJoin='round';
      const type=id;
      if(type==='wave'){ drawWave(ctx,w,h,model); }
      else if(type==='harmonics'||type==='fourier'||type==='mbira'){ drawHarmonics(ctx,w,h,model,type); }
      else if(type==='resonance'){ drawResonance(ctx,w,h,model); }
      else if(type==='interference'||type==='anc'){ drawInterference(ctx,w,h,model); }
      else if(type==='masking'||type==='loudness'||type==='roughness'){ drawMasking(ctx,w,h,model,type); }
      else if(type==='binaural'){ drawBinaural(ctx,w,h,model); }
      else if(type==='scale'||type==='fifths'||type==='chord'){ drawScale(ctx,w,h,model,type); }
      else if(type==='metronome'||type==='polyrhythm'||type==='gamelan'){ drawRhythm(ctx,w,h,model,type); }
      else if(type==='voiceSystem'){ drawVoiceSystem(ctx,w,h,model); }
      else if(type==='vocalfold'){ drawVocalFold(ctx,w,h,model); }
      else if(type==='sovt'){ drawSOVT(ctx,w,h,model); }
      else if(type==='formant'){ drawFormant(ctx,w,h,model); }
      else if(type==='tone'||type==='talkingDrum'){ drawTone(ctx,w,h,model,type); }
      else if(type==='choir'){ drawChoir(ctx,w,h,model); }
      else if(type==='prediction'){ drawPrediction(ctx,w,h,model); }
      else if(type==='breathSync'){ drawBreathSync(ctx,w,h,model); }
      else if(type==='lifeSleep'||type==='soundscape'||type==='pain'){ drawLife(ctx,w,h,model,type); }
      else if(type==='theremin'){ drawTheremin(ctx,w,h,model); }
      else if(type==='sampling'){ drawSampling(ctx,w,h,model); }
      else if(type==='tactile'||type==='space'){ drawFuture(ctx,w,h,model,type); }
      else drawWave(ctx,w,h,model);
    }
    if(['wave'].includes(id)){ addSlider('a', state.lang==='zh'?'频率':'Frequency',.5,6,.1,2.2); addSlider('b', state.lang==='zh'?'振幅':'Amplitude',.2,2,.1,1); addSlider('c', state.lang==='zh'?'相位':'Phase',0,6.28,.01,0); }
    else if(['harmonics','fourier','mbira'].includes(id)){ addSlider('a','2f',0,1,.05,.55); addSlider('b','3f',0,1,.05,.32); addSlider('c','4f',0,1,.05,.16); }
    else if(['resonance'].includes(id)){ addSlider('a', state.lang==='zh'?'输入频率':'Input frequency',.2,1,.01,.48); addSlider('b', state.lang==='zh'?'空间长度':'Space length',.2,1,.01,.55); }
    else if(['interference','anc'].includes(id)){ addSlider('a', state.lang==='zh'?'相位差':'Phase difference',0,6.28,.01,3.14); addSlider('b', state.lang==='zh'?'噪声强度':'Noise level',.2,1.2,.05,.8); }
    else if(['masking','loudness','roughness'].includes(id)){ addSlider('a', state.lang==='zh'?'噪声强度':'Noise level',0,1,.01,.55); addSlider('b', state.lang==='zh'?'目标距离':'Target distance',0,1,.01,.3); }
    else if(['binaural','theremin'].includes(id)){ addSlider('a', state.lang==='zh'?'左/右位置':'Left/right position',0,1,.01,.7); addSlider('b', state.lang==='zh'?'距离':'Distance',0,1,.01,.45); }
    else if(['scale','fifths','chord'].includes(id)){ addSlider('a', state.lang==='zh'?'中心音':'Tonic',0,11,1,0); addButton(t('playSound'),()=>playScale(model.a)); }
    else if(['metronome','polyrhythm','gamelan'].includes(id)){ addSlider('bpm','BPM',40,180,1,86); addSlider('a', state.lang==='zh'?'细分':'Subdivision',1,4,1,2); }
    else if(['voiceSystem','vocalfold'].includes(id)){ addSlider('a', state.lang==='zh'?'气流':'Airflow',0,1,.01,.55); addSlider('b', state.lang==='zh'?'闭合':'Closure',0,1,.01,.55); addSlider('c', state.lang==='zh'?'声道空间':'Tract space',0,1,.01,.55); }
    else if(['sovt'].includes(id)){ addSlider('a', state.lang==='zh'?'出口开合':'Exit opening',0,1,.01,.35); addSlider('b', state.lang==='zh'?'气流':'Airflow',0,1,.01,.5); }
    else if(['formant'].includes(id)){ addSlider('a', state.lang==='zh'?'舌位前后':'Tongue front-back',0,1,.01,.45); addSlider('b', state.lang==='zh'?'嘴唇圆度':'Lip rounding',0,1,.01,.3); addSelect('vowel', state.lang==='zh'?'元音':'Vowel', [['a','a'],['e','e'],['i','i'],['o','o'],['u','u']], 'a'); }
    else if(['tone','talkingDrum'].includes(id)){ addSlider('a', state.lang==='zh'?'声调/语调':'Tone contour',1,4,1,1); addButton(t('playSound'),()=>playTone(model.a)); }
    else if(['choir'].includes(id)){ ['C','E','G','B'].forEach(v=>addButton(v,()=>{model.voices[v]=!model.voices[v];draw();playChord(model.voices);})); }
    else { addSlider('a', state.lang==='zh'?'变化':'Change',0,1,.01,.5); addSlider('b', state.lang==='zh'?'强度':'Strength',0,1,.01,.5); }
    addButton(t('stopSound'), stopSound);
    draw();
  }

  function lineWave(ctx,w,h,fn,color,width=3){ ctx.beginPath(); for(let x=0;x<w;x++){ const y=fn(x); x?ctx.lineTo(x,y):ctx.moveTo(x,y); } ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke(); }
  function label(ctx,text,x,y,color='rgba(255,255,255,.82)'){ ctx.fillStyle=color; ctx.font='900 15px ui-rounded, sans-serif'; ctx.fillText(text,x,y); }
  function drawWave(ctx,w,h,m){ label(ctx,'y = A sin(2πft + φ)',18,28,'#ffe08d'); lineWave(ctx,w,h,x=>h/2+Math.sin(x/w*Math.PI*2*m.a*2 + m.c)*55*m.b,'#78e7ff',4); lineWave(ctx,w,h,x=>h/2+Math.cos(x/w*Math.PI*2*m.a + m.c)*22*m.b,'rgba(181,146,255,.75)',2); }
  function drawHarmonics(ctx,w,h,m,type){ label(ctx,type==='fourier'?'complex sound → simple waves':'f + 2f + 3f … → timbre',18,28,'#ffe08d'); lineWave(ctx,w,h,x=>h*.44+(Math.sin(x*.035)+m.a*Math.sin(x*.07)+m.b*Math.sin(x*.105)+m.c*Math.sin(x*.14))*30,'#ff9bd2',3); const base=h*.82; for(let i=1;i<=8;i++){ const val=[1,m.a,m.b,m.c,.12,.08,.06,.05][i-1]; ctx.fillStyle=i===1?'#ffe08d':'#78e7ff'; ctx.fillRect(35+i*42,base-val*110,18,val*110); } }
  function drawResonance(ctx,w,h,m){ const freq=m.a, len=m.b; const match=Math.max(0,1-Math.abs(freq-len)*3.2); label(ctx,'resonance = selected frequency grows',18,28,'#ffe08d'); ctx.fillStyle=`rgba(255,224,141,${.12+.4*match})`; ctx.beginPath(); ctx.roundRect(w*.2,h*.38,w*.6,h*.25,40); ctx.fill(); ctx.strokeStyle='#ffe08d'; ctx.lineWidth=3; ctx.stroke(); for(let i=0;i<5;i++) lineWave(ctx,w,h,x=>h*.5+Math.sin((x/w*6.28*(1+i*.2))+i)*match*42*Math.sin((x-w*.2)/(w*.6)*Math.PI),'rgba(255,224,141,.9)',2); ctx.fillStyle='#78e7ff'; ctx.fillRect(w*.15+freq*w*.7,h*.75,8,40); ctx.fillStyle='#ff9bd2'; ctx.fillRect(w*.15+len*w*.7,h*.72,8,58); label(ctx, state.lang==='zh'?'蓝=输入频率，粉=空间偏好':'cyan=input, pink=space preference',18,h-20,'rgba(255,255,255,.72)'); }
  function drawInterference(ctx,w,h,m){ label(ctx,'opposite phase → cancellation',18,28,'#ffe08d'); const p=m.a; lineWave(ctx,w,h,x=>h*.38+Math.sin(x*.04)*42*m.b,'rgba(255,155,210,.8)',2); lineWave(ctx,w,h,x=>h*.38+Math.sin(x*.04+p)*42*m.b,'rgba(120,231,255,.8)',2); lineWave(ctx,w,h,x=>h*.68+(Math.sin(x*.04)+Math.sin(x*.04+p))*28*m.b,'#ffe08d',4); }
  function drawMasking(ctx,w,h,m,type){ label(ctx,type==='roughness'?'crowded frequencies → roughness':'noise cloud hides target',18,28,'#ffe08d'); for(let i=0;i<150;i++){ const x=Math.random()*w,y=h*.25+Math.random()*h*.55; ctx.fillStyle=`rgba(120,231,255,${.02+m.a*.07})`; ctx.fillRect(x,y,2+Math.random()*8,2+Math.random()*8); } const tx=w*(.35+m.b*.45), ty=h*.5; ctx.fillStyle='#ffe08d'; ctx.beginPath(); ctx.arc(tx,ty,18,0,6.28); ctx.fill(); ctx.strokeStyle='rgba(255,224,141,.7)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(tx,ty,40+60*m.b,0,6.28); ctx.stroke(); }
  function drawBinaural(ctx,w,h,m){ label(ctx,'two ears compare time and level',18,28,'#ffe08d'); const headX=w/2, headY=h*.55; ctx.fillStyle='rgba(255,255,255,.1)'; ctx.beginPath(); ctx.arc(headX,headY,70,0,6.28); ctx.fill(); ctx.fillStyle='#78e7ff'; ctx.beginPath(); ctx.arc(headX-82,headY,14,0,6.28); ctx.arc(headX+82,headY,14,0,6.28); ctx.fill(); const sx=w*m.a, sy=h*(.25+.5*m.b); ctx.fillStyle='#ffe08d'; ctx.beginPath(); ctx.arc(sx,sy,18,0,6.28); ctx.fill(); ctx.strokeStyle='rgba(255,224,141,.7)'; ctx.setLineDash([5,8]); ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(headX-82,headY); ctx.moveTo(sx,sy); ctx.lineTo(headX+82,headY); ctx.stroke(); ctx.setLineDash([]); }
  function drawScale(ctx,w,h,m,type){ label(ctx,type==='fifths'?'circle of fifths':'semitone stairs → scale',18,28,'#ffe08d'); if(type==='fifths'){ const notes=['C','G','D','A','E','B','F#','C#','Ab','Eb','Bb','F']; const cx=w/2, cy=h/2, r=Math.min(w,h)*.32; notes.forEach((n,i)=>{ const a=i/12*6.28-1.57; ctx.fillStyle=i===m.a?'#ffe08d':'#78e7ff'; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,16,0,6.28); ctx.fill(); label(ctx,n,cx+Math.cos(a)*r-8,cy+Math.sin(a)*r+5,'#0b0a24'); }); } else { for(let i=0;i<13;i++){ const x=30+i*(w-60)/12, y=h*.78-i*(h*.48)/12; ctx.fillStyle=i===m.a?'#ffe08d':(i%2?'#b592ff':'#78e7ff'); ctx.beginPath(); ctx.roundRect(x-12,y-16,32,24,8); ctx.fill(); label(ctx,String(i),x-4,y+3,'#111'); } lineWave(ctx,w,h,x=>h*.26+Math.sin(x*.045)*22,'rgba(255,255,255,.25)',1); } }
  function drawRhythm(ctx,w,h,m,type){ label(ctx,type==='polyrhythm'||type==='gamelan'?'two time grids':'BPM as periodic pulse',18,28,'#ffe08d'); const n1=type==='polyrhythm'||type==='gamelan'?3:4, n2=type==='polyrhythm'||type==='gamelan'?4:m.a; const y1=h*.42,y2=h*.68; for(let i=0;i<n1;i++){ ctx.fillStyle='#ffe08d'; ctx.beginPath(); ctx.arc(70+i*(w-140)/(n1-1),y1,20+(i===0?8:0),0,6.28); ctx.fill(); } for(let i=0;i<n2;i++){ ctx.fillStyle='#78e7ff'; ctx.beginPath(); ctx.arc(70+i*(w-140)/(Math.max(1,n2-1)),y2,15,0,6.28); ctx.fill(); } label(ctx,`${m.bpm} BPM`,20,h-22,'rgba(255,255,255,.75)'); }
  function drawVoiceSystem(ctx,w,h,m){ label(ctx,'air → folds → tract → voice',18,28,'#ffe08d'); const cx=w*.48; ctx.strokeStyle='rgba(120,231,255,.8)'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(cx,h*.78); ctx.bezierCurveTo(cx-30,h*.6,cx-20,h*.45,cx,h*.35); ctx.stroke(); ctx.fillStyle='rgba(120,231,255,.16)'; ctx.beginPath(); ctx.ellipse(cx,h*.78,70,38,0,0,6.28); ctx.fill(); ctx.fillStyle='#ff9bd2'; ctx.fillRect(cx-24,h*.42,18,48); ctx.fillRect(cx+6,h*.42,18,48); ctx.strokeStyle='#ffe08d'; ctx.lineWidth=3; ctx.beginPath(); ctx.roundRect(cx-60,h*.18,120,68,28); ctx.stroke(); for(let i=0;i<7;i++){ ctx.fillStyle=`rgba(120,231,255,${.15+i*.08})`; ctx.beginPath(); ctx.arc(cx,h*.72-i*48,4+i*2*m.a,0,6.28); ctx.fill(); } }
  function drawVocalFold(ctx,w,h,m){ label(ctx,'closure balance changes tone',18,28,'#ffe08d'); const gap=48*(1-m.b)+4; const x=w/2,y=h/2; ctx.fillStyle='rgba(255,155,210,.8)'; ctx.beginPath(); ctx.roundRect(x-gap-36,y-80,38,160,28); ctx.roundRect(x+gap,y-80,38,160,28); ctx.fill(); ctx.strokeStyle='#78e7ff'; ctx.lineWidth=3; for(let i=0;i<7;i++){ ctx.beginPath(); ctx.moveTo(x-140,y-80+i*26); ctx.quadraticCurveTo(x,y-100+i*26+m.a*20,x+140,y-80+i*26); ctx.stroke(); } label(ctx,m.b<.35?(state.lang==='zh'?'漏气':'breathy'):m.b>.75?(state.lang==='zh'?'挤压':'pressed'):(state.lang==='zh'?'平衡':'balanced'),20,h-22,'#ffe08d'); }
  function drawSOVT(ctx,w,h,m){ label(ctx,'semi-closed exit creates gentle back pressure',18,28,'#ffe08d'); const cx=w*.45, cy=h*.55; ctx.strokeStyle='#ff9bd2'; ctx.lineWidth=18; ctx.beginPath(); ctx.moveTo(cx-160,cy); ctx.quadraticCurveTo(cx,cy-90,cx+130,cy); ctx.stroke(); const open=20+80*m.a; ctx.fillStyle='rgba(120,231,255,.25)'; ctx.beginPath(); ctx.roundRect(cx+90,cy-open/2,120,open,30); ctx.fill(); ctx.strokeStyle='#78e7ff'; ctx.lineWidth=3; for(let i=0;i<6;i++){ ctx.beginPath(); ctx.arc(cx+92,cy,20+i*18*(1-m.a),-1.1,1.1); ctx.stroke(); } }
  function drawFormant(ctx,w,h,m){ label(ctx,'vocal tract = living filter',18,28,'#ffe08d'); const vowels={a:[.75,.28],e:[.55,.55],i:[.25,.82],o:[.72,.55],u:[.42,.24]}; const v=vowels[m.vowel]||[m.a,m.b]; const x=80+v[0]*(w-160), y=h-70-v[1]*(h-140); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(80,h-70-i*(h-140)/4); ctx.lineTo(w-80,h-70-i*(h-140)/4); ctx.stroke(); }
    ctx.fillStyle='#ffe08d'; ctx.beginPath(); ctx.arc(x,y,24,0,6.28); ctx.fill(); label(ctx,`/${m.vowel}/`,x-8,y+5,'#111'); ctx.strokeStyle='#78e7ff'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(90,h*.35); ctx.bezierCurveTo(170,h*.18,250,h*.18,330,h*.35); ctx.bezierCurveTo(260,h*.52,170,h*.52,90,h*.35); ctx.stroke(); ctx.fillStyle='rgba(255,155,210,.55)'; ctx.beginPath(); ctx.ellipse(220+m.a*80,h*.36,54,16+m.b*18,0,0,6.28); ctx.fill(); }
  function drawTone(ctx,w,h,m,type){ label(ctx,type==='talkingDrum'?'drum imitates speech contour':'speech has melody',18,28,'#ffe08d'); const tone=Math.round(m.a); const curves={1:x=>h*.35,2:x=>h*.65-x/w*h*.35,3:x=>h*.42+Math.sin(x/w*Math.PI)*h*.22,4:x=>h*.25+x/w*h*.4}; lineWave(ctx,w,h,x=>curves[tone](x),'#ffe08d',5); if(type==='talkingDrum'){ for(let i=0;i<5;i++){ ctx.strokeStyle='rgba(255,155,210,.65)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(w*.5,h*.7,30+i*14,0,6.28); ctx.stroke(); } } label(ctx, state.lang==='zh'?`第 ${tone} 声`:`tone ${tone}`, 24,h-25,'rgba(255,255,255,.78)'); }
  function drawChoir(ctx,w,h,m){ label(ctx,'voices combine into harmony',18,28,'#ffe08d'); const voices=[['C',0,'#ffe08d'],['E',4,'#ff9bd2'],['G',7,'#78e7ff'],['B',11,'#b592ff']]; let active=voices.filter(v=>m.voices[v[0]]); active.forEach((v,i)=>{ const x=w*(.25+i*.18), y=h*.58-v[1]*6; ctx.fillStyle=v[2]; ctx.beginPath(); ctx.arc(x,y,26,0,6.28); ctx.fill(); label(ctx,v[0],x-8,y+5,'#111'); }); ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=2; for(let i=0;i<active.length;i++) for(let j=i+1;j<active.length;j++){ const xi=w*(.25+i*.18), yi=h*.58-active[i][1]*6, xj=w*(.25+j*.18), yj=h*.58-active[j][1]*6; ctx.beginPath(); ctx.moveTo(xi,yi); ctx.lineTo(xj,yj); ctx.stroke(); } }
  function drawPrediction(ctx,w,h,m){ label(ctx,'prediction + surprise = curiosity',18,28,'#ffe08d'); for(let i=0;i<8;i++){ const x=50+i*(w-100)/7, expected=h*.55+Math.sin(i*.8)*30; ctx.fillStyle='rgba(120,231,255,.28)'; ctx.beginPath(); ctx.arc(x,expected,18,0,6.28); ctx.fill(); const actual=expected+(i===5? -70*m.a: Math.sin(i)*12); ctx.fillStyle=i===5?'#ffe08d':'#ff9bd2'; ctx.beginPath(); ctx.arc(x,actual,10,0,6.28); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(x,expected); ctx.lineTo(x,actual); ctx.stroke(); } }
  function drawBreathSync(ctx,w,h,m){ label(ctx,'voice + exhale + pulse',18,28,'#ffe08d'); lineWave(ctx,w,h,x=>h*.35+Math.sin(x*.018)*35,'#78e7ff',4); lineWave(ctx,w,h,x=>h*.6+Math.sin(x*.010+1)*28,'#9ff0c0',4); lineWave(ctx,w,h,x=>h*.78+Math.sin(x*.006+2)*20,'#ff9bd2',4); }
  function drawLife(ctx,w,h,m,type){ label(ctx,type==='soundscape'?'design layers of a room':type==='pain'?'attention and breath can buffer pain':'downshift sound for sleep',18,28,'#ffe08d'); const zones=[['alert','#ff8fa6'],['background','#78e7ff'],['anchor','#ffe08d'],['quiet','#9ff0c0']]; zones.forEach((z,i)=>{ ctx.fillStyle=z[1]+'66'; ctx.beginPath(); ctx.roundRect(40+i*(w-80)/4,h*.42+(i%2)*38,(w-120)/4,100,22); ctx.fill(); label(ctx,state.lang==='zh'?['提示','背景','锚点','静音'][i]:z[0],55+i*(w-80)/4,h*.48+(i%2)*38,'rgba(255,255,255,.88)'); }); }
  function drawTheremin(ctx,w,h,m){ label(ctx,'hand distance → pitch / volume',18,28,'#ffe08d'); const sx=w*.5, sy=h*.55; ctx.fillStyle='rgba(120,231,255,.35)'; ctx.fillRect(sx-10,sy-45,20,90); const hx=w*m.a, hy=h*(.25+.55*m.b); ctx.fillStyle='#ffe08d'; ctx.beginPath(); ctx.arc(hx,hy,24,0,6.28); ctx.fill(); ctx.strokeStyle='#78e7ff'; ctx.lineWidth=3; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(sx,sy,60+i*34,0,6.28); ctx.stroke(); } }
  function drawSampling(ctx,w,h,m){ label(ctx,'capture → slice → rearrange',18,28,'#ffe08d'); lineWave(ctx,w,h,x=>h*.35+Math.sin(x*.04)*20+Math.sin(x*.11)*10,'#ff9bd2',3); for(let i=0;i<8;i++){ ctx.fillStyle=i%2?'#78e7ff':'#ffe08d'; ctx.beginPath(); ctx.roundRect(40+i*(w-90)/8,h*.62,36,60+Math.sin(i)*28,10); ctx.fill(); } }
  function drawFuture(ctx,w,h,m,type){ label(ctx,type==='space'?'music can become data, light, vibration':'music can be felt by the body',18,28,'#ffe08d'); const cx=w/2, cy=h/2; for(let i=0;i<7;i++){ ctx.strokeStyle=i%2?'rgba(120,231,255,.45)':'rgba(255,224,141,.45)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,30+i*22,0,6.28); ctx.stroke(); } ctx.fillStyle='#ff9bd2'; ctx.beginPath(); ctx.arc(cx,cy,22,0,6.28); ctx.fill(); }

  // ---------- gentle audio ----------
  function audio(){ if(!state.audioCtx) state.audioCtx = new (window.AudioContext||window.webkitAudioContext)(); return state.audioCtx; }
  function stopSound(){ if(state.audioCtx){ state.audioCtx.close(); state.audioCtx=null; } }
  function beep(freq, time=.25, gain=.03){ const ac=audio(); const o=ac.createOscillator(); const g=ac.createGain(); o.frequency.value=freq; o.type='sine'; g.gain.value=gain; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+time); }
  function playScale(tonic=0){ const base=220*Math.pow(2,tonic/12); [0,2,4,5,7,9,11,12].forEach((s,i)=>setTimeout(()=>beep(base*Math.pow(2,s/12),.18,.025),i*170)); }
  function playTone(tone=1){ const seq={1:[330,330,330],2:[260,310,360],3:[300,220,330],4:[380,300,220]}[tone]||[330]; seq.forEach((f,i)=>setTimeout(()=>beep(f,.16,.025),i*150)); }
  function playChord(vs){ const freqs={C:261.63,E:329.63,G:392,B:493.88}; Object.keys(vs).filter(k=>vs[k]).forEach(k=>beep(freqs[k],.55,.018)); }

  init();
})();
