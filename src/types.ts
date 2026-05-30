export type Fruit = {
  id: string;
  level: number;
  components?: number[]; // list of basic fruit levels inside this hybrid, e.g. [1, 5]
  name_ru?: string;
  emoji?: string;
  color?: string;
  baseValue?: number;
};

export type Cell = Fruit | null;

export type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel?: number;
};

export type FruitType = {
  level: number;
  name_ru: string;
  name_en: string;
  emoji: string;
  color: string;
  baseValue: number;
  buyCost: number;
};

// Base 24 fruits
const BASE_24_FRUITS: FruitType[] = [
  { level: 1, name_ru: "Вишня", name_en: "Cherry", emoji: "🍒", color: "from-red-400 to-red-500", baseValue: 5, buyCost: 15 },
  { level: 2, name_ru: "Клубника", name_en: "Strawberry", emoji: "🍓", color: "from-rose-400 to-rose-600", baseValue: 12, buyCost: 40 },
  { level: 3, name_ru: "Виноград", name_en: "Grape", emoji: "🍇", color: "from-purple-400 to-purple-650", baseValue: 28, buyCost: 100 },
  { level: 4, name_ru: "Лимон", name_en: "Lemon", emoji: "🍋", color: "from-yellow-400 to-yellow-500", baseValue: 60, buyCost: 250 },
  { level: 5, name_ru: "Апельсин", name_en: "Orange", emoji: "🍊", color: "from-orange-400 to-orange-500", baseValue: 130, buyCost: 600 },
  { level: 6, name_ru: "Яблоко", name_en: "Apple", emoji: "🍎", color: "from-red-500 to-red-700", baseValue: 280, buyCost: 1500 },
  { level: 7, name_ru: "Персик", name_en: "Peach", emoji: "🍑", color: "from-orange-300 to-red-400", baseValue: 600, buyCost: 3500 },
  { level: 8, name_ru: "Ананас", name_en: "Pineapple", emoji: "🍍", color: "from-yellow-500 to-yellow-700", baseValue: 1300, buyCost: 8000 },
  { level: 9, name_ru: "Арбуз", name_en: "Watermelon", emoji: "🍉", color: "from-green-500 to-green-700", baseValue: 2800, buyCost: 18000 },
  { level: 10, name_ru: "Драконий Фрукт", name_en: "Dragon Fruit", emoji: "🥑", color: "from-pink-500 to-rose-500", baseValue: 6000, buyCost: 40000 },
  { level: 11, name_ru: "Кокос", name_en: "Coconut", emoji: "🥥", color: "from-emerald-700 to-stone-500", baseValue: 13000, buyCost: 90000 },
  { level: 12, name_ru: "Звездный Фрукт", name_en: "Star Fruit", emoji: "⭐", color: "from-yellow-300 to-amber-500", baseValue: 28000, buyCost: 200000 },
  { level: 13, name_ru: "Банан", name_en: "Banana", emoji: "🍌", color: "from-yellow-300 to-yellow-400", baseValue: 60000, buyCost: 450000 },
  { level: 14, name_ru: "Груша", name_en: "Pear", emoji: "🍐", color: "from-green-400 to-yellow-500", baseValue: 130000, buyCost: 1000000 },
  { level: 15, name_ru: "Киви", name_en: "Kiwi", emoji: "🥝", color: "from-emerald-500 to-lime-600", baseValue: 280000, buyCost: 2200000 },
  { level: 16, name_ru: "Черника", name_en: "Blueberry", emoji: "🫐", color: "from-blue-500 to-indigo-600", baseValue: 600000, buyCost: 5000000 },
  { level: 17, name_ru: "Манго", name_en: "Mango", emoji: "🥭", color: "from-orange-500 to-red-500", baseValue: 1300000, buyCost: 12000000 },
  { level: 18, name_ru: "Дыня", name_en: "Melon", emoji: "🍈", color: "from-yellow-250 to-lime-500", baseValue: 2800000, buyCost: 28000000 },
  { level: 19, name_ru: "Оливка", name_en: "Olive", emoji: "🫒", color: "from-olive-600 to-green-800", baseValue: 6000000, buyCost: 65000000 },
  { level: 20, name_ru: "Чили-Перец", name_en: "Chili Pepper", emoji: "🌶️", color: "from-red-600 to-orange-700", baseValue: 13000000, buyCost: 150000000 },
  { level: 21, name_ru: "Шоколадный Плод", name_en: "Cacao Fruit", emoji: "🍫", color: "from-yellow-900 to-stone-900", baseValue: 28000000, buyCost: 350000000 },
  { level: 22, name_ru: "Карамельный Фрукт", name_en: "Candy Fruit", emoji: "🍭", color: "from-pink-400 to-purple-500", baseValue: 60000000, buyCost: 800000000 },
  { level: 23, name_ru: "Королевский Плод", name_en: "Royal Gold Fruit", emoji: "👑", color: "from-yellow-400 to-yellow-600", baseValue: 130000000, buyCost: 1800000000 },
  { level: 24, name_ru: "Кристалл Вечности", name_en: "Eternity Crystal", emoji: "💎", color: "from-cyan-400 to-blue-500", baseValue: 280000000, buyCost: 4500000000 },
];

const EXTRA_RAW_DATA = [
  // L25-L30: Hell 2
  { name_ru: "Вулканический Плод", name_en: "Volcano Fruit", emoji: "🌋", color: "from-red-700 to-amber-700", gender: "m", adj_m: "Вулканический", adj_f: "Вулканическая", adj_n: "Вулканическое", prefix: "Вулкано-" },
  { name_ru: "Лавовая Фига", name_en: "Lava Fig", emoji: "🫚", color: "from-amber-600 to-red-850", gender: "f", adj_m: "Лавовый", adj_f: "Лавовая", adj_n: "Лавовое", prefix: "Лаво-" },
  { name_ru: "Адская Клубника", name_en: "Hell Strawberry", emoji: "🦇", color: "from-red-900 to-purple-950", gender: "f", adj_m: "Адский", adj_f: "Адская", adj_n: "Адское", prefix: "Адо-" },
  { name_ru: "Обсидиановая Дыня", name_en: "Obsidian Melon", emoji: "🏺", color: "from-purple-900 to-stone-955", gender: "f", adj_m: "Обсидиановый", adj_f: "Обсидиановая", adj_n: "Обсидиановое", prefix: "Обсидиано-" },
  { name_ru: "Тлеющий Уголь", name_en: "Ember Fruit", emoji: "🔥", color: "from-amber-700 to-stone-900", gender: "m", adj_m: "Угольный", adj_f: "Угольная", adj_n: "Угольное", prefix: "Угольно-" },
  { name_ru: "Люцифер-Слива", name_en: "Lucifer Plum", emoji: "👺", color: "from-red-950 to-stone-950", gender: "f", adj_m: "Дьявольский", adj_f: "Дьявольская", adj_n: "Дьявольское", prefix: "Дьяво-" },
  
  // L31-L35: Heaven 1
  { name_ru: "Ангельское Яблоко", name_en: "Angel Apple", emoji: "👼", color: "from-sky-100 to-sky-300", gender: "n", adj_m: "Ангельский", adj_f: "Ангельская", adj_n: "Ангельское", prefix: "Ангело-" },
  { name_ru: "Святой Персик", name_en: "Saint Peach", emoji: "🍑", color: "from-orange-200 to-amber-300", gender: "m", adj_m: "Святой", adj_f: "Святая", adj_n: "Святое", prefix: "Свято-" },
  { name_ru: "Нектар Богов", name_en: "Divine Nectar", emoji: "🍯", color: "from-yellow-400 to-amber-550", gender: "m", adj_m: "Нектарный", adj_f: "Нектарная", adj_n: "Нектарное", prefix: "Нектаро-" },
  { name_ru: "Райская Дыня", name_en: "Paradise Melon", emoji: "🍈", color: "from-lime-200 to-cyan-300", gender: "f", adj_m: "Райский", adj_f: "Райская", adj_n: "Райское", prefix: "Райско-" },
  { name_ru: "Плод Эдема", name_en: "Eden Fruit", emoji: "🍇", color: "from-sky-300 to-indigo-400", gender: "m", adj_m: "Эдемский", adj_f: "Эдемская", adj_n: "Эдемское", prefix: "Эдемо-" },
  
  // L36-L40: Heaven 2
  { name_ru: "Херувимская Вишня", name_en: "Cherub Cherry", emoji: "🍒", color: "from-teal-300 to-cyan-200", gender: "f", adj_m: "Херувимский", adj_f: "Херувимская", adj_n: "Херувимское", prefix: "Херувимо-" },
  { name_ru: "Амброзия Полей", name_en: "Ambrosia Field", emoji: "🌾", color: "from-amber-200 to-yellow-500", gender: "f", adj_m: "Амброзийный", adj_f: "Амброзийная", adj_n: "Амброзийное", prefix: "Амбро-" },
  { name_ru: "Серафимский Гранат", name_en: "Seraphim Pomegranate", emoji: "🍎", color: "from-rose-400 to-cyan-100", gender: "m", adj_m: "Серафимский", adj_f: "Серафимская", adj_n: "Серафимское", prefix: "Серафимо-" },
  { name_ru: "Золотой Виноград", name_en: "Gold Grapes", emoji: "🍇", color: "from-yellow-300 to-yellow-500", gender: "m", adj_m: "Золотой", adj_f: "Золотая", adj_n: "Золотое", prefix: "Золото-" },
  { name_ru: "Нимбовый Лимон", name_en: "Halo Lemon", emoji: "🍋", color: "from-yellow-250 to-sky-300", gender: "m", adj_m: "Нимбовый", adj_f: "Нимбовая", adj_n: "Нимбовое", prefix: "Нимбо-" },

  // L41-L45: Common 3
  { name_ru: "Дикая Земляника", name_en: "Wild Strawberry", emoji: "🍓", color: "from-red-400 to-rose-500", gender: "f", adj_m: "Земляничный", adj_f: "Земляничная", adj_n: "Земляничное", prefix: "Землянично-" },
  { name_ru: "Таежная Малина", name_en: "Taiga Raspberry", emoji: "🫐", color: "from-rose-500 to-pink-650", gender: "f", adj_m: "Малиновый", adj_f: "Малиновая", adj_n: "Малиновое", prefix: "Малино-" },
  { name_ru: "Черная Смородина", name_en: "Black Currant", emoji: "🍇", color: "from-purple-800 to-neutral-900", gender: "f", adj_m: "Смородиновый", adj_f: "Смородинная", adj_n: "Смородинное", prefix: "Смородино-" },
  { name_ru: "Лесная Ежевика", name_en: "Forest Blackberry", emoji: "🫐", color: "from-blue-800 to-purple-800", gender: "f", adj_m: "Ежевичный", adj_f: "Ежевичная", adj_n: "Ежевичное", prefix: "Ежевично-" },
  { name_ru: "Садовый Крыжовник", name_en: "Garden Gooseberry", emoji: "🍏", color: "from-lime-400 to-green-600", gender: "m", adj_m: "Крыжовниковый", adj_f: "Крыжовниковая", adj_n: "Крыжовниковое", prefix: "Крыжовнико-" },

  // L46-L50: Big Fruits
  { name_ru: "Мега-Арбуз", name_en: "Mega Watermelon", emoji: "🍉", color: "from-emerald-500 to-emerald-800", gender: "m", adj_m: "Мега-арбузный", adj_f: "Мега-арбузная", adj_n: "Мега-арбузное", prefix: "Мегаарбузно-" },
  { name_ru: "Царь-Тыква", name_en: "Tsar Pumpkin", emoji: "🎃", color: "from-orange-500 to-red-650", gender: "f", adj_m: "Царь-тыквенный", adj_f: "Царь-тыквенная", adj_n: "Царь-тыквенное", prefix: "Царьтыквенно-" },
  { name_ru: "Императорский Ананас", name_en: "Imperial Pineapple", emoji: "🍍", color: "from-amber-400 to-yellow-600", gender: "m", adj_m: "Императорский", adj_f: "Императорская", adj_n: "Императорское", prefix: "Императорско-" },
  { name_ru: "Колосс-Лимон", name_en: "Colossus Lemon", emoji: "🍋", color: "from-yellow-350 to-orange-400", gender: "m", adj_m: "Колоссальный", adj_f: "Колоссальная", adj_n: "Колоссальное", prefix: "Колоссо-" },
  { name_ru: "Титан-Дыня", name_en: "Titan Melon", emoji: "🍈", color: "from-emerald-400 to-indigo-700", gender: "f", adj_m: "Титанический", adj_f: "Титаническая", adj_n: "Титаническое", prefix: "Титано-" },

  // L51-L55: Cosmic
  { name_ru: "Лесной Метеорит", name_en: "Forest Meteor", emoji: "☄️", color: "from-violet-850 to-stone-900", gender: "m", adj_m: "Метеоритный", adj_f: "Метеоритная", adj_n: "Метеоритное", prefix: "Метеорито-" },
  { name_ru: "Звездная Земляника", name_en: "Star Dew", emoji: "🌠", color: "from-teal-400 to-purple-600", gender: "f", adj_m: "Звездный", adj_f: "Звездная", adj_n: "Звездное", prefix: "Звездно-" },
  { name_ru: "Солнечный Апельсин", name_en: "Solar Orange", emoji: "☀️", color: "from-amber-400 to-red-650", gender: "m", adj_m: "Солнечный", adj_f: "Солнечная", adj_n: "Солнечное", prefix: "Солнечно-" },
  { name_ru: "Лунный Лимон", name_en: "Lunar Lemon", emoji: "🌙", color: "from-cyan-100 to-blue-550", gender: "m", adj_m: "Лунный", adj_f: "Лунная", adj_n: "Лунное", prefix: "Лунно-" },
  { name_ru: "Галактическая Слива", name_en: "Galactic Plum", emoji: "🌌", color: "from-indigo-600 to-violet-955", gender: "f", adj_m: "Галактический", adj_f: "Галактическая", adj_n: "Галактическое", prefix: "Галактико-" },

  // L56-L60: Quantum
  { name_ru: "Нано-Вишня", name_en: "Nano Cherry", emoji: "🔬", color: "from-teal-300 to-emerald-600", gender: "f", adj_m: "Нано", adj_f: "Нано", adj_n: "Нано", prefix: "Нано-" },
  { name_ru: "Атомное Яблоко", name_en: "Atomic Apple", emoji: "⚛️", color: "from-emerald-400 to-stone-900", gender: "n", adj_m: "Атомный", adj_f: "Атомная", adj_n: "Атомное", prefix: "Атомно-" },
  { name_ru: "Кварковый Банан", name_en: "Quark Banana", emoji: "🍌", color: "from-cyan-300 to-yellow-500", gender: "m", adj_m: "Кварковый", adj_f: "Кварковая", adj_n: "Кварковое", prefix: "Кварко-" },
  { name_ru: "Спин-Манго", name_en: "Spin Mango", emoji: "🥭", color: "from-purple-500 to-pink-500", gender: "n", adj_m: "Спиновый", adj_f: "Спиновая", adj_n: "Спиновое", prefix: "Спино-" },
  { name_ru: "Бозон-Киви", name_en: "Boson Kiwi", emoji: "🥝", color: "from-fuchsia-400 to-emerald-600", gender: "n", adj_m: "Бозонный", adj_f: "Бозонная", adj_n: "Бозонное", prefix: "Бозонно-" },

  // L61-L65: Multiverse
  { name_ru: "Портальный Нарцисс", name_en: "Portal Narcissus", emoji: "🌀", color: "from-indigo-500 to-sky-300", gender: "m", adj_m: "Портальный", adj_f: "Портальная", adj_n: "Портальное", prefix: "Портально-" },
  { name_ru: "Параллельный Персик", name_en: "Parallel Peach", emoji: "🍑", color: "from-amber-300 to-rose-405", gender: "m", adj_m: "Параллельный", adj_f: "Параллельная", adj_n: "Параллельное", prefix: "Параллельно-" },
  { name_ru: "Зеркальный Кокос", name_en: "Mirror Coconut", emoji: "🥥", color: "from-stone-300 to-cyan-400", gender: "m", adj_m: "Зеркальный", adj_f: "Зеркальная", adj_n: "Зеркальное", prefix: "Зеркально-" },
  { name_ru: "Холо-Черника", name_en: "Holo Blueberry", emoji: "🫐", color: "from-blue-400 via-teal-300 to-purple-500", gender: "f", adj_m: "Голографический", adj_f: "Голографическая", adj_n: "Голографическое", prefix: "Голо-" },
  { name_ru: "Временной Инжир", name_en: "Time Fig", emoji: "⏳", color: "from-amber-600 to-slate-800", gender: "m", adj_m: "Временной", adj_f: "Временная", adj_n: "Временное", prefix: "Времено-" },

  // L66-L70: Cyber
  { name_ru: "Кибер-Ананас", name_en: "Cyber Pineapple", emoji: "🍍", color: "from-cyan-400 to-purple-800", gender: "m", adj_m: "Кибер", adj_f: "Кибер", adj_n: "Кибер", prefix: "Кибер-" },
  { name_ru: "Неоновое Яблоко", name_en: "Neon Apple", emoji: "🍏", color: "from-lime-300 to-fuchsia-500", gender: "n", adj_m: "Неоновый", adj_f: "Неоновая", adj_n: "Неоновое", prefix: "Неоно-" },
  { name_ru: "Байт-Лимон", name_en: "Byte Lemon", emoji: "🍋", color: "from-yellow-300 to-stone-800", gender: "m", adj_m: "Байтового", adj_f: "Байтовая", adj_n: "Байтовое", prefix: "Байто-" },
  { name_ru: "Матричный Арбуз", name_en: "Matrix Watermelon", emoji: "🍉", color: "from-emerald-400 to-neutral-900", gender: "m", adj_m: "Матричный", adj_f: "Матричная", adj_n: "Матричное", prefix: "Матрично-" },
  { name_ru: "ДНК-Синтез Персик", name_en: "DNA Peach", emoji: "🍑", color: "from-purple-600 to-neutral-800", gender: "m", adj_m: "Синтетический", adj_f: "Синтетическая", adj_n: "Синтетическое", prefix: "Синтетико-" },

  // L71-L75: Ethereal
  { name_ru: "Эфирная Роза", name_en: "Ethereal Rose", emoji: "🌸", color: "from-pink-300 to-neutral-500", gender: "f", adj_m: "Эфирный", adj_f: "Эфирная", adj_n: "Эфирное", prefix: "Эфиро-" },
  { name_ru: "Астральный Лотос", name_en: "Astral Lotus", emoji: "🪷", color: "from-violet-400 to-teal-300", gender: "m", adj_m: "Астральный", adj_f: "Астральная", adj_n: "Астральное", prefix: "Астрально-" },
  { name_ru: "Призрачная Земляника", name_en: "Ghost Berry", emoji: "🍓", color: "from-sky-300 to-neutral-700", gender: "f", adj_m: "Призрачный", adj_f: "Призрачная", adj_n: "Призрачное", prefix: "Призрачно-" },
  { name_ru: "Духовный Манго", name_en: "Spirit Mango", emoji: "🥭", color: "from-yellow-400 to-violet-500", gender: "n", adj_m: "Духовный", adj_f: "Духовная", adj_n: "Духовное", prefix: "Духовно-" },
  { name_ru: "Ментальный Кокос", name_en: "Mental Coconut", emoji: "🥥", color: "from-fuchsia-300 to-sky-305", gender: "m", adj_m: "Ментальный", adj_f: "Ментальная", adj_n: "Ментальное", prefix: "Ментально-" },

  // L76-L80: Absolute
  { name_ru: "Хроно-Яблоко", name_en: "Chrono Apple", emoji: "🍎", color: "from-amber-500 to-purple-800", gender: "n", adj_m: "Абсолютный", adj_f: "Абсолютная", adj_n: "Абсолютное", prefix: "Абсолютно-" },
  { name_ru: "Сингулярный Абрикос", name_en: "Singularity Apricot", emoji: "🍑", color: "from-orange-400 to-neutral-900", gender: "m", adj_m: "Сингулярный", adj_f: "Сингулярная", adj_n: "Сингулярное", prefix: "Сингулярно-" },
  { name_ru: "Гравитационный Виноград", name_en: "Gravity Grape", emoji: "🍇", color: "from-indigo-700 to-stone-900", gender: "m", adj_m: "Гравитационный", adj_f: "Гравитационная", adj_n: "Гравитационное", prefix: "Грави-" },
  { name_ru: "Чернодырный Арбуз", name_en: "Blackhole Watermelon", emoji: "🕳️", color: "from-neutral-900 to-black", gender: "m", adj_m: "Трансцендентный", adj_f: "Трансцендентная", adj_n: "Трансцендентное", prefix: "Транс-" },
  { name_ru: "Космический Сплав Кокос", name_en: "Cosmic Alloy Coconut", emoji: "🥥", color: "from-yellow-600 to-purple-955", gender: "m", adj_m: "Космическо-сплавный", adj_f: "Космическо-сплавная", adj_n: "Космическо-сплавное", prefix: "Космосплав-" },

  // L81-L85: Divine
  { name_ru: "Олимп-Дыня", name_en: "Olympus Melon", emoji: "🍈", color: "from-yellow-300 to-cyan-200", gender: "f", adj_m: "Божественный", adj_f: "Божественная", adj_n: "Божественное", prefix: "Божественно-" },
  { name_ru: "Асгард-Персик", name_en: "Asgard Peach", emoji: "🍑", color: "from-rose-300 to-cyan-500", gender: "m", adj_m: "Асгардский", adj_f: "Асгардская", adj_n: "Асгардское", prefix: "Асгард-" },
  { name_ru: "Вальгалла-Ягода", name_en: "Valhalla Berry", emoji: "🫒", color: "from-emerald-400 to-yellow-305", gender: "f", adj_m: "Вальгальский", adj_f: "Вальгальская", adj_n: "Вальгальское", prefix: "Вальгалл-" },
  { name_ru: "Элизиум-Банан", name_en: "Elysium Banana", emoji: "🍌", color: "from-sky-300 via-amber-200 to-white", gender: "m", adj_m: "Элизиумский", adj_f: "Элизиумская", adj_n: "Элизиумское", prefix: "Элизиум-" },
  { name_ru: "Кронос-Лимон", name_en: "Kronos Lemon", emoji: "🍋", color: "from-amber-200 to-indigo-500", gender: "m", adj_m: "Хроно-божественный", adj_f: "Хроно-божественная", adj_n: "Хроно-божественное", prefix: "Хронобоже-" },

  // L86-L90: Abyss
  { name_ru: "Пустотная Слива", name_en: "Void Plum", emoji: "🌑", color: "from-neutral-800 to-black", gender: "f", adj_m: "Пустотный", adj_f: "Пустотная", adj_n: "Пустотное", prefix: "Пустотно-" },
  { name_ru: "Теневое Яблоко", name_en: "Shadow Apple", emoji: "🍎", color: "from-zinc-805 to-stone-950", gender: "n", adj_m: "Теневой", adj_f: "Теневая", adj_n: "Теневое", prefix: "Тенево-" },
  { name_ru: "Хаос-Перец", name_en: "Chaos Pepper", emoji: "🌶️", color: "from-red-955 to-neutral-950", gender: "m", adj_m: "Хаотический", adj_f: "Хаотическая", adj_n: "Хаотическое", prefix: "Хаос-" },
  { name_ru: "Некро-Виноград", name_en: "Necro Grapes", emoji: "🍇", color: "from-purple-950 to-stone-955", gender: "m", adj_m: "Некро", adj_f: "Некро", adj_n: "Некро", prefix: "Некро-" },
  { name_ru: "Бездна-Арбуз", name_en: "Abyss Watermelon", emoji: "🍉", color: "from-indigo-950 to-black", gender: "m", adj_m: "Бездный", adj_f: "Бездняная", adj_n: "Бездное", prefix: "Бездно-" },

  // L91-L95: Creator / Genesis
  { name_ru: "Плод Генезиса", name_en: "Genesis Fruit", emoji: "🌱", color: "from-emerald-450 via-sky-300 to-yellow-300", gender: "m", adj_m: "Созидательный", adj_f: "Созидательная", adj_n: "Созидательное", prefix: "Созидательно-" },
  { name_ru: "Альфа-Ягода", name_en: "Alpha Berry", emoji: "✨", color: "from-cyan-305 to-amber-300", gender: "f", adj_m: "Альфический", adj_f: "Альфическая", adj_n: "Альфическое", prefix: "Альфа-" },
  { name_ru: "Омега-Ананас", name_en: "Omega Pineapple", emoji: "🍍", color: "from-red-405 via-purple-500 to-cyan-400", gender: "m", adj_m: "Омегический", adj_f: "Омегическая", adj_n: "Омегическое", prefix: "Омега-" },
  { name_ru: "Источник Жизни", name_en: "Source of Life", emoji: "🌍", color: "from-blue-500 to-green-500", gender: "m", adj_m: "Мировой", adj_f: "Мировая", adj_n: "Мировое", prefix: "Миро-" },
  { name_ru: "Абсолютное Дао", name_en: "Absolute Tao", emoji: "👑", color: "from-yellow-300 via-fuchsia-500 to-cyan-400", gender: "n", adj_m: "Абсолютно-высший", adj_f: "Абсолютно-высшая", adj_n: "Абсолютно-высшее", prefix: "Абсолютно-" }
];

export const FRUITS: FruitType[] = [...BASE_24_FRUITS];

// Populate levels 25 to 95 programmatically with balanced logarithmic/exponential growth!
EXTRA_RAW_DATA.forEach((raw, idx) => {
  const currentLevel = 25 + idx;
  
  // Exponential baseValue calculation: multiplier ~2.15x per level
  const lastBase = BASE_24_FRUITS[23].baseValue; // 280,000,000
  const baseValue = Math.round(lastBase * Math.pow(2.05, currentLevel - 24));
  
  // buyCost: multiplier ~2.15x per level
  const lastCost = BASE_24_FRUITS[23].buyCost; // 4,500,000,000
  const buyCost = Math.round(lastCost * Math.pow(2.10, currentLevel - 24));

  FRUITS.push({
    level: currentLevel,
    name_ru: raw.name_ru,
    name_en: raw.name_en,
    emoji: raw.emoji,
    color: raw.color,
    baseValue,
    buyCost
  });
});

export interface BaseFruitGene {
  noun: string;
  gender: 'm' | 'f' | 'n';
  adj_m: string;
  adj_f: string;
  adj_n: string;
  prefix: string;
}

export const FRUIT_GENE_DICT: Record<number, BaseFruitGene> = {
  1: { noun: "Вишня", gender: "f", adj_m: "Вишнёвый", adj_f: "Вишнёвая", adj_n: "Вишнёвое", prefix: "Вишнёво-" },
  2: { noun: "Клубника", gender: "f", adj_m: "Клубничный", adj_f: "Клубничная", adj_n: "Клубничное", prefix: "Клубнично-" },
  3: { noun: "Виноград", gender: "m", adj_m: "Виноградный", adj_f: "Виноградная", adj_n: "Виноградное", prefix: "Виноградно-" },
  4: { noun: "Лимон", gender: "m", adj_m: "Лимонный", adj_f: "Лимонная", adj_n: "Лимонное", prefix: "Лимонно-" },
  5: { noun: "Апельсин", gender: "m", adj_m: "Апельсиновый", adj_f: "Апельсиновая", adj_n: "Апельсиновое", prefix: "Апельсиново-" },
  6: { noun: "Яблоко", gender: "n", adj_m: "Яблочный", adj_f: "Яблочная", adj_n: "Яблочное", prefix: "Яблочно-" },
  7: { noun: "Персик", gender: "m", adj_m: "Персиковый", adj_f: "Персиковая", adj_n: "Персиковое", prefix: "Персиково-" },
  8: { noun: "Ананас", gender: "m", adj_m: "Ананасовый", adj_f: "Ананасовая", adj_n: "Ананасовое", prefix: "Ананасово-" },
  9: { noun: "Арбуз", gender: "m", adj_m: "Арбузный", adj_f: "Арбузная", adj_n: "Арбузное", prefix: "Арбузно-" },
  10: { noun: "Драконий Фрукт", gender: "m", adj_m: "Драконий", adj_f: "Драконья", adj_n: "Драконье", prefix: "Драконье-" },
  11: { noun: "Кокос", gender: "m", adj_m: "Кокосовый", adj_f: "Кокосовая", adj_n: "Кокосовое", prefix: "Кокосово-" },
  12: { noun: "Звездный Фрукт", gender: "m", adj_m: "Звёздный", adj_f: "Звёздная", adj_n: "Звёздное", prefix: "Звёздно-" },
  13: { noun: "Банан", gender: "m", adj_m: "Банановый", adj_f: "Банановая", adj_n: "Банановое", prefix: "Бананово-" },
  14: { noun: "Груша", gender: "f", adj_m: "Грушевый", adj_f: "Грушевая", adj_n: "Грушевое", prefix: "Грушево-" },
  15: { noun: "Киви", gender: "n", adj_m: "Кивиевый", adj_f: "Кивиевая", adj_n: "Кивиевое", prefix: "Киви-" },
  16: { noun: "Черника", gender: "f", adj_m: "Черничный", adj_f: "Черничная", adj_n: "Черничное", prefix: "Чернично-" },
  17: { noun: "Манго", gender: "n", adj_m: "Манговый", adj_f: "Манговая", adj_n: "Манговое", prefix: "Манго-" },
  18: { noun: "Дыня", gender: "f", adj_m: "Дынный", adj_f: "Дынная", adj_n: "Дынное", prefix: "Дынно-" },
  19: { noun: "Оливка", gender: "f", adj_m: "Оливковый", adj_f: "Оливковая", adj_n: "Оливковое", prefix: "Оливково-" },
  20: { noun: "Чили-Перец", gender: "m", adj_m: "Чили", adj_f: "Чили", adj_n: "Чили", prefix: "Чили-" },
  21: { noun: "Шоколадный Плод", gender: "m", adj_m: "Шоколадный", adj_f: "Шоколадная", adj_n: "Шоколадное", prefix: "Шоколадно-" },
  22: { noun: "Карамельный Фрукт", gender: "m", adj_m: "Карамельный", adj_f: "Карамельная", adj_n: "Карамельное", prefix: "Карамельно-" },
  23: { noun: "Королевский Плод", gender: "m", adj_m: "Королевский", adj_f: "Королевская", adj_n: "Королевское", prefix: "Королевско-" },
  24: { noun: "Кристалл Вечности", gender: "m", adj_m: "Кристальный", adj_f: "Кристальная", adj_n: "Кристальное", prefix: "Кристально-" },
};

// Programmatically seed EXTRA_RAW_DATA genes
EXTRA_RAW_DATA.forEach((raw, idx) => {
  const currentLevel = 25 + idx;
  FRUIT_GENE_DICT[currentLevel] = {
    noun: raw.name_ru,
    gender: raw.gender as 'm' | 'f' | 'n',
    adj_m: raw.adj_m,
    adj_f: raw.adj_f,
    adj_n: raw.adj_n,
    prefix: raw.prefix
  };
});

export function getFruitComponents(fruit: Fruit): number[] {
  if (fruit.components && fruit.components.length > 0) {
    return fruit.components;
  }
  return [fruit.level];
}

export function getFruitEmoji(fruit: Fruit | null): string {
  if (!fruit) return "";
  if (fruit.emoji) return fruit.emoji;
  const comps = getFruitComponents(fruit);
  const emojis = comps.map(lvl => FRUITS[lvl - 1]?.emoji || "❓");
  const uniqueEmojis = Array.from(new Set(emojis));
  return uniqueEmojis.slice(0, 3).join(""); // fallback
}

export function getFruitRankTag(compsCount: number, gender: 'm' | 'f' | 'n'): string {
  if (compsCount <= 1) return "";
  if (compsCount === 2) {
    return gender === 'f' ? "Модифицированная" : (gender === 'n' ? "Модифицированное" : "Модифицированный");
  }
  if (compsCount === 3) {
    return gender === 'f' ? "Гибридная" : (gender === 'n' ? "Гибридное" : "Гибридный");
  }
  if (compsCount === 4) {
    return "Супер";
  }
  if (compsCount === 5) {
    return gender === 'f' ? "Супергибридная" : (gender === 'n' ? "Супергибридное" : "Супергибридный");
  }
  if (compsCount === 6) {
    return "Ультра";
  }
  if (compsCount === 7) {
    return gender === 'f' ? "Мегагибридная" : (gender === 'n' ? "Мегагибридное" : "Мегагибридный");
  }
  if (compsCount === 8) {
    return gender === 'f' ? "Квантовая" : (gender === 'n' ? "Квантное" : "Квантовый");
  }
  if (compsCount === 9) {
    return gender === 'f' ? "Космическая" : (gender === 'n' ? "Космическое" : "Космический");
  }
  if (compsCount === 10) {
    return gender === 'f' ? "Экзотическая" : (gender === 'n' ? "Экзотическое" : "Экзотический");
  }
  if (compsCount === 11) {
    return gender === 'f' ? "Легендарная" : (gender === 'n' ? "Легендарное" : "Легендарный");
  }
  if (compsCount === 12) {
    return gender === 'f' ? "Сингулярная" : (gender === 'n' ? "Сингулярное" : "Сингулярный");
  }
  if (compsCount === 13) {
    return gender === 'f' ? "Абсолютная" : (gender === 'n' ? "Абсолютное" : "Абсолютный");
  }
  if (compsCount === 14) {
    return gender === 'f' ? "Божественная" : (gender === 'n' ? "Божественное" : "Божественный");
  }
  return gender === 'f' ? "Мультиверсная" : (gender === 'n' ? "Мультиверсное" : "Мультиверсный");
}

export function generateRussianHybridName(comps: number[]): string {
  if (!comps || comps.length === 0) return "Неизвестный Фрукт";
  
  if (comps.length === 1) {
    return FRUIT_GENE_DICT[comps[0]]?.noun || FRUITS[comps[0] - 1]?.name_ru || "Фрукт";
  }

  const uniqueComps = Array.from(new Set(comps));
  if (uniqueComps.length === 1) {
    const baseNoun = FRUIT_GENE_DICT[uniqueComps[0]]?.noun || "Фрукт";
    const baseNounGender = FRUIT_GENE_DICT[uniqueComps[0]]?.gender || "m";
    const rankPrefix = getFruitRankTag(comps.length, baseNounGender);
    return `${rankPrefix} ${baseNoun}`;
  }

  const nounLvl = uniqueComps[uniqueComps.length - 1];
  const nounInfo = FRUIT_GENE_DICT[nounLvl] || { noun: "Фрукт", gender: "m" as const };
  const baseNounText = nounInfo.noun;
  const targetGender = nounInfo.gender;

  let adjText = "";
  if (uniqueComps.length >= 2) {
    const adjLvl = uniqueComps[uniqueComps.length - 2];
    const adjInfo = FRUIT_GENE_DICT[adjLvl];
    if (adjInfo) {
      adjText = targetGender === 'f' ? adjInfo.adj_f : (targetGender === 'n' ? adjInfo.adj_n : adjInfo.adj_m);
    }
  }

  let prefixText = "";
  if (uniqueComps.length > 2) {
    for (let i = 0; i < uniqueComps.length - 2; i++) {
      const pInfo = FRUIT_GENE_DICT[uniqueComps[i]];
      if (pInfo) {
        prefixText += pInfo.prefix;
      }
    }
  }

  let coreCombined = "";
  if (adjText) {
    if (prefixText) {
      coreCombined = `${prefixText}${adjText.toLowerCase()} ${baseNounText}`;
    } else {
      coreCombined = `${adjText} ${baseNounText}`;
    }
  } else {
    coreCombined = baseNounText;
  }

  const rankPrefix = getFruitRankTag(comps.length, targetGender);
  if (rankPrefix) {
    return `${rankPrefix} ${coreCombined.charAt(0).toLowerCase() + coreCombined.slice(1)}`;
  }

  return coreCombined;
}

export function getFruitName(fruit: Fruit | null): string {
  if (!fruit) return "";
  if (fruit.name_ru) return fruit.name_ru;
  const comps = getFruitComponents(fruit);
  return generateRussianHybridName(comps);
}

export function getFruitColor(fruit: Fruit | null): string {
  if (!fruit) return "from-neutral-600 to-neutral-700";
  if (fruit.color) return fruit.color;
  const comps = getFruitComponents(fruit);
  const highestLvl = Math.max(...comps);
  return FRUITS[highestLvl - 1]?.color || "from-neutral-600 to-neutral-700";
}

export function getFruitBaseValue(fruit: Fruit | null): number {
  if (!fruit) return 0;
  if (fruit.baseValue !== undefined) return fruit.baseValue;
  const comps = getFruitComponents(fruit);
  const sum = comps.reduce((acc, lvl) => acc + (FRUITS[lvl - 1]?.baseValue || 0), 0);
  const uniqueCount = Array.from(new Set(comps)).length;
  let multiplier = 1;
  if (comps.length > 1) {
    multiplier = 1.35 + (uniqueCount * 0.2) + (comps.length * 0.1); // High genome / hybrid rewards
  }
  return Math.round(sum * multiplier);
}

export function createMergedFruit(fruitA: Fruit, fruitB: Fruit): Fruit {
  const compsA = getFruitComponents(fruitA);
  const compsB = getFruitComponents(fruitB);
  
  const newComponents = [...compsA, ...compsB];
  
  let nextLevel = Math.max(fruitA.level, fruitB.level);
  if (fruitA.level === fruitB.level) {
    nextLevel = Math.min(95, fruitA.level + 1);
  } else {
    nextLevel = Math.min(95, nextLevel);
  }
  
  const tempFruit: Fruit = {
    id: crypto.randomUUID(),
    level: nextLevel,
    components: newComponents,
  };
  
  tempFruit.emoji = getFruitEmoji(tempFruit);
  tempFruit.name_ru = getFruitName(tempFruit);
  tempFruit.color = getFruitColor(tempFruit);
  tempFruit.baseValue = getFruitBaseValue(tempFruit);
  
  return tempFruit;
}

// --- Player Rank Tiers ---
export interface RankInfo {
  title: string;
  minXp: number;
  color: string;
  badge: string;
}

export const RANKS: RankInfo[] = [
  { title: "Новичок-Селекционер", minXp: 0, color: "from-neutral-400 to-neutral-500", badge: "🌱" },
  { title: "Младший Генетик", minXp: 150, color: "from-blue-400 to-cyan-500", badge: "🔬" },
  { title: "Опытный Мичуринец", minXp: 450, color: "from-emerald-400 to-teal-500", badge: "🍏" },
  { title: "Доктор Помологии", minXp: 1000, color: "from-purple-400 to-indigo-500", badge: "🎓" },
  { title: "Магистр Скрещивания", minXp: 2000, color: "from-pink-400 to-rose-500", badge: "🔮" },
  { title: "Профессор Хромосом", minXp: 4000, color: "from-cyan-405 to-sky-600", badge: "🧬" },
  { title: "Властелин ДНК", minXp: 7000, color: "from-purple-500 to-fuchsia-600", badge: "🌀" },
  { title: "Создатель Биосферы", minXp: 11000, color: "from-teal-400 to-emerald-600", badge: "🌍" },
  { title: "Генетический Творец", minXp: 16000, color: "from-amber-400 to-orange-500", badge: "✨" },
  { title: "Абсолютный Ботаник", minXp: 22000, color: "from-yellow-300 to-amber-600", badge: "👑" },
];

export function getPlayerRank(xp: number) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];
  let currentRankIdx = 0;
  
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      currentRankIdx = i;
      nextRank = RANKS[i + 1] || null;
    } else {
      break;
    }
  }
  
  const xpInCurrentRank = xp - currentRank.minXp;
  const xpNeededForNext = nextRank ? nextRank.minXp - currentRank.minXp : 1000;
  const progressRatio = nextRank ? xpInCurrentRank / xpNeededForNext : 1;

  return {
    title: currentRank.title,
    badge: currentRank.badge,
    color: currentRank.color,
    level: currentRankIdx + 1,
    xpInCurrentRank,
    xpNeededForNext,
    progressPercentage: Math.min(100, Math.max(0, Math.round(progressRatio * 100))),
    nextRankTitle: nextRank ? nextRank.title : "Максимальный ранг",
    isMax: !nextRank
  };
}

// --- Reward Pass (Генетик-Пасс) Tiers ---
export interface PassTier {
  id: number;
  pointsRequired: number;
  rewardName: string;
  rewardDesc: string;
  rewardType: 'coins' | 'luck_boost' | 'spawn_hybrid' | 'speed_boost' | 'auction_boost' | 'spawn_golden' | 'delivery_boost' | 'spawn_crystal' | 'dna_booster';
  rewardIcon: string;
  rewardColor: string;
}

export const PASS_TIERS: PassTier[] = [
  {
    id: 1,
    pointsRequired: 100,
    rewardName: "Селекционный Грант",
    rewardDesc: "+750 монет моментально",
    rewardType: "coins",
    rewardIcon: "💰",
    rewardColor: "text-yellow-400"
  },
  {
    id: 2,
    pointsRequired: 200,
    rewardName: "🍀 Сверх-Удача",
    rewardDesc: "+100% шанс мутаций при скрещивании на 2 минуты",
    rewardType: "luck_boost",
    rewardIcon: "🍀",
    rewardColor: "text-emerald-400"
  },
  {
    id: 3,
    pointsRequired: 300,
    rewardName: "Экзотический Гибрид",
    rewardDesc: "Материализует на поле случайный гибрид вашего высшего открытого уровня!",
    rewardType: "spawn_hybrid",
    rewardIcon: "🍍",
    rewardColor: "text-amber-400"
  },
  {
    id: 4,
    pointsRequired: 400,
    rewardName: "⚡ Супер-Ускоритель",
    rewardDesc: "Авто-бот проводит слияния в 2.5 раза быстрее в течение 3 минут!",
    rewardType: "speed_boost",
    rewardIcon: "⚡",
    rewardColor: "text-cyan-400"
  },
  {
    id: 5,
    pointsRequired: 500,
    rewardName: "Премиальный Бюджет",
    rewardDesc: "+3,500 монет в научный фонд",
    rewardType: "coins",
    rewardIcon: "🪙",
    rewardColor: "text-amber-300"
  },
  {
    id: 6,
    pointsRequired: 600,
    rewardName: "⚖️ Выгодные Торги",
    rewardDesc: "Стартовые ставки и шаги на аукционе повышены на +50% на 3 минуты!",
    rewardType: "auction_boost",
    rewardIcon: "⚖️",
    rewardColor: "text-purple-400"
  },
  {
    id: 7,
    pointsRequired: 700,
    rewardName: "🧪 Золотой Плодород",
    rewardDesc: "Мгновенно создает плод 10 уровня (Драконий Фрукт) на доске!",
    rewardType: "spawn_golden",
    rewardIcon: "🧪",
    rewardColor: "text-pink-400"
  },
  {
    id: 8,
    pointsRequired: 800,
    rewardName: "🚚 Императорский Экспресс",
    rewardDesc: "Каждый выполненный заказ доставки выплачивает +100% (2x) прибыли на 3 минуты!",
    rewardType: "delivery_boost",
    rewardIcon: "🚚",
    rewardColor: "text-orange-400"
  },
  {
    id: 9,
    pointsRequired: 900,
    rewardName: "💎 Кристальный Эфир",
    rewardDesc: "Материализует кристальный гибрид Вечности (уровень 15) высшего качества!",
    rewardType: "spawn_crystal",
    rewardIcon: "💎",
    rewardColor: "text-blue-400"
  },
  {
    id: 10,
    pointsRequired: 1000,
    rewardName: "👑 Генетический Бустер ДНК",
    rewardDesc: "ПЕРМАНЕНТНЫЙ БУСТ +25% к пассивному и активному доходу от ВСЕХ продаж!",
    rewardType: "dna_booster",
    rewardIcon: "👑",
    rewardColor: "text-red-400 font-bold"
  }
];

export interface FruitCategory {
  id: string;
  name: string;
  color: string;
  minLevel: number;
  maxLevel: number;
  requiredRebirths: number;
  badge: string;
}

export const FRUIT_CATEGORIES: FruitCategory[] = [
  { id: "common", name: "Обычные фрукты", color: "from-slate-400 to-slate-500 shadow-slate-500/10", minLevel: 1, maxLevel: 5, requiredRebirths: 0, badge: "🌱" },
  { id: "common2", name: "Обычные фрукты 2", color: "from-teal-400 to-emerald-500 shadow-emerald-500/10", minLevel: 6, maxLevel: 10, requiredRebirths: 0, badge: "🍏" },
  { id: "exo", name: "Экзофрукты", color: "from-yellow-400 to-amber-500 shadow-amber-500/10", minLevel: 11, maxLevel: 15, requiredRebirths: 0, badge: "🍍" },
  { id: "exo2", name: "Экзофрукты 2", color: "from-orange-400 to-red-500 shadow-red-500/10", minLevel: 16, maxLevel: 20, requiredRebirths: 0, badge: "🥭" },
  { id: "hell", name: "Адские фрукты", color: "from-rose-500 to-red-700 shadow-red-700/10", minLevel: 21, maxLevel: 25, requiredRebirths: 0, badge: "🔥" },
  { id: "hell2", name: "Адские фрукты 2", color: "from-red-800 to-stone-900 shadow-stone-800/10", minLevel: 26, maxLevel: 30, requiredRebirths: 0, badge: "👿" },
  { id: "heaven", name: "Райские фрукты", color: "from-sky-300 to-indigo-400 shadow-indigo-450/10", minLevel: 31, maxLevel: 35, requiredRebirths: 0, badge: "✨" },
  { id: "heaven2", name: "Райские фрукты 2", color: "from-cyan-300 to-blue-500 shadow-blue-500/10", minLevel: 36, maxLevel: 40, requiredRebirths: 0, badge: "👼" },
  
  // Rebirth >= 1
  { id: "common3", name: "Обычные фрукты 3", color: "from-green-500 to-emerald-700 shadow-emerald-500/10", minLevel: 41, maxLevel: 45, requiredRebirths: 1, badge: "🍇" },
  { id: "big", name: "Биг-фрукты", color: "from-yellow-500 to-orange-600 shadow-orange-500/10", minLevel: 46, maxLevel: 50, requiredRebirths: 1, badge: "🎃" },
  
  // Rebirth >= 2
  { id: "cosmic", name: "Космические фрукты", color: "from-purple-600 to-indigo-800 shadow-indigo-850/10", minLevel: 51, maxLevel: 55, requiredRebirths: 2, badge: "🌌" },
  
  // Rebirth >= 3
  { id: "quantum", name: "Квантовые фрукты", color: "from-emerald-305 to-teal-500 shadow-teal-500/10", minLevel: 56, maxLevel: 60, requiredRebirths: 3, badge: "⚛️" },
  
  // Rebirth >= 4
  { id: "multiverse", name: "Мультиверсные фрукты", color: "from-pink-500 to-rose-600 shadow-rose-650/10", minLevel: 61, maxLevel: 65, requiredRebirths: 4, badge: "🌀" },
  
  // Rebirth >= 5
  { id: "cyber", name: "Кибер-фрукты", color: "from-cyan-400 to-blue-600 shadow-blue-600/10", minLevel: 66, maxLevel: 70, requiredRebirths: 5, badge: "🤖" },
  
  // Rebirth >= 6
  { id: "ethereal", name: "Эфирные фрукты", color: "from-pink-300 to-indigo-400 shadow-indigo-400/10", minLevel: 71, maxLevel: 75, requiredRebirths: 6, badge: "🌸" },
  
  // Rebirth >= 7
  { id: "absolute", name: "Абсолютные плоды", color: "from-amber-400 to-yellow-600 shadow-yellow-600/10", minLevel: 76, maxLevel: 80, requiredRebirths: 7, badge: "⏳" },
  
  // Rebirth >= 8
  { id: "divine", name: "Божественные плоды", color: "from-yellow-300 to-orange-400 shadow-orange-400/10", minLevel: 81, maxLevel: 85, requiredRebirths: 8, badge: "👑" },
  
  // Rebirth >= 9
  { id: "abyss", name: "Фрукты Бездны", color: "from-zinc-700 to-stone-950 shadow-black/20", minLevel: 86, maxLevel: 90, requiredRebirths: 9, badge: "🌑" },
  
  // Rebirth >= 10
  { id: "creator", name: "Плод Создателя", color: "from-teal-400 via-fuchsia-400 to-yellow-400 shadow-fuchsia-400/10", minLevel: 91, maxLevel: 95, requiredRebirths: 10, badge: "🌍" }
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  targetType: 'merges' | 'orders' | 'auctions' | 'coinsSpent' | 'rebirths' | 'level';
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  badge: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "merges_10",
    title: "Младший скрещиватель 🌱",
    description: "Проведите 10 генетических слияний фруктов",
    targetType: 'merges',
    targetValue: 10,
    rewardCoins: 350,
    rewardXp: 25,
    badge: "🌱"
  },
  {
    id: "merges_50",
    title: "Генный лаборант 🧪",
    description: "Проведите 50 генетических слияний фруктов",
    targetType: 'merges',
    targetValue: 50,
    rewardCoins: 1600,
    rewardXp: 60,
    badge: "🧪"
  },
  {
    id: "merges_200",
    title: "Профессор селекции 🧬",
    description: "Проведите 200 генетических слияний фруктов",
    targetType: 'merges',
    targetValue: 200,
    rewardCoins: 12000,
    rewardXp: 180,
    badge: "🧬"
  },
  {
    id: "orders_3",
    title: "Первая посылка 📦",
    description: "Выполните 3 заказа доставки лесным жителям",
    targetType: 'orders',
    targetValue: 3,
    rewardCoins: 500,
    rewardXp: 30,
    badge: "📦"
  },
  {
    id: "orders_15",
    title: "Логистический босс 🚚",
    description: "Выполните 15 заказов доставки лесным жителям",
    targetType: 'orders',
    targetValue: 15,
    rewardCoins: 4500,
    rewardXp: 120,
    badge: "🚚"
  },
  {
    id: "auctions_3",
    title: "Начинающий дилер ⚖️",
    description: "Успешно продайте 3 фрукта через торговый аукцион",
    targetType: 'auctions',
    targetValue: 3,
    rewardCoins: 600,
    rewardXp: 35,
    badge: "⚖️"
  },
  {
    id: "auctions_12",
    title: "Волк с Фрукт-Стрит 💰",
    description: "Успешно продайте 12 фруктов через торговый аукцион",
    targetType: 'auctions',
    targetValue: 12,
    rewardCoins: 6000,
    rewardXp: 110,
    badge: "🦁"
  },
  {
    id: "level_5",
    title: "Эволюционный скачок 🍊",
    description: "Откройте фрукт 5-го уровня спелости или выше",
    targetType: 'level',
    targetValue: 5,
    rewardCoins: 400,
    rewardXp: 25,
    badge: "🍊"
  },
  {
    id: "level_12",
    title: "Звездный статус 🌠",
    description: "Откройте фрукт 12-го уровня спелости или выше",
    targetType: 'level',
    targetValue: 12,
    rewardCoins: 2500,
    rewardXp: 75,
    badge: "🌠"
  },
  {
    id: "level_25",
    title: "Вулканический прорыв 🌋",
    description: "Откройте фрукт 25-го уровня спелости или выше",
    targetType: 'level',
    targetValue: 25,
    rewardCoins: 20000,
    rewardXp: 250,
    badge: "🌋"
  },
  {
    id: "coins_spent_5k",
    title: "Крупный инвестор 🪙",
    description: "Потратьте суммарно 5,000 монет на семена и улучшения",
    targetType: 'coinsSpent',
    targetValue: 5000,
    rewardCoins: 1200,
    rewardXp: 50,
    badge: "🧳"
  },
  {
    id: "rebirths_1",
    title: "Феникс Космоса 🌀",
    description: "Совершите своё первое перерождение в лаборатории",
    targetType: 'rebirths',
    targetValue: 1,
    rewardCoins: 10000,
    rewardXp: 150,
    badge: "🌀"
  }
];
