/** 相对时间格式化：`刚刚 / 3 分钟前 / 2 小时前 / 5 天前 / 2026-11-08`。 */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diff = Math.max(0, now - t);
  const sec = Math.floor(diff / 1000);
  if (sec < 30) return "刚刚";
  if (sec < 60) return `${sec} 秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} 天前`;
  return new Date(t).toISOString().slice(0, 10);
}
