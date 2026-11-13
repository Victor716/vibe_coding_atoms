/**
 * 游戏页 mock 数据；分类对齐 Atoms 游戏示例。
 * 未来接真实 API 时字段保持不变即可无缝替换。
 */

export type GameCategory =
  | "全部"
  | "动作冒险"
  | "射击"
  | "竞速"
  | "平台跳跃"
  | "策略与塔防"
  | "经营与模拟"
  | "解谜与卡牌"
  | "体育竞技";

export const GAME_CATEGORIES: GameCategory[] = [
  "全部",
  "动作冒险",
  "射击",
  "竞速",
  "平台跳跃",
  "策略与塔防",
  "经营与模拟",
  "解谜与卡牌",
  "体育竞技",
];

export interface GameItem {
  id: string;
  title: string;
  description: string;
  author: string;
  plays: number;
  category: Exclude<GameCategory, "全部">;
  emoji: string;
  gradient: string; // tailwind gradient class
}

export const MOCK_GAMES: GameItem[] = [
  {
    id: "g_001",
    title: "像素贪吃蛇",
    description: "经典玩法 + 键盘操控 + 排行榜",
    author: "RetroGamer",
    plays: 12400,
    category: "动作冒险",
    emoji: "🐍",
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    id: "g_002",
    title: "太空射击 1945",
    description: "纵版卷轴，弹幕躲避 + 装备升级",
    author: "NovaArcade",
    plays: 8900,
    category: "射击",
    emoji: "🚀",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "g_003",
    title: "极速卡丁车",
    description: "60 秒计时赛，漂移加速",
    author: "TurboLab",
    plays: 15200,
    category: "竞速",
    emoji: "🏎️",
    gradient: "from-orange-400 to-red-500",
  },
  {
    id: "g_004",
    title: "蘑菇跳跃",
    description: "横版平台，100 关难度递增",
    author: "PixelWizard",
    plays: 22100,
    category: "平台跳跃",
    emoji: "🍄",
    gradient: "from-rose-400 to-pink-600",
  },
  {
    id: "g_005",
    title: "王国塔防",
    description: "12 种塔 + 30 波敌人 + 无尽模式",
    author: "StrategyHub",
    plays: 9700,
    category: "策略与塔防",
    emoji: "🏰",
    gradient: "from-amber-400 to-yellow-600",
  },
  {
    id: "g_006",
    title: "咖啡馆物语",
    description: "开店、招人、研发菜单，模拟经营",
    author: "CozyGames",
    plays: 18300,
    category: "经营与模拟",
    emoji: "☕",
    gradient: "from-yellow-600 to-amber-800",
  },
  {
    id: "g_007",
    title: "数独大师",
    description: "4 档难度 + 提示系统 + 每日挑战",
    author: "BrainPuzzle",
    plays: 6400,
    category: "解谜与卡牌",
    emoji: "🧩",
    gradient: "from-cyan-400 to-blue-600",
  },
  {
    id: "g_008",
    title: "篮球三分王",
    description: "拖拽蓄力投篮，风速影响弹道",
    author: "SportPix",
    plays: 11500,
    category: "体育竞技",
    emoji: "🏀",
    gradient: "from-orange-500 to-amber-700",
  },
  {
    id: "g_009",
    title: "忍者跳跃",
    description: "无限跑酷，收集金币解锁角色",
    author: "ShurikenStudio",
    plays: 27800,
    category: "动作冒险",
    emoji: "🥷",
    gradient: "from-slate-600 to-gray-800",
  },
  {
    id: "g_010",
    title: "坦克大战",
    description: "双人同屏对战，掩体可破坏",
    author: "ArcadeKing",
    plays: 13900,
    category: "射击",
    emoji: "🔫",
    gradient: "from-lime-500 to-green-700",
  },
  {
    id: "g_011",
    title: "2048 融合",
    description: "数字滑动合成，极简解压",
    author: "PuzzleLab",
    plays: 45600,
    category: "解谜与卡牌",
    emoji: "🔢",
    gradient: "from-amber-300 to-orange-500",
  },
  {
    id: "g_012",
    title: "农场物语",
    description: "种植、养殖、加工，四季轮转",
    author: "GreenField",
    plays: 19200,
    category: "经营与模拟",
    emoji: "🌾",
    gradient: "from-yellow-400 to-lime-600",
  },
];
