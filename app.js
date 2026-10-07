/* ==========================================================================
   Aura Studio — Core Engine: 3D Camera, Speech AI, 10-Question Session & DB
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. ИНТЕРАКТИВНЫЙ 3D ФОН (Three.js): Студийная камера + видоискатель + глифы
   -------------------------------------------------------------------------- */
(function init3DBackground() {
  const canvas = document.getElementById('bg3d');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Освещение
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.PointLight(0x00d2ff, 3, 50);
  keyLight.position.set(10, 10, 12);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x3D81E3, 2, 40);
  fillLight.position.set(-10, -5, 8);
  scene.add(fillLight);

  // Сборка 3D-модели студийной камеры Aura
  const cameraRig = new THREE.Group();

  // Корпус камеры (матовый темно-графитовый металл)
  const bodyGeo = new THREE.BoxGeometry(5.2, 3.4, 6.5);
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x111622,
    metalness: 0.85,
    roughness: 0.25
  });
  const cameraBody = new THREE.Mesh(bodyGeo, darkMetalMat);
  cameraRig.add(cameraBody);

  // Объектив (Lens ring stack)
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x070c14,
    metalness: 0.95,
    roughness: 0.15
  });
  const lensBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 2.4, 32), lensMat);
  lensBase.rotation.x = Math.PI / 2;
  lensBase.position.z = 4.2;
  cameraRig.add(lensBase);

  // Светящееся фронтальное стекло объектива
  const glassGeo = new THREE.CircleGeometry(1.4, 32);
  const cyanGlassMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  const frontGlass = new THREE.Mesh(glassGeo, cyanGlassMat);
  frontGlass.position.z = 5.41;
  cameraRig.add(frontGlass);

  // Видоискатель верхний
  const vFinder = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 2.8), darkMetalMat);
  vFinder.position.set(0, 2.1, -0.6);
  cameraRig.add(vFinder);

  // Окружающие 3D-глифы и прицельные рамки фокуса
  const crossGroup = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.4 });
  
  function createFocusBracket(x, y) {
    const pts = [
      new THREE.Vector3(x, y - 0.4, 5.5),
      new THREE.Vector3(x, y, 5.5),
      new THREE.Vector3(x + (x > 0 ? -0.4 : 0.4), y, 5.5)
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, lineMat);
  }
  crossGroup.add(createFocusBracket(2.2, 1.6));
  crossGroup.add(createFocusBracket(-2.2, 1.6));
  crossGroup.add(createFocusBracket(2.2, -1.6));
  crossGroup.add(createFocusBracket(-2.2, -1.6));
  cameraRig.add(crossGroup);

  // Плавающие светящиеся частицы в пространстве
  const particlesCount = 70;
  const pGeo = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 30;
    posArray[i + 1] = (Math.random() - 0.5) * 20;
    posArray[i + 2] = (Math.random() - 0.5) * 25;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.12,
    color: 0xA4F4FD,
    transparent: true,
    opacity: 0.6
  });
  const particleField = new THREE.Points(pGeo, pMat);
  scene.add(particleField);

  cameraRig.position.set(5.2, -0.8, -1.5);
  cameraRig.rotation.y = -0.42;
  cameraRig.rotation.x = 0.15;
  scene.add(cameraRig);

  // Слежение за курсором
  let targetRotX = 0.15;
  let targetRotY = -0.42;
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    targetRotY = -0.42 + x * 0.4;
    targetRotX = 0.15 + y * 0.3;
  });

  // Цикл рендеринга
  function animate() {
    requestAnimationFrame(animate);
    cameraRig.rotation.y += (targetRotY - cameraRig.rotation.y) * 0.05;
    cameraRig.rotation.x += (targetRotX - cameraRig.rotation.x) * 0.05;
    cameraRig.position.y = -0.8 + Math.sin(Date.now() * 0.001) * 0.15;
    particleField.rotation.y += 0.0004;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* --------------------------------------------------------------------------
   2. МАСШТАБНАЯ БАЗА ВОПРОСОВ (Big Tech / МСП / СТАЖЕРЫ vs ОПЫТНЫЕ)
   Категории: RU (80%) и EN (20%)
   -------------------------------------------------------------------------- */
const QUESTIONS_MASTER = [
  // --- PRODUCT MANAGEMENT ---
  {
    id: "pm_jr_1",
    role: "pm",
    exp: "no_exp",
    lang: "ru",
    companyType: "bigtech",
    category: "Product Sense / Junior",
    text: "Каким мобильным приложением или сервисом вы пользуетесь каждый день? Опишите, какую главную работу пользователя (JTBD) оно решает и какую одну фичу вы бы убрали?",
    prep: 45,
    hint: "Сфокусируйтесь на целевой аудитории, болях и метриках удержания, а не просто на дизайне."
  },
  {
    id: "pm_jr_2",
    role: "pm",
    exp: "no_exp",
    lang: "ru",
    companyType: "sme",
    category: "Prioritization",
    text: "У вас ограниченный ресурс: один разработчик и дизайнер. Как вы расставите приоритеты между исправлением критического бага и запуском фичи, о которой просит заказчик?",
    prep: 60,
    hint: "Используйте критерии RICE/ICE и оцените стоимость простоя vs выручку от новой фичи."
  },
  {
    id: "pm_sr_1",
    role: "pm",
    exp: "exp",
    lang: "ru",
    companyType: "bigtech",
    category: "Product Strategy & Metrics",
    text: "Метрика Retention 7-го дня в ключевом продуктовом сценарии упала на 14% за две недели после релиза. Ваши детальные пошаговые действия по локализации и исправлению проблемы?",
    prep: 75,
    hint: "Разбивайте ответ на когорты, технические логи/сбои, воронку конверсий и изменения каналов трафика."
  },
  {
    id: "pm_sr_2",
    role: "pm",
    exp: "exp",
    lang: "ru",
    companyType: "corp",
    category: "Stakeholder Management",
    text: "Бизнес-заказчики требуют запустить функционал к концу квартала, а техлид утверждает, что без рефакторинга архитектуры система рухнет при масштабировании. Ваше решение?",
    prep: 60,
    hint: "Покажите навык переговоров, оценку технических рисков и поиск компромиссного MVP."
  },

  // --- IT & ENGINEERING ---
  {
    id: "dev_jr_1",
    role: "dev",
    exp: "no_exp",
    lang: "ru",
    companyType: "bigtech",
    category: "Architecture & Basics",
    text: "Что происходит в браузере и сетевом стеке с момента ввода URL до полной отрисовки первого пикселя страницы (First Contentful Paint)?",
    prep: 60,
    hint: "DNS Lookup, TCP Handshake, TLS, HTTP, парсинг DOM/CSSOM, Render Tree и композиция слоев."
  },
  {
    id: "dev_sr_1",
    role: "dev",
    exp: "exp",
    lang: "ru",
    companyType: "bigtech",
    category: "Distributed Systems & Reliability",
    text: "Как вы спроектируете отказоустойчивую систему обработки платежей или вебхуков с гарантией idempotency при пиковых нагрузках и сетевых сбоях?",
    prep: 75,
    hint: "Idempotency keys, distributed locks, outbox pattern, DLQ и graceful degradation."
  },

  // --- ЭКОНОМИКА, ФИНАНСЫ & ЗАКУПКИ ---
  {
    id: "econ_jr_1",
    role: "econ",
    exp: "no_exp",
    lang: "ru",
    companyType: "corp",
    category: "Financial Analysis & Procurement",
    text: "Как бы вы подошли к первичному аудиту коммерческих предложений поставщиков при закупке оборудования или серверных мощностей для компании?",
    prep: 60,
    hint: "TCO (совокупная стоимость владения), условия отсрочки платежей, SLA и проверка благонадежности."
  },
  {
    id: "econ_sr_1",
    role: "econ",
    exp: "exp",
    lang: "ru",
    companyType: "sme",
    category: "Unit Economics & Risk",
    text: "У компании снизилась маржинальность на 8% при росте выручки на 20%. В каких статьях P&L и кассовых разрывах вы будете искать причину в первую очередь?",
    prep: 75,
    hint: "Переменные vs постоянные издержки, кассовый разрыв, скидочная политика и оборачиваемость запасов."
  },

  // --- DATA SCIENCE & ANALYTICS ---
  {
    id: "ds_jr_1",
    role: "analytics",
    exp: "no_exp",
    lang: "ru",
    companyType: "bigtech",
    category: "A/B Testing & Statistics",
    text: "Что такое p-value и статистическая мощность теста? Почему нельзя останавливать A/B-тестирование раньше расчетного sample size при первом же зеленом результате?",
    prep: 60,
    hint: "Проблема подглядывания (peeking problem), ошибка I и II рода, MDE."
  },
  {
    id: "ds_sr_1",
    role: "analytics",
    exp: "exp",
    lang: "ru",
    companyType: "bigtech",
    category: "Causal Inference & ML",
    text: "Как вы будете оценивать влияние внедрения новой рекомендательной модели в продакшн, если классический A/B тест невозможен из-за сетевого эффекта пользователей?",
    prep: 75,
    hint: "Interleaved testing, synthetic controls, quasi-experiments, geo-experiments."
  },

  // --- МАРКЕТИНГ & РОСТ ---
  {
    id: "mkt_jr_1",
    role: "marketing",
    exp: "no_exp",
    lang: "ru",
    companyType: "sme",
    category: "User Acquisition",
    text: "Предложите стратегию привлечения первых 1,000 активных пользователей для B2B SaaS-продукта с околонулевым прямым рекламным бюджетом.",
    prep: 60,
    hint: "Cold outreach, комьюнити-билдинг, виральные петли, экспертный контент."
  },

  // --- ПОВЕДЕНЧЕСКИЕ НА РУССКОМ (УНИВЕРСАЛЬНЫЕ) ---
  {
    id: "beh_ru_1",
    role: "all",
    exp: "all",
    lang: "ru",
    companyType: "all",
    category: "STAR Methodology",
    text: "Вспомните реальную конфликтную или неопределенную ситуацию в вашей команде. В чем состояла ваша задача, что именно сделали вы и какой измеримый результат получился?",
    prep: 60,
    hint: "Структура STAR: Ситуация -> Задача -> Личное Действие -> Результат в фактах."
  },
  {
    id: "beh_ru_2",
    role: "all",
    exp: "all",
    lang: "ru",
    companyType: "all",
    category: "Self-Awareness & Failure",
    text: "Расскажите о вашей самой крупной профессиональной или учебной ошибке за последние два года. Что пошло не так и какие выводы вы внедрили в свою работу?",
    prep: 45,
    hint: "Будьте честными, не обвиняйте коллег, подчеркните внедренные системные выводы."
  },

  // ================= АНГЛИЙСКИЙ БЛОК (20% СЕССИИ) =================
  {
    id: "en_pitch",
    role: "all",
    exp: "all",
    lang: "en",
    companyType: "all",
    category: "English Screening",
    text: "Could you walk me through your professional background and highlight one major project that demonstrates your core strength?",
    prep: 60,
    hint: "Keep it under 2 minutes. Structure: Current focus -> Top achievement with metrics -> Motivation for this role."
  },
  {
    id: "en_conflict",
    role: "all",
    exp: "all",
    lang: "en",
    companyType: "all",
    category: "English Behavioral",
    text: "Describe a situation when you had to disagree with a colleague or manager about a critical project decision. How did you handle it?",
    prep: 60,
    hint: "Focus on data-driven arguments, respectful communication, and mutual commitment to the project outcome."
  },
  {
    id: "en_tech",
    role: "dev",
    exp: "exp",
    lang: "en",
    companyType: "bigtech",
    category: "English Technical",
    text: "How do you evaluate technical debt versus delivering new customer-facing features under tight business constraints?",
    prep: 60,
    hint: "Discuss trade-offs, engineering velocity, and explaining technical risk to non-technical stakeholders."
  }
];

/* --------------------------------------------------------------------------
   3. СЛОВАРЬ СЛОВ-ПАРАЗИТОВ (RU & EN)
   -------------------------------------------------------------------------- */
const PARASITE_DICT = {
  ru: ["как бы", "в общем", "типа", "короче", "ну", "эээ", "ммм", "собственно", "значит", "так сказать", "по факту", "слушай"],
  en: ["like", "you know", "basically", "actually", "sort of", "kind of", "um", "uh", "i mean", "literally"]
};

/* --------------------------------------------------------------------------
   4. СОСТОЯНИЕ СЕССИИ И УПРАВЛЕНИЕ
   -------------------------------------------------------------------------- */
let activeSessionQuestions = [];
let currentQuestionIndex = 0;
let sessionTimer = null;
let secondsRemaining = 0;
let answerStartTime = null;

let userVideoStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let completedAnswers = [];

let speechRecognizer = null;
let liveTranscriptAccumulator = "";

// Сборка протокола ровно из 10 вопросов (8 RU + 2 EN)
function assemble10Questions(role, expLevel, companyType) {
  // 1. Пул русских вопросов
  let ruPool = QUESTIONS_MASTER.filter(q => q.lang === "ru" && (q.role === role || q.role === "all") && (q.exp === expLevel || q.exp === "all"));
  if (ruPool.length < 8) {
    // Добираем релевантными смежными вопросами
    ruPool = QUESTIONS_MASTER.filter(q => q.lang === "ru");
  }
  // Перемешиваем и берем 8
  const selectedRu = [...ruPool].sort(() => 0.5 - Math.random()).slice(0, 8);

  // 2. Пул английских вопросов
  let enPool = QUESTIONS_MASTER.filter(q => q.lang === "en" && (q.role === role || q.role === "all"));
  if (enPool.length < 2) {
    enPool = QUESTIONS_MASTER.filter(q => q.lang === "en");
  }
  const selectedEn = [...enPool].sort(() => 0.5 - Math.random()).slice(0, 2);

  // Итого 10 вопросов: сначала 8 на русском, финальные 2 — на английском
  return [...selectedRu, ...selectedEn];
}

/* --------------------------------------------------------------------------
   5. ЗАПУСК И ШАГИ ИНТЕРВЬЮ
   -------------------------------------------------------------------------- */
async function startInterviewSession() {
  const role = document.getElementById('roleInput').value;
  const exp = document.getElementById('expInput').value;
  const company = document.getElementById('companyTypeInput').value;

  activeSessionQuestions = assemble10Questions(role, exp, company);
  currentQuestionIndex = 0;
  completedAnswers = [];

  try {
    userVideoStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true
    });
    document.getElementById('webcamPreview').srcObject = userVideoStream;

    document.getElementById('setupView').classList.remove('active');
    document.getElementById('sessionView').classList.add('active');

    loadQuestionStep(0);
  } catch (err) {
    alert("Для тренировки необходим доступ к веб-камере и микрофону. Разрешите доступ в браузере.");
    console.error(err);
  }
}

function loadQuestionStep(index) {
  if (index >= activeSessionQuestions.length) {
    finishEntireSession();
    return;
  }

  currentQuestionIndex = index;
  const q = activeSessionQuestions[index];
  liveTranscriptAccumulator = "";

  // Обновление UI карточки
  document.getElementById('questionCounter').innerText = `Вопрос ${index + 1} из 10`;
  document.getElementById('progressFillBar').style.width = `${((index + 1) / 10) * 100}%`;
  document.getElementById('currentQuestionTitle').innerText = q.text;
  document.getElementById('currentQuestionHint').innerText = q.hint ? `Фокус: ${q.hint}` : "";
  document.getElementById('questionCategory').innerText = q.category;
  document.getElementById('questionLevelBadge').innerText = q.lang.toUpperCase();

  const langBadge = document.getElementById('langBadge');
  langBadge.innerText = q.lang === 'en' ? 'EN (English Block)' : 'RU (Русский Блок)';
  langBadge.style.color = q.lang === 'en' ? '#00d2ff' : '#fff';

  document.getElementById('realtimeTranscript').innerText = "Транскрипция речи появится во время ответа...";
  document.getElementById('btnFinishAnswer').style.display = 'none';
  document.getElementById('btnReadyToAnswer').style.display = 'inline-block';

  // Озвучка голосом браузера (TTS)
  const isMock = document.getElementById('modeInput').value === 'mock';
  if (isMock) {
    speakQuestionWithTTS(q.text, q.lang);
  }

  // Запуск таймера на подготовку
  secondsRemaining = q.prep;
  updateTimerLabel("Подготовка");
  clearInterval(sessionTimer);
  sessionTimer = setInterval(() => {
    secondsRemaining--;
    updateTimerLabel("Подготовка");
    if (secondsRemaining <= 0) {
      clearInterval(sessionTimer);
      startRecordingAnswer();
    }
  }, 1000);
}

function speakQuestionWithTTS(text, lang) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'en' ? 'en-US' : 'ru-RU';
  utter.rate = 1.0;

  const avatar = document.getElementById('aiAvatarBox');
  const waves = document.getElementById('audioWaves');
  const state = document.getElementById('interviewerState');

  utter.onstart = () => {
    avatar.classList.add('speaking');
    waves.classList.add('active');
    state.innerText = lang === 'en' ? "Speaking in English..." : "Задает вопрос...";
  };
  utter.onend = () => {
    avatar.classList.remove('speaking');
    waves.classList.remove('active');
    state.innerText = "Внимательно слушает вас";
  };
  window.speechSynthesis.speak(utter);
}

function forceStartAnswering() {
  clearInterval(sessionTimer);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  document.getElementById('aiAvatarBox').classList.remove('speaking');
  document.getElementById('audioWaves').classList.remove('active');
  startRecordingAnswer();
}

function startRecordingAnswer() {
  recordedChunks = [];
  liveTranscriptAccumulator = "";
  answerStartTime = Date.now();

  const currentQ = activeSessionQuestions[currentQuestionIndex];

  // 1. Инициализация Speech Recognition
  initLiveSpeechToText(currentQ.lang);

  // 2. Инициализация MediaRecorder
  try {
    mediaRecorder = new MediaRecorder(userVideoStream, { mimeType: 'video/webm' });
  } catch (e) {
    mediaRecorder = new MediaRecorder(userVideoStream);
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const duration = Math.max(1, Math.round((Date.now() - answerStartTime) / 1000));
    const analysis = analyzeSpeechMetrics(liveTranscriptAccumulator, duration, currentQ.lang);

    completedAnswers.push({
      question: currentQ.text,
      lang: currentQ.lang,
      category: currentQ.category,
      videoBlob: videoBlob,
      transcript: liveTranscriptAccumulator.trim(),
      analysis: analysis
    });

    loadQuestionStep(currentQuestionIndex + 1);
  };

  mediaRecorder.start();

  document.getElementById('recIndicator').classList.add('active');
  document.getElementById('btnReadyToAnswer').style.display = 'none';
  document.getElementById('btnFinishAnswer').style.display = 'inline-block';

  // Таймер на ответ (макс 150 секунд)
  secondsRemaining = 150;
  updateTimerLabel("Ответ идет");
  clearInterval(sessionTimer);
  sessionTimer = setInterval(() => {
    secondsRemaining--;
    updateTimerLabel("Ответ идет");
    if (secondsRemaining <= 0) {
      stopAnswerAndNext();
    }
  }, 1000);
}

function stopAnswerAndNext() {
  clearInterval(sessionTimer);
  document.getElementById('recIndicator').classList.remove('active');

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) {}
  }

  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

function updateTimerLabel(prefix) {
  const m = Math.floor(secondsRemaining / 60);
  const s = secondsRemaining % 60;
  document.getElementById('sessionTimerBadge').innerText = `${prefix}: ${m}:${s < 10 ? '0' : ''}${s}`;
}

/* --------------------------------------------------------------------------
   6. РАСПОЗНАВАНИЕ РЕЧИ (Speech-to-Text)
   -------------------------------------------------------------------------- */
function initLiveSpeechToText(lang) {
  const SpeechApi = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechApi) {
    document.getElementById('realtimeTranscript').innerText = "Браузерное распознавание речи не поддерживается. Видео пишется.";
    return;
  }

  speechRecognizer = new SpeechApi();
  speechRecognizer.continuous = true;
  speechRecognizer.interimResults = true;
  speechRecognizer.lang = lang === 'en' ? 'en-US' : 'ru-RU';

  speechRecognizer.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      if (e.results[i].isFinal) {
        liveTranscriptAccumulator += " " + e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    const fullText = (liveTranscriptAccumulator + " " + interim).trim();
    document.getElementById('realtimeTranscript').innerText = fullText || "Слушаю вас...";

    // Живой расчет темпа речи WPM
    const words = fullText.split(/\s+/).filter(Boolean).length;
    const elapsedMinutes = Math.max(0.1, (Date.now() - answerStartTime) / 60000);
    const wpm = Math.round(words / elapsedMinutes);
    document.getElementById('liveSpeed').innerText = `${wpm} WPM`;
  };

  speechRecognizer.onerror = (e) => console.warn("Speech API info:", e.error);

  try {
    speechRecognizer.start();
  } catch (err) {}
}

/* --------------------------------------------------------------------------
   7. АНАЛИЗАТОР РЕЧИ И СЛОВ-ПАРАЗИТОВ
   -------------------------------------------------------------------------- */
function analyzeSpeechMetrics(transcript, durationSec, lang) {
  if (!transcript || transcript.trim().length === 0) {
    return {
      wordCount: 0,
      wpm: 0,
      purity: 100,
      parasitesFound: {},
      formattedText: "Ответ без распознанного текста."
    };
  }

  const words = transcript.toLowerCase().match(/[a-zA-Zа-яА-Я0-9]+/g) || [];
  const wordCount = words.length;
  const minutes = durationSec / 60;
  const wpm = Math.round(wordCount / minutes);

  const dict = PARASITE_DICT[lang] || PARASITE_DICT.ru;
  let parasiteCount = 0;
  let parasitesFound = {};
  let formattedText = transcript;

  dict.forEach(term => {
    const reg = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = transcript.match(reg);
    if (matches) {
      parasiteCount += matches.length;
      parasitesFound[term] = matches.length;
      formattedText = formattedText.replace(reg, `<mark>${term}</mark>`);
    }
  });

  const purity = wordCount > 0 ? Math.max(0, Math.round(100 - (parasiteCount / wordCount) * 100)) : 100;

  return {
    wordCount,
    wpm,
    purity,
    parasitesFound,
    formattedText
  };
}

/* --------------------------------------------------------------------------
   8. ЗАВЕРШЕНИЕ СЕССИИ И ОТЧЕТ
   -------------------------------------------------------------------------- */
async function finishEntireSession() {
  if (userVideoStream) {
    userVideoStream.getTracks().forEach(t => t.stop());
  }

  document.getElementById('sessionView').classList.remove('active');
  document.getElementById('resultsView').classList.add('active');

  // Агрегированная статистика по 10 вопросам
  let totalWords = 0;
  let totalWpm = 0;
  let totalPurity = 0;

  completedAnswers.forEach(ans => {
    totalWords += ans.analysis.wordCount;
    totalWpm += ans.analysis.wpm;
    totalPurity += ans.analysis.purity;
  });

  const avgWpm = Math.round(totalWpm / completedAnswers.length) || 0;
  const avgPurity = Math.round(totalPurity / completedAnswers.length) || 100;

  document.getElementById('statTotalWords').innerText = totalWords;
  document.getElementById('statAvgWpm').innerText = avgWpm;
  document.getElementById('statAvgPurity').innerText = `${avgPurity}%`;

  // Отрисовка списка 10 видеоответов
  const container = document.getElementById('answersAccordionList');
  container.innerHTML = "";

  completedAnswers.forEach((item, idx) => {
    const videoUrl = URL.createObjectURL(item.videoBlob);
    const card = document.createElement('div');
    card.className = "answer-card";

    const badgeColor = item.analysis.purity > 90 ? "green" : (item.analysis.purity > 75 ? "yellow" : "red");

    card.innerHTML = `
      <div class="answer-video">
        <video src="${videoUrl}" controls playsinline></video>
        <div style="margin-top: 8px;">
          <a href="${videoUrl}" download="aura_q${idx + 1}.webm" style="font-size:12px; color:var(--cyan-bright); text-decoration:none;">
            Скачать видео (.webm)
          </a>
        </div>
      </div>
      <div class="answer-meta">
        <div class="pills-group">
          <span class="tag-badge ${badgeColor}">Чистота речи: ${item.analysis.purity}%</span>
          <span class="tag-badge green">${item.analysis.wpm} WPM</span>
          <span class="tag-badge yellow">${item.lang.toUpperCase()}</span>
          <span class="tag-badge green">${item.category}</span>
        </div>
        <h4>Вопрос ${idx + 1}</h4>
        <p class="q-text">${item.question}</p>
        <div class="transcript-preview">${item.analysis.formattedText}</div>
      </div>
    `;
    container.appendChild(card);
  });

  // Автоматическое сохранение в IndexedDB
  await saveSessionToIndexedDB({
    date: new Date().toLocaleString('ru-RU'),
    totalWords,
    avgWpm,
    avgPurity,
    answers: completedAnswers
  });
}

function returnToStart() {
  document.getElementById('resultsView').classList.remove('active');
  document.getElementById('setupView').classList.add('active');
}

/* --------------------------------------------------------------------------
   9. INDEXEDDB ХРАНИЛИЩЕ
   -------------------------------------------------------------------------- */
const DB_NAME = "AuraStudioDB";
const STORE_NAME = "interviews_archive";

function getDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveSessionToIndexedDB(sessionData) {
  try {
    const db = await getDB();
    const tx = db.transaction([STORE_NAME], "readwrite");
    tx.objectStore(STORE_NAME).add(sessionData);
  } catch (err) {
    console.error("Ошибка сохранения в IndexedDB:", err);
  }
}

async function loadHistorySessions() {
  const container = document.getElementById('savedSessionsList');
  container.innerHTML = "<p class='text-muted'>Загрузка архива из IndexedDB...</p>";

  try {
    const db = await getDB();
    const tx = db.transaction([STORE_NAME], "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();

    req.onsuccess = () => {
      const list = req.result || [];
      if (list.length === 0) {
        container.innerHTML = "<p class='text-muted'>В локальной базе пока нет сохраненных сессий.</p>";
        return;
      }

      container.innerHTML = "";
      list.reverse().forEach((sess) => {
        const item = document.createElement('div');
        item.className = "saved-session-item";
        item.innerHTML = `
          <div class="saved-session-header">
            <div>
              <h3 style="font-size:16px;">Сессия от ${sess.date}</h3>
              <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">
                Ответов: ${sess.answers.length} · Темп: ${sess.avgWpm} WPM · Чистота: ${sess.avgPurity}%
              </p>
            </div>
            <span class="tag-badge green">10 Вопросов Protocol</span>
          </div>
          <div style="font-size:13px; color:#cbd5e1; margin-top:8px;">
            Первый вопрос: <i>«${sess.answers[0]?.question || "—"}»</i>
          </div>
        `;
        container.appendChild(item);
      });
    };
  } catch (e) {
    container.innerHTML = "<p class='text-muted'>Не удалось открыть IndexedDB.</p>";
  }
}

async function purgeIndexedDB() {
  if (!confirm("Вы уверены, что хотите удалить все сохраненные сессии и видео?")) return;
  const db = await getDB();
  const tx = db.transaction([STORE_NAME], "readwrite");
  tx.objectStore(STORE_NAME).clear();
  tx.oncomplete = () => loadHistorySessions();
}

/* --------------------------------------------------------------------------
   10. ТАБЛИЦА БАЗЫ ВОПРОСОВ (ВКЛАДКА 2)
   -------------------------------------------------------------------------- */
function renderQuestionsTable() {
  const tbody = document.getElementById('dbTableBody');
  if (!tbody) return;

  const role = document.getElementById('dbFilterRole').value;
  const exp = document.getElementById('dbFilterExp').value;
  const lang = document.getElementById('dbFilterLang').value;

  const filtered = QUESTIONS_MASTER.filter(q => {
    const matchRole = role === "all" || q.role === role || q.role === "all";
    const matchExp = exp === "all" || q.exp === exp || q.exp === "all";
    const matchLang = lang === "all" || q.lang === lang;
    return matchRole && matchExp && matchLang;
  });

  tbody.innerHTML = "";
  filtered.forEach(q => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="tag-badge ${q.lang === 'en' ? 'yellow' : 'green'}">${q.lang.toUpperCase()}</span></td>
      <td><b>${q.role.toUpperCase()}</b></td>
      <td>${q.exp === 'no_exp' ? 'Junior' : (q.exp === 'exp' ? 'Middle+' : 'Все')}</td>
      <td>${q.text}</td>
      <td style="color:var(--text-muted);">${q.hint || "—"}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* --------------------------------------------------------------------------
   11. НАВИГАЦИЯ И АВТОРИЗАЦИЯ
   -------------------------------------------------------------------------- */
function switchMainTab(tabKey) {
  document.querySelectorAll('.view-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  if (tabKey === 'simulator') {
    document.getElementById('tabSimulator').classList.add('active');
    document.querySelectorAll('.nav-link')[0].classList.add('active');
  } else if (tabKey === 'database') {
    document.getElementById('tabDatabase').classList.add('active');
    document.querySelectorAll('.nav-link')[1].classList.add('active');
    renderQuestionsTable();
  } else if (tabKey === 'history') {
    document.getElementById('tabHistory').classList.add('active');
    document.querySelectorAll('.nav-link')[2].classList.add('active');
    loadHistorySessions();
  }
}

// Модальное окно профиля/авторизации
function openAuthModal() {
  document.getElementById('authModal').classList.add('open');
}
function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open');
}
function toggleAuthForm(type) {
  if (type === 'login') {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('regForm').style.display = 'none';
    document.getElementById('tabLoginBtn').classList.add('active');
    document.getElementById('tabRegisterBtn').classList.remove('active');
  } else {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('regForm').style.display = 'block';
    document.getElementById('tabRegisterBtn').classList.add('active');
    document.getElementById('tabLoginBtn').classList.remove('active');
  }
}
function handleAuthSubmit(e, type) {
  e.preventDefault();
  const userName = type === 'reg' ? document.getElementById('regNameInput').value : "Кандидат";
  document.getElementById('authBtn').innerText = `Профиль: ${userName}`;
  closeAuthModal();
  alert(`Вы успешно вошли как ${userName}. Сессии привязаны к локальному профилю.`);
}

// Инициализация при старте
window.addEventListener('DOMContentLoaded', () => {
  renderQuestionsTable();
});