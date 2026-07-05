#!/bin/bash
# VitaFlow 一键启动脚本
# 用法: ./start.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$PROJECT_DIR/backend/.venv"
PORT=${1:-8000}

echo "=========================================="
echo "   VitaFlow 本地版 - 一键启动"
echo "=========================================="

# 1. 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python3，请先安装"
    exit 1
fi
echo "✅ Python3 已就绪"

# 2. 创建虚拟环境
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv "$VENV_DIR"
fi
echo "✅ 虚拟环境已就绪"

# 3. 安装依赖
echo "📦 检查依赖..."
source "$VENV_DIR/bin/activate"
pip install -q fastapi uvicorn sqlalchemy pydantic python-docx jinja2 python-multipart 2>/dev/null
echo "✅ 依赖已就绪"

# 4. 安装 Playwright 浏览器（PDF导出需要）
if [ ! -d "$HOME/Library/Caches/ms-playwright" ]; then
    echo "🌐 安装 Playwright 浏览器（首次运行）..."
    python -m playwright install chromium 2>/dev/null || true
fi

# 5. 创建必要目录
mkdir -p "$PROJECT_DIR/storage/exports"
mkdir -p "$PROJECT_DIR/storage/uploads"

# 6. 停止旧进程
pkill -f "uvicorn.*main:app" 2>/dev/null || true
sleep 1

# 7. 启动服务器
echo ""
echo "🚀 启动服务器..."
echo "   地址: http://localhost:$PORT"
echo "   按 Ctrl+C 停止"
echo ""
cd "$PROJECT_DIR"
exec "$VENV_DIR/bin/uvicorn" main:app --host 0.0.0.0 --port "$PORT"
