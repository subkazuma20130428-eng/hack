#!/bin/bash

echo "===================================="
echo "  Hacker Typer Game - Start Server"
echo "===================================="
echo

# Python がインストールされているか確認
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 がインストールされていません"
    exit 1
fi

echo "✓ Python 3 が検出されました"

# 仮想環境が存在するか確認
if [ ! -d "venv" ]; then
    echo
    echo "仮想環境を作成しています..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: 仮想環境の作成に失敗しました"
        exit 1
    fi
    echo "✓ 仮想環境が作成されました"
fi

# 仮想環境を有効化
echo
echo "仮想環境を有効化しています..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERROR: 仮想環境の有効化に失敗しました"
    exit 1
fi

# Django をインストール
echo
echo "必要なパッケージをインストールしています..."
pip install django -q
if [ $? -ne 0 ]; then
    echo "ERROR: Django のインストールに失敗しました"
    exit 1
fi
echo "✓ パッケージがインストールされました"

# データベースマイグレーション
echo
echo "データベースをセットアップしています..."
python manage.py migrate --quiet
if [ $? -ne 0 ]; then
    echo "ERROR: マイグレーションに失敗しました"
    exit 1
fi
echo "✓ データベースがセットアップされました"

# 静的ファイル収集
echo
echo "静的ファイルを収集しています..."
python manage.py collectstatic --noinput --quiet 2>/dev/null || true
echo "✓ 静的ファイルの準備完了"

# サーバー起動
echo
echo "===================================="
echo "   Django サーバーを起動しています"
echo "===================================="
echo
echo "ゲームを開く: http://localhost:8000"
echo "管理画面: http://localhost:8000/admin"
echo
echo "ユーザー名: masumc"
echo "パスワード: kazuma20130412@@"
echo
echo "サーバーを停止するには Ctrl+C を押してください"
echo "===================================="
echo

python manage.py runserver 0.0.0.0:8000
