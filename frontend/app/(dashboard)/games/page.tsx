import { GameExamples } from "@/components/games/GameExamples";
import { GameHero } from "@/components/games/GameHero";
import { MOCK_GAMES } from "@/lib/mock/games";

/**
 * 游戏页：Atoms Editorial Minimal 风格。
 * Hero（像素底纹 + Agent 头像 + 衬线标题 + 输入卡）+ 分类示例。
 */
export default function GamesPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <GameHero />
      <GameExamples items={MOCK_GAMES} />
    </div>
  );
}
