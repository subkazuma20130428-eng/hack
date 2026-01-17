#!/usr/bin/env python
"""
ハッカータイパー - クイックスタートスクリプト

このスクリプトを実行すると、Django開発サーバーが起動します。
"""

import os
import sys
import subprocess

def main():
    # プロジェクトディレクトリを取得
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)
    
    # Python バージョン確認
    if sys.version_info < (3, 8):
        print("❌ エラー: Python 3.8 以上が必要です")
        print(f"   現在のバージョン: {sys.version}")
        sys.exit(1)
    
    print("=" * 50)
    print("  🎮 ハッカータイパー - Hacker Typer Game")
    print("=" * 50)
    print()
    
    # 仮想環境をチェック
    venv_path = os.path.join(project_dir, 'venv')
    if not os.path.exists(venv_path):
        print("📦 仮想環境を作成しています...")
        try:
            subprocess.run([sys.executable, '-m', 'venv', 'venv'], check=True)
            print("✅ 仮想環境が作成されました")
        except subprocess.CalledProcessError:
            print("❌ 仮想環境の作成に失敗しました")
            sys.exit(1)
    else:
        print("✅ 仮想環境が見つかりました")
    
    # Django をインストール
    print("📦 必要なパッケージをインストールしています...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'django'], 
                      check=False)
        print("✅ パッケージがインストールされました")
    except Exception as e:
        print(f"⚠️  パッケージインストール中に警告: {e}")
    
    # マイグレーション実行
    print("🗄️  データベースをセットアップしています...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'migrate', '--quiet'], 
                      check=False)
        print("✅ データベースがセットアップされました")
    except subprocess.CalledProcessError:
        print("⚠️  マイグレーション中にエラーが発生しました")
    
    # 静的ファイル収集
    print("📦 静的ファイルを収集しています...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'collectstatic', 
                       '--noinput', '--quiet'], 
                      check=False)
        print("✅ 静的ファイルの準備完了")
    except subprocess.CalledProcessError:
        print("⚠️  静的ファイル収集中にエラーが発生しました")
    
    # サーバー起動
    print()
    print("=" * 50)
    print("  🚀 Django サーバーを起動しています")
    print("=" * 50)
    print()
    print("🌐 ゲームURL: http://localhost:8000")
    print("🔐 管理画面:  http://localhost:8000/admin")
    print()
    print("📝 テストアカウント:")
    print("   ユーザー名: masumc")
    print("   パスワード: kazuma20130412@@")
    print()
    print("⛔ サーバーを停止: Ctrl+C")
    print("=" * 50)
    print()
    
    # サーバー起動
    try:
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
    except KeyboardInterrupt:
        print("\n\n✅ サーバーを停止しました")
    except Exception as e:
        print(f"\n❌ エラー: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
