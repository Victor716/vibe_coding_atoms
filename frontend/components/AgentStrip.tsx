/**
 * 首页 Agent 头像条：48px 重叠圆形卡通头像。
 * Server Component。
 * 参考 atoms.dev 首页 8 个戴帽子的卡通角色。
 */

const AGENTS = [
  { name: "Alex", color: "#F5B78A", emoji: "🧑‍🦰", hat: "🧢" },
  { name: "Sam", color: "#FDE68A", emoji: "🐥", hat: "🎓" },
  { name: "Mia", color: "#E7D9C6", emoji: "🐰", hat: "👒" },
  { name: "Lee", color: "#FBCFE8", emoji: "🐷", hat: "🎀" },
  { name: "Zoe", color: "#CBD5E1", emoji: "🐼", hat: "🧣" },
  { name: "Max", color: "#BAE6FD", emoji: "🐧", hat: "👓" },
  { name: "Ivy", color: "#BBF7D0", emoji: "🐢", hat: "🎧" },
  { name: "Ray", color: "#DDD6FE", emoji: "🦄", hat: "🎓" },
];

export function AgentStrip() {
  return (
    <div className="flex items-center justify-center">
      {AGENTS.map((a, i) => (
        <span
          key={a.name}
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-sm ring-2 ring-background"
          style={{
            backgroundColor: a.color,
            marginLeft: i === 0 ? 0 : "-14px",
            zIndex: AGENTS.length - i,
          }}
          title={a.name}
        >
          <span aria-hidden>{a.emoji}</span>
          <span
            className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs"
            aria-hidden
          >
            {a.hat}
          </span>
        </span>
      ))}
    </div>
  );
}
