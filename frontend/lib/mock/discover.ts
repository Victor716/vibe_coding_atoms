/** 发现页 mock 数据；字段对齐未来真实 API，换数据源零改动。 */

export interface DiscoverItem {
  id: string;
  title: string;
  author: string;
  author_avatar?: string;
  likes: number;
  category: string;
  preview_image?: string;
  created_at: string;
}

export const CATEGORIES = ["全部", "游戏", "网站", "生产力", "工具", "创意"] as const;

export const MOCK_DISCOVER_ITEMS: DiscoverItem[] = [
  {
    id: "disc_001",
    title: "设计一款音游，采用经典音乐，支持拖拽音符",
    author: "PixelWizard",
    likes: 1240,
    category: "游戏",
    created_at: "2026-11-10T08:00:00Z",
  },
  {
    id: "disc_002",
    title: "个人品牌主页，深色玻璃拟态风格",
    author: "DesignLab",
    likes: 856,
    category: "网站",
    created_at: "2026-11-09T14:30:00Z",
  },
  {
    id: "disc_003",
    title: "Markdown 笔记本，支持双链和标签",
    author: "NoteMaster",
    likes: 2100,
    category: "生产力",
    created_at: "2026-11-08T10:00:00Z",
  },
  {
    id: "disc_004",
    title: "像素风贪吃蛇，键盘操控 + 排行榜",
    author: "RetroGamer",
    likes: 430,
    category: "游戏",
    created_at: "2026-11-11T16:00:00Z",
  },
  {
    id: "disc_005",
    title: "JSON 格式化工具，带语法高亮和折叠",
    author: "DevToolkit",
    likes: 1800,
    category: "工具",
    created_at: "2026-11-07T09:00:00Z",
  },
  {
    id: "disc_006",
    title: "粒子流体动画实验，鼠标交互",
    author: "CreativeCode",
    likes: 960,
    category: "创意",
    created_at: "2026-11-12T11:00:00Z",
  },
  {
    id: "disc_007",
    title: "番茄钟 + 任务管理，数据本地存储",
    author: "FocusFirst",
    likes: 3200,
    category: "生产力",
    created_at: "2026-11-06T07:30:00Z",
  },
  {
    id: "disc_008",
    title: "响应式定价卡片，三栏布局 + 切换月年付",
    author: "SaaS Builder",
    likes: 540,
    category: "网站",
    created_at: "2026-11-11T13:00:00Z",
  },
];
