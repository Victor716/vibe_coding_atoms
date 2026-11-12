# sandbox/

ECS（或本地 Docker）上运行的 mini-FastAPI，管理 "会话 → 容器 → 端口" 模型。

## 接口（对应 docs/architecture.md §沙箱方案）

| Method | Path | 说明 |
|---|---|---|
| `POST /sessions` | 分配端口（池 10000–10100） |
| `PUT /sessions/{id}/code` | 接收单文件 HTML 落到 `workdir/{id}/index.html` |
| `POST /sessions/{id}/start` | M3 前返回 pending-docker；M3 起 `docker run` 挂载 workdir 到 nginx:alpine |
| `GET /sessions` | 端口占用表 |
| `DELETE /sessions/{id}` | 释放端口 |
| `GET /health` | 容量 + 已用 |

## 关键决策

- **端口段 10000–10100，101 槽**（Q6 决策）
- 默认镜像 `nginx:alpine`（Engineer 产出单文件 HTML，不需要 npm）
- **M1 状态**：`ENABLE_DOCKER=false`，只分配端口与写文件，不真起容器；backend 靠 L2 srcDoc 兜底演示
- **M3 目标**：`ENABLE_DOCKER=true`，接入 docker SDK，`docker run -d -p {port}:80 -v {workdir}:/usr/share/nginx/html:ro nginx:alpine`

## 本地跑

```bash
uv sync --all-extras
cp .env.example .env
uvicorn main:app --reload --port 9000
```

## 部署到 ECS

1. 拷贝本目录到 ECS
2. `uvicorn main:app --host 0.0.0.0 --port 9000` + systemd 单元
3. 安全组放行 `10000-10100` 段
4. `docker pull nginx:alpine` 预热

## 注意

- 无资源限额、无网络策略——生产化需要 Firecracker/gVisor + 出口白名单（docs/architecture.md §注意事项）
- 单实例文件端口状态在内存里，重启即清；考试场景可接受
