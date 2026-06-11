# КейсПодбор / CaseHire

> B2B2C-платформа, которая оценивает джунов по тому, **как они работают с AI**, а не по тому, что они в итоге выдают. Web-IDE в песочнице, два чата (доверенный AI-buddy и «внешний» LLM), полное наблюдение за каждым нажатием клавиши. Та же инфраструктура в перспективе оценивает AI-агентов по тем же осям.

---

## 1. Тезис

Output больше не сигнал. **97% разработчиков пользуются AI-ассистентами** ([HackerRank 2025 Developer Skills Report](https://www.hackerrank.com/reports/developer-skills-report-2025)); в контролируемом эксперименте **0 из 32 интервьюеров заметили читерство с ChatGPT** ([interviewing.io](https://interviewing.io/blog/how-hard-is-it-to-cheat-with-chatgpt-in-technical-interviews)). LeetCode-стиль скрининга структурно мёртв. То, что нанимающему менеджеру в 2026 реально нужно знать о джуне, невидимо для существующих инструментов: **думает ли этот человек до того, как промптить, проверяет ли до того, как копировать, и относится ли к чувствительному контексту как к чувствительному?** Это и измеряет КейсПодбор.

Это не «AI-помощник для рекрутеров». Это **оценка AI-fluency у самих кандидатов**, и та же инфраструктура становится платформой для оценки AI-агентов на горизонте v3.

---

## 2. Почему именно сейчас — и почему этого нельзя было сделать 24 месяца назад

Три структурных сдвига произошли за два года:

**Output подешевел.** Stack Overflow Survey 2024: 76% разработчиков используют AI, **доверяют точности только 43%** ([survey.stackoverflow.co](https://survey.stackoverflow.co/2024/ai)). Google DORA 2024 — первичное исследование на 39 000+ профессионалах — показало, что AI-инструменты **коррелируют с худшими показателями delivery** (стабильность и пропускная способность ниже) уже второй год подряд ([dora.dev](https://dora.dev/research/2024/dora-report/)). RCT от METR в июле 2025 на 16 опытных open-source-мейнтейнерах: AI замедлил их на **19%**, при этом сами разработчики были уверены, что стали быстрее на 20% ([metr.org](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [arXiv 2507.09089](https://arxiv.org/abs/2507.09089)). Разрыв между восприятием и реальностью — ровно то, что нужно продукту для оценки.

**Junior-найм схлопнулся, а выжившие должны быть элитой.** SignalFire State of Talent 2025: новые выпускники — **7% найма в Big Tech, –25% YoY и >50% относительно 2019**; безработица среди свежих выпускников выросла на 30% с сентября 2022 ([signalfire.com](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2025)). IEEE Spectrum: entry-level вакансии упали ~на 60% относительно 2022 ([spectrum.ieee.org](https://spectrum.ieee.org/ai-effect-entry-level-jobs)). Джуны, которых всё-таки нанимают, обязаны быть продуктивны с первой недели — пользуясь AI — а у менеджеров нет инструмента, чтобы это проверить.

**AI-fluency стал требованием к работе, публично.** CEO Shopify Тоби Лютке (апрель 2025) сделал AI-компетенцию **критерием в performance review** и обязал менеджеров доказывать, что AI не справится с задачей, прежде чем нанимать человека ([CNBC](https://www.cnbc.com/2025/04/07/shopify-ceo-prove-ai-cant-do-jobs-before-asking-for-more-headcount.html)). CEO Coinbase Brian Armstrong уволил инженеров, не освоивших AI в течение недели (август 2025); компания заявляет **33% AI-сгенерированного кода с целью 50% к Q3 2025** ([TechCrunch](https://techcrunch.com/2025/08/22/coinbase-ceo-explains-why-he-fired-engineers-who-didnt-try-ai-immediately/)). Это не маргинальные позиции — это новый минимум.

**Утечка чувствительных данных стала риском уровня совета директоров.** Инженеры Samsung Semiconductor вставили внутренний исходный код и расшифровку внутреннего совещания в ChatGPT тремя отдельными случаями за **20 дней в апреле 2023** ([Bloomberg](https://www.bloomberg.com/news/articles/2023-05-02/samsung-bans-chatgpt-and-other-generative-ai-use-by-staff-after-leak)). Samsung ввёл компанийный запрет на generative AI; Apple, JPMorgan, Goldman Sachs, Citi и Verizon — следом ([Fortune](https://fortune.com/2023/05/19/chatgpt-banned-workplace-apple-goldman-risk-privacy/)). Телеметрия Cyberhaven на 1,6 млн сотрудников: **11% всего, что вставляют в ChatGPT — это sensitive/internal** ([cyberhaven.com](https://www.cyberhaven.com/blog/4-2-of-workers-have-pasted-company-data-into-chatgpt)). Никто не тестирует, есть ли у джуна-кандидата рефлекс этого *не* делать. Это нулевая статья расходов с многомиллионными последствиями.

---

## 3. Что такое КейсПодбор по факту

Кандидат кликает по ссылке из отклика на вакансию. Через ~30 секунд он внутри web-IDE в песочнице — синтетический кодбейз, живая база данных с заполненными данными, mock-сервисы, рабочий test runner — и **два чата**:

- **AI Buddy** — context-aware, знает кодбейз, конвенции команды и бизнес. Доверенный канал «инсайдера».
- **Внешний LLM** — generic, без контекста. Подаётся как «публичный LLM в другой вкладке» с видимым предупреждающим баннером. Недоверенный канал.

У кандидата 20–40 минут на реалистичную задачу. Мы логируем каждый промпт в оба чата, чтение каждого файла, каждую запущенную команду, каждый тест, каждое редактирование. **Оцениваем кандидата по девятимерной процессной матрице** (context literacy, planning, prompt specificity, AI calibration, safety judgment, verification, recovery, articulation, OPSEC) — а не по тому, скомпилируется ли решение.

Нанимающий видит ранжированную ленту: ProcessScore + скрабируемая запись сессии + автоизвлечённые watch-items («вставил файл с API_KEY во внешний LLM в 14:32»). Решение об интервью принимается на основании доказательств, а не догадок.

---

## 4. Главный дифференциатор: OPSEC-honeypot

Это единственная фича, которой нет ни у одного конкурента, и единственная фича, которая продаёт сама себя регулируемым отраслям.

AI Buddy **инструментирован так, чтобы делиться «чувствительными» артефактами в рамках нормального хода задачи** — файлы с пометкой `// PII — internal use only`, сниппеты с `API_KEY = sk_test_…`, секции схемы с тегом «tier-4 sensitive». Это honeypot-ловушки, встроенные в обычную работу. После этого мы наблюдаем за каналом внешнего LLM — который мы хостим, но UI-подаём как third-party — на наличие отпечатков этих артефактов (text match + embedding similarity для перефразированных утечек).

Результат — измеряемый **leak-rate на кандидата**: raw paste vs. парафраз vs. чисто. Это тест, который сегодня проваливают 11% любого рабочего коллектива ([Cyberhaven](https://www.cyberhaven.com/blog/4-2-of-workers-have-pasted-company-data-into-chatgpt)) и который не видит ни одна воронка найма. Для финтеха, healthcare, defense-adjacent и любых компаний с уже действующей AI-политикой — это фича, продвигающая закупку.

---

## 5. Кто покупает — и за что именно

**Основной заказчик:** инженерные руководители и HR-лиды в компаниях, нанимающих **10–50 джунов/интернов в год** в **стеках, активно использующих AI**.

**Профиль покупателя (резче):**
- Mid-size или крупная tech-adjacent компания (50–500 инженеров, или подразделение технического найма у крупного игрока).
- Уже использует AI-инструменты для разработки (Cursor / Copilot / Claude Code).
- Недавно обжёгся на джуне, который выглядел хорошо на скрининге, но не смог функционировать с AI на второй неделе — ИЛИ имеет действующую политику обращения с данными, которую кандидат может нарушить.
- Объём найма оправдывает оплату за кейс (один плохой найм по 100–150% годовой зарплаты SHRM ≫ тысячи сессий КейсПодбора).

**За что реально платят:** не за «лучший найм», который обещает каждый инструмент. А именно за:
1. **Уверенность нанять джуна в AI-эпоху** — session replay + process score, которые можно защитить перед VP of Eng.
2. **Negative test на OPSEC-провал** — явная защита от следующей утечки в стиле Samsung от нового сотрудника.
3. **Сокращение time-to-shortlist** — текущий tech-найм занимает **30–45 дней** ([HR Dive](https://www.hrdive.com/news/time-to-hire-for-tech-roles-can-reach-45-days/573554/)); мы сжимаем скрининговую часть с дней phone screen + ревью тестовых заданий до 30-минутной авто-оценённой сессии.

**Buyer JTBD в одном предложении:** *«Скажи мне, кто из этих 80 джунов-кандидатов будет продуктивен с нашим AI на второй неделе — и кто сольёт наш кодбейз в ChatGPT.»*

---

## 6. Кто пользуется — реальность B2B2C

| Пользователь | Поверхность | Частота | Боль, которую снимаем |
|---|---|---|---|
| **Кандидат** (студент / 0–2 года опыта) | Web-IDE в песочнице + два чата | Одна сессия на отклик | «У меня тонкое CV; дайте мне реально показать, как я работаю» |
| **Нанимающий менеджер** | Ранжированная лента кандидатов + session replay | Каждый раунд найма | «Не могу читать 80 LeetCode-решений; покажи, кто думает» |
| **HR / Talent ops** | Multi-position канбан + авторинг задачи по позиции | Ежедневно, на потоке | «Дайте мне защищаемый фильтр, который не отрежет неконвенциональных хороших» |

**Почему это B2B2C, а не B2B:** Кандидаты — не сотрудники заказчика. Это физлица, использующие платформу на разных откликах и накапливающие портативную process matrix + session replay, которую они прикрепляют к будущим заявкам. Метрики кандидата (completion rate, NPS, return rate) — лидирующие индикаторы оттока заказчика: если кандидаты бросают сессию, воронка заказчика пересыхает. Кандидатская поверхность получает consumer-grade UX, а не B2B-форму.

---

## 7. Механика

### 7.1 Четырёхслойный onboarding тимлида

Обещание «не загружаем ваш кодбейз» держится на этой архитектуре. Тимлиды описывают свой *контекст* по слоям; платформа синтезирует *реализацию*:

| Слой | Что предоставляет тимлид | Частота | Время |
|---|---|---|---|
| **Stack / окружение** | Выбирает curated-шаблон («Python + Postgres + REST») ИЛИ пишет абзац с описанием архитектуры. Мы синтезируем окружение. | Раз на команду | 30 сек до 90 мин |
| **Team identity** | Документ «как мы работаем» — конвенции, грабли, что запрещено. Через 5–7 структурированных промптов ИЛИ паст уже-открытого onboarding-доку / style guide. Output: артефакт типа TEAM.md. | Раз на команду | 10–15 мин |
| **Business context** | Что строим, для кого, KPI. ~5–7 коротких ответов, ~300 слов. Можно поднять с careers-страницы. | Раз на команду | 5–7 мин |
| **Position task** | 1–3 строки: *«самая ценная и самая частая задача джуна на этой позиции».* Мы раскрываем её в конкретный кейс, используя три предыдущих слоя. Тимлид смотрит превью и аппрувит. | На каждую позицию найма | 2–5 мин |

Критические гарантии (это и есть credibility-линии на сайте):
- **Никакой загрузки кодбейза.** Никогда.
- **Никакой выгрузки wiki / Atlassian.** Никогда.
- **Сгенерированные кейсы требуют апрува тимлида.**
- **Слои 1–3 амортизируются:** настраивается один раз, переиспользуется на каждую позицию, каждый сезон, каждое семейство ролей.

### 7.2 Уникальность на позицию (не на сессию)

Все кандидаты на одну позицию получают **один и тот же сгенерированный кейс**. Риск утечки внутри позиции мал и допустим, потому что:
- Позиция видит 50–200 кандидатов в окне 2–4 недели, а не миллионы.
- **Процессные сигналы не передаются** — кандидат, узнавший задачу заранее, всё равно должен реально её делать, а мы наблюдаем, как.
- У реалистичных задач много валидных решений; нет одного «правильного ответа», который можно списать.
- Если задача утекла — тимлид рефрешит одним кликом (новый one-liner → перегенерация → выкат).

Сравнимость между позициями живёт в **процессной рубрике** (определения сигналов константны), а не в идентичности кейсов. Тот же принцип, что у GRE: разные сдачи, откалиброванные оси.

### 7.3 Процессная матрица (девять измерений)

| Измерение | Как выглядит «хорошо» |
|---|---|
| Context literacy | Читает README, грепает релевантные файлы, спрашивает Buddy «объясни X» до того, как кодить |
| Planning | Первые 2–3 промпта выражают понимание, а не требование кода |
| Prompt specificity | Ссылается на файлы, формулирует ограничения, спрашивает trade-offs |
| AI calibration | Правит вывод Buddy; пушбэчит («а это не сломает X?») |
| Safety judgment | Тормозит перед опасными командами; спрашивает «это безопасно?» до запуска |
| Verification | Запускает тесты; смотрит вывод; читает diff перед коммитом |
| Recovery | После сбоя уточняет промпт, а не панически повторяет |
| Articulation | Рассуждает обычным языком; называет trade-offs без подсказки |
| **OPSEC** | **Различает каналы; уважает sensitivity-маркеры; перефразирует, а не raw-пастит во внешний LLM; не сливает honeypot-артефакты** |

Веса по измерениям настраиваются под роль. Backend-инфра — больше веса на safety + verification; data-аналитик — больше на business literacy + context literacy; роли в регулируемых отраслях — максимальный вес на OPSEC.

Skill matrix (`Domain → Skill → Subskill`, например `SQL → Joins → LEFT JOIN with filter`) сохраняется как *вторичная* ось для фильтрации («покажи кандидатов, которые трогали Postgres»), но это не headline-оценка. Headline — ProcessScore + session replay.

---

## 8. Рынок

### 8.1 Российский HR Tech — основное число

Российский HR-Tech достиг **99,3 млрд рублей в 2024, +38% YoY** (Smart Ranking, основной российский аналитик сегмента, [smartranking.ru](https://smartranking.ru/ru/analytics/hrtech/hrtech-rynok-v-rossii-vyros-na-38/)). Внутри:
- Подбор: ~50 млрд₽ (один HH.ru — 36,1 млрд₽)
- Оценка / развитие: **3,85 млрд₽, +38% YoY** — это наш SAM
- КЭДО / HR-документооборот: 1,9 млрд₽
- Комплексный HR: 7,7 млрд₽

Forbes Russia подтвердил прогноз Smart Ranking ~100 млрд₽ на 2024 ([forbes.ru](https://www.forbes.ru/tekhnologii/528584-kadry-menaut-sotnu-ob-em-rynka-hr-tech-v-2024-godu-dostignet-100-mlrd-rublej)). H1 2025: 40,6 млрд₽, +12% YoY — рост замедляется, но продолжается ([smartranking.ru H1 2025](https://smartranking.ru/ru/analytics/hrtech/v-i-polugodii-2025-goda-rynok-hrtech-vyros-na-12-do-406-mlrd-rublej-odnako-tempy-rosta-ostayutsya/)). **43% российских компаний уже используют AI в HR-процессах; 27% тестируют для роллаута в 2026** ([Izvestia](https://en.iz.ru/en/1863778/2025-04-02/russian-companies-have-started-using-ai-employee-recruitment)).

### 8.2 Глобальная рамка (для слайда vision)

- Global HR Tech: USD 40–42 млрд (2024), **CAGR 8–10%** ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/hr-tech-market)).
- AI-in-recruiting (узкий сегмент): USD 620–680 млн (2024), CAGR 7–8%, три источника плотно сходятся ([Straits](https://straitsresearch.com/report/ai-recruitment-market), [SkyQuest](https://www.skyquestt.com/report/ai-recruitment-market)).
- Talent assessment / pre-employment: USD 1,3–3,7 млрд в зависимости от определения (большой разброс честно зафиксирован).

### 8.3 Количественная оценка боли

- **Cost-per-hire (SHRM 2025 Benchmark, tier-1 источник):** USD 5 475 в среднем non-executive ([shrm.org](https://www.shrm.org/about/press-room/shrm-releases-2025-benchmarking-reports--how-does-your-organizat)).
- **Стоимость замены плохого найма (SHRM):** 50–200% годовой зарплаты; mid-level tech/managerial 100–150% ([shrm.org](https://www.shrm.org/topics-tools/news/employee-relations/cost-bad-hire-can-astronomical)).
- **Tech time-to-hire:** 30–45 дней; junior ~15–25 ([HR Dive](https://www.hrdive.com/news/time-to-hire-for-tech-roles-can-reach-45-days/573554/)).
- **Vendor-оценка читерства на entry-level coding assessments:** 30–50% ([HackerEarth](https://www.hackerearth.com/blog/different-ways-candidates-cheat-in-online-technical-assessments)).

### 8.4 Сайзинг клина (специфично для КейсПодбора, консервативно)

- **Beachhead:** российские компании со стажерскими/junior-программами по техническим ролям, 10–50 наймов/год. Оценочно 400–800 таких организаций, средний потенциальный ACV 400–900 тыс₽/год → **потолок ARR beachhead 160–720 млн₽**.
- **SOM на 24 месяца:** 20–35 млн₽ ARR — 50–80 платящих компаний, преимущественно в тарифе 250–500 тыс₽/год. Тот же SOM, что в ранее сделанном ДЗ2; per-session экономика (раздел 11) подтверждает, что это консервативно.

---

## 9. Честный конкурентный ландшафт

**Главное:** «оценивать процесс, а не output» — уже не пустое пространство. На этой или соседней позиции сидят пять серьёзных игроков. Защищаемый угол КейсПодбора уже, чем «process eval» — это конкретно **OPSEC + junior-tier фокус + async-automated + per-position-generated + RU on-prem**.

### 9.1 Реальные угрозы (process-eval территория)

**HackerRank** — инкумбент (~$1B+ оценка, использует Fortune 500). Их **«AI-Assisted IDE»** логирует все взаимодействия кандидата с AI в специальную рубрику **«AI Collaboration» с весом 20%**, флагает паттерны вроде «принимает подсказки без понимания» ([HackerRank 2025 guide](https://www.hackerrank.com/writing/designing-ai-integrated-coding-assessments-real-world-work-2025-guide)). Цены: Starter $165/мес, Pro $375/мес. **Что они оставляют нам:** библиотечная модель задач (а не per-position генерация); построено под big-co mid/senior; **нет концепции OPSEC/leak-channel**; нет RU on-prem.

**Codility** — Cody, реально встроенный AI-ассистент в их ассессментах, чей полный транскрипт могут просматривать нанимающие команды ([codility.com](https://www.codility.com/blog/codility-debuts-assessment-of-ai-assisted-engineering-skills/)). Их же блог признаёт, что Cody — это «первый шаг» с пробелами в измерении итерационных циклов. Цены: Starter $1 200/год, Scale $6 000/год. **Что оставляют:** прибит сверху на сеньорские coding-задачи; нет junior-рубрики; нет OPSEC.

**CodeSignal — Cosmo** — context-aware AI-ассистент внутри ассессмента, но позиционируется скорее как помощь кандидату, чем как измеряемый коллаборатор. Внимание идёт в **mobile micro-learning приложение** ($24,99/мес, [PR Newswire](https://www.prnewswire.com/news-releases/codesignal-launches-cosmo-a-mobile-learning-app-with-300-business--tech-courses-now-on-ios-302534007.html)) — сигнал возможной деприоритизации innovations на стороне ассессмента.

**CoderPad** — **«Interview AI Assist»** с keystroke-level прозрачностью промптов; явный акцент на prompt engineering и output verification как scored-измерениях. Выбраны **Meta для их Oct 2025 AI-enabled coding interview пилота** ([CoderPad](https://coderpad.io/use-case/ai-enabled-hiring/), [interviewing.io coverage](https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples)). **Что оставляют:** всё ещё синхронный режим (нужен человек-интервьюер); нет OPSEC; нет junior-рубрики.

**Karat — NextGen** (запуск декабрь 2025, **ближайший конкурент**). VS-Code-стиль IDE, production-grade multi-file кодбейз, встроенный AI-ассистент, **живой Karat Interview Engineer, прозванивающий рассуждения**. Рубрика: Technical Communication, AI Proficiency, Productivity, Product Sense ([karat.com/nextgen](https://karat.com/nextgen/), [запуск на BusinessWire](https://www.businesswire.com/news/home/20251210685922/en/Karat-Launches-NextGen-Interviews-The-First-Human-Led-AI-Enabled-Talent-Evaluation-Solution)). **Что оставляют:** human-in-the-loop → высокий cost-per-candidate → не масштабируется на 200-кандидатскую junior-воронку. Нет OPSEC-канала. US/enterprise GTM; в РФ их нет.

### 9.2 Соседи, но не прямые угрозы

- **TestGorilla / Coderbyte / HackerEarth / DevSkiller / iMocha** — MCQ-стиль «AI fluency» тестов, output-grading, или фокус на проктроринге. Не в process-eval.
- **HireVue / Apriora (Alex)** — *AI как интервьюер*, не *оценщик AI-навыков кандидата*. Другая категория.
- **Mercor** — поднял $350 млн при оценке $10B в октябре 2025 ([TechCrunch](https://techcrunch.com/2025/10/27/mercor-quintuples-valuation-to-10b-with-350m-series-c/)), но **пивотнулся от candidate-ассессмента** к marketplace для AI-training labeling. Сигнал, что деньги идут в «AI-meets-labor» соседние ниши, но и предостерегающая история для чистых AI-hiring плеев.

### 9.3 Российский рынок

- **«Виртуальный рекрутер» hh.ru** — оценка 1–10 AI на отклик, лемматизированный матчинг, 2–3-предложенческое summary ([hh.ru kb](https://feedback.hh.ru/knowledge-base/article/9913)). **Это то, что каждая HR-команда РФ уже видит** — мы продаём поверх этого, с другим сигналом (process vs. резюме-матч).
- **Skillaz, Поток, Хантфлоу** — AI на стороне воронки (résumé scoring, outreach automation, ATS). **Никто не оценщик процессных навыков.**
- **StartExam** — 5М+ тестов/год, традиционная оценка + AI-проктроринг + детекция читерства. Кандидат на приобретение / партнёрство, не прямой конкурент.
- **Вывод:** В РФ нет конкурента на оси AI-collaboration-process. Рынок большой (43% AI-adoption в HR), местные инкумбенты — funnel-automation. **РФ + on-prem действительно защищаем.**

### 9.4 Где КейсПодбор выигрывает там, где реальные угрозы — нет

1. **OPSEC honeypot** — ни у кого больше нет. Самая защищаемая фича в одиночку; продаёт себя в регулируемых отраслях.
2. **Специализация на junior-tier** — Karat/HackerRank/Codility сидят на mid/senior. У нас размер кейсов, веса рубрик и цены настроены под объём junior-найма.
3. **Async + automated** — не нужен человек-интервьюер (узкое место Karat). 80 кандидатов → 80 сессий → 80 scored карточек.
4. **Per-position генерация кейсов** — каждая позиция получает кейс, привязанный к её реальной самой частой junior-задаче. Конкуренты крутят библиотечные вопросы. Наши кейсы ощущаются как реальная работа, потому что это и есть форма реальной работы.
5. **Опция RU on-prem** — ни у одного из западных AI-process игроков нет российского присутствия и data-locality story.

---

## 10. Продукт построен на тезисе, который рынок уже валидирует

Самая надёжная валидация — это не мы заявляем, что категория реальна. А когда инкумбенты публично признают, что их модель сломалась:

> «The challenge is not just detecting AI-assisted cheating, but determining when AI assistance should be considered legitimate.»
> *«Задача — не просто детектить AI-читерство, а определять, когда AI-помощь должна считаться легитимной.»*
> — *HackerRank, [Designing AI-Integrated Coding Assessments, гайд 2025](https://www.hackerrank.com/writing/designing-ai-integrated-coding-assessments-real-world-work-2025-guide)*

Когда доминирующий инкумбент перестраивает свой собственный продукт вокруг оценки AI-коллаборации, категория уже сложилась. Открытый вопрос — **кто построит правильную её форму**.

---

## 11. Юнит-экономика

### Себестоимость сессии
Живая сессия = контейнер (кодбейз + БД + mocks) + LLM-токены для AI Buddy + токены для авто-скоринга.

- Compute контейнера (30 мин, snapshot-restore БД): ~$0,15
- AI Buddy LLM (~30 мин, mid-tier модель): $0,50–2,00
- Канал внешнего LLM (используется или нет, ~30 мин, low-tier): $0,20–0,50
- Скоринг / генерация replay: $0,10–0,30
- **All-in на завершённую сессию: ~$1–3.**

### Тарифы (рефреш старого деки под per-session реальность)

| Тариф | Цель | Цена | Лимит | Маржа |
|---|---|---|---|---|
| **Pilot** | Первое касание, 1 позиция | 15 000₽ | 100 кандидатов | ~$1,50/сессия @ 100 сессий ≈ 70% gross |
| **Team** | 5 позиций/мес | 49 000₽/мес | 1 000 кандидатов/мес | ~$0,50/сессия paid; нужна compute-оптимизация → 50–60% gross на высокой утилизации |
| **Growth** | 20 позиций/мес + аналитика | 149 000₽/мес | 4 000 кандидатов/мес | ~$0,40/сессия paid; та же compute-оптимизация |
| **Enterprise** | Кастом, доступен on-prem | от 400 000₽/год | Кастом | Стандартный enterprise gross 75–85% |

**Критично:** Per-completed-session тарификация с rate-limits — не предмет торга. Per-seat SaaS не работает против переменного compute-кост. Тарифные лимиты защищают downside.

### Сравнительная ценность
Стоимость одного плохого junior-найма по полу SHRM 100% replacement на зарплате 1,5 млн₽ = **1,5 млн₽**. Тариф Team КейсПодбор на год = **588 000₽**. **Один предотвращённый плохой найм окупает платформу на >2 года.**

---

## 12. Риски (без размывания)

| Риск | Реальность | Ответ |
|---|---|---|
| **Karat NextGen вертикально интегрируется и демпингует** | Реален. Karat поднял $248 млн и купил Byteboard. | Async-automated + junior-tier + RU структурно быстрее и дешевле за сессию. Не лезем на senior eng в FAANG-окрестностях. |
| **Process eval быстро коммодитизируется** | Уже происходит (HackerRank, Codility, CoderPad — у всех какая-то версия). | OPSEC honeypot + per-position генерация — не коммодити. На них и опираемся. |
| **Качество синтетического окружения — длинный шест** | Если synthetic-кодбейзы ощущаются как CS-домашка, весь pitch разваливается. | Делаем 1–2 шаблона на production-grade уровне, а не 15 поверхностных. Качество > ширина на v1. |
| **Себестоимость сессии растёт с использованием** | LLM-токены для Buddy compound-ятся. | Дешевле модель для Buddy (Haiku-уровень); более сильная — только для скоринг-прохода. Pre-warm пул + snapshot/restore. |
| **Регуляторика: Mobley v. Workday может каскадить** | Реален — первый крупный AI-hiring class-action пошёл вперёд в мае 2025 ([Bloomberg Law](https://news.bloomberglaw.com/litigation/workday-ai-bias-suit-to-go-forward-as-age-claim-class-action)). NYC AEDT, EU AI Act, Illinois AI Video. | Process eval — это *не* автоматизированное решение. Это decision-support. Session replay = полный доказательный след. Защищать легче, чем résumé-screening AI. |
| **Кандидатская рамка — звучит как «слежка»** | Реален, если плохо запаковать. «Всё логируется» — плохо садится. | Подаём как **portfolio artifact**: кандидат сохраняет replay + матрицу; прикрепляет к будущим откликам. Он что-то строит, а не за ним наблюдают. |

---

## 13. Roadmap — и финальная панчлайн

Та же инфраструктура, которая оценивает джунов-людей, оценивает AI-агентов. **Субстрат идентичен.**

| Бит | Горизонт | Что говорит |
|---|---|---|
| **Сейчас (v1)** | Пилот, 10 компаний, один шаблон (B2B SaaS backend или data analyst), один industry-оверлей | Мы сфокусированы. Мы шипим. |
| **+6 месяцев** | Больше ролей, больше отраслей, Tier-2 generative shape-match для тех, кто хочет глубже учитывать специфику компании | Клин расширяется внутри найма. |
| **+12 месяцев** | Режим оценки AI-агентов — то же окружение, та же рубрика, агент в кресле | Мы перестали быть HR-инструментом. |
| **Long-term** | Субстрат для оценки intelligence at work, кто бы её ни делал | Мы — категория. |

Агент-eval экспансия — не натяжка. Это структурное следствие того, как мы построили v1. **Goldman Sachs деплоит «сотни, идущие в тысячи Devin-ов»** рядом со своими 12 000 разработчиков-людей — по словам CTO Marco Argenti ([CNBC, июль 2025](https://www.cnbc.com/2025/07/11/goldman-sachs-autonomous-coder-pilot-marks-major-ai-milestone.html)). **Cursor сообщает о 64% adoption в Fortune 500, 100M+ строк enterprise-кода в день** ([cursor.com/enterprise](https://cursor.com/enterprise)). У procurement-команд нет apples-to-apples способа оценить, какой агент работает в их кодбейзе — этот gap есть *прямо сейчас*, и растёт быстрее, чем HR Tech.

Стратегическая дисциплина: **v1 остаётся только junior-наймом.** Agent eval — это позиционирующая рамка и финальный бит scroll-narrative, не v1-фича.

**Сплит-скрин-сцена, которая закрывает pitch:** сессия джуна-человека слева, сессия Claude Code справа, **тот же кейс, та же process matrix заполняется для обоих.** Overlay: *«You'll need to compare them. We're already built for it.»*

Это и есть момент, в который член студийной комиссии перестаёт думать «ещё один HR Tech проект» и начинает думать «эта команда видит следующее десятилетие».

---

## 14. Приложение источников

### Рынок и adoption
- [Smart Ranking — RU HR Tech 2024 (99,3 млрд₽, +38%)](https://smartranking.ru/ru/analytics/hrtech/hrtech-rynok-v-rossii-vyros-na-38/)
- [Smart Ranking — H1 2025 (40,6 млрд₽, +12%)](https://smartranking.ru/ru/analytics/hrtech/v-i-polugodii-2025-goda-rynok-hrtech-vyros-na-12-do-406-mlrd-rublej-odnako-tempy-rosta-ostayutsya/)
- [Forbes Russia — HR Tech 2024 прогноз](https://www.forbes.ru/tekhnologii/528584-kadry-menaut-sotnu-ob-em-rynka-hr-tech-v-2024-godu-dostignet-100-mlrd-rublej)
- [Mordor Intelligence — Global HR Tech](https://www.mordorintelligence.com/industry-reports/hr-tech-market)
- [Straits Research — AI Recruitment](https://straitsresearch.com/report/ai-recruitment-market)
- [Izvestia — 43% RU компаний используют AI в HR](https://en.iz.ru/en/1863778/2025-04-02/russian-companies-have-started-using-ai-employee-recruitment)
- [SHRM 2025 Benchmarking ($5 475 cost-per-hire)](https://www.shrm.org/about/press-room/shrm-releases-2025-benchmarking-reports--how-does-your-organizat)
- [SHRM — стоимость замены плохого найма](https://www.shrm.org/topics-tools/news/employee-relations/cost-bad-hire-can-astronomical)
- [HR Dive — Tech time-to-hire](https://www.hrdive.com/news/time-to-hire-for-tech-roles-can-reach-45-days/573554/)
- [SignalFire State of Talent 2025](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2025)
- [IEEE Spectrum — AI и entry-level expectations](https://spectrum.ieee.org/ai-effect-entry-level-jobs)

### Productivity-исследования
- [METR RCT — 19% замедление (июль 2025)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) + [arXiv](https://arxiv.org/abs/2507.09089) + [Feb 2026 update](https://metr.org/blog/2026-02-24-uplift-update/)
- [Stack Overflow 2024 Survey — AI](https://survey.stackoverflow.co/2024/ai)
- [Google DORA 2024](https://dora.dev/research/2024/dora-report/) и [DORA 2025 AI-assisted](https://dora.dev/dora-report-2025/)
- [ACM — Measuring GitHub Copilot productivity](https://cacm.acm.org/research/measuring-github-copilots-impact-on-productivity/)
- [MIT Media Lab — Your Brain on ChatGPT](https://arxiv.org/abs/2506.08872)
- [Addy Osmani — The 70% Problem](https://addyosmani.com/blog/next-two-years/)

### OPSEC / утечки
- [Bloomberg — Samsung запрет ChatGPT (май 2023)](https://www.bloomberg.com/news/articles/2023-05-02/samsung-bans-chatgpt-and-other-generative-ai-use-by-staff-after-leak)
- [Fortune — Apple/JPMorgan/Goldman/Verizon ограничения](https://fortune.com/2023/05/19/chatgpt-banned-workplace-apple-goldman-risk-privacy/)
- [Cyberhaven — 11% sensitive pastes (1,6М сотрудников)](https://www.cyberhaven.com/blog/4-2-of-workers-have-pasted-company-data-into-chatgpt)
- [Microsoft Work Trend Index 2024 — 75% BYOAI](https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part)

### Сдвиг в hiring criteria
- [CNBC — Shopify AI mandate](https://www.cnbc.com/2025/04/07/shopify-ceo-prove-ai-cant-do-jobs-before-asking-for-more-headcount.html)
- [TechCrunch — Coinbase увольняет не-AI инженеров](https://techcrunch.com/2025/08/22/coinbase-ceo-explains-why-he-fired-engineers-who-didnt-try-ai-immediately/)
- [interviewing.io — 0/32 detection](https://interviewing.io/blog/how-hard-is-it-to-cheat-with-chatgpt-in-technical-interviews)
- [HackerRank 2025 Developer Skills Report — 97% AI use](https://www.hackerrank.com/reports/developer-skills-report-2025)
- [HackerRank 2025 guide — process eval pivot](https://www.hackerrank.com/writing/designing-ai-integrated-coding-assessments-real-world-work-2025-guide)
- [Vibe coding — Wikipedia](https://en.wikipedia.org/wiki/Vibe_coding)

### Конкурентный ландшафт
- [Codility — Cody assistant blog](https://www.codility.com/blog/codility-debuts-assessment-of-ai-assisted-engineering-skills/)
- [CoderPad — AI-enabled hiring](https://coderpad.io/use-case/ai-enabled-hiring/) + [Meta pilot coverage](https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples)
- [Karat NextGen launch (декабрь 2025)](https://karat.com/nextgen/) + [BusinessWire](https://www.businesswire.com/news/home/20251210685922/en/Karat-Launches-NextGen-Interviews-The-First-Human-Led-AI-Enabled-Talent-Evaluation-Solution)
- [CodeSignal Cosmo](https://support.codesignal.com/hc/en-us/articles/16957386089879-Evaluate-test-takers-AI-skills-with-Cosmo)
- [TestGorilla AI Fluency](https://www.testgorilla.com/ai-fluency/)
- [Mercor pivot — TechCrunch](https://techcrunch.com/2025/10/27/mercor-quintuples-valuation-to-10b-with-350m-series-c/)
- [hh.ru Виртуальный рекрутер](https://feedback.hh.ru/knowledge-base/article/9913)
- [TAdviser — российский HR-tech рынок](https://tadviser.com/index.php/Article:Russian_HR-tech_market)

### Агенты / roadmap
- [CNBC — Goldman деплоит тысячи Devin-ов](https://www.cnbc.com/2025/07/11/goldman-sachs-autonomous-coder-pilot-marks-major-ai-milestone.html)
- [Cursor Enterprise — 64% Fortune 500](https://cursor.com/enterprise)
- [Cognition — Devin / SWE-bench](https://cognition.ai/blog/swe-bench-technical-report)
- [Braintrust Series B ($80 млн, февраль 2026)](https://www.braintrust.dev/blog/announcing-series-b)
- [LangChain Series B ($125 млн, октябрь 2025)](https://www.langchain.com/blog/series-b)
- [Galileo Series B](https://www.prnewswire.com/news-releases/galileo-raises-45m-series-b-funding-to-bring-evaluation-intelligence-to-generative-ai-teams-everywhere-302276383.html)

### Регуляторика / литигация
- [EEOC v. iTutorGroup settlement (2023)](https://www.eeoc.gov/newsroom/itutorgroup-pay-365000-settle-eeoc-discriminatory-hiring-suit)
- [Mobley v. Workday class-action proceeds (май 2025)](https://news.bloomberglaw.com/litigation/workday-ai-bias-suit-to-go-forward-as-age-claim-class-action)
- [HR Dive — HireVue/Intuit complaints](https://www.hrdive.com/news/ai-intuit-hirevue-deaf-indigenous-employee-discrimination-aclu/743273/)
