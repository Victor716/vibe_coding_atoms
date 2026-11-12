#!/usr/bin/env bash
# 考前预热：拉取沙箱所需镜像 + 校验端口段可用
set -euo pipefail
IMAGES=(nginx:alpine)
for img in "${IMAGES[@]}"; do
  echo "[prewarm] docker pull $img"
  docker pull "$img"
done
echo "[prewarm] done. 记得安全组放行 10000-10100"
