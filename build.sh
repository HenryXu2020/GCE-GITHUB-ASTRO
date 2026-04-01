#!/bin/bash
LOCKFILE="/tmp/astro-build.lock"
exec 200>"$LOCKFILE"
flock -n 200 || { echo "Another build is running, exiting."; exit 1; }

cd /home/astro-vitesse-site || exit 1

INCREMENTAL=false
if [[ "$1" == "--incremental" ]]; then
    INCREMENTAL=true
    shift
fi

if $INCREMENTAL; then
    echo "Running incremental build..."

    # 清理 Astro 编译缓存，避免旧依赖
    rm -rf .astro

else
    echo "Running full build..."

    rm -rf dist
    rm -rf .astro

    # 确保缓存目录存在
    mkdir -p src/generated/cache

    # 清理缓存
    rm -rf src/generated/cache/*

    # 全量生成 schema 与缓存
    npm run analyze-schema
    npm run generate-correct-queries
    npm run codegen-dynamic
    npm run generate-config
    npm run build-cache
fi

