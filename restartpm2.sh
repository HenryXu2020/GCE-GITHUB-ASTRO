#!/bin/bash
cd /home/astro-vitesse-site

# 停止并删除两个应用（忽略不存在时的错误）
pm2 stop astro-http-server webhook-handler 2>/dev/null || true
pm2 delete astro-http-server webhook-handler 2>/dev/null || true

# 根据配置文件启动所有应用
pm2 start pm2.config.json

# 保存当前进程列表，以便开机自启
pm2 save
