// Единый источник данных сайта «Дента Плюс».
// Тот же файл используется как источник данных для CRM (проект 6): врачи, услуги, цены, графики.
// Формат графика: schedule[день недели] = [[начало, конец], ...]; 0 = воскресенье, 1 = понедельник ... 6 = суббота.
// Нет ключа дня = врач не работает. Несколько диапазонов = смена с перерывом.

export const clinic = {
  name: 'Дента Плюс',
  founded: 2014,
  address: 'г. Минск, ул. Притыцкого, 62, 2 этаж',
  addressShort: 'ул. Притыцкого, 62',
  phones: ['+375 (29) 314-27-60', '+375 (17) 215-48-30'],
  email: 'info@nkorshun-dental.netlify.app',
  hours: [
    { days: 'Пн–Пт', time: '09:00–21:00' },
    { days: 'Сб', time: '09:00–18:00' },
    { days: 'Вс', time: 'выходной' },
  ],
  // часы работы по дням недели, для JSON-LD и проверок
  openingHours: { 1: ['09:00', '21:00'], 2: ['09:00', '21:00'], 3: ['09:00', '21:00'], 4: ['09:00', '21:00'], 5: ['09:00', '21:00'], 6: ['09:00', '18:00'] },
  metro: 'От станции метро «Петровщина» — 8 минут пешком, выход к ТЦ, дальше прямо по улице Притыцкого.',
  parking: 'Бесплатная парковка во дворе, 12 мест. Шлагбаум открывается по звонку на ресепшен.',
  coords: { lat: 53.9061, lon: 27.4343 },
  license: 'Лицензия Министерства здравоохранения Республики Беларусь № 02040/1234567 от 12.05.2021',
  legal: 'ООО «Дента Плюс», УНП 193456789',
  rating: { value: '4,9', source: 'Яндекс Картах', count: 386 },
  telegram: 'https://t.me/denta_plus_demo',
};

export const categories = [
  { id: 'therapy', name: 'Терапия', description: 'Лечение кариеса и каналов, реставрация, снимки', icon: 'tooth' },
  { id: 'implant', name: 'Имплантация и протезирование', description: 'Импланты, коронки, виниры, протезы', icon: 'implant' },
  { id: 'ortho', name: 'Ортодонтия', description: 'Брекеты, элайнеры, ретейнеры', icon: 'braces' },
  { id: 'hygiene', name: 'Гигиена и отбеливание', description: 'Чистка, фторирование, отбеливание', icon: 'sparkle' },
  { id: 'kids', name: 'Детская стоматология', description: 'Лечение и профилактика с 3 лет', icon: 'kid' },
  { id: 'surgery', name: 'Хирургия', description: 'Удаление, пластика, костная ткань', icon: 'surgery' },
];

// doctors — id врачей, которые выполняют услугу.
// from: true — цена указана «от». qty: true — услуга штучная (можно выбрать количество в калькуляторе).
// visits — сколько визитов обычно занимает услуга (для калькулятора).
export const services = [
  // Терапия
  { id: 'consult', category: 'therapy', name: 'Первичная консультация стоматолога', price: 18, from: false, duration: 30, visits: 1, qty: false, doctors: ['d1', 'd2', 'd3', 'd5', 'd8', 'd9'] },
  { id: 'xray-point', category: 'therapy', name: 'Прицельный снимок зуба', price: 12, from: false, duration: 30, visits: 0, qty: true, doctors: ['d1', 'd2', 'd5', 'd7', 'd9'] },
  { id: 'xray-pano', category: 'therapy', name: 'Панорамный снимок (ОПТГ)', price: 28, from: false, duration: 30, visits: 0, qty: false, doctors: ['d1', 'd2', 'd3', 'd5', 'd7', 'd8', 'd9'] },
  { id: 'caries', category: 'therapy', name: 'Лечение кариеса', price: 94, from: true, duration: 60, visits: 1, qty: true, doctors: ['d2', 'd5', 'd9'] },
  { id: 'caries-deep', category: 'therapy', name: 'Лечение глубокого кариеса', price: 128, from: true, duration: 90, visits: 1, qty: true, doctors: ['d2', 'd5', 'd9'] },
  { id: 'canal-1', category: 'therapy', name: 'Лечение пульпита, однокорневой зуб', price: 168, from: true, duration: 90, visits: 2, qty: true, doctors: ['d2', 'd9'] },
  { id: 'canal-multi', category: 'therapy', name: 'Лечение пульпита, многокорневой зуб', price: 245, from: true, duration: 120, visits: 2, qty: true, doctors: ['d2', 'd9'] },
  { id: 'canal-redo', category: 'therapy', name: 'Перелечивание корневого канала', price: 210, from: true, duration: 120, visits: 2, qty: true, doctors: ['d2'] },
  { id: 'restore-front', category: 'therapy', name: 'Реставрация переднего зуба', price: 164, from: true, duration: 90, visits: 1, qty: true, doctors: ['d2', 'd5', 'd9'] },

  // Имплантация и протезирование
  { id: 'implant-osstem', category: 'implant', name: 'Имплант Osstem с установкой', price: 1240, from: true, duration: 90, visits: 2, qty: true, doctors: ['d1'] },
  { id: 'implant-straumann', category: 'implant', name: 'Имплант Straumann с установкой', price: 2380, from: true, duration: 90, visits: 2, qty: true, doctors: ['d1'] },
  { id: 'gum-former', category: 'implant', name: 'Формирователь десны', price: 96, from: false, duration: 30, visits: 1, qty: true, doctors: ['d1'] },
  { id: 'crown-metal', category: 'implant', name: 'Коронка металлокерамическая', price: 286, from: true, duration: 60, visits: 2, qty: true, doctors: ['d8'] },
  { id: 'crown-zirconia', category: 'implant', name: 'Коронка из диоксида циркония', price: 560, from: true, duration: 60, visits: 2, qty: true, doctors: ['d8'] },
  { id: 'veneer', category: 'implant', name: 'Керамический винир', price: 690, from: true, duration: 90, visits: 2, qty: true, doctors: ['d8'] },
  { id: 'denture', category: 'implant', name: 'Съёмный протез (одна челюсть)', price: 780, from: true, duration: 60, visits: 4, qty: false, doctors: ['d8'] },

  // Ортодонтия
  { id: 'ortho-consult', category: 'ortho', name: 'Консультация ортодонта с планом лечения', price: 25, from: false, duration: 30, visits: 1, qty: false, doctors: ['d3'] },
  { id: 'braces-metal', category: 'ortho', name: 'Металлические брекеты (две челюсти)', price: 1870, from: true, duration: 90, visits: 12, qty: false, doctors: ['d3'] },
  { id: 'braces-ceramic', category: 'ortho', name: 'Керамические брекеты (две челюсти)', price: 2650, from: true, duration: 90, visits: 12, qty: false, doctors: ['d3'] },
  { id: 'aligners', category: 'ortho', name: 'Элайнеры (курс лечения)', price: 4200, from: true, duration: 60, visits: 8, qty: false, doctors: ['d3'] },
  { id: 'retainer', category: 'ortho', name: 'Ретейнер, одна челюсть', price: 190, from: false, duration: 30, visits: 1, qty: true, doctors: ['d3'] },
  { id: 'braces-adjust', category: 'ortho', name: 'Активация брекет-системы', price: 55, from: false, duration: 30, visits: 1, qty: false, doctors: ['d3'] },

  // Гигиена и отбеливание
  { id: 'hygiene', category: 'hygiene', name: 'Профессиональная гигиена (Air Flow и ультразвук)', price: 115, from: false, duration: 60, visits: 1, qty: false, doctors: ['d6'] },
  { id: 'whitening', category: 'hygiene', name: 'Отбеливание зубов', price: 340, from: false, duration: 90, visits: 1, qty: false, doctors: ['d6', 'd9'] },
  { id: 'fluoride', category: 'hygiene', name: 'Глубокое фторирование', price: 48, from: false, duration: 30, visits: 1, qty: false, doctors: ['d6'] },

  // Детская стоматология
  { id: 'kids-consult', category: 'kids', name: 'Консультация детского стоматолога', price: 15, from: false, duration: 30, visits: 1, qty: false, doctors: ['d4'] },
  { id: 'kids-caries', category: 'kids', name: 'Лечение молочного зуба', price: 78, from: true, duration: 60, visits: 1, qty: true, doctors: ['d4'] },
  { id: 'kids-seal', category: 'kids', name: 'Герметизация фиссур, один зуб', price: 42, from: false, duration: 30, visits: 1, qty: true, doctors: ['d4'] },
  { id: 'kids-hygiene', category: 'kids', name: 'Профессиональная гигиена для детей', price: 69, from: false, duration: 60, visits: 1, qty: false, doctors: ['d4'] },

  // Хирургия
  { id: 'extract-simple', category: 'surgery', name: 'Удаление зуба, простое', price: 64, from: true, duration: 30, visits: 1, qty: true, doctors: ['d1', 'd7'] },
  { id: 'extract-complex', category: 'surgery', name: 'Удаление сложное, зуб мудрости', price: 148, from: true, duration: 60, visits: 1, qty: true, doctors: ['d1', 'd7'] },
  { id: 'frenum', category: 'surgery', name: 'Пластика уздечки', price: 132, from: false, duration: 60, visits: 1, qty: false, doctors: ['d7'] },
  { id: 'sinus-lift', category: 'surgery', name: 'Синус-лифтинг', price: 980, from: true, duration: 120, visits: 1, qty: false, doctors: ['d1'] },
  { id: 'bone-graft', category: 'surgery', name: 'Костная пластика', price: 620, from: true, duration: 90, visits: 1, qty: false, doctors: ['d1', 'd7'] },
];

const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=480&h=560&q=75`;
const WEEK_1_5 = [1, 2, 3, 4, 5];
const sched = (days, ...ranges) => Object.fromEntries(days.map((d) => [d, ranges]));

const doctorsBase = [
  {
    id: 'd1', name: 'Козлов Андрей Викторович', specialty: 'Хирург-имплантолог', specialtyId: 'surgery', chief: true, experience: 19,
    education: ['БГМУ, стоматологический факультет, 2005', 'Ординатура по челюстно-лицевой хирургии, 2007'],
    courses: ['Straumann: протоколы немедленной имплантации, Цюрих, 2019', 'Синус-лифтинг и костная пластика, Москва, 2022', 'Цифровое планирование имплантации, Вена, 2024'],
    about: 'Главный врач клиники. Ставит импланты с 2008 года, перед операцией показывает план на 3D-снимке.',
    photo: photo('1612349317150-e413f6a5b16d'),
    schedule: { ...sched([1, 3, 5], ['09:00', '18:00']) },
  },
  {
    id: 'd2', name: 'Мельник Ирина Сергеевна', specialty: 'Стоматолог-терапевт', specialtyId: 'therapy', chief: false, experience: 12,
    education: ['ВГМУ, стоматологический факультет, 2012', 'Интернатура по терапевтической стоматологии, 2013'],
    courses: ['Эндодонтия под микроскопом, Минск, 2018', 'Художественная реставрация, Санкт-Петербург, 2021', 'Перелечивание каналов, Минск, 2023'],
    about: 'Лечит каналы под микроскопом. Принимает пациентов, которые боятся боли: обезболивает заранее и предупреждает о каждом шаге.',
    photo: photo('1559839734-2b71ea197ec2'),
    schedule: sched(WEEK_1_5, ['09:00', '18:00']),
  },
  {
    id: 'd3', name: 'Савицкий Дмитрий Олегович', specialty: 'Ортодонт', specialtyId: 'ortho', chief: false, experience: 12,
    education: ['ГрГМУ, стоматологический факультет, 2012', 'Ординатура по ортодонтии, БГМУ, 2014'],
    courses: ['Лингвальные брекеты, Мадрид, 2017', 'Элайнеры: планирование движения зубов, Варшава, 2020', 'Ортодонтия у взрослых, Минск, 2023'],
    about: 'Ведёт взрослых и подростков. План лечения со сроками и стоимостью выдаёт на руки в день консультации.',
    photo: photo('1622253692010-333f2da6031d'),
    schedule: { 2: [['12:00', '20:00']], 4: [['12:00', '20:00']], 6: [['10:00', '15:00']] },
  },
  {
    id: 'd4', name: 'Жукова Елена Павловна', specialty: 'Детский стоматолог', specialtyId: 'kids', chief: false, experience: 12,
    education: ['БГМУ, стоматологический факультет, 2012', 'Интернатура по детской стоматологии, 2013'],
    courses: ['Лечение детей без страха, Минск, 2016', 'Седация закисью азота, Киев, 2019', 'Профилактика кариеса у детей, Минск, 2024'],
    about: 'Работает с детьми от трёх лет. Первый визит — знакомство с кабинетом без лечения, если ребёнок волнуется.',
    photo: photo('1594824476967-48c8b964273f'),
    schedule: sched([1, 2, 3, 4, 5, 6], ['09:00', '15:00']),
  },
  {
    id: 'd5', name: 'Ковальчук Артём Игоревич', specialty: 'Стоматолог-терапевт', specialtyId: 'therapy', chief: false, experience: 3,
    education: ['БГМУ, стоматологический факультет, 2021', 'Интернатура по терапевтической стоматологии, 2022'],
    courses: ['Современные пломбировочные материалы, Минск, 2023', 'Лечение кариеса под коффердамом, Минск, 2024'],
    about: 'Лечит кариес и ставит реставрации. Сложные случаи показывает старшим коллегам на консилиуме.',
    photo: photo('1537368910025-700350fe46c7'),
    schedule: sched([1, 3, 5], ['09:00', '19:00']),
  },
  {
    id: 'd6', name: 'Рудь Наталья Анатольевна', specialty: 'Гигиенист', specialtyId: 'hygiene', chief: false, experience: 7,
    education: ['Минский государственный медицинский колледж, 2016', 'БГМУ, курс «Пародонтология и гигиена», 2018'],
    courses: ['Air Flow Master: протокол чистки, Минск, 2019', 'Гигиена при ортодонтическом лечении, Минск, 2022'],
    about: 'Работает по сменам: утром по понедельникам, средам и пятницам, вечером по вторникам и четвергам.',
    photo: photo('1666214280557-f1b5022eb634'),
    schedule: { 1: [['09:00', '14:00']], 2: [['15:00', '21:00']], 3: [['09:00', '14:00']], 4: [['15:00', '21:00']], 5: [['09:00', '14:00']], 6: [['10:00', '15:00']] },
  },
  {
    id: 'd7', name: 'Лавренов Павел Николаевич', specialty: 'Хирург-стоматолог', specialtyId: 'surgery', chief: false, experience: 12,
    education: ['ВГМУ, стоматологический факультет, 2012', 'Ординатура по хирургической стоматологии, 2014'],
    courses: ['Атравматичное удаление зубов, Минск, 2017', 'Работа с мягкими тканями, Гданьск, 2021'],
    about: 'Удаляет зубы мудрости и делает пластику уздечек. Принимает три дня в неделю.',
    photo: photo('1582750433449-648ed127bb54'),
    schedule: { 2: [['10:00', '18:00']], 4: [['10:00', '18:00']], 6: [['10:00', '14:00']] },
  },
  {
    id: 'd8', name: 'Тарасевич Виктор Леонидович', specialty: 'Стоматолог-ортопед', specialtyId: 'implant', chief: false, experience: 19,
    education: ['БГМУ, стоматологический факультет, 2005', 'Клиническая ординатура по ортопедической стоматологии, 2007'],
    courses: ['Цифровое протезирование, Минск, 2018', 'Керамические виниры, Берлин, 2020', 'Коронки на имплантах, Минск, 2023'],
    about: 'Делает коронки, виниры и протезы. Перед работой показывает цвет и форму на пробной модели.',
    photo: photo('1607990281513-2c110a25bd8c'),
    schedule: sched(WEEK_1_5, ['10:00', '19:00']),
  },
  {
    id: 'd9', name: 'Шевцова Анна Дмитриевна', specialty: 'Стоматолог-терапевт', specialtyId: 'therapy', chief: false, experience: 7,
    education: ['ГрГМУ, стоматологический факультет, 2016', 'Интернатура по терапевтической стоматологии, 2017'],
    courses: ['Реставрация передних зубов, Минск, 2019', 'Отбеливание зубов: показания и ограничения, Минск, 2022'],
    about: 'Лечит зубы и делает отбеливание. Принимает со вторника по субботу.',
    photo: photo('1527613426441-4da17471b66d'),
    schedule: sched([2, 3, 4, 5, 6], ['10:00', '18:00']),
  },
];

// Услуги врача выводятся из services[].doctors, чтобы данные не расходились.
export const doctors = doctorsBase.map((d) => ({
  ...d,
  services: services.filter((s) => s.doctors.includes(d.id)).map((s) => s.id),
}));

export const reviews = [
  { id: 'r1', name: 'Светлана К.', rating: 5, date: '2026-10-14', doctorId: 'd2', text: 'Боялась идти лет пять. Ирина Сергеевна сначала просто показала, как всё будет, потом вылечила два зуба. Ничего не почувствовала. Записалась на повторный осмотр.' },
  { id: 'r2', name: 'Алексей Д.', rating: 5, date: '2026-10-02', doctorId: 'd1', text: 'Ставил имплант у Андрея Викторовича. Перед операцией показал снимок и объяснил, почему выбрал именно этот размер. Через неделю шов сняли, отёка почти не было.' },
  { id: 'r3', name: 'Марина П.', rating: 5, date: '2026-09-21', doctorId: 'd4', text: 'Сыну пять лет, до этого плакал уже в коридоре любой клиники. У Елены Павловны на первом визите просто сидели в кресле и считали лампы. Через неделю вылечили зуб, сын сам попросил наклейку.' },
  { id: 'r4', name: 'Игорь Т.', rating: 4, date: '2026-09-09', doctorId: 'd3', text: 'Брекеты ставят аккуратно, цену назвали до начала и не поменяли. Минус один: в субботу пришлось ждать 20 минут после назначенного времени. Извинились, но осадок остался.' },
  { id: 'r5', name: 'Ольга В.', rating: 5, date: '2026-08-30', doctorId: 'd6', text: 'Профгигиена у Натальи, вечерняя смена, удобно после работы. Налёт на кофейных пятнах убрала полностью, дёсны потом не кровили.' },
  { id: 'r6', name: 'Дмитрий Н.', rating: 5, date: '2026-08-12', doctorId: 'd7', text: 'Удалили зуб мудрости за двадцать минут. Павел Николаевич написал, что можно есть и пить в первые сутки. Через три дня уже забыл, что что-то было.' },
  { id: 'r7', name: 'Татьяна Л.', rating: 5, date: '2026-07-25', doctorId: 'd8', text: 'Делала две циркониевые коронки у Виктора Леонидовича. Цвет подбирали при дневном свете у окна, а не под лампой. Сходство с моими зубами полное.', reply: 'Татьяна, спасибо за отзыв. Ждём вас на плановый осмотр через полгода. Коллектив «Дента Плюс».' },
  { id: 'r8', name: 'Евгений М.', rating: 5, date: '2026-07-03', doctorId: 'd5', text: 'Пришёл по записи с острой болью. Артём принял в тот же день, нашёл причину на снимке, вылечил за один визит. Цена совпала с прайсом на сайте.' },
];

export const faq = [
  { q: 'Это будет больно?', a: 'Лечение проходит под местной анестезией. Сначала врач наносит гель, потом делает укол тонкой иглой. Если вы боитесь, скажите об этом сразу: врач предупредит о каждом шаге и сделает паузу по вашему сигналу.' },
  { q: 'Сколько стоит консультация?', a: 'Первичная консультация стоматолога — 18 BYN, ортодонта — 25 BYN, детского стоматолога — 15 BYN. Если после консультации вы начинаете лечение у этого же врача в течение 14 дней, сумма консультации вычитается из счёта.' },
  { q: 'Можно ли лечить зубы в рассрочку?', a: 'Да. Рассрочка на 3 и 6 месяцев — без процентов, на 12 месяцев — с наценкой 7%. Она доступна, если сумма плана лечения от 300 BYN. Оформляется в клинике за 10 минут по паспорту.' },
  { q: 'Вы принимаете детей?', a: 'Да, с трёх лет. Детей принимает Елена Павловна Жукова. Для первого знакомства можно прийти без лечения: ребёнок посидит в кресле, а мы покажем инструменты.' },
  { q: 'Как подготовиться к визиту?', a: 'Почистите зубы перед приёмом. Возьмите паспорт и, если есть, прошлые снимки. Перед имплантацией и удалением зуба поешьте за 2–3 часа до визита. Подробные рекомендации пришлём в SMS или Telegram.' },
  { q: 'Что, если я опоздаю?', a: 'Опоздание до 15 минут: врач примет вас, но время приёма сократится. Если задерживаетесь дольше, позвоните: перенесём визит на ближайшее свободное окно без штрафов.' },
  { q: 'Есть ли парковка?', a: 'Да, во дворе здания 12 бесплатных мест для пациентов. При въезде позвоните на ресепшен: шлагбаум откроют. Если мест нет, рядом платная парковка на улице Притыцкого.' },
];

export const promos = [
  { id: 'p1', title: 'Профгигиена за 89 BYN', oldPrice: 115, newPrice: 89, text: 'Air Flow, ультразвук и полировка за 89 BYN вместо 115. Один раз на пациента.', until: '2026-11-30', untilText: 'до 30 ноября', serviceId: 'hygiene' },
  { id: 'p2', title: 'Консультация ортодонта бесплатно', oldPrice: 25, newPrice: 0, text: 'При записи на элайнеры или брекеты консультация с планом лечения бесплатна.', until: '2026-12-15', untilText: 'до 15 декабря', serviceId: 'ortho-consult' },
  { id: 'p3', title: 'Отбеливание 290 BYN', oldPrice: 340, newPrice: 290, text: 'Отбеливание зубов за 290 BYN вместо 340 при записи на профгигиену в один день.', until: '2026-12-31', untilText: 'до 31 декабря', serviceId: 'whitening' },
];

export const whyUs = [
  { title: 'План лечения письменно', text: 'После консультации вы получаете на руки список процедур, сроки и итоговую сумму. Цена в плане не меняется.' },
  { title: 'Лечение под микроскопом', text: 'Каналы и сложный кариес лечим с увеличением в 20 раз. Меньше повторных визитов.' },
  { title: 'Гарантия на пломбы 2 года', text: 'Если пломба выпала или откололась в течение двух лет, переделаем бесплатно.' },
  { title: 'Детский врач и игровая зона', text: 'Для детей отдельный кабинет и зона ожидания с книгами и конструктором.' },
];

export const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const getService = (id) => services.find((s) => s.id === id);
export const getDoctor = (id) => doctors.find((d) => d.id === id);
export const getCategory = (id) => categories.find((c) => c.id === id);
